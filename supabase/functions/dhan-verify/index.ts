import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DHAN_API_URL = "https://api.dhan.co/v2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate JWT auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: authError } = await userClient.auth.getClaims(token);
  if (authError || !claims?.claims) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  const userId = claims.claims.sub as string;

  try {
    const body = await req.json();
    const { action, client_id, access_token } = body;

    if (!action) {
      throw new Error("Action is required (verify, disconnect, test, renew)");
    }

    // ── VERIFY: Save new credentials ───────────────────────────
    if (action === "verify") {
      if (!client_id) throw new Error("client_id is required");
      if (!access_token) throw new Error("access_token is required");

      console.log(`Verifying Dhan credentials for user ${userId}`);

      const response = await fetch(`${DHAN_API_URL}/profile`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "access-token": access_token,
          "client-id": client_id,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Dhan profile API error:", errorText);
        return new Response(
          JSON.stringify({
            success: false,
            error:
              response.status === 401
                ? "Invalid access token. Please check your credentials."
                : `Dhan API error: ${response.status}`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const profileData = await response.json();
      const profile = profileData?.data || profileData;
      const accountName = profile?.name || `Dhan Account (${client_id})`;
      const rawExpiry = profile?.tokenValidity || null;
      let tokenExpiry: string | null = null;
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
        }
      }

      const { error: updateError } = await supabase
        .from("user_settings")
        .update({
          dhan_client_id: client_id,
          dhan_access_token: access_token,
          dhan_verified_at: new Date().toISOString(),
          dhan_enabled: true,
          dhan_account_name: accountName,
          dhan_token_expiry: tokenExpiry,
        } as any)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          message: "Dhan connected successfully",
          account_name: accountName,
          token_expiry: tokenExpiry,
          profile,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── TEST: Check current token validity ─────────────────────
    if (action === "test") {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("dhan_access_token, dhan_client_id, dhan_enabled")
        .eq("user_id", userId)
        .single();

      if (!settings?.dhan_access_token || !settings?.dhan_client_id) {
        return new Response(
          JSON.stringify({ success: false, error: "Dhan not configured", status: "not_configured" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch(`${DHAN_API_URL}/profile`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "access-token": settings.dhan_access_token,
          "client-id": settings.dhan_client_id,
        },
      });

      if (!response.ok) {
        await supabase
          .from("user_settings")
          .update({ dhan_token_expiry: null } as any)
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({
            success: false,
            status: response.status === 401 ? "expired" : "error",
            error:
              response.status === 401
                ? "Token expired or invalid"
                : `API error: ${response.status}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const profileData = await response.json();
      const profile = profileData?.data || profileData;
      const rawExpiry = profile?.tokenValidity || null;
      let tokenExpiry: string | null = null;
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
        }
      }

      await supabase
        .from("user_settings")
        .update({
          dhan_token_expiry: tokenExpiry,
          dhan_account_name: profile?.name || settings.dhan_client_id,
        } as any)
        .eq("user_id", userId);

      return new Response(
        JSON.stringify({
          success: true,
          status: "active",
          account_name: profile?.name,
          token_expiry: tokenExpiry,
          data_plan: profile?.dataPlan || null,
          data_validity: profile?.dataValidity || null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── RENEW: Refresh token (only works on active tokens) ─────
    if (action === "renew") {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("dhan_access_token, dhan_client_id")
        .eq("user_id", userId)
        .single();

      if (!settings?.dhan_access_token || !settings?.dhan_client_id) {
        return new Response(
          JSON.stringify({ success: false, error: "Dhan not configured" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch(`${DHAN_API_URL}/RenewToken`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "access-token": settings.dhan_access_token,
          "dhanClientId": settings.dhan_client_id,
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Dhan RenewToken error:", response.status, errText);
        return new Response(
          JSON.stringify({
            success: false,
            error:
              response.status === 401
                ? "Token expired. Generate a new token from Dhan Web and paste it in Settings."
                : `Renewal failed: ${response.status}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const renewData = await response.json();
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
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Token renewed successfully",
            token_expiry: expiryTime,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "No new token returned from Dhan" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── DISCONNECT ─────────────────────────────────────────────
    if (action === "disconnect") {
      const { error } = await supabase
        .from("user_settings")
        .update({
          dhan_access_token: null,
          dhan_verified_at: null,
          dhan_enabled: false,
          dhan_account_name: null,
          dhan_token_expiry: null,
          dhan_api_key: null,
          dhan_api_secret: null,
        } as any)
        .eq("user_id", userId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "Dhan disconnected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error("Dhan verify error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
