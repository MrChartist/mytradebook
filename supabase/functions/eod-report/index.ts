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

    // Today's date range in IST
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const todayStart = new Date(istNow);
    todayStart.setUTCHours(0, 0, 0, 0);
    todayStart.setTime(todayStart.getTime() - 5.5 * 60 * 60 * 1000); // Convert back to UTC
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Get all users with telegram enabled
    const { data: allSettings } = await supabase
      .from("user_settings")
      .select("user_id, telegram_chat_id, telegram_enabled")
      .eq("telegram_enabled", true)
      .not("telegram_chat_id", "is", null);

    if (!allSettings || allSettings.length === 0) {
      return jsonResponse({ success: true, message: "No users" });
    }

    let sent = 0;
    for (const settings of allSettings) {
      const userId = settings.user_id;
      const chatId = settings.telegram_chat_id;
      if (!chatId) continue;

      // Trades created/closed today
      const { data: todayTrades } = await supabase
        .from("trades")
        .select("symbol, trade_type, entry_price, pnl, pnl_percent, status, closed_at, segment")
        .eq("user_id", userId)
        .gte("entry_time", todayStart.toISOString())
        .lte("entry_time", todayEnd.toISOString());

      // Trades closed today (may have been opened earlier)
      const { data: closedToday } = await supabase
        .from("trades")
        .select("symbol, trade_type, entry_price, pnl, pnl_percent, status")
        .eq("user_id", userId)
        .eq("status", "CLOSED")
        .gte("closed_at", todayStart.toISOString())
        .lte("closed_at", todayEnd.toISOString());

      // Alerts triggered today
      const { data: triggeredAlerts } = await supabase
        .from("alerts")
        .select("symbol, condition_type, threshold")
        .eq("user_id", userId)
        .gte("last_triggered", todayStart.toISOString())
        .lte("last_triggered", todayEnd.toISOString());

      // Still-open positions
      const { data: openPositions } = await supabase
        .from("trades")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "OPEN");

      const allClosed = closedToday || [];
      const totalPnl = allClosed.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const wins = allClosed.filter(t => (t.pnl || 0) > 0).length;
      const losses = allClosed.filter(t => (t.pnl || 0) < 0).length;
      const winRate = allClosed.length > 0 ? (wins / allClosed.length * 100).toFixed(1) : "—";

      // Skip if no activity
      if ((todayTrades?.length || 0) === 0 && allClosed.length === 0 && (triggeredAlerts?.length || 0) === 0) {
        continue;
      }

      let msg = `🌙 *END OF DAY REPORT*\n`;
      msg += `📅 ${istNow.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}\n\n`;

      // P&L Summary
      const pnlEmoji = totalPnl >= 0 ? "🟢" : "🔴";
      msg += `${pnlEmoji} *Day P&L: ${totalPnl >= 0 ? "+" : ""}₹${totalPnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}*\n`;
      msg += `📈 Trades: ${allClosed.length} closed | W ${wins} / L ${losses} | WR: ${winRate}%\n`;
      if (todayTrades && todayTrades.length > 0) {
        msg += `🆕 New entries: ${todayTrades.length}\n`;
      }
      msg += `📂 Still open: ${openPositions?.length || 0}\n\n`;

      // Closed trades detail
      if (allClosed.length > 0) {
        msg += `*Closed Trades:*\n`;
        for (const t of allClosed.slice(0, 8)) {
          const emoji = (t.pnl || 0) >= 0 ? "✅" : "❌";
          const dir = t.trade_type === "BUY" ? "L" : "S";
          msg += `${emoji} ${t.symbol} (${dir}) → ${(t.pnl || 0) >= 0 ? "+" : ""}₹${(t.pnl || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} (${(t.pnl_percent || 0).toFixed(1)}%)\n`;
        }
        if (allClosed.length > 8) msg += `   ...+${allClosed.length - 8} more\n`;
        msg += `\n`;
      }

      // Alerts triggered
      if (triggeredAlerts && triggeredAlerts.length > 0) {
        msg += `🔔 *Alerts Triggered (${triggeredAlerts.length})*\n`;
        for (const a of triggeredAlerts.slice(0, 5)) {
          msg += `• ${a.symbol} ${a.condition_type} ₹${a.threshold?.toLocaleString() || "—"}\n`;
        }
        msg += `\n`;
      }

      msg += `⏱ Sent at ${istNow.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST`;

      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" }),
        });
        sent++;
      } catch (e) { console.error(`EOD failed for ${userId}:`, e); }
    }

    return jsonResponse({ success: true, sent });
  } catch (error: unknown) {
    console.error("EOD report error:", error);
    return jsonResponse({ success: false, error: error instanceof Error ? error.message : "Unknown" }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
