import { useMemo } from "react";
import type { Trade } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";

interface Props {
  trades: Trade[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DayOfWeekAnalysis({ trades }: Props) {
  const dayData = useMemo(() => {
    const closed = trades.filter((t) => t.status === "CLOSED" && t.entry_time);
    const byDay: Record<number, { pnl: number; count: number; wins: number }> = {};
    for (let i = 0; i < 7; i++) byDay[i] = { pnl: 0, count: 0, wins: 0 };

    for (const t of closed) {
      const day = new Date(t.entry_time).getDay();
      byDay[day].pnl += t.pnl || 0;
      byDay[day].count++;
      if ((t.pnl || 0) > 0) byDay[day].wins++;
    }

    const maxAbsPnl = Math.max(...Object.values(byDay).map((d) => Math.abs(d.pnl)), 1);

    return [1, 2, 3, 4, 5].map((d) => ({ // Mon-Fri only
      day: d,
      name: SHORT_DAYS[d],
      fullName: DAYS[d],
      ...byDay[d],
      winRate: byDay[d].count ? (byDay[d].wins / byDay[d].count) * 100 : 0,
      avgPnl: byDay[d].count ? byDay[d].pnl / byDay[d].count : 0,
      intensity: byDay[d].pnl / maxAbsPnl,
    }));
  }, [trades]);

  const totalTrades = dayData.reduce((a, d) => a + d.count, 0);

  if (totalTrades === 0) {
    return (
      <div className="surface-card p-8 text-center">
        <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="font-semibold mb-1">No Day Data</h3>
        <p className="text-sm text-muted-foreground">Close trades to see day-of-week patterns.</p>
      </div>
    );
  }

  return (
    <div className="surface-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          Day-of-Week Analysis
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Identify your best and worst trading days</p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {dayData.map((d) => {
          const absI = Math.abs(d.intensity);
          const opacity = d.count === 0 ? 0.05 : Math.max(0.12, absI * 0.7);
          const isProfit = d.pnl >= 0;

          return (
            <div
              key={d.day}
              className="rounded-xl p-3 text-center space-y-1.5 transition-all"
              style={d.count > 0 ? {
                backgroundColor: isProfit
                  ? `hsl(152 60% 42% / ${opacity})`
                  : `hsl(0 72% 55% / ${opacity})`,
              } : { backgroundColor: "hsl(var(--accent) / 0.3)" }}
            >
              <p className="text-xs font-semibold text-foreground">{d.name}</p>
              <p className={cn("text-lg font-bold font-mono", d.count > 0 ? (isProfit ? "text-profit" : "text-loss") : "text-muted-foreground/40")}>
                {d.count > 0 ? `${isProfit ? "+" : ""}₹${(d.pnl / 1000).toFixed(1)}k` : "—"}
              </p>
              <div className="space-y-0.5 text-[10px] text-muted-foreground">
                <p>{d.count} trades</p>
                {d.count > 0 && (
                  <p className={cn("font-semibold", d.winRate >= 50 ? "text-profit" : "text-loss")}>
                    {d.winRate.toFixed(0)}% WR
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Best/Worst day callout */}
      {totalTrades > 0 && (() => {
        const sorted = dayData.filter((d) => d.count > 0).sort((a, b) => b.pnl - a.pnl);
        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        if (!best || !worst) return null;
        return (
          <div className="text-xs text-muted-foreground text-center">
            Best: <span className="font-semibold text-profit">{best.fullName}</span> •
            Worst: <span className="font-semibold text-loss">{worst.fullName}</span>
          </div>
        );
      })()}
    </div>
  );
}
