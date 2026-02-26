import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Eye, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
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
}

export function JournalCalendarView({
  calendarData,
  isLoading,
  onTradeClick,
}: JournalCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDayData = (date: Date): DayData | undefined => {
    return calendarData.find((d) => isSameDay(d.date, date));
  };

  const selectedDayData = selectedDate ? getDayData(selectedDate) : null;

  if (isLoading) {
    return (
      <div className="glass-card p-5">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar Grid */}
      <div className="glass-card p-5 flex-1">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 px-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-xl border-border/50 hover:bg-accent hover:text-accent-foreground shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-xl font-bold tracking-tight">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-xl border-border/50 hover:bg-accent hover:text-accent-foreground shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground/80 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayData = getDayData(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "aspect-square p-2 border rounded-xl transition-all flex flex-col items-center relative min-h-[90px]",
                  isCurrentMonth
                    ? "border-border/40 hover:border-primary/30 hover:shadow-md cursor-pointer bg-card hover:bg-accent/30"
                    : "border-transparent opacity-40 hover:opacity-60 cursor-pointer",
                  isSelected && "ring-2 ring-primary border-transparent bg-primary/5 shadow-sm"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-bold mt-1",
                    !isCurrentMonth && "text-muted-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayData && dayData.tradeCount > 0 ? (
                  <div className="mt-auto flex flex-col items-center w-full pb-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      {dayData.tradeCount} Trade{dayData.tradeCount > 1 ? "s" : ""}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-bold px-1.5 py-0.5 rounded-md w-full text-center truncate",
                        dayData.pnl >= 0 ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"
                      )}
                    >
                      {dayData.pnl >= 0 ? "+" : ""}₹{dayData.pnl.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="mt-auto text-[10px] text-muted-foreground/30 font-medium pb-2">-</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Sidebar */}
      <div className="glass-card p-6 lg:w-[380px] flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
          <h4 className="font-bold text-lg tracking-tight">
            {selectedDate
              ? format(selectedDate, "MMM dd, yyyy")
              : "Daily Summary"}
          </h4>
          {selectedDayData && selectedDayData.tradeCount > 0 && (
            <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase tracking-wider">
              {selectedDayData.tradeCount} Trades
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {selectedDayData && selectedDayData.trades.length > 0 ? (
            <div className="space-y-3 flex-1">
              {selectedDayData.trades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shadow-inner",
                        trade.trade_type === "BUY" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"
                      )}
                    >
                      {trade.trade_type === "BUY" ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{trade.symbol}</p>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                        {trade.trade_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "font-bold text-sm",
                        (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {(trade.pnl || 0) >= 0 ? "+" : ""}₹
                      {Math.abs(trade.pnl || 0).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onTradeClick(trade)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between bg-accent/30 p-4 rounded-xl">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Day Total</span>
                  <span
                    className={cn(
                      "font-black text-lg",
                      selectedDayData.pnl >= 0 ? "text-profit" : "text-loss"
                    )}
                  >
                    {selectedDayData.pnl >= 0 ? "+" : ""}₹
                    {selectedDayData.pnl.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-full bg-accent/50 flex items-center justify-center mb-5 ring-8 ring-background">
                <CalendarDays className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <h5 className="font-bold text-foreground text-lg mb-2">No Trades Found</h5>
              <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
                {selectedDate
                  ? "You didn't execute any trades on this day. Take a break or plan for tomorrow."
                  : "Select a date on the calendar to view your specific trading activity."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
