import { useTrades } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths } from "date-fns";

export function CalendarHeatmap() {
  const { trades } = useTrades();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dailyPnl = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => {
      if (t.status === "CLOSED" && t.closed_at && t.pnl) {
        const key = format(new Date(t.closed_at), "yyyy-MM-dd");
        map[key] = (map[key] || 0) + t.pnl;
      }
    });
    return map;
  }, [trades]);

  const maxAbsPnl = Math.max(
    ...Object.values(dailyPnl).map(Math.abs),
    1
  );

  const getIntensity = (pnl: number) => {
    const ratio = Math.min(Math.abs(pnl) / maxAbsPnl, 1);
    if (ratio < 0.25) return "low";
    if (ratio < 0.6) return "mid";
    return "high";
  };

  // Fill empty cells for the first week
  const startDayOfWeek = getDay(monthStart); // 0 = Sun
  const emptySlots = Array.from({ length: startDayOfWeek });

  const tradingDays = Object.keys(dailyPnl).length;
  const profitDays = Object.values(dailyPnl).filter((v) => v > 0).length;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">🗓️ Calendar Heatmap</h3>
          <p className="text-sm text-muted-foreground">{format(now, "MMMM yyyy")}</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {profitDays}/{tradingDays} green days
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptySlots.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const pnl = dailyPnl[key];
          const isToday = format(day, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
          const isFuture = day > now;

          return (
            <div
              key={key}
              title={pnl !== undefined ? `${format(day, "MMM d")}: ₹${pnl.toLocaleString()}` : format(day, "MMM d")}
              className={cn(
                "aspect-square rounded-sm flex items-center justify-center text-[10px] font-mono transition-colors relative",
                isFuture && "opacity-30",
                isToday && "ring-1 ring-primary/50",
                pnl === undefined && "bg-accent/20",
                pnl !== undefined && pnl > 0 && getIntensity(pnl) === "low" && "bg-profit/15 text-profit",
                pnl !== undefined && pnl > 0 && getIntensity(pnl) === "mid" && "bg-profit/30 text-profit",
                pnl !== undefined && pnl > 0 && getIntensity(pnl) === "high" && "bg-profit/50 text-profit font-semibold",
                pnl !== undefined && pnl < 0 && getIntensity(pnl) === "low" && "bg-loss/15 text-loss",
                pnl !== undefined && pnl < 0 && getIntensity(pnl) === "mid" && "bg-loss/30 text-loss",
                pnl !== undefined && pnl < 0 && getIntensity(pnl) === "high" && "bg-loss/50 text-loss font-semibold",
                pnl !== undefined && pnl === 0 && "bg-muted/40"
              )}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-loss/40" /> Loss
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent/30" /> No trade
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-profit/40" /> Profit
        </div>
      </div>
    </div>
  );
}
