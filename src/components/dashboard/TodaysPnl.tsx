import { useTrades } from "@/hooks/useTrades";
import { useLivePrices } from "@/hooks/useLivePrices";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { calculatePnL } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatting";
import { TradeStatus } from "@/lib/constants";

export function TodaysPnl() {
  const { trades } = useTrades();

  const today = new Date().toDateString();

  const closedToday = trades.filter(
    (t) => t.status === TradeStatus.CLOSED && t.closed_at && new Date(t.closed_at).toDateString() === today
  );
  const openTrades = trades.filter((t) => t.status === TradeStatus.OPEN);

  const openInstruments = useMemo(() => openTrades.map((t) => ({
    symbol: t.symbol,
    security_id: t.security_id,
    exchange_segment: t.exchange_segment,
  })), [openTrades]);
  const { prices } = useLivePrices(openInstruments);

  const realizedPnl = closedToday.reduce((acc, t) => acc + (t.pnl || 0), 0);

  const unrealizedPnl = openTrades.reduce((acc, t) => {
    const ltp = prices[t.symbol]?.ltp || t.current_price || t.entry_price;
    const entry = t.entry_price || 0;
    const tradeType = t.trade_type === "BUY" ? "LONG" : "SHORT";
    return acc + calculatePnL(entry, ltp, t.quantity, tradeType);
  }, 0);

  const totalPnl = realizedPnl + unrealizedPnl;

  return (
    <div className="dashboard-card-hover relative overflow-hidden group">
      {/* Top accent line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl",
        totalPnl >= 0 ? "bg-profit" : "bg-loss"
      )} />

      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground font-medium">Today's P&L</p>
          <p className={cn("text-3xl font-bold tracking-tight font-mono", totalPnl >= 0 ? "text-profit" : "text-loss")}>
            {formatCurrency(totalPnl)}
          </p>
        </div>
        <div className={cn(
          "icon-badge transition-all duration-300",
          totalPnl >= 0 ? "bg-profit/10 group-hover:bg-profit/20" : "bg-loss/10 group-hover:bg-loss/20"
        )}>
          <Flame className={cn("w-5 h-5", totalPnl >= 0 ? "text-profit" : "text-loss")} />
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        <div className="flex-1 p-3 rounded-xl bg-muted/50">
          <p className="text-xs text-muted-foreground">Realized</p>
          <p className={cn("text-sm font-semibold mt-1 font-mono", realizedPnl >= 0 ? "text-profit" : "text-loss")}>
            {formatCurrency(realizedPnl)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{closedToday.length} closed</p>
        </div>
        <div className="flex-1 p-3 rounded-xl bg-muted/50">
          <p className="text-xs text-muted-foreground">Unrealized</p>
          <p className={cn("text-sm font-semibold mt-1 font-mono", unrealizedPnl >= 0 ? "text-profit" : "text-loss")}>
            {formatCurrency(unrealizedPnl)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{openTrades.length} open</p>
        </div>
      </div>

      <div className={cn(
        "absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        totalPnl >= 0 ? "bg-profit/10" : "bg-loss/10"
      )} />
    </div>
  );
}
