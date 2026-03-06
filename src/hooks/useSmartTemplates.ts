import { useMemo } from "react";
import type { Trade } from "@/hooks/useTrades";

export interface SmartTemplate {
  key: string;
  label: string;
  segment: string;
  trade_type: string;
  timeframe: string | null;
  avgSl: number | null;
  avgTarget: number | null;
  count: number;
}

const SEGMENT_LABELS: Record<string, string> = {
  Equity_Intraday: "Intraday",
  Equity_Positional: "Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "Commodity",
};

export function useSmartTemplates(trades: Trade[]): SmartTemplate[] {
  return useMemo(() => {
    const closed = trades.filter((t) => t.status === "CLOSED");
    if (closed.length < 3) return [];

    const groups = new Map<string, { segment: string; trade_type: string; timeframe: string | null; slPcts: number[]; targetPcts: number[]; count: number }>();

    for (const t of closed) {
      const key = `${t.segment}|${t.trade_type}|${t.timeframe || "none"}`;
      if (!groups.has(key)) {
        groups.set(key, { segment: t.segment, trade_type: t.trade_type, timeframe: t.timeframe, slPcts: [], targetPcts: [], count: 0 });
      }
      const g = groups.get(key)!;
      g.count++;
      if (t.entry_price && t.stop_loss && t.entry_price > 0) {
        const slPct = Math.abs((t.entry_price - t.stop_loss) / t.entry_price) * 100;
        if (slPct > 0 && slPct < 50) g.slPcts.push(slPct);
      }
      if (t.pnl_percent && t.pnl_percent > 0) {
        g.targetPcts.push(t.pnl_percent);
      }
    }

    const sorted = Array.from(groups.values())
      .filter((g) => g.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return sorted.map((g) => {
      const avgSl = g.slPcts.length > 0 ? g.slPcts.reduce((a, b) => a + b, 0) / g.slPcts.length : null;
      const avgTarget = g.targetPcts.length > 0 ? g.targetPcts.reduce((a, b) => a + b, 0) / g.targetPcts.length : null;
      const segLabel = SEGMENT_LABELS[g.segment] || g.segment;
      const tfLabel = g.timeframe && g.timeframe !== "none" ? ` ${g.timeframe}` : "";
      return {
        key: `${g.segment}|${g.trade_type}|${g.timeframe}`,
        label: `${segLabel} ${g.trade_type}${tfLabel} (${g.count}×)`,
        segment: g.segment,
        trade_type: g.trade_type,
        timeframe: g.timeframe === "none" ? null : g.timeframe,
        avgSl: avgSl ? Math.round(avgSl * 100) / 100 : null,
        avgTarget: avgTarget ? Math.round(avgTarget * 100) / 100 : null,
        count: g.count,
      };
    });
  }, [trades]);
}
