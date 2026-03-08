import { useMemo } from "react";
import { useDashboard } from "@/pages/Dashboard";
import { calculatePnL } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";

export function FloatingTradeTicker() {
  const { openTrades, prices, isPolling } = useDashboard();

  const items = useMemo(() => {
    return openTrades.map((t) => {
      const ltp = prices[t.symbol]?.ltp || t.current_price || t.entry_price || 0;
      const entry = t.entry_price || 0;
      const tradeType = t.trade_type === "BUY" ? "LONG" as const : "SHORT" as const;
      const pnl = calculatePnL(entry, ltp, t.quantity, tradeType);
      const pnlPct = entry > 0 ? ((ltp - entry) / entry) * 100 * (t.trade_type === "BUY" ? 1 : -1) : 0;
      return { symbol: t.symbol, ltp, pnl, pnlPct, type: t.trade_type };
    });
  }, [openTrades, prices]);

  if (items.length === 0) return null;

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center">
        {/* Static label */}
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-r border-border/40 bg-muted/30">
          {isPolling ? (
            <Radio className="w-3 h-3 text-profit animate-pulse" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Open
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1">
          <div className="ticker-scroll flex items-center gap-6 py-2 px-3 whitespace-nowrap">
            {doubled.map((item, i) => (
              <div key={`${item.symbol}-${i}`} className="inline-flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-foreground">{item.symbol}</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  ₹{item.ltp.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
                <span className={cn(
                  "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full",
                  item.pnl >= 0 ? "text-profit bg-profit/10" : "text-loss bg-loss/10"
                )}>
                  {item.pnl >= 0 ? "+" : ""}₹{item.pnl.toFixed(0)}
                  <span className="ml-1 opacity-70">
                    ({item.pnlPct >= 0 ? "+" : ""}{item.pnlPct.toFixed(1)}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
