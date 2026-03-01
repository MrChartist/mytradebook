import { BarChart3, TrendingUp, TrendingDown, Target, Activity } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useCapitalTransactions } from "@/hooks/useCapitalTransactions";
import { StatCard } from "@/components/dashboard/StatCard";
import { EquityCurveDrawdown } from "@/components/analytics/EquityCurveDrawdown";
import { RiskRewardAnalytics } from "@/components/analytics/RiskRewardAnalytics";
import { SegmentPerformance } from "@/components/analytics/SegmentPerformance";
import { TimeOfDayAnalysis } from "@/components/analytics/TimeOfDayAnalysis";
import { DayOfWeekAnalysis } from "@/components/analytics/DayOfWeekAnalysis";
import { StreakTracker } from "@/components/analytics/StreakTracker";
import { SetupTagPerformance } from "@/components/analytics/SetupTagPerformance";
import { PlanGate } from "@/components/PlanGate";
import { AITradeInsights } from "@/components/analytics/AITradeInsights";

export default function Analytics() {
  const { trades, summary } = useTrades();
  const { settings } = useUserSettings();
  const { transactions: capitalTransactions } = useCapitalTransactions();
  const closed = trades.filter((t) => t.status === "CLOSED");

  const startingCapital = (settings as any)?.starting_capital ?? 500000;

  const totalPnl = closed.reduce((a, t) => a + (t.pnl || 0), 0);
  const wins = closed.filter((t) => (t.pnl || 0) > 0);
  const losses = closed.filter((t) => (t.pnl || 0) < 0);
  const avgWin = wins.length ? wins.reduce((a, t) => a + (t.pnl || 0), 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + (t.pnl || 0), 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;
  const expectancy = closed.length ? totalPnl / closed.length : 0;
  const bestTrade = closed.length ? Math.max(...closed.map((t) => t.pnl || 0)) : 0;
  const worstTrade = closed.length ? Math.min(...closed.map((t) => t.pnl || 0)) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Deep dive into your trading performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Win Rate" value={`${summary.winRate.toFixed(1)}%`} change={`${closed.length} trades`} changeType={summary.winRate >= 50 ? "profit" : "loss"} icon={Target} subtitle="Closed" href="/trades?status=CLOSED" />
        <StatCard title="Total P&L" value={`₹${totalPnl.toLocaleString("en-IN")}`} change={`${wins.length}W / ${losses.length}L`} changeType={totalPnl >= 0 ? "profit" : "loss"} icon={BarChart3} subtitle="All time" href="/reports" />
        <StatCard title="Avg Win" value={`₹${avgWin.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change={`${wins.length} wins`} changeType="profit" icon={TrendingUp} subtitle="Per trade" href="/journal" />
        <StatCard title="Avg Loss" value={`₹${avgLoss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change={`${losses.length} losses`} changeType="loss" icon={TrendingDown} subtitle="Per trade" href="/journal" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Expectancy" value={`₹${expectancy.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change="Per trade" changeType={expectancy >= 0 ? "profit" : "loss"} icon={Activity} subtitle="Expected" href="/reports" />
        <StatCard title="Profit Factor" value={profitFactor.toFixed(2)} change={profitFactor >= 1.5 ? "Strong" : profitFactor >= 1 ? "Positive" : "Weak"} changeType={profitFactor >= 1 ? "profit" : "loss"} icon={BarChart3} subtitle="Ratio" href="/journal" />
        <StatCard title="Best Trade" value={`₹${bestTrade.toLocaleString("en-IN")}`} change="Single trade" changeType="profit" icon={TrendingUp} subtitle="Max profit" href="/trades?status=CLOSED" />
        <StatCard title="Worst Trade" value={`₹${worstTrade.toLocaleString("en-IN")}`} change="Single trade" changeType="loss" icon={TrendingDown} subtitle="Max loss" href="/trades?status=CLOSED" />
      </div>

      {/* AI Trade Insights */}
      <PlanGate plan="pro" feature="advancedAnalytics" message="Upgrade to Pro to unlock AI-powered trade insights.">
        <AITradeInsights />
      </PlanGate>

      {/* Equity Curve & Drawdown */}
      <EquityCurveDrawdown trades={trades} startingCapital={startingCapital} capitalTransactions={capitalTransactions} />

      {/* Segment Performance Breakdown */}
      <PlanGate plan="pro" feature="advancedAnalytics" message="Upgrade to Pro to unlock segment breakdown, time analysis, and more.">
        <SegmentPerformance trades={trades} />

        {/* Time & Day Heatmaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <TimeOfDayAnalysis trades={trades} />
          <DayOfWeekAnalysis trades={trades} />
        </div>

        {/* Streak & Tag Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <StreakTracker trades={trades} />
          <SetupTagPerformance trades={trades} />
        </div>

        {/* Risk-Reward Analytics */}
        <RiskRewardAnalytics trades={trades} />
      </PlanGate>

      {closed.length === 0 && (
        <div className="surface-card p-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No analytics yet</h3>
          <p className="text-muted-foreground text-sm">Close some trades to see your performance analytics.</p>
        </div>
      )}
    </div>
  );
}
