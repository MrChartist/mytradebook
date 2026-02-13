import { useTrades } from "@/hooks/useTrades";
import { useLivePrices } from "@/hooks/useLivePrices";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export function TodaysPnl() {
  const { trades } = useTrades();

  const today = new Date().toDateString();

  const closedToday = trades.filter(
    (t) => t.status === "CLOSED" && t.closed_at && new Date(t.closed_at).toDateString() === today
  );
  const openTrades = trades.filter((t) => t.status === "OPEN");

  const openInstruments = useMemo(() => openTrades.map((t) => ({
    symbol: t.symbol,
    security_id: t.security_id,
    exchange_segment: t.exchange_segment,
  })), [openTrades]);
  const { prices } = useLivePrices(openInstruments, 30000);

  const realizedPnl = closedToday.reduce((acc, t) => acc + (t.pnl || 0), 0);

  const unrealizedPnl = openTrades.reduce((acc, t) => {
    const ltp = prices[t.symbol]?.ltp || t.current_price || t.entry_price;
    const entry = t.entry_price || 0;
    const pnl =
      t.trade_type === "BUY"
        ? (ltp - entry) * t.quantity
        : (entry - ltp) * t.quantity;
    return acc + pnl;
  }, 0);

  const totalPnl = realizedPnl + unrealizedPnl;

  const format = (v: number) =>
    `${v >= 0 ? "+" : ""}₹${Math.abs(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="glass-card-hover p-5 relative overflow-hidden group">
      <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[hsl(var(--glass-shine)/0.2)] to-transparent" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">Today's P&L</p>
          <p className={cn("text-2xl font-bold tracking-tight", totalPnl >= 0 ? "text-profit" : "text-loss")}>
            {format(totalPnl)}
          </p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
          totalPnl >= 0 ? "bg-profit/10 group-hover:bg-profit/20" : "bg-loss/10 group-hover:bg-loss/20"
        )}>
          <Flame className={cn("w-6 h-6", totalPnl >= 0 ? "text-profit" : "text-loss")} />
        </div>
      </div>

      <div className="mt-3 flex gap-4">
        <div className="flex-1 p-2.5 rounded-lg bg-accent/30">
          <p className="text-xs text-muted-foreground">Realized</p>
          <p className={cn("text-sm font-semibold mt-0.5", realizedPnl >= 0 ? "text-profit" : "text-loss")}>
            {format(realizedPnl)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{closedToday.length} closed</p>
        </div>
        <div className="flex-1 p-2.5 rounded-lg bg-accent/30">
          <p className="text-xs text-muted-foreground">Unrealized</p>
          <p className={cn("text-sm font-semibold mt-0.5", unrealizedPnl >= 0 ? "text-profit" : "text-loss")}>
            {format(unrealizedPnl)}
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
