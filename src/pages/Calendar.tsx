import { useState, useMemo } from "react";
import { useTrades } from "@/hooks/useTrades";
import { JournalCalendarView } from "@/components/journal/JournalCalendarView";
import { DailyJournalEditor } from "@/components/journal/DailyJournalEditor";
import { TradeDetailModal } from "@/components/modals/TradeDetailModal";
import { format } from "date-fns";

export default function Calendar() {
  const { trades, isLoading } = useTrades();
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  const handleTradeClick = (trade: { id: string }) => {
    setSelectedTradeId(trade.id);
  };

  const selectedTrade = selectedTradeId ? trades.find((t) => t.id === selectedTradeId) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground text-sm">
          Daily trading activity timeline — click a date to view trades and P&L.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JournalCalendarView
            calendarData={calendarData}
            isLoading={isLoading}
            onTradeClick={handleTradeClick}
            onDayClick={(dateStr) => setSelectedDate(new Date(dateStr))}
          />
        </div>
        <DailyJournalEditor date={selectedDate} />
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
