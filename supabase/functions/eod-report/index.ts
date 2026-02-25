import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALL_SEGMENTS = [
  "Equity_Intraday",
  "Equity_Positional",
  "Futures",
  "Options",
  "Commodities",
];

const segmentDisplayNames: Record<string, string> = {
  Equity_Intraday: "EQUITY INTRADAY",
  Equity_Positional: "EQUITY POSITIONAL",
  Futures: "FUTURES",
  Options: "OPTIONS",
  Commodities: "MCX / COMMODITIES",
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
    todayStart.setTime(todayStart.getTime() - 5.5 * 60 * 60 * 1000);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Get all telegram_chats with report segments configured
    const { data: allChats } = await supabase
      .from("telegram_chats")
      .select("id, user_id, chat_id, bot_token, notification_types, segments, enabled")
      .eq("enabled", true);

    if (!allChats || allChats.length === 0) {
      return jsonResponse({ success: true, message: "No enabled chats" });
    }

    // Group chats by user_id, and determine which segments each chat wants reports for
    const userChatMap = new Map<string, Array<{ chat_id: string; bot_token: string | null; report_segments: string[] }>>();

    for (const chat of allChats) {
      const userId = chat.user_id;
      if (!userChatMap.has(userId)) userChatMap.set(userId, []);

      let reportSegments: string[] = [];
      const nt = chat.notification_types;

      if (nt && typeof nt === "object" && (nt as any).report) {
        const reportConfig = (nt as any).report as string[];
        if (reportConfig.includes("*")) {
          reportSegments = [...ALL_SEGMENTS];
        } else {
          reportSegments = reportConfig.filter((s: string) => ALL_SEGMENTS.includes(s));
        }
      } else if (chat.segments && chat.segments.length > 0) {
        // Fallback: old segments array — treat as report segments too
        reportSegments = chat.segments.filter((s: string) => ALL_SEGMENTS.includes(s));
      }

      if (reportSegments.length > 0) {
        userChatMap.get(userId)!.push({
          chat_id: chat.chat_id,
          bot_token: chat.bot_token,
          report_segments: reportSegments,
        });
      }
    }

    let totalSent = 0;

    for (const [userId, chats] of userChatMap.entries()) {
      // Collect all unique segments this user's chats want reports for
      const allRequestedSegments = new Set<string>();
      for (const chat of chats) {
        for (const seg of chat.report_segments) allRequestedSegments.add(seg);
      }

      // Fetch trades closed today for this user
      const { data: closedToday } = await supabase
        .from("trades")
        .select("symbol, trade_type, entry_price, pnl, pnl_percent, status, segment, contract_key")
        .eq("user_id", userId)
        .eq("status", "CLOSED")
        .gte("closed_at", todayStart.toISOString())
        .lte("closed_at", todayEnd.toISOString());

      // Fetch trades opened today
      const { data: openedToday } = await supabase
        .from("trades")
        .select("symbol, segment")
        .eq("user_id", userId)
        .gte("entry_time", todayStart.toISOString())
        .lte("entry_time", todayEnd.toISOString());

      // Fetch still-open trades
      const { data: openPositions } = await supabase
        .from("trades")
        .select("id, segment")
        .eq("user_id", userId)
        .eq("status", "OPEN");

      // Fetch alerts triggered today
      const { data: triggeredAlerts } = await supabase
        .from("alerts")
        .select("symbol, condition_type, threshold")
        .eq("user_id", userId)
        .gte("last_triggered", todayStart.toISOString())
        .lte("last_triggered", todayEnd.toISOString());

      // Build segment-wise reports
      for (const segment of allRequestedSegments) {
        const segClosed = (closedToday || []).filter((t: any) => t.segment === segment);
        const segOpened = (openedToday || []).filter((t: any) => t.segment === segment);
        const segOpen = (openPositions || []).filter((t: any) => t.segment === segment);

        // Skip if no activity for this segment
        if (segClosed.length === 0 && segOpened.length === 0) continue;

        const totalPnl = segClosed.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0);
        const wins = segClosed.filter((t: any) => (t.pnl || 0) > 0).length;
        const losses = segClosed.filter((t: any) => (t.pnl || 0) < 0).length;
        const winRate = segClosed.length > 0 ? (wins / segClosed.length * 100).toFixed(1) : "—";

        const displayName = segmentDisplayNames[segment] || segment;

        let msg = `🌙 *END OF DAY: ${displayName}*\n`;
        msg += `📅 ${istNow.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}\n\n`;

        const pnlEmoji = totalPnl >= 0 ? "🟢" : "🔴";
        msg += `${pnlEmoji} *Day P&L: ${totalPnl >= 0 ? "+" : ""}₹${totalPnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}*\n`;
        msg += `📈 Trades: ${segClosed.length} closed | W ${wins} / L ${losses} | WR: ${winRate}%\n`;
        if (segOpened.length > 0) {
          msg += `🆕 New entries: ${segOpened.length}\n`;
        }
        msg += `📂 Still open: ${segOpen.length}\n\n`;

        if (segClosed.length > 0) {
          msg += `*Closed Trades:*\n`;
          for (const t of segClosed.slice(0, 8)) {
            const emoji = (t.pnl || 0) >= 0 ? "✅" : "❌";
            const dir = t.trade_type === "BUY" ? "L" : "S";
            const sym = t.contract_key || t.symbol;
            msg += `${emoji} ${sym} (${dir}) → ${(t.pnl || 0) >= 0 ? "+" : ""}₹${(t.pnl || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} (${(t.pnl_percent || 0).toFixed(1)}%)\n`;
          }
          if (segClosed.length > 8) msg += `   ...+${segClosed.length - 8} more\n`;
          msg += `\n`;
        }

        msg += `⏱ Sent at ${istNow.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST`;

        // Send to chats that have this segment in their report config
        const targetChats = chats.filter((c) => c.report_segments.includes(segment));
        for (const chat of targetChats) {
          const token = chat.bot_token || TELEGRAM_BOT_TOKEN;
          try {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chat.chat_id, text: msg, parse_mode: "Markdown" }),
            });
            totalSent++;

            // Log delivery
            await supabase.from("telegram_delivery_log").insert({
              user_id: userId,
              chat_id: chat.chat_id,
              notification_type: "eod_report",
              segment: segment,
              success: true,
              attempt_number: 1,
            }).then(() => {});
          } catch (e) {
            console.error(`EOD failed for ${userId} segment ${segment}:`, e);
            await supabase.from("telegram_delivery_log").insert({
              user_id: userId,
              chat_id: chat.chat_id,
              notification_type: "eod_report",
              segment: segment,
              success: false,
              error_message: e instanceof Error ? e.message : "Unknown",
              attempt_number: 1,
            }).then(() => {});
          }
        }
      }
    }

    return jsonResponse({ success: true, sent: totalSent });
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
