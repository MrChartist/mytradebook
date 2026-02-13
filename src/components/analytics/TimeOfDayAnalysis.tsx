import { useMemo } from "react";
import type { Trade } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface Props {
  trades: Trade[];
}

const HOURS = Array.from({ length: 8 }, (_, i) => i + 9); // 9 AM to 4 PM
const HOUR_LABELS: Record<number, string> = {
  9: "9-10",
  10: "10-11",
  11: "11-12",
  12: "12-1",
  13: "1-2",
  14: "2-3",
  15: "3-4",
  16: "4+",
};

export function TimeOfDayAnalysis({ trades }: Props) {
  const hourData = useMemo(() => {
    const closed = trades.filter((t) => t.status === "CLOSED" && t.entry_time);

    const byHour: Record<number, { pnl: number; count: number; wins: number }> = {};
    for (const h of HOURS) byHour[h] = { pnl: 0, count: 0, wins: 0 };

    for (const t of closed) {
      const d = new Date(t.entry_time);
      let hour = d.getHours();
      // Clamp to trading hours
      if (hour < 9) hour = 9;
      if (hour > 16) hour = 16;
      if (!byHour[hour]) byHour[hour] = { pnl: 0, count: 0, wins: 0 };
      byHour[hour].pnl += t.pnl || 0;
      byHour[hour].count++;
      if ((t.pnl || 0) > 0) byHour[hour].wins++;
    }

    const maxAbsPnl = Math.max(...Object.values(byHour).map((d) => Math.abs(d.pnl)), 1);

    return HOURS.map((h) => ({
      hour: h,
      label: HOUR_LABELS[h],
      ...byHour[h],
      winRate: byHour[h].count ? (byHour[h].wins / byHour[h].count) * 100 : 0,
      intensity: byHour[h].pnl / maxAbsPnl,
    }));
  }, [trades]);

  const totalTrades = hourData.reduce((a, d) => a + d.count, 0);

  if (totalTrades === 0) {
    return (
      <div className="surface-card p-8 text-center">
        <Clock className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="font-semibold mb-1">No Time Data</h3>
        <p className="text-sm text-muted-foreground">Close trades to see your time-of-day patterns.</p>
      </div>
    );
  }

  return (
    <div className="surface-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Time-of-Day Analysis
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Which hours are you most profitable?</p>
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {hourData.map((d) => {
          const absI = Math.abs(d.intensity);
          const opacity = d.count === 0 ? 0.05 : Math.max(0.15, absI * 0.8);
          const isProfit = d.pnl >= 0;

          return (
            <div
              key={d.hour}
              className="flex flex-col items-center gap-1"
              title={`${d.label}: ₹${d.pnl.toLocaleString("en-IN")} | ${d.count} trades | ${d.winRate.toFixed(0)}% WR`}
            >
              {/* Heat cell */}
              <div
                className={cn(
                  "w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                  d.count === 0 && "bg-accent/30 text-muted-foreground/30"
                )}
                style={d.count > 0 ? {
                  backgroundColor: isProfit
                    ? `hsl(152 60% 42% / ${opacity})`
                    : `hsl(0 72% 55% / ${opacity})`,
                  color: isProfit
                    ? `hsl(152 60% 32%)`
                    : `hsl(0 72% 45%)`,
                } : undefined}
              >
                {d.count > 0 ? d.count : "—"}
              </div>
              {/* Label */}
              <span className="text-[10px] text-muted-foreground font-medium">{d.label}</span>
              {/* P&L */}
              {d.count > 0 && (
                <span className={cn("text-[9px] font-mono font-semibold", isProfit ? "text-profit" : "text-loss")}>
                  {isProfit ? "+" : ""}₹{(d.pnl / 1000).toFixed(1)}k
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Best/Worst Hour */}
      {totalTrades > 0 && (() => {
        const best = hourData.filter((d) => d.count > 0).sort((a, b) => b.pnl - a.pnl)[0];
        const worst = hourData.filter((d) => d.count > 0).sort((a, b) => a.pnl - b.pnl)[0];
        return (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-profit/5 border border-profit/10">
              <p className="text-muted-foreground">Best Hour</p>
              <p className="font-semibold text-profit">{best?.label} AM — ₹{best?.pnl.toLocaleString("en-IN")}</p>
              <p className="text-muted-foreground">{best?.count} trades • {best?.winRate.toFixed(0)}% WR</p>
            </div>
            <div className="p-2.5 rounded-lg bg-loss/5 border border-loss/10">
              <p className="text-muted-foreground">Worst Hour</p>
              <p className="font-semibold text-loss">{worst?.label} — ₹{worst?.pnl.toLocaleString("en-IN")}</p>
              <p className="text-muted-foreground">{worst?.count} trades • {worst?.winRate.toFixed(0)}% WR</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
