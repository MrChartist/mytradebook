import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

interface CalendarHeatmapProps {
  dailyPnl: Record<string, number>;
  month?: Date;
  onDayClick?: (dateStr: string) => void;
  showLink?: boolean;
}

export function CalendarHeatmap({ dailyPnl, month, onDayClick, showLink }: CalendarHeatmapProps) {
  const now = month ?? new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

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

  const startDayOfWeek = getDay(monthStart);
  const emptySlots = Array.from({ length: startDayOfWeek });

  const tradingDays = Object.keys(dailyPnl).length;
  const profitDays = Object.values(dailyPnl).filter((v) => v > 0).length;

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          {showLink ? (
            <Link to="/calendar" className="group flex items-center gap-1.5 hover:text-primary transition-colors">
              <h3 className="font-semibold text-lg">🗓️ Calendar Heatmap</h3>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ) : (
            <h3 className="font-semibold text-lg">🗓️ Calendar Heatmap</h3>
          )}
          <p className="text-sm text-muted-foreground">{format(now, "MMMM yyyy")}</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {profitDays}/{tradingDays} green days
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptySlots.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const pnl = dailyPnl[key];
          const isToday = key === today;
          const isFuture = day > new Date();
          const clickable = !!onDayClick;

          const cell = (
            <div
              className={cn(
                "aspect-square rounded-sm flex items-center justify-center text-[10px] font-mono transition-colors relative",
                isFuture && "opacity-30",
                isToday && "ring-1 ring-primary/50",
                clickable && !isFuture && "cursor-pointer hover:ring-1 hover:ring-primary/30",
                pnl === undefined && "bg-accent/20",
                pnl !== undefined && pnl > 0 && getIntensity(pnl) === "low" && "bg-profit/15 text-profit",
                pnl !== undefined && pnl > 0 && getIntensity(pnl) === "mid" && "bg-profit/30 text-profit",
                pnl !== undefined && pnl > 0 && getIntensity(pnl) === "high" && "bg-profit/50 text-profit font-semibold",
                pnl !== undefined && pnl < 0 && getIntensity(pnl) === "low" && "bg-loss/15 text-loss",
                pnl !== undefined && pnl < 0 && getIntensity(pnl) === "mid" && "bg-loss/30 text-loss",
                pnl !== undefined && pnl < 0 && getIntensity(pnl) === "high" && "bg-loss/50 text-loss font-semibold",
                pnl !== undefined && pnl === 0 && "bg-muted/40"
              )}
              title={pnl !== undefined ? `${format(day, "MMM d")}: ₹${pnl.toLocaleString()}` : format(day, "MMM d")}
              onClick={clickable && !isFuture ? () => onDayClick!(key) : undefined}
            >
              {format(day, "d")}
            </div>
          );

          return <div key={key}>{cell}</div>;
        })}
      </div>

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
