import { useState, useMemo } from "react";
import { useTrades } from "@/hooks/useTrades";
import { JournalCalendarView } from "@/components/journal/JournalCalendarView";
import { DailyJournalEditor } from "@/components/journal/DailyJournalEditor";
import { TradeDetailModal } from "@/components/modals/TradeDetailModal";
import { useDailyJournal } from "@/hooks/useDailyJournal";
import { format, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const { trades, isLoading } = useTrades();
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { entries: journalEntries } = useDailyJournal();

  const journalDates = useMemo(
    () => new Set(journalEntries.map((e) => e.entry_date)),
    [journalEntries]
  );

  const closedTrades = useMemo(
    () => trades.filter((t) => t.status === "CLOSED" && t.closed_at),
    [trades]
  );

  const calendarData = useMemo(() => {
    const map = new Map<string, { date: Date; dateStr: string; trades: any[]; tradeCount: number; pnl: number }>();
    closedTrades.forEach((t) => {
      const d = new Date(t.closed_at!);
      const key = format(d, "yyyy-MM-dd");
      if (!map.has(key)) {
        map.set(key, { date: d, dateStr: key, trades: [], tradeCount: 0, pnl: 0 });
      }
      const entry = map.get(key)!;
      entry.trades.push({ id: t.id, symbol: t.symbol, trade_type: t.trade_type, pnl: t.pnl });
      entry.tradeCount += 1;
      entry.pnl += t.pnl || 0;
    });
    return Array.from(map.values());
  }, [closedTrades]);

  // Monthly stats
  const monthStats = useMemo(() => {
    const monthData = calendarData.filter((d) => isSameMonth(d.date, currentMonth));
    const totalPnl = monthData.reduce((s, d) => s + d.pnl, 0);
    const winDays = monthData.filter((d) => d.pnl > 0).length;
    const lossDays = monthData.filter((d) => d.pnl < 0).length;
    const best = monthData.length ? Math.max(...monthData.map((d) => d.pnl)) : 0;
    const worst = monthData.length ? Math.min(...monthData.map((d) => d.pnl)) : 0;
    return { totalPnl, winDays, lossDays, best, worst, tradingDays: monthData.length };
  }, [calendarData, currentMonth]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDayData = calendarData.find((d) => d.dateStr === selectedDateStr);

  const handleTradeClick = (trade: { id: string }) => setSelectedTradeId(trade.id);
  const selectedTrade = selectedTradeId ? trades.find((t) => t.id === selectedTradeId) : null;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Monthly Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Month P&L</p>
          <p className={cn("text-lg font-bold", monthStats.totalPnl >= 0 ? "text-profit" : "text-loss")}>
            {monthStats.totalPnl >= 0 ? "+" : ""}₹{monthStats.totalPnl.toLocaleString()}
          </p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Win / Loss Days</p>
          <p className="text-lg font-bold">
            <span className="text-profit">{monthStats.winDays}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-loss">{monthStats.lossDays}</span>
          </p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Trading Days</p>
          <p className="text-lg font-bold">{monthStats.tradingDays}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Best Day</p>
          <p className="text-lg font-bold text-profit">+₹{monthStats.best.toLocaleString()}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Worst Day</p>
          <p className="text-lg font-bold text-loss">₹{monthStats.worst.toLocaleString()}</p>
        </div>
      </div>

      {/* 2-column layout: Calendar + Right panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JournalCalendarView
            calendarData={calendarData}
            isLoading={isLoading}
            onTradeClick={handleTradeClick}
            onDayClick={(dateStr) => setSelectedDate(new Date(dateStr))}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            journalDates={journalDates}
            gridOnly
          />
        </div>

        {/* Right panel: trade list + journal */}
        <div className="space-y-4 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1">
          {/* Trade list for selected day */}
          <div className="glass-card p-5">
            <h4 className="font-semibold mb-3 text-sm">
              {selectedDate ? `Trades — ${format(selectedDate, "MMM dd, yyyy")}` : "Select a date"}
            </h4>
            {selectedDayData && selectedDayData.trades.length > 0 ? (
              <div className="space-y-2">
                {selectedDayData.trades.map((trade: any) => (
                  <div key={trade.id} className="flex items-center justify-between p-2.5 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", trade.trade_type === "BUY" ? "bg-profit/10" : "bg-loss/10")}>
                        {trade.trade_type === "BUY" ? <ArrowUpRight className="w-3.5 h-3.5 text-profit" /> : <ArrowDownRight className="w-3.5 h-3.5 text-loss" />}
                      </div>
                      <div>
                        <p className="font-medium text-xs">{trade.symbol}</p>
                        <p className="text-[10px] text-muted-foreground">{trade.trade_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("font-semibold text-xs", (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss")}>
                        {(trade.pnl || 0) >= 0 ? "+" : ""}₹{Math.abs(trade.pnl || 0).toLocaleString()}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleTradeClick(trade)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Day Total</span>
                  <span className={cn("font-bold text-sm", selectedDayData.pnl >= 0 ? "text-profit" : "text-loss")}>
                    {selectedDayData.pnl >= 0 ? "+" : ""}₹{selectedDayData.pnl.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs text-center py-6">No trades on this date</p>
            )}
          </div>

          <DailyJournalEditor date={selectedDate} compact />
        </div>
      </div>

      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          open={!!selectedTradeId}
          onOpenChange={(open) => !open && setSelectedTradeId(null)}
        />
      )}
    </div>
  );
}
