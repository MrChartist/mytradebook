import { useDashboard } from "@/pages/Dashboard";
import { useUserSettings } from "@/hooks/useUserSettings";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatting";
import { Shield, Target } from "lucide-react";
import { useMemo } from "react";
import { calculatePnL } from "@/lib/calculations";
import { TradeStatus } from "@/lib/constants";

export function RiskGoalWidget() {
  const { monthTrades, openTrades, prices } = useDashboard();
  const { settings } = useUserSettings();

  const startingCapital = settings?.starting_capital || 500000;

  // Risk at stop loss
  const riskAtSL = useMemo(() => openTrades.reduce((a, t) => {
    if (!t.stop_loss || !t.entry_price) return a;
    const risk = t.trade_type === "BUY"
      ? (t.entry_price - t.stop_loss) * t.quantity
      : (t.stop_loss - t.entry_price) * t.quantity;
    return a + Math.max(0, risk);
  }, 0), [openTrades]);

  const riskPercent = (riskAtSL / startingCapital) * 100;

  // Today's P&L for daily goal
  const today = new Date().toDateString();
  const todayPnl = useMemo(() => {
    const closedToday = monthTrades.filter(
      (t) => t.status === TradeStatus.CLOSED && t.closed_at && new Date(t.closed_at).toDateString() === today
    );
    return closedToday.reduce((a, t) => a + (t.pnl || 0), 0);
  }, [monthTrades, today]);

  // MTD P&L
  const mtdPnl = useMemo(() => {
    const closed = monthTrades.filter((t) => t.status === TradeStatus.CLOSED);
    return closed.reduce((a, t) => a + (t.pnl || 0), 0);
  }, [monthTrades]);

  // Goals: 1% daily, 5% monthly of starting capital
  const dailyGoal = startingCapital * 0.01;
  const monthlyGoal = startingCapital * 0.05;
  const dailyProgress = Math.min((todayPnl / dailyGoal) * 100, 100);
  const monthlyProgress = Math.min((mtdPnl / monthlyGoal) * 100, 100);

  // Max risk threshold: 2% of capital
  const maxRiskPercent = 2;
  const riskLevel = riskPercent > maxRiskPercent ? "danger" : riskPercent > maxRiskPercent * 0.6 ? "warn" : "safe";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Risk Gauge */}
      <div className="premium-card-hover !p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            "inner-panel !p-2 !rounded-xl",
            riskLevel === "danger" ? "!bg-loss/8 !border-loss/15" : riskLevel === "warn" ? "!bg-warning/8 !border-warning/15" : "!bg-profit/8 !border-profit/15"
          )}>
            <Shield className={cn("w-4 h-4", riskLevel === "danger" ? "text-loss" : riskLevel === "warn" ? "text-warning" : "text-profit")} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Capital at Risk</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <p className={cn("text-2xl font-bold font-mono", riskLevel === "danger" ? "text-loss" : riskLevel === "warn" ? "text-warning" : "text-profit")}>
            {riskPercent.toFixed(1)}%
          </p>
          <span className="text-xs text-muted-foreground">of {formatCurrency(startingCapital, 0)}</span>
        </div>

        {/* Risk bar */}
        <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              riskLevel === "danger" ? "bg-loss" : riskLevel === "warn" ? "bg-warning" : "bg-profit"
            )}
            style={{ width: `${Math.min(riskPercent / maxRiskPercent * 100, 100)}%` }}
          />
          {/* Threshold marker */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/30" style={{ left: "100%" }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{formatCurrency(riskAtSL, 0)} at SL</span>
          <span className="text-[10px] text-muted-foreground">Max: {maxRiskPercent}%</span>
        </div>
      </div>

      {/* Goal Tracker */}
      <div className="premium-card-hover !p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="inner-panel !p-2 !rounded-xl !bg-primary/8 !border-primary/15">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">P&L Goals</span>
        </div>

        {/* Daily goal */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Daily (1%)</span>
            <span className={cn("text-xs font-bold font-mono", todayPnl >= 0 ? "text-profit" : "text-loss")}>
              {formatCurrency(todayPnl, 0)} / {formatCurrency(dailyGoal, 0)}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", todayPnl >= 0 ? "bg-profit" : "bg-loss")}
              style={{ width: `${Math.max(dailyProgress, 0)}%` }}
            />
          </div>
        </div>

        {/* Monthly goal */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Monthly (5%)</span>
            <span className={cn("text-xs font-bold font-mono", mtdPnl >= 0 ? "text-profit" : "text-loss")}>
              {formatCurrency(mtdPnl, 0)} / {formatCurrency(monthlyGoal, 0)}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", mtdPnl >= 0 ? "bg-profit" : "bg-loss")}
              style={{ width: `${Math.max(monthlyProgress, 0)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
