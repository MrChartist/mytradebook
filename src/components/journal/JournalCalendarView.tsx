import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";

interface Trade {
  id: string;
  symbol: string;
  trade_type: string;
  pnl: number | null;
}

interface DayData {
  date: Date;
  dateStr: string;
  trades: Trade[];
  tradeCount: number;
  pnl: number;
}

interface JournalCalendarViewProps {
  calendarData: DayData[];
  isLoading: boolean;
  onTradeClick: (trade: Trade) => void;
  /** Compact heatmap mode for dashboard widget */
  compact?: boolean;
  /** Show a link to the full calendar page (compact mode) */
  showLink?: boolean;
  /** Called when a day cell is clicked */
  onDayClick?: (dateStr: string) => void;
  /** Grid-only mode: no internal sidebar, parent manages detail panel */
  gridOnly?: boolean;
  /** Controlled selected date */
  selectedDate?: Date;
  /** Controlled current month */
  currentMonth?: Date;
  /** Month change handler for controlled mode */
  onMonthChange?: (month: Date) => void;
  /** Set of dates (yyyy-MM-dd) that have journal entries */
  journalDates?: Set<string>;
}

export function JournalCalendarView({
  calendarData,
  isLoading,
  onTradeClick,
  compact = false,
  showLink = false,
  onDayClick,
  gridOnly = false,
  selectedDate: controlledSelectedDate,
  currentMonth: controlledMonth,
  onMonthChange,
  journalDates,
}: JournalCalendarViewProps) {
  const [internalMonth, setInternalMonth] = useState(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(null);

  const currentMonth = controlledMonth ?? internalMonth;
  const setCurrentMonth = onMonthChange ?? setInternalMonth;
  const selectedDate = controlledSelectedDate ?? internalSelectedDate;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = compact ? ["M", "T", "W", "T", "F", "S", "S"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDayData = (date: Date): DayData | undefined => {
    return calendarData.find((d) => isSameDay(d.date, date));
  };

  const selectedDayData = selectedDate ? getDayData(selectedDate) : null;

  // Compact stats
  const tradingDays = calendarData.length;
  const profitDays = calendarData.filter((d) => d.pnl > 0).length;

  // Heatmap intensity helper
  const getIntensity = (pnl: number) => {
    const maxAbs = Math.max(...calendarData.map((d) => Math.abs(d.pnl)), 1);
    const ratio = Math.min(Math.abs(pnl) / maxAbs, 1);
    if (ratio < 0.25) return "low";
    if (ratio < 0.6) return "mid";
    return "high";
  };

  const today = format(new Date(), "yyyy-MM-dd");

  if (isLoading) {
    return (
      <div className="surface-card p-5">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className={compact ? "aspect-square rounded-sm" : "h-[90px] rounded-lg"} />
          ))}
        </div>
      </div>
    );
  }

  /* ─── Compact heatmap mode (dashboard widget) ─── */
  if (compact) {
    return (
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            {showLink ? (
              <Link to="/calendar" className="group flex items-center gap-1.5 hover:text-primary transition-colors">
                <h3 className="font-semibold text-lg">🗓️ Calendar</h3>
                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <h3 className="font-semibold text-lg">🗓️ Calendar</h3>
            )}
            <p className="text-sm text-muted-foreground">{format(currentMonth, "MMMM yyyy")}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{profitDays}/{tradingDays} green days</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((d, i) => (
            <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayData = getDayData(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = key === today;
            const isFuture = day > new Date();
            const pnl = dayData?.pnl;
            const clickable = !!onDayClick && !isFuture && isCurrentMonth;

            if (!isCurrentMonth) return <div key={key} className="aspect-square" />;

            return (
              <div
                key={key}
                title={pnl !== undefined ? `${format(day, "MMM d")}: ₹${pnl.toLocaleString()}` : format(day, "MMM d")}
                className={cn(
                  "aspect-square rounded-sm flex items-center justify-center text-[10px] font-mono transition-colors",
                  isFuture && "opacity-30",
                  isToday && "ring-1 ring-primary/50",
                  clickable && "cursor-pointer hover:ring-1 hover:ring-primary/30",
                  !dayData && "bg-accent/20",
                  dayData && pnl !== undefined && pnl > 0 && getIntensity(pnl) === "low" && "bg-profit/15 text-profit",
                  dayData && pnl !== undefined && pnl > 0 && getIntensity(pnl) === "mid" && "bg-profit/30 text-profit",
                  dayData && pnl !== undefined && pnl > 0 && getIntensity(pnl) === "high" && "bg-profit/50 text-profit font-semibold",
                  dayData && pnl !== undefined && pnl < 0 && getIntensity(pnl) === "low" && "bg-loss/15 text-loss",
                  dayData && pnl !== undefined && pnl < 0 && getIntensity(pnl) === "mid" && "bg-loss/30 text-loss",
                  dayData && pnl !== undefined && pnl < 0 && getIntensity(pnl) === "high" && "bg-loss/50 text-loss font-semibold",
                  dayData && pnl === 0 && "bg-muted/40"
                )}
                onClick={clickable ? () => onDayClick!(key) : undefined}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-loss/40" /> Loss</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-accent/30" /> No trade</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-profit/40" /> Profit</div>
        </div>
      </div>
    );
  }

  /* ─── Full calendar grid mode ─── */
  const calendarGrid = (
    <div className="surface-card p-5">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h3>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 border-l border-border">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayData = getDayData(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = key === today;
          const isFuture = day > new Date();
          const hasJournal = journalDates?.has(key);
          const pnl = dayData?.pnl;

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                if (!gridOnly) setInternalSelectedDate(day);
                if (onDayClick && isCurrentMonth) onDayClick(key);
              }}
              className={cn(
                "p-1.5 border-r border-b border-border transition-colors text-left flex flex-col relative min-h-[100px]",
                isCurrentMonth ? "hover:bg-accent/60" : "opacity-30 pointer-events-none",
                isFuture && isCurrentMonth && "opacity-50",
                isSelected && "border-2 border-dashed border-primary",
                isToday && !isSelected && "border-2 border-dashed border-primary/60",
                // Heatmap background
                !dayData && isCurrentMonth && "bg-card",
                dayData && pnl !== undefined && pnl > 0 && getIntensity(pnl) === "low" && "bg-profit/10",
                dayData && pnl !== undefined && pnl > 0 && getIntensity(pnl) === "mid" && "bg-profit/20",
                dayData && pnl !== undefined && pnl > 0 && getIntensity(pnl) === "high" && "bg-profit/30",
                dayData && pnl !== undefined && pnl < 0 && getIntensity(pnl) === "low" && "bg-loss/10",
                dayData && pnl !== undefined && pnl < 0 && getIntensity(pnl) === "mid" && "bg-loss/20",
                dayData && pnl !== undefined && pnl < 0 && getIntensity(pnl) === "high" && "bg-loss/30",
                dayData && pnl === 0 && "bg-muted/30"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className={cn(
                  "text-xs font-medium leading-none",
                  !isCurrentMonth && "text-muted-foreground",
                  isToday && "text-primary font-bold"
                )}>
                  {format(day, "d")}
                </span>
                {hasJournal && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60" title="Journal entry" />
                )}
              </div>

              {dayData && dayData.tradeCount > 0 && (
                <>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {dayData.tradeCount} trade{dayData.tradeCount > 1 ? "s" : ""}
                  </span>
                  <span className={cn("text-xs font-semibold mt-auto", pnl !== undefined && pnl >= 0 ? "text-profit" : "text-loss")}>
                    {pnl !== undefined && pnl >= 0 ? "+" : ""}₹{(pnl ?? 0).toLocaleString()}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-loss/30" /> Loss</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-card border border-border" /> No trade</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-profit/30" /> Profit</div>
        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary/60" /> Journal</div>
      </div>
    </div>
  );

  if (gridOnly) return calendarGrid;

  /* ─── Full calendar with internal sidebar (legacy/standalone usage) ─── */
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {calendarGrid}

      {/* Day Detail Sidebar */}
      <div className="surface-card p-5 lg:w-80">
        <h4 className="font-semibold mb-4">
          {selectedDate ? `Trades on ${format(selectedDate, "MMM dd, yyyy")}` : "Select a date"}
        </h4>

        {selectedDayData && selectedDayData.trades.length > 0 ? (
          <div className="space-y-3">
            {selectedDayData.trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", trade.trade_type === "BUY" ? "bg-profit/10" : "bg-loss/10")}>
                    {trade.trade_type === "BUY" ? <ArrowUpRight className="w-4 h-4 text-profit" /> : <ArrowDownRight className="w-4 h-4 text-loss" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{trade.symbol}</p>
                    <p className="text-xs text-muted-foreground">{trade.trade_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("font-semibold text-sm", (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss")}>
                    {(trade.pnl || 0) >= 0 ? "+" : ""}₹{Math.abs(trade.pnl || 0).toLocaleString()}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onTradeClick(trade)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Day Total</span>
                <span className={cn("font-bold", selectedDayData.pnl >= 0 ? "text-profit" : "text-loss")}>
                  {selectedDayData.pnl >= 0 ? "+" : ""}₹{selectedDayData.pnl.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : selectedDate ? (
          <p className="text-muted-foreground text-sm text-center py-8">No trades on this date</p>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">Click a date to view trades</p>
        )}
      </div>
    </div>
  );
}
