import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Generate cryptographically secure verification code: TS-XXXXXXXXXXXX
 */
function generateVerificationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const codeLength = 12;
  let code = "TS-";
  const randomBytes = new Uint8Array(codeLength);
  crypto.getRandomValues(randomBytes);
  for (let i = 0; i < codeLength; i++) {
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
    const { action, user_id, code, chat_id, bot_token } = body;

    if (!action) {
      throw new Error("Action is required (generate, verify, disconnect, verify_bot_token)");
    }

    // ──────────────────────────────────────────────
    // NEW: Verify a bot token via Telegram getMe API
    // ──────────────────────────────────────────────
    if (action === "verify_bot_token") {
      if (!bot_token) throw new Error("bot_token is required");

      const response = await fetch(`https://api.telegram.org/bot${bot_token}/getMe`);
      const result = await response.json();

      if (!result.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            error: result.description || "Invalid bot token",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          bot: {
            id: result.result.id,
            username: result.result.username,
            first_name: result.result.first_name,
            can_join_groups: result.result.can_join_groups,
            can_read_all_group_messages: result.result.can_read_all_group_messages,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "generate") {
      if (!user_id) throw new Error("user_id is required");

      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

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
          bot_username: "@YourTradebookBot",
          instructions: `Send this code to the bot: ${verificationCode}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      if (!code) throw new Error("code is required");
      if (!chat_id) throw new Error("chat_id is required");

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

      const expiresAt = new Date(settings.telegram_link_expires_at);
      if (expiresAt < new Date()) {
        return new Response(
          JSON.stringify({ success: false, error: "Verification code has expired" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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
