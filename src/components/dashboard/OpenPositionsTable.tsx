import { useTrades } from "@/hooks/useTrades";
import { useLivePrices } from "@/hooks/useLivePrices";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";

export function OpenPositionsTable() {
  const { trades, isLoading } = useTrades({ status: "OPEN" });

  const symbols = useMemo(() => trades.map((t) => t.symbol), [trades]);
  const { prices } = useLivePrices(symbols, 30000);

  const positions = trades.map((t) => {
    const ltp = prices[t.symbol]?.ltp || t.current_price || t.entry_price || 0;
    const entry = t.entry_price || 0;
    const unrealizedPnl =
      t.trade_type === "BUY"
        ? (ltp - entry) * t.quantity
        : (entry - ltp) * t.quantity;
    const unrealizedPercent = entry > 0 ? (unrealizedPnl / (entry * t.quantity)) * 100 : 0;
    const slDistance = t.stop_loss
      ? t.trade_type === "BUY"
        ? ((ltp - t.stop_loss) / ltp) * 100
        : ((t.stop_loss - ltp) / ltp) * 100
      : null;

    return { ...t, ltp, unrealizedPnl, unrealizedPercent, slDistance };
  });

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">📈 Open Positions</h3>
          <p className="text-sm text-muted-foreground">
            {positions.length} position{positions.length !== 1 ? "s" : ""} • Live prices
          </p>
        </div>
        <Link to="/trades" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          View All →
        </Link>
      </div>

      {positions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No open positions</p>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left pb-3 font-medium">Symbol</th>
                <th className="text-right pb-3 font-medium">LTP</th>
                <th className="text-right pb-3 font-medium">Entry</th>
                <th className="text-right pb-3 font-medium">P&L</th>
                <th className="text-right pb-3 font-medium hidden sm:table-cell">SL Dist.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {positions.slice(0, 8).map((p) => (
                <tr key={p.id} className="hover:bg-accent/20 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      {p.trade_type === "BUY" ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-profit" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-loss" />
                      )}
                      <div>
                        <span className="font-medium">{p.symbol}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">×{p.quantity}</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-2.5 font-mono">₹{p.ltp.toLocaleString()}</td>
                  <td className="text-right py-2.5 font-mono text-muted-foreground">₹{(p.entry_price || 0).toLocaleString()}</td>
                  <td className="text-right py-2.5">
                    <span className={cn("font-semibold font-mono", p.unrealizedPnl >= 0 ? "text-profit" : "text-loss")}>
                      {p.unrealizedPnl >= 0 ? "+" : ""}₹{Math.abs(p.unrealizedPnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                    <span className={cn("text-xs ml-1", p.unrealizedPercent >= 0 ? "text-profit/70" : "text-loss/70")}>
                      {p.unrealizedPercent >= 0 ? "+" : ""}{p.unrealizedPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-right py-2.5 hidden sm:table-cell">
                    {p.slDistance !== null ? (
                      <span className={cn(
                        "text-xs font-mono px-1.5 py-0.5 rounded",
                        p.slDistance > 3 ? "bg-profit/10 text-profit" : p.slDistance > 1 ? "bg-warning/10 text-warning" : "bg-loss/10 text-loss"
                      )}>
                        {p.slDistance.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
