import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface Trade {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  segment: string;
}

const recentTrades: Trade[] = [
  {
    id: "1",
    symbol: "RELIANCE",
    type: "BUY",
    quantity: 100,
    entryPrice: 2400,
    currentPrice: 2485,
    pnl: 8500,
    pnlPercent: 3.54,
    segment: "Equity",
  },
  {
    id: "2",
    symbol: "NIFTY 24JAN 22000CE",
    type: "BUY",
    quantity: 50,
    entryPrice: 180,
    currentPrice: 245,
    pnl: 3250,
    pnlPercent: 36.11,
    segment: "Options",
  },
  {
    id: "3",
    symbol: "TATASTEEL",
    type: "SELL",
    quantity: 200,
    entryPrice: 135,
    currentPrice: 138,
    pnl: -600,
    pnlPercent: -2.22,
    segment: "Equity",
  },
  {
    id: "4",
    symbol: "BANKNIFTY FUT",
    type: "BUY",
    quantity: 25,
    entryPrice: 48200,
    currentPrice: 48650,
    pnl: 11250,
    pnlPercent: 0.93,
    segment: "Futures",
  },
  {
    id: "5",
    symbol: "INFY",
    type: "BUY",
    quantity: 150,
    entryPrice: 1580,
    currentPrice: 1545,
    pnl: -5250,
    pnlPercent: -2.22,
    segment: "Equity",
  },
];

export function RecentTrades() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Open Positions</h3>
          <p className="text-sm text-muted-foreground">
            {recentTrades.length} active trades
          </p>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          View All →
        </button>
      </div>
      <div className="space-y-3">
        {recentTrades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  trade.type === "BUY" ? "bg-profit/10" : "bg-loss/10"
                )}
              >
                {trade.type === "BUY" ? (
                  <ArrowUpRight className="w-5 h-5 text-profit" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-loss" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{trade.symbol}</p>
                <p className="text-xs text-muted-foreground">
                  {trade.quantity} × ₹{trade.entryPrice.toLocaleString()} •{" "}
                  {trade.segment}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "font-semibold text-sm",
                  trade.pnl >= 0 ? "text-profit" : "text-loss"
                )}
              >
                {trade.pnl >= 0 ? "+" : ""}₹{trade.pnl.toLocaleString()}
              </p>
              <p
                className={cn(
                  "text-xs",
                  trade.pnl >= 0 ? "text-profit/80" : "text-loss/80"
                )}
              >
                {trade.pnlPercent >= 0 ? "+" : ""}
                {trade.pnlPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
