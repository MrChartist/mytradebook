import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DHAN_AUTH_URL = "https://auth.dhan.co";
const DHAN_API_URL = "https://api.dhan.co/v2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json();
    const { action } = body;

    if (!action) throw new Error("action is required");

    // ── RESOLVE CONSENT: Look up user_id from consent_id ────────
    if (action === "resolve-consent") {
      const { consent_id } = body;
      if (!consent_id) throw new Error("consent_id is required");

      const { data: settings, error } = await supabase
        .from("user_settings")
        .select("user_id")
        .eq("dhan_consent_id", consent_id)
        .single();

      if (error || !settings?.user_id) {
        return new Response(
          JSON.stringify({ success: false, error: "No user found for this consent ID. Please reconnect from Settings." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, user_id: settings.user_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── RESOLVE BY TOKEN: Find pending consent user (no params needed) ──
    if (action === "resolve-by-token") {
      const { data: settings, error } = await supabase
        .from("user_settings")
        .select("user_id, dhan_consent_id")
        .not("dhan_consent_id", "is", null)
        .eq("dhan_enabled", false)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !settings?.user_id || !settings?.dhan_consent_id) {
        return new Response(
          JSON.stringify({ success: false, error: "No pending Dhan authorization found. Please start the connection process from Settings." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, user_id: settings.user_id, consent_id: settings.dhan_consent_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // All other actions require user_id
    const { user_id } = body;
    if (!user_id) throw new Error("user_id is required");

    // ── STEP 1: Generate consent URL ────────────────────────────
    if (action === "generate-consent") {
      const { api_key, api_secret, redirect_url } = body;
      if (!api_key || !api_secret) throw new Error("api_key and api_secret are required");
      if (!redirect_url) throw new Error("redirect_url is required");

      console.log(`Generating Dhan consent for user ${user_id}`);

      // First, save API key & secret to user_settings
      const { error: saveErr } = await supabase
        .from("user_settings")
        .update({
          dhan_api_key: api_key,
          dhan_api_secret: api_secret,
        } as any)
        .eq("user_id", user_id);
      if (saveErr) throw saveErr;

      // Call Dhan to generate consent
      const consentRes = await fetch(
        `${DHAN_AUTH_URL}/app/generate-consent?client_id=${encodeURIComponent(body.client_id || "")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            app_id: api_key,
            app_secret: api_secret,
          },
        }
      );

      if (!consentRes.ok) {
        const errText = await consentRes.text();
        console.error("Dhan consent error:", consentRes.status, errText);
        return new Response(
          JSON.stringify({
            success: false,
            error: consentRes.status === 401
              ? "Invalid API Key or Secret. Check your credentials."
              : `Dhan auth error: ${consentRes.status} - ${errText}`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const consentData = await consentRes.json();
      const consentAppId = consentData?.consentAppId;

      if (!consentAppId) {
        return new Response(
          JSON.stringify({ success: false, error: "No consentAppId returned from Dhan" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Save consent_id to user_settings for later lookup
      const { error: consentSaveErr } = await supabase
        .from("user_settings")
        .update({ dhan_consent_id: consentAppId } as any)
        .eq("user_id", user_id);
      if (consentSaveErr) {
        console.warn("Failed to save consent_id:", consentSaveErr);
      }

      // Build the authorization URL the user must visit (browser-based login)
      const authUrl = `${DHAN_AUTH_URL}/login/consentApp-login?consentAppId=${consentAppId}`;

      return new Response(
        JSON.stringify({
          success: true,
          consent_id: consentAppId,
          auth_url: authUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── STEP 3: Exchange consent + tokenId for access token ─────
    if (action === "exchange-token") {
      const { consent_id, token_id } = body;
      if (!consent_id || !token_id) throw new Error("consent_id and token_id are required");

      // Retrieve stored API key & secret
      const { data: settings } = await supabase
        .from("user_settings")
        .select("dhan_api_key, dhan_api_secret, dhan_client_id")
        .eq("user_id", user_id)
        .single();

      if (!settings?.dhan_api_key || !settings?.dhan_api_secret) {
        return new Response(
          JSON.stringify({ success: false, error: "API Key/Secret not found. Please reconnect." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Exchanging token for user ${user_id}, consent ${consent_id}`);

      const tokenRes = await fetch(`${DHAN_AUTH_URL}/app/consumeApp-consent?tokenId=${encodeURIComponent(token_id)}`, {
        method: "POST",
        headers: {
          app_id: settings.dhan_api_key,
          app_secret: settings.dhan_api_secret,
        },
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Dhan token exchange error:", tokenRes.status, errText);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Token exchange failed: ${tokenRes.status}`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData?.accessToken || tokenData?.data?.accessToken;
      const dhanClientId = tokenData?.dhanClientId || tokenData?.data?.dhanClientId || settings.dhan_client_id;

      if (!accessToken) {
        return new Response(
          JSON.stringify({ success: false, error: "No access token returned from Dhan" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify the new token by calling profile
      const profileRes = await fetch(`${DHAN_API_URL}/profile`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "access-token": accessToken,
          "client-id": dhanClientId || "",
        },
      });

      let accountName = `Dhan Account`;
      let tokenExpiry: string | null = null;

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const profile = profileData?.data || profileData;
        accountName = profile?.name || accountName;
        const rawExpiry = profile?.tokenValidity;
        if (rawExpiry) {
          try {
            const parts = rawExpiry.match(/(\d{2})\/(\d{2})\/(\d{4})\s*(\d{2}):(\d{2})/);
            if (parts) {
              tokenExpiry = new Date(`${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}:00Z`).toISOString();
            } else {
              tokenExpiry = new Date(rawExpiry).toISOString();
            }
          } catch {
            console.warn("Could not parse token expiry:", rawExpiry);
            tokenExpiry = null;
          }
        }
      }

      // Save everything to user_settings and clear consent_id
      const { error: updateErr } = await supabase
        .from("user_settings")
        .update({
          dhan_access_token: accessToken,
          dhan_client_id: dhanClientId,
          dhan_verified_at: new Date().toISOString(),
          dhan_enabled: true,
          dhan_account_name: accountName,
          dhan_token_expiry: tokenExpiry,
          dhan_consent_id: null,
        } as any)
        .eq("user_id", user_id);

      if (updateErr) throw updateErr;

      return new Response(
        JSON.stringify({
          success: true,
          message: "Dhan connected via API Key!",
          account_name: accountName,
          token_expiry: tokenExpiry,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── AUTO-REFRESH: Use stored API Key to get new token daily ──
    if (action === "auto-refresh") {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("dhan_api_key, dhan_api_secret, dhan_client_id, dhan_access_token")
        .eq("user_id", user_id)
        .single();

      if (!settings?.dhan_api_key || !settings?.dhan_api_secret) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "API Key flow not configured. Use manual token or set up API Key in Settings.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Try to renew using existing token first (Dhan's RenewToken API)
      if (settings.dhan_access_token && settings.dhan_client_id) {
        const renewRes = await fetch(`${DHAN_API_URL}/RenewToken`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "access-token": settings.dhan_access_token,
            dhanClientId: settings.dhan_client_id,
          },
        });

        if (renewRes.ok) {
          const renewData = await renewRes.json();
          const newToken = renewData?.accessToken || renewData?.data?.accessToken;
          const expiryTime = renewData?.expiryTime || renewData?.data?.expiryTime;

          if (newToken) {
            await supabase
              .from("user_settings")
              .update({
                dhan_access_token: newToken,
                dhan_token_expiry: expiryTime || null,
                dhan_verified_at: new Date().toISOString(),
              } as any)
              .eq("user_id", user_id);

            return new Response(
              JSON.stringify({
                success: true,
                method: "renew",
                message: "Token auto-renewed successfully",
                token_expiry: expiryTime,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }

      // If renewal failed, user needs to re-authorize via browser
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token renewal failed. Please re-authorize via Settings → Dhan → Connect with API Key.",
          requires_reauth: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error("Dhan auth error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
