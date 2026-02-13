import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN not set");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Get all users with telegram enabled
    const { data: allSettings } = await supabase
      .from("user_settings")
      .select("user_id, telegram_chat_id, telegram_enabled")
      .eq("telegram_enabled", true)
      .not("telegram_chat_id", "is", null);

    if (!allSettings || allSettings.length === 0) {
      return jsonResponse({ success: true, message: "No users with Telegram enabled" });
    }

    let sent = 0;
    for (const settings of allSettings) {
      const userId = settings.user_id;
      const chatId = settings.telegram_chat_id;
      if (!chatId) continue;

      // Open positions
      const { data: openTrades } = await supabase
        .from("trades")
        .select("symbol, entry_price, stop_loss, quantity, trade_type, segment, targets")
        .eq("user_id", userId)
        .eq("status", "OPEN");

      // Active alerts
      const { data: activeAlerts } = await supabase
        .from("alerts")
        .select("symbol, condition_type, threshold, notes")
        .eq("user_id", userId)
        .eq("active", true)
        .limit(10);

      // Today's expiring alerts
      const { data: expiringAlerts } = await supabase
        .from("alerts")
        .select("symbol, condition_type, threshold")
        .eq("user_id", userId)
        .eq("active", true)
        .lte("expires_at", new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .gte("expires_at", now.toISOString());

      // Studies with recent analysis
      const { data: recentStudies } = await supabase
        .from("studies")
        .select("symbol, title, notes")
        .eq("user_id", userId)
        .gte("analysis_date", todayStr)
        .limit(5);

      // Build message
      let msg = `☀️ *MORNING BRIEFING*\n`;
      msg += `📅 ${now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "short", year: "numeric" })}\n\n`;

      // Open Positions
      if (openTrades && openTrades.length > 0) {
        msg += `📊 *Open Positions (${openTrades.length})*\n`;
        for (const t of openTrades.slice(0, 8)) {
          const dir = t.trade_type === "BUY" ? "🟢" : "🔴";
          const targets = Array.isArray(t.targets) ? t.targets : [];
          msg += `${dir} ${t.symbol} | Entry ₹${t.entry_price?.toLocaleString() || "—"}`;
          if (t.stop_loss) msg += ` | SL ₹${t.stop_loss.toLocaleString()}`;
          if (targets.length > 0) msg += ` | T1 ₹${targets[0]}`;
          msg += `\n`;
        }
        if (openTrades.length > 8) msg += `   ...+${openTrades.length - 8} more\n`;
        msg += `\n`;
      } else {
        msg += `📊 *No open positions*\n\n`;
      }

      // Active Alerts
      if (activeAlerts && activeAlerts.length > 0) {
        msg += `🔔 *Active Alerts (${activeAlerts.length})*\n`;
        for (const a of activeAlerts.slice(0, 6)) {
          const condMap: Record<string, string> = {
            PRICE_GT: "Above", PRICE_LT: "Below",
            PRICE_CROSS_ABOVE: "Cross↑", PRICE_CROSS_BELOW: "Cross↓",
            PERCENT_CHANGE_GT: "%↑", PERCENT_CHANGE_LT: "%↓",
            VOLUME_SPIKE: "Vol🔊",
          };
          msg += `• ${a.symbol} ${condMap[a.condition_type] || a.condition_type} ₹${a.threshold?.toLocaleString() || "—"}`;
          if (a.notes) msg += ` — _${a.notes.slice(0, 30)}_`;
          msg += `\n`;
        }
        msg += `\n`;
      }

      // Expiring alerts
      if (expiringAlerts && expiringAlerts.length > 0) {
        msg += `⏰ *Expiring Today (${expiringAlerts.length})*\n`;
        for (const a of expiringAlerts.slice(0, 4)) {
          msg += `• ${a.symbol} ${a.condition_type} ₹${a.threshold?.toLocaleString() || "—"}\n`;
        }
        msg += `\n`;
      }

      // Key levels from studies
      if (recentStudies && recentStudies.length > 0) {
        msg += `📝 *Today's Studies*\n`;
        for (const s of recentStudies) {
          msg += `• ${s.symbol}: ${s.title}\n`;
        }
        msg += `\n`;
      }

      msg += `🕘 Sent at 8:45 AM IST\n`;
      msg += `_Good luck trading today! 🚀_`;

      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" }),
        });
        sent++;
      } catch (e) { console.error(`Briefing failed for ${userId}:`, e); }
    }

    return jsonResponse({ success: true, sent });
  } catch (error: unknown) {
    console.error("Morning briefing error:", error);
    return jsonResponse({ success: false, error: error instanceof Error ? error.message : "Unknown" }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
