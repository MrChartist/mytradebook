import { useMemo } from "react";
import { useTrades, type Trade } from "@/hooks/useTrades";
import { startOfDay, startOfWeek, startOfMonth, isAfter } from "date-fns";
import { TradeStatus } from "@/lib/constants";

export type SharePeriod = "today" | "this_week" | "this_month" | "all_time";

export interface ShareCardData {
  period: string;
  totalPnl: number;
  pnlPercent: number;
  winRate: number;
  totalTrades: number;
  winners: number;
  losers: number;
  bestTrade: { symbol: string; pnl: number } | null;
  worstTrade: { symbol: string; pnl: number } | null;
  streak: number;
  userName?: string;
}

const periodLabels: Record<SharePeriod, string> = {
  today: "Today",
  this_week: "This Week",
  this_month: "This Month",
  all_time: "All Time",
};

function getPeriodStart(period: SharePeriod): Date {
  const now = new Date();
  switch (period) {
    case "today":
      return startOfDay(now);
    case "this_week":
      return startOfWeek(now, { weekStartsOn: 1 });
    case "this_month":
      return startOfMonth(now);
    case "all_time":
      return new Date(0);
  }
}

export function useShareCardData(period: SharePeriod): ShareCardData {
  const { trades } = useTrades();

  return useMemo(() => {
    const cutoff = getPeriodStart(period);

    const closed = trades.filter(
      (t) =>
        t.status === TradeStatus.CLOSED &&
        t.closed_at &&
        isAfter(new Date(t.closed_at), cutoff)
    );

    const totalPnl = closed.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winners = closed.filter((t) => (t.pnl || 0) > 0);
    const losers = closed.filter((t) => (t.pnl || 0) < 0);
    const winRate = closed.length > 0 ? (winners.length / closed.length) * 100 : 0;

    // Capital-based percent: sum of individual pnl_percent weighted equally
    const pnlPercent =
      closed.length > 0
        ? closed.reduce((sum, t) => sum + (t.pnl_percent || 0), 0) / closed.length
        : 0;

    const sorted = [...closed].sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
    const bestTrade =
      sorted.length > 0 && (sorted[0].pnl || 0) > 0
        ? { symbol: sorted[0].symbol, pnl: sorted[0].pnl! }
        : null;
    const worstTrade =
      sorted.length > 0 && (sorted[sorted.length - 1].pnl || 0) < 0
        ? { symbol: sorted[sorted.length - 1].symbol, pnl: sorted[sorted.length - 1].pnl! }
        : null;

    // Current streak (consecutive wins or losses from most recent)
    let streak = 0;
    const chronological = [...closed].sort(
      (a, b) => new Date(b.closed_at!).getTime() - new Date(a.closed_at!).getTime()
    );
    if (chronological.length > 0) {
      const firstSign = (chronological[0].pnl || 0) >= 0 ? 1 : -1;
      for (const t of chronological) {
        const sign = (t.pnl || 0) >= 0 ? 1 : -1;
        if (sign === firstSign) streak++;
        else break;
      }
      streak *= firstSign;
    }

    return {
      period: periodLabels[period],
      totalPnl,
      pnlPercent,
      winRate,
      totalTrades: closed.length,
      winners: winners.length,
      losers: losers.length,
      bestTrade,
      worstTrade,
      streak,
    };
  }, [trades, period]);
}
