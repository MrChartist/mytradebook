import { useMemo } from "react";
import type { Trade } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

interface Props {
  trades: Trade[];
}

const SEGMENT_LABELS: Record<string, string> = {
  Equity_Intraday: "Eq. Intraday",
  Equity_Positional: "Eq. Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "Commodities",
};

interface SegmentStats {
  segment: string;
  label: string;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  sharpe: number;
}

export function SegmentPerformance({ trades }: Props) {
  const segments = useMemo(() => {
    const closed = trades.filter((t) => t.status === "CLOSED");
    const grouped: Record<string, Trade[]> = {};
    for (const t of closed) {
      (grouped[t.segment] ||= []).push(t);
    }

    return Object.entries(grouped)
      .map(([seg, tds]): SegmentStats => {
        const wins = tds.filter((t) => (t.pnl || 0) > 0);
        const losses = tds.filter((t) => (t.pnl || 0) < 0);
        const pnls = tds.map((t) => t.pnl || 0);
        const totalPnl = pnls.reduce((a, b) => a + b, 0);
        const avgPnl = pnls.length ? totalPnl / pnls.length : 0;
        const avgWin = wins.length ? wins.reduce((a, t) => a + (t.pnl || 0), 0) / wins.length : 0;
        const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + (t.pnl || 0), 0) / losses.length) : 0;
        const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;

        // Sharpe-like: mean / stdev of returns
        const mean = avgPnl;
        const variance = pnls.length > 1
          ? pnls.reduce((a, p) => a + (p - mean) ** 2, 0) / (pnls.length - 1)
          : 0;
        const stdev = Math.sqrt(variance);
        const sharpe = stdev > 0 ? mean / stdev : 0;

        return {
          segment: seg,
          label: SEGMENT_LABELS[seg] || seg,
          totalTrades: tds.length,
          wins: wins.length,
          losses: losses.length,
          winRate: tds.length ? (wins.length / tds.length) * 100 : 0,
          totalPnl,
          avgPnl,
          avgWin,
          avgLoss,
          profitFactor,
          sharpe,
        };
      })
      .sort((a, b) => b.totalPnl - a.totalPnl);
  }, [trades]);

  if (segments.length === 0) {
    return (
      <div className="surface-card p-8 text-center">
        <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="font-semibold mb-1">No Segment Data</h3>
        <p className="text-sm text-muted-foreground">Close trades across segments to compare.</p>
      </div>
    );
  }

  return (
    <div className="surface-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Segment-wise Performance
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Side-by-side comparison across market segments</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left py-2 pr-3 font-medium">Segment</th>
              <th className="text-center py-2 px-2 font-medium">Trades</th>
              <th className="text-center py-2 px-2 font-medium">Win Rate</th>
              <th className="text-right py-2 px-2 font-medium">Total P&L</th>
              <th className="text-right py-2 px-2 font-medium">Avg P&L</th>
              <th className="text-right py-2 px-2 font-medium">Avg Win</th>
              <th className="text-right py-2 px-2 font-medium">Avg Loss</th>
              <th className="text-center py-2 px-2 font-medium">PF</th>
              <th className="text-center py-2 pl-2 font-medium">Sharpe</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((s) => (
              <tr key={s.segment} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="py-2.5 pr-3 font-medium">{s.label}</td>
                <td className="text-center py-2.5 px-2 text-muted-foreground">
                  {s.totalTrades}
                  <span className="text-xs ml-1">({s.wins}W/{s.losses}L)</span>
                </td>
                <td className="text-center py-2.5 px-2">
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-xs font-semibold",
                    s.winRate >= 50 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                  )}>
                    {s.winRate.toFixed(0)}%
                  </span>
                </td>
                <td className={cn("text-right py-2.5 px-2 font-mono font-semibold", s.totalPnl >= 0 ? "text-profit" : "text-loss")}>
                  {s.totalPnl >= 0 ? "+" : ""}₹{s.totalPnl.toLocaleString("en-IN")}
                </td>
                <td className={cn("text-right py-2.5 px-2 font-mono text-xs", s.avgPnl >= 0 ? "text-profit" : "text-loss")}>
                  ₹{s.avgPnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
                <td className="text-right py-2.5 px-2 font-mono text-xs text-profit">
                  ₹{s.avgWin.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
                <td className="text-right py-2.5 px-2 font-mono text-xs text-loss">
                  ₹{s.avgLoss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
                <td className={cn("text-center py-2.5 px-2 font-mono text-xs font-semibold", s.profitFactor >= 1 ? "text-profit" : "text-loss")}>
                  {s.profitFactor.toFixed(2)}
                </td>
                <td className={cn("text-center py-2.5 pl-2 font-mono text-xs font-semibold", s.sharpe >= 0 ? "text-profit" : "text-loss")}>
                  {s.sharpe.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
