import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export function RecentTrades() {
  const { trades, isLoading } = useTrades({ status: "OPEN" });
  const openTrades = trades.slice(0, 5);

  if (isLoading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Open Positions</h3>
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Open Positions</h3>
          <p className="text-sm text-muted-foreground">
            {openTrades.length} active trade{openTrades.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link 
          to="/trades" 
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View All →
        </Link>
      </div>
      {openTrades.length > 0 ? (
        <div className="space-y-3">
          {openTrades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    trade.trade_type === "BUY" ? "bg-profit/10" : "bg-loss/10"
                  )}
                >
                  {trade.trade_type === "BUY" ? (
                    <ArrowUpRight className="w-5 h-5 text-profit" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-loss" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{trade.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    {trade.quantity} × ₹{trade.entry_price.toLocaleString()} •{" "}
                    {trade.segment.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "font-semibold text-sm",
                    (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss"
                  )}
                >
                  {(trade.pnl || 0) >= 0 ? "+" : ""}₹{(trade.pnl || 0).toLocaleString()}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    (trade.pnl_percent || 0) >= 0 ? "text-profit/80" : "text-loss/80"
                  )}
                >
                  {(trade.pnl_percent || 0) >= 0 ? "+" : ""}
                  {(trade.pnl_percent || 0).toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No open positions</p>
          <Link to="/trades" className="text-primary text-sm hover:underline">
            Create a trade →
          </Link>
        </div>
      )}
    </div>
  );
}
