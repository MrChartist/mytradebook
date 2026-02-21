import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Generate cryptographically secure verification code: TS-XXXXXXXXXXXX
 *
 * Security improvements:
 * - Increased from 6 to 12 characters (52-bit entropy vs 31-bit)
 * - Uses crypto.getRandomValues() instead of Math.random()
 * - Makes brute-force attacks computationally infeasible
 */
function generateVerificationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const codeLength = 12; // Increased from 6 for better security
  let code = "TS-";

  // Use cryptographically secure random number generator
  const randomBytes = new Uint8Array(codeLength);
  crypto.getRandomValues(randomBytes);

  for (let i = 0; i < codeLength; i++) {
    // Use modulo to map byte value to character set
    code += chars.charAt(randomBytes[i] % chars.length);
  }

  return code;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json();
    const { action, user_id, code, chat_id } = body;

    if (!action) {
      throw new Error("Action is required (generate, verify, disconnect)");
    }

    // The "verify" action is called from Telegram webhook (no JWT).
    // "generate" and "disconnect" need JWT auth.
    if (action !== "verify") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
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
      const authUserId = claims.claims.sub as string;
      // Ensure user_id in body matches authenticated user
      if (user_id && user_id !== authUserId) {
        return new Response(
          JSON.stringify({ error: "Forbidden: user_id mismatch" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (action === "generate") {
      // Generate new verification code for user
      if (!user_id) throw new Error("user_id is required");

      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Extended to 15 minutes

      const { error } = await supabase
        .from("user_settings")
        .update({
          telegram_link_code: verificationCode,
          telegram_link_expires_at: expiresAt.toISOString(),
        })
        .eq("user_id", user_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          code: verificationCode,
          expires_at: expiresAt.toISOString(),
          bot_username: "@YourTradebookBot", // Update with actual bot username
          instructions: `Send this code to the bot: ${verificationCode}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      // Verify code and link chat_id
      if (!code) throw new Error("code is required");
      if (!chat_id) throw new Error("chat_id is required");

      // Find user with matching code
      const { data: settings, error: findError } = await supabase
        .from("user_settings")
        .select("user_id, telegram_link_expires_at")
        .eq("telegram_link_code", code)
        .single();

      if (findError || !settings) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid verification code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check expiry
      const expiresAt = new Date(settings.telegram_link_expires_at);
      if (expiresAt < new Date()) {
        return new Response(
          JSON.stringify({ success: false, error: "Verification code has expired" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update with chat_id and clear code
      const { error: updateError } = await supabase
        .from("user_settings")
        .update({
          telegram_chat_id: chat_id,
          telegram_verified_at: new Date().toISOString(),
          telegram_enabled: true,
          telegram_link_code: null,
          telegram_link_expires_at: null,
        })
        .eq("user_id", settings.user_id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          message: "Telegram connected successfully",
          user_id: settings.user_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "disconnect") {
      // Disconnect Telegram
      if (!user_id) throw new Error("user_id is required");

      const { error } = await supabase
        .from("user_settings")
        .update({
          telegram_chat_id: null,
          telegram_verified_at: null,
          telegram_enabled: false,
          telegram_link_code: null,
          telegram_link_expires_at: null,
        })
        .eq("user_id", user_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "Telegram disconnected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error("Telegram verify error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
