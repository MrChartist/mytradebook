import { cn } from "@/lib/utils";

export function TickerBar() {
  const tickers = [
    { symbol: "NIFTY 50", price: "24,285", change: "+0.82%", up: true },
    { symbol: "BANKNIFTY", price: "51,440", change: "-0.34%", up: false },
    { symbol: "RELIANCE", price: "2,945", change: "+1.24%", up: true },
    { symbol: "GOLD", price: "71,850", change: "+0.45%", up: true },
    { symbol: "CRUDE", price: "6,420", change: "-1.12%", up: false },
  ];
  return (
    <div className="flex items-center gap-5 px-4 py-2 border-b border-border/20 bg-muted/10 overflow-hidden text-[10px]">
      {tickers.map((t) => (
        <div key={t.symbol} className="flex items-center gap-1.5 shrink-0">
          <span className="text-muted-foreground font-medium">{t.symbol}</span>
          <span className="font-mono font-semibold text-foreground/80">{t.price}</span>
          <span className={cn("font-mono font-semibold", t.up ? "text-profit" : "text-loss")}>{t.change}</span>
        </div>
      ))}
    </div>
  );
}
