import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Eye } from "lucide-react";
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
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayData = getDayData(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "aspect-square p-1 rounded-lg transition-colors text-left flex flex-col relative min-h-[80px]",
                  isCurrentMonth
                    ? "hover:bg-accent"
                    : "opacity-40 hover:opacity-60",
                  isSelected && "ring-2 ring-primary bg-primary/10"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    !isCurrentMonth && "text-muted-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayData && dayData.tradeCount > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground mt-1">
                      {dayData.tradeCount} trade{dayData.tradeCount > 1 ? "s" : ""}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold mt-auto",
                        dayData.pnl >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {dayData.pnl >= 0 ? "+" : ""}₹{dayData.pnl.toLocaleString()}
                    </span>
                    <div
                      className={cn(
                        "absolute top-1 right-1 w-2 h-2 rounded-full",
                        dayData.pnl >= 0 ? "bg-profit" : "bg-loss"
                      )}
                    />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Sidebar */}
      <div className="glass-card p-5 lg:w-80">
        <h4 className="font-semibold mb-4">
          {selectedDate
            ? `Trades on ${format(selectedDate, "MMM dd, yyyy")}`
            : "Select a date"}
        </h4>

        {selectedDayData && selectedDayData.trades.length > 0 ? (
          <div className="space-y-3">
            {selectedDayData.trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      trade.trade_type === "BUY" ? "bg-profit/10" : "bg-loss/10"
                    )}
                  >
                    {trade.trade_type === "BUY" ? (
                      <ArrowUpRight className="w-4 h-4 text-profit" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-loss" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{trade.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {trade.trade_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss"
                    )}
                  >
                    {(trade.pnl || 0) >= 0 ? "+" : ""}₹
                    {Math.abs(trade.pnl || 0).toLocaleString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onTradeClick(trade)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Day Total</span>
                <span
                  className={cn(
                    "font-bold",
                    selectedDayData.pnl >= 0 ? "text-profit" : "text-loss"
                  )}
                >
                  {selectedDayData.pnl >= 0 ? "+" : ""}₹
                  {selectedDayData.pnl.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : selectedDate ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No trades on this date
          </p>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">
            Click a date to view trades
          </p>
        )}
      </div>
    </div>
  );
}
