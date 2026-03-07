import { useDashboard } from "@/pages/Dashboard";
import { useUserSettings } from "@/hooks/useUserSettings";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatting";
import { Shield, Target, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import { TradeStatus } from "@/lib/constants";

export function RiskGoalWidget() {
  const { monthTrades, openTrades } = useDashboard();
  const { settings } = useUserSettings();

  const startingCapital = settings?.starting_capital || 500000;

  const riskAtSL = useMemo(() => openTrades.reduce((a, t) => {
    if (!t.stop_loss || !t.entry_price) return a;
    const risk = t.trade_type === "BUY"
      ? (t.entry_price - t.stop_loss) * t.quantity
      : (t.stop_loss - t.entry_price) * t.quantity;
    return a + Math.max(0, risk);
  }, 0), [openTrades]);

  const riskPercent = (riskAtSL / startingCapital) * 100;

  const today = new Date().toDateString();
  const todayPnl = useMemo(() => {
    const closedToday = monthTrades.filter(
      (t) => t.status === TradeStatus.CLOSED && t.closed_at && new Date(t.closed_at).toDateString() === today
    );
    return closedToday.reduce((a, t) => a + (t.pnl || 0), 0);
  }, [monthTrades, today]);

  const mtdPnl = useMemo(() => {
    const closed = monthTrades.filter((t) => t.status === TradeStatus.CLOSED);
    return closed.reduce((a, t) => a + (t.pnl || 0), 0);
  }, [monthTrades]);

  const dailyGoal = startingCapital * 0.01;
  const monthlyGoal = startingCapital * 0.05;
  const dailyProgress = Math.min((todayPnl / dailyGoal) * 100, 100);
  const monthlyProgress = Math.min((mtdPnl / monthlyGoal) * 100, 100);

  const maxRiskPercent = 2;
  const riskLevel = riskPercent > maxRiskPercent ? "danger" : riskPercent > maxRiskPercent * 0.6 ? "warn" : "safe";
  const riskBarWidth = Math.min(riskPercent / maxRiskPercent * 100, 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Risk Gauge */}
      <div className={cn("premium-card-hover", riskLevel === "danger" ? "card-glow-loss" : riskLevel === "warn" ? "card-glow-primary" : "card-glow-profit")}>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "icon-badge",
            riskLevel === "danger" ? "bg-loss/10" : riskLevel === "warn" ? "bg-warning/10" : "bg-profit/10"
          )}>
            <Shield className={cn("w-4.5 h-4.5", riskLevel === "danger" ? "text-loss" : riskLevel === "warn" ? "text-warning" : "text-profit")} />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Capital at Risk</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <p className={cn("text-[28px] font-bold font-mono leading-none", riskLevel === "danger" ? "text-loss" : riskLevel === "warn" ? "text-warning" : "text-profit")}>
            {riskPercent.toFixed(1)}%
          </p>
          <span className="text-xs text-muted-foreground">of {formatCurrency(startingCapital, 0)}</span>
        </div>

        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 relative bar-shine",
              riskLevel === "danger"
                ? "bg-gradient-to-r from-loss to-loss/80"
                : riskLevel === "warn"
                ? "bg-gradient-to-r from-warning to-warning/80"
                : "bg-gradient-to-r from-profit to-profit/80"
            )}
            style={{ width: `${riskBarWidth}%` }}
          />
          {/* Danger zone marker */}
          <div className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: "100%" }}>
            <div className="w-px h-full border-l border-dashed border-loss/50" />
          </div>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">{formatCurrency(riskAtSL, 0)} at SL</span>
          <span className="text-[10px] text-loss/70 font-medium">Max: {maxRiskPercent}%</span>
        </div>
      </div>

      {/* Goal Tracker */}
      <div className="premium-card-hover card-glow-primary">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-badge bg-primary/10">
            <Target className="w-4.5 h-4.5 text-primary" />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">P&L Goals</span>
        </div>

        {/* Daily goal */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Daily (1%)</span>
              {dailyProgress >= 100 && <CheckCircle2 className="w-3.5 h-3.5 text-profit" />}
            </div>
            <span className={cn("text-xs font-bold font-mono", todayPnl >= 0 ? "text-profit" : "text-loss")}>
              {formatCurrency(todayPnl, 0)} / {formatCurrency(dailyGoal, 0)}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden relative">
            <div
              className={cn("h-full rounded-full transition-all duration-500 relative bar-shine", todayPnl >= 0 ? "bg-gradient-to-r from-profit to-profit/80" : "bg-gradient-to-r from-loss to-loss/80")}
              style={{ width: `${Math.max(dailyProgress, 0)}%` }}
            />
          </div>
        </div>

        {/* Monthly goal */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Monthly (5%)</span>
              {monthlyProgress >= 100 && <CheckCircle2 className="w-3.5 h-3.5 text-profit" />}
            </div>
            <span className={cn("text-xs font-bold font-mono", mtdPnl >= 0 ? "text-profit" : "text-loss")}>
              {formatCurrency(mtdPnl, 0)} / {formatCurrency(monthlyGoal, 0)}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden relative">
            <div
              className={cn("h-full rounded-full transition-all duration-500 relative bar-shine", mtdPnl >= 0 ? "bg-gradient-to-r from-profit to-profit/80" : "bg-gradient-to-r from-loss to-loss/80")}
              style={{ width: `${Math.max(monthlyProgress, 0)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
