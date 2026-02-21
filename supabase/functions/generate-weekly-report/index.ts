import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SEGMENTS = [
  "Equity_Intraday",
  "Equity_Positional",
  "Futures",
  "Options",
  "Commodities",
];

interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  segment: string;
  pnl: number | null;
  pnl_percent: number | null;
  status: string;
  closed_at: string | null;
  trade_patterns?: { pattern_id: string; pattern_tags: { name: string } }[];
  trade_mistakes?: { mistake_id: string; mistake_tags: { name: string } }[];
}

interface SegmentReport {
  segment: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnl: number;
  winRate: number;
  avgGain: number;
  avgLoss: number;
  bestTradePnl: number;
  worstTradePnl: number;
  topSetups: { name: string; count: number }[];
  commonMistakes: { name: string; count: number }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate Authorization header (cron sends anon key)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate week boundaries (previous week - Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Start of current week (Monday)
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - daysSinceMonday);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // Previous week boundaries
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() - 1); // Sunday
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6); // Previous Monday
    weekStart.setHours(0, 0, 0, 0);

    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    console.log(`Generating report for week: ${weekStartStr} to ${weekEndStr}`);

    // Fetch all closed trades in the week
    const { data: trades, error: tradesError } = await supabase
      .from("trades")
      .select(`
        *,
        trade_patterns(pattern_id, pattern_tags(name)),
        trade_mistakes(mistake_id, mistake_tags(name))
      `)
      .eq("status", "CLOSED")
      .gte("closed_at", weekStart.toISOString())
      .lte("closed_at", weekEnd.toISOString());

    if (tradesError) {
      throw new Error(`Failed to fetch trades: ${tradesError.message}`);
    }

    if (!trades || trades.length === 0) {
      console.log("No trades found for this week");
      return new Response(
        JSON.stringify({ success: true, message: "No trades to report" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group trades by user and segment
    const userTrades: Record<string, Trade[]> = {};
    for (const trade of trades as Trade[]) {
      if (!userTrades[trade.user_id]) {
        userTrades[trade.user_id] = [];
      }
      userTrades[trade.user_id].push(trade);
    }

    const reportsCreated: string[] = [];

    // Generate report for each user
    for (const [userId, userTradeList] of Object.entries(userTrades)) {
      // Generate report for each segment
      for (const segment of SEGMENTS) {
        const segmentTrades = userTradeList.filter((t) => t.segment === segment);
        
        if (segmentTrades.length === 0) continue;

        const report = generateSegmentReport(segment, segmentTrades);

        // Insert report into database
        const { error: insertError } = await supabase
          .from("weekly_reports")
          .insert({
            user_id: userId,
            segment: segment,
            week_start: weekStartStr,
            week_end: weekEndStr,
            total_trades: report.totalTrades,
            winning_trades: report.winningTrades,
            losing_trades: report.losingTrades,
            total_pnl: report.totalPnl,
            win_rate: report.winRate,
            avg_gain: report.avgGain,
            avg_loss: report.avgLoss,
            best_trade_pnl: report.bestTradePnl,
            worst_trade_pnl: report.worstTradePnl,
            top_setups: report.topSetups,
            common_mistakes: report.commonMistakes,
          });

        if (insertError) {
          console.error(`Failed to insert report for ${userId}/${segment}:`, insertError);
          continue;
        }

        reportsCreated.push(`${segment}`);
      }

      // Send consolidated Telegram notification for this user
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const allUserTrades = userTradeList;
        const totalPnl = allUserTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const winningTrades = allUserTrades.filter((t) => (t.pnl || 0) > 0);
        const winRate = allUserTrades.length > 0 
          ? (winningTrades.length / allUserTrades.length) * 100 
          : 0;

        // Build segment breakdown
        const segmentBreakdown = SEGMENTS
          .map((seg) => {
            const segTrades = allUserTrades.filter((t) => t.segment === seg);
            if (segTrades.length === 0) return null;
            const segPnl = segTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
            const emoji = segPnl >= 0 ? "📈" : "📉";
            return `${emoji} *${seg.replace("_", " ")}*: ${segPnl >= 0 ? "+" : ""}₹${segPnl.toLocaleString()} (${segTrades.length} trades)`;
          })
          .filter(Boolean)
          .join("\n");

        const overallEmoji = totalPnl >= 0 ? "🎉" : "📊";
        const message = `${overallEmoji} *Weekly Report*\n` +
          `📅 ${weekStartStr} to ${weekEndStr}\n\n` +
          `*Overall Performance*\n` +
          `💰 Net P&L: ${totalPnl >= 0 ? "+" : ""}₹${totalPnl.toLocaleString()}\n` +
          `📊 Win Rate: ${winRate.toFixed(1)}%\n` +
          `📈 Total Trades: ${allUserTrades.length}\n\n` +
          `*Segment Breakdown*\n${segmentBreakdown}`;

        await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        reportsCreated,
        totalUsers: Object.keys(userTrades).length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Weekly report generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateSegmentReport(segment: string, trades: Trade[]): SegmentReport {
  const winningTrades = trades.filter((t) => (t.pnl || 0) > 0);
  const losingTrades = trades.filter((t) => (t.pnl || 0) < 0);
  
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  
  const avgGain = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length
    : 0;
  
  const avgLoss = losingTrades.length > 0
    ? losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length
    : 0;

  const pnlValues = trades.map((t) => t.pnl || 0);
  const bestTradePnl = Math.max(...pnlValues, 0);
  const worstTradePnl = Math.min(...pnlValues, 0);

  // Count patterns
  const patternCounts: Record<string, number> = {};
  for (const trade of trades) {
    if (trade.trade_patterns) {
      for (const tp of trade.trade_patterns) {
        const name = tp.pattern_tags?.name;
        if (name) {
          patternCounts[name] = (patternCounts[name] || 0) + 1;
        }
      }
    }
  }
  const topSetups = Object.entries(patternCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Count mistakes
  const mistakeCounts: Record<string, number> = {};
  for (const trade of trades) {
    if (trade.trade_mistakes) {
      for (const tm of trade.trade_mistakes) {
        const name = tm.mistake_tags?.name;
        if (name) {
          mistakeCounts[name] = (mistakeCounts[name] || 0) + 1;
        }
      }
    }
  }
  const commonMistakes = Object.entries(mistakeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    segment,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    totalPnl,
    winRate,
    avgGain,
    avgLoss,
    bestTradePnl,
    worstTradePnl,
    topSetups,
    commonMistakes,
  };
}

async function sendTelegramMessage(token: string, chatId: string, message: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (e) {
    console.error("Failed to send Telegram message:", e);
  }
}
