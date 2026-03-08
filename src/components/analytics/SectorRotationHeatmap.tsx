import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import type { Trade } from "@/hooks/useTrades";

const SEGMENTS = ["Equity_Intraday", "Equity_Positional", "Futures", "Options", "Commodities"];
const SEGMENT_LABELS: Record<string, string> = {
  Equity_Intraday: "Intraday",
  Equity_Positional: "Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "Commodities",
};

interface Props {
  trades: Trade[];
}

export function SectorRotationHeatmap({ trades }: Props) {
  const closed = useMemo(() => trades.filter((t) => t.status === "CLOSED"), [trades]);

  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const m = subMonths(now, 5 - i);
      return {
        label: format(m, "MMM yy"),
        start: startOfMonth(m),
        end: endOfMonth(m),
      };
    });
  }, []);

  const data = useMemo(() => {
    return SEGMENTS.map((seg) => ({
      segment: seg,
      label: SEGMENT_LABELS[seg],
      months: months.map((m) => {
        const monthTrades = closed.filter((t) => {
          const d = new Date(t.closed_at || t.entry_time);
          return t.segment === seg && d >= m.start && d <= m.end;
        });
        const count = monthTrades.length;
        const pnl = monthTrades.reduce((a, t) => a + (t.pnl || 0), 0);
        return { count, pnl };
      }),
    }));
  }, [closed, months]);

  // Max count for intensity scaling
  const maxCount = useMemo(() => {
    let max = 1;
    data.forEach((row) => row.months.forEach((m) => { if (m.count > max) max = m.count; }));
    return max;
  }, [data]);

  if (closed.length < 5) return null;

  return (
    <div className="premium-card space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Sector Rotation</h3>
        <p className="text-xs text-muted-foreground">Trading activity by segment over last 6 months</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Segment</th>
              {months.map((m) => (
                <th key={m.label} className="text-center py-2 px-2 text-muted-foreground font-medium">{m.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.segment}>
                <td className="py-2 pr-4 font-medium text-foreground">{row.label}</td>
                {row.months.map((cell, i) => {
                  const intensity = cell.count / maxCount;
                  const isProfit = cell.pnl >= 0;

                  return (
                    <td key={i} className="py-1.5 px-1">
                      <div
                        className={cn(
                          "rounded-lg p-2 text-center transition-all",
                          cell.count === 0
                            ? "bg-muted/30"
                            : isProfit
                              ? "bg-profit/10 border border-profit/20"
                              : "bg-loss/10 border border-loss/20"
                        )}
                        style={{
                          opacity: cell.count === 0 ? 0.3 : 0.4 + intensity * 0.6,
                        }}
                        title={`${cell.count} trades, ₹${cell.pnl.toFixed(0)}`}
                      >
                        <p className="font-bold font-mono">{cell.count}</p>
                        {cell.count > 0 && (
                          <p className={cn("text-[10px] font-mono", isProfit ? "text-profit" : "text-loss")}>
                            {cell.pnl >= 0 ? "+" : ""}₹{cell.pnl.toFixed(0)}
                          </p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
