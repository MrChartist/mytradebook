import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEPARATOR = "━━━━━━━━━━━━━━━━━━━━━━";
const FOOTER = "\n_via TradeBook_";

function fmt(val: number | null | undefined): string {
  if (val === null || val === undefined) return "—";
  return `₹${val.toLocaleString("en-IN")}`;
}

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
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

    // Get all telegram_chats with enabled status
    const { data: allChats } = await supabase
      .from("telegram_chats")
      .select("user_id, chat_id, bot_token, notification_types, enabled")
      .eq("enabled", true);

    if (!allChats || allChats.length === 0) {
      return jsonResponse({ success: true, message: "No enabled chats" });
    }

    // Group chats by user
    const userChatMap = new Map<string, Array<{ chat_id: string; bot_token: string | null }>>();
    for (const chat of allChats) {
      const nt = chat.notification_types;
      // Check if user wants reports
      const wantsReports = nt && typeof nt === "object" && 
        ((nt as any).report?.length > 0 || Object.keys(nt).length === 0);
      
      if (wantsReports || !nt) {
        if (!userChatMap.has(chat.user_id)) userChatMap.set(chat.user_id, []);
        userChatMap.get(chat.user_id)!.push({ chat_id: chat.chat_id, bot_token: chat.bot_token });
      }
    }

    let sent = 0;
    for (const [userId, chats] of userChatMap.entries()) {
      // Check DND preference
      const { data: settings } = await supabase
        .from("user_settings")
        .select("notification_preferences")
        .eq("user_id", userId)
        .maybeSingle();
      
      const prefs = settings?.notification_preferences || {};
      if (prefs.dnd_enabled && prefs.dnd_until) {
        if (new Date(prefs.dnd_until) > now) continue;
      }

      // Open positions
      const { data: openTrades } = await supabase
        .from("trades")
        .select("symbol, entry_price, stop_loss, quantity, trade_type, segment, targets, pnl")
        .eq("user_id", userId)
        .eq("status", "OPEN");

      // Active alerts
      const { data: activeAlerts } = await supabase
        .from("alerts")
        .select("symbol, condition_type, threshold, notes")
        .eq("user_id", userId)
        .eq("active", true)
        .limit(10);

      // Expiring alerts
      const { data: expiringAlerts } = await supabase
        .from("alerts")
        .select("symbol, condition_type, threshold")
        .eq("user_id", userId)
        .eq("active", true)
        .lte("expires_at", new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .gte("expires_at", now.toISOString());

      // Studies
      const { data: recentStudies } = await supabase
        .from("studies")
        .select("symbol, title, status")
        .eq("user_id", userId)
        .in("status", ["Active", "Triggered"])
        .limit(5);

      // Build message
      let msg = `☀️ *MORNING BRIEFING*\n`;
      msg += `${SEPARATOR}\n\n`;
      msg += `📅 ${istNow.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}\n\n`;

      // Open Positions
      if (openTrades && openTrades.length > 0) {
        const totalUnrealizedPnl = openTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        msg += `📊 *Open Positions (${openTrades.length})*\n`;
        msg += `💰 Unrealized: ${totalUnrealizedPnl >= 0 ? "+" : ""}${fmt(totalUnrealizedPnl)}\n\n`;
        
        for (const t of openTrades.slice(0, 6)) {
          const dir = t.trade_type === "BUY" ? "🟢" : "🔴";
          const targets = Array.isArray(t.targets) ? t.targets : [];
          msg += `${dir} *${t.symbol}*\n`;
          msg += `   Entry: ${fmt(t.entry_price)}`;
          if (t.stop_loss) msg += ` | SL: ${fmt(t.stop_loss)}`;
          if (targets.length > 0) msg += ` | T1: ${fmt(targets[0])}`;
          msg += `\n`;
        }
        if (openTrades.length > 6) msg += `   ...+${openTrades.length - 6} more\n`;
        msg += `\n`;
      } else {
        msg += `📊 *No open positions*\n\n`;
      }

      // Active Alerts
      if (activeAlerts && activeAlerts.length > 0) {
        msg += `${SEPARATOR}\n\n`;
        msg += `🔔 *Active Alerts (${activeAlerts.length})*\n`;
        const condMap: Record<string, string> = {
          PRICE_GT: "Above", PRICE_LT: "Below",
          PRICE_CROSS_ABOVE: "Cross↑", PRICE_CROSS_BELOW: "Cross↓",
          PERCENT_CHANGE_GT: "%↑", PERCENT_CHANGE_LT: "%↓",
          VOLUME_SPIKE: "Vol🔊",
        };
        for (const a of activeAlerts.slice(0, 5)) {
          msg += `• ${a.symbol} ${condMap[a.condition_type] || a.condition_type} ${fmt(a.threshold)}`;
          if (a.notes) msg += ` — _${a.notes.slice(0, 25)}_`;
          msg += `\n`;
        }
        if (activeAlerts.length > 5) msg += `   ...+${activeAlerts.length - 5} more\n`;
        msg += `\n`;
      }

      // Expiring alerts
      if (expiringAlerts && expiringAlerts.length > 0) {
        msg += `⏰ *Expiring Today (${expiringAlerts.length})*\n`;
        for (const a of expiringAlerts.slice(0, 3)) {
          msg += `• ${a.symbol} ${fmt(a.threshold)}\n`;
        }
        msg += `\n`;
      }

      // Active Studies
      if (recentStudies && recentStudies.length > 0) {
        msg += `${SEPARATOR}\n\n`;
        msg += `📝 *Active Studies*\n`;
        for (const s of recentStudies) {
          const statusEmoji = s.status === "Triggered" ? "🎯" : "🔍";
          msg += `${statusEmoji} ${s.symbol}: ${s.title}\n`;
        }
        msg += `\n`;
      }

      msg += `${SEPARATOR}\n`;
      msg += `⏱️ 8:45 AM IST\n`;
      msg += `_Good luck trading today! 🚀_`;
      msg += FOOTER;

      // Send to all user's chats
      for (const chat of chats) {
        const token = chat.bot_token || TELEGRAM_BOT_TOKEN;
        try {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chat.chat_id, text: msg, parse_mode: "Markdown" }),
          });
          sent++;

          await supabase.from("telegram_delivery_log").insert({
            user_id: userId,
            chat_id: chat.chat_id,
            notification_type: "morning_briefing",
            success: true,
            attempt_number: 1,
          });
        } catch (e) {
          console.error(`Briefing failed for ${userId}:`, e);
          await supabase.from("telegram_delivery_log").insert({
            user_id: userId,
            chat_id: chat.chat_id,
            notification_type: "morning_briefing",
            success: false,
            error_message: e instanceof Error ? e.message : "Unknown",
            attempt_number: 1,
          });
        }
      }
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
