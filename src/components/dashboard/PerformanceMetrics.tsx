import { cn } from "@/lib/utils";

interface Metric {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: boolean;
}

const metrics: Metric[] = [
  { label: "Win Rate", value: "68%", sublabel: "Last 30 trades", highlight: true },
  { label: "Avg Win", value: "₹12,450", sublabel: "+4.2% per trade" },
  { label: "Avg Loss", value: "₹5,820", sublabel: "-2.1% per trade" },
  { label: "Profit Factor", value: "2.14", sublabel: "Risk/Reward" },
  { label: "Max Drawdown", value: "-8.5%", sublabel: "Peak to trough" },
  { label: "Sharpe Ratio", value: "1.85", sublabel: "Risk-adjusted return" },
];

export function PerformanceMetrics() {
  return (
    <div className="glass-card p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Performance Metrics</h3>
        <p className="text-sm text-muted-foreground">This month's statistics</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={cn(
              "p-3 rounded-lg",
              metric.highlight
                ? "bg-primary/10 border border-primary/20"
                : "bg-accent/50"
            )}
          >
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {metric.label}
            </p>
            <p
              className={cn(
                "text-xl font-bold mt-1",
                metric.highlight && "text-primary"
              )}
            >
              {metric.value}
            </p>
            {metric.sublabel && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {metric.sublabel}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
