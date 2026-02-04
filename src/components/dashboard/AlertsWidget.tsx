import { Bell, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  symbol: string;
  condition: string;
  threshold: number;
  currentPrice: number;
  triggered: boolean;
  type: "price_above" | "price_below" | "percent_change";
}

const alerts: Alert[] = [
  {
    id: "1",
    symbol: "RELIANCE",
    condition: "Price Above",
    threshold: 2500,
    currentPrice: 2485,
    triggered: false,
    type: "price_above",
  },
  {
    id: "2",
    symbol: "NIFTY 50",
    condition: "Price Below",
    threshold: 21800,
    currentPrice: 22150,
    triggered: false,
    type: "price_below",
  },
  {
    id: "3",
    symbol: "BANKNIFTY",
    condition: "% Change",
    threshold: 2,
    currentPrice: 48650,
    triggered: true,
    type: "percent_change",
  },
  {
    id: "4",
    symbol: "TCS",
    condition: "Price Above",
    threshold: 4000,
    currentPrice: 3920,
    triggered: false,
    type: "price_above",
  },
];

export function AlertsWidget() {
  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Active Alerts</h3>
            <p className="text-sm text-muted-foreground">
              {triggeredCount > 0 ? (
                <span className="text-warning">{triggeredCount} triggered</span>
              ) : (
                `${alerts.length} monitoring`
              )}
            </p>
          </div>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          Manage →
        </button>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-colors",
              alert.triggered
                ? "bg-warning/10 border border-warning/20"
                : "bg-accent/50 hover:bg-accent"
            )}
          >
            <div className="flex items-center gap-3">
              {alert.type === "price_above" ? (
                <TrendingUp className="w-4 h-4 text-profit" />
              ) : alert.type === "price_below" ? (
                <TrendingDown className="w-4 h-4 text-loss" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning" />
              )}
              <div>
                <p className="font-medium text-sm">{alert.symbol}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.condition}: ₹{alert.threshold.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm">
                ₹{alert.currentPrice.toLocaleString()}
              </p>
              {alert.triggered && (
                <span className="text-xs text-warning font-medium">
                  TRIGGERED
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
