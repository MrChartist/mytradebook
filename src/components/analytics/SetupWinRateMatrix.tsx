import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Trade } from "@/hooks/useTrades";

interface Props {
  trades: Trade[];
}

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"];

export function SetupWinRateMatrix({ trades }: Props) {
  const closed = useMemo(() => trades.filter((t) => t.status === "CLOSED"), [trades]);

  // Get unique pattern tags from trades (stored in trade_patterns junction)
  // We'll use the `timeframe` and `segment` fields from trades as proxies
  // For setup tags, we use emotion_tag as a lightweight proxy since pattern_tags require joins
  const matrix = useMemo(() => {
    // Group by segment × timeframe
    const segments = [...new Set(closed.map((t) => t.segment))];
    const timeframes = [...new Set(closed.map((t) => t.timeframe).filter(Boolean))] as string[];

    if (timeframes.length === 0) return null;

    const grid: {
      segment: string;
      cells: { timeframe: string; winRate: number; count: number; avgPnl: number }[];
    }[] = [];

    segments.forEach((seg) => {
      const cells = timeframes.map((tf) => {
        const matches = closed.filter((t) => t.segment === seg && t.timeframe === tf);
        const wins = matches.filter((t) => (t.pnl || 0) > 0).length;
        const winRate = matches.length > 0 ? (wins / matches.length) * 100 : 0;
        const avgPnl = matches.length > 0 ? matches.reduce((a, t) => a + (t.pnl || 0), 0) / matches.length : 0;
        return { timeframe: tf, winRate, count: matches.length, avgPnl };
      });
      grid.push({ segment: seg, cells });
    });

    return { grid, timeframes };
  }, [closed]);

  if (!matrix || matrix.grid.length === 0) return null;

  const segmentLabels: Record<string, string> = {
    Equity_Intraday: "Intraday",
    Equity_Positional: "Positional",
    Futures: "Futures",
    Options: "Options",
    Commodities: "MCX",
  };

  return (
    <div className="premium-card space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Setup Win-Rate Matrix</h3>
        <p className="text-xs text-muted-foreground">Segment × Timeframe cross-tab</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Segment</th>
              {matrix.timeframes.map((tf) => (
                <th key={tf} className="text-center py-2 px-2 text-muted-foreground font-medium">{tf}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.grid.map((row) => (
              <tr key={row.segment}>
                <td className="py-2 pr-3 font-medium text-foreground">
                  {segmentLabels[row.segment] || row.segment}
                </td>
                {row.cells.map((cell) => (
                  <td key={cell.timeframe} className="py-1.5 px-1">
                    {cell.count === 0 ? (
                      <div className="rounded-lg bg-muted/20 p-2 text-center opacity-30">
                        <p className="text-muted-foreground">—</p>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "rounded-lg p-2 text-center border",
                          cell.winRate >= 60
                            ? "bg-profit/10 border-profit/20"
                            : cell.winRate >= 40
                              ? "bg-warning/10 border-warning/20"
                              : "bg-loss/10 border-loss/20"
                        )}
                        title={`${cell.count} trades, Avg P&L: ₹${cell.avgPnl.toFixed(0)}`}
                      >
                        <p className={cn(
                          "font-bold font-mono",
                          cell.winRate >= 60 ? "text-profit" : cell.winRate >= 40 ? "text-warning" : "text-loss"
                        )}>
                          {cell.winRate.toFixed(0)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {cell.count} trades
                        </p>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
