import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Target, Activity, CalendarDays } from "lucide-react";
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
import { RiskOfRuinCalculator } from "@/components/analytics/RiskOfRuinCalculator";
import { AIPatternDetection } from "@/components/analytics/AIPatternDetection";
import { SectorRotationHeatmap } from "@/components/analytics/SectorRotationHeatmap";
import { SetupWinRateMatrix } from "@/components/analytics/SetupWinRateMatrix";
import { EmotionalPnlCorrelation } from "@/components/analytics/EmotionalPnlCorrelation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

type DatePreset = "7d" | "30d" | "90d" | "mtd" | "all" | "custom";

export default function Analytics() {
  const { trades, summary } = useTrades();
  const { settings } = useUserSettings();
  const { transactions: capitalTransactions } = useCapitalTransactions();

  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (datePreset) {
      case "7d": return { from: subDays(now, 7), to: now };
      case "30d": return { from: subDays(now, 30), to: now };
      case "90d": return { from: subDays(now, 90), to: now };
      case "mtd": return { from: startOfMonth(now), to: endOfMonth(now) };
      case "custom": return { from: customRange.from, to: customRange.to };
      default: return { from: undefined, to: undefined };
    }
  }, [datePreset, customRange]);

  const closed = useMemo(() => {
    const all = trades.filter((t) => t.status === "CLOSED");
    if (!dateRange.from || !dateRange.to) return all;
    return all.filter((t) => {
      const d = new Date(t.closed_at || t.entry_time);
      return isWithinInterval(d, { start: dateRange.from!, end: dateRange.to! });
    });
  }, [trades, dateRange]);

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

  const presets: { label: string; value: DatePreset }[] = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
    { label: "MTD", value: "mtd" },
    { label: "All", value: "all" },
  ];

  return (
    <div className="space-y-6 animate-fade-in" role="region" aria-label="Trading analytics">
      <PageHeader title="Analytics" subtitle="Deep dive into your trading performance.">
        <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => setDatePreset(p.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                datePreset === p.value
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2", datePreset === "custom" && "border-primary text-primary")}
            >
              <CalendarDays className="w-4 h-4" />
              {datePreset === "custom" && customRange.from && customRange.to
                ? `${format(customRange.from, "dd MMM")} – ${format(customRange.to, "dd MMM")}`
                : "Custom"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={customRange.from && customRange.to ? { from: customRange.from, to: customRange.to } : undefined}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setCustomRange({ from: range.from, to: range.to });
                  setDatePreset("custom");
                }
              }}
              className="p-3 pointer-events-auto"
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </PageHeader>

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

      {/* AI Pattern Detection */}
      <AIPatternDetection trades={trades} />

      {/* Equity Curve & Drawdown */}
      <EquityCurveDrawdown trades={trades} startingCapital={startingCapital} capitalTransactions={capitalTransactions} />

      {/* Sector Rotation & Emotional Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectorRotationHeatmap trades={trades} />
        <EmotionalPnlCorrelation trades={trades} />
      </div>

      {/* Segment Performance Breakdown */}
      <PlanGate plan="pro" feature="advancedAnalytics" message="Upgrade to Pro to unlock segment breakdown, time analysis, and more.">
        <SegmentPerformance trades={trades} />

        {/* Setup Win-Rate Matrix */}
        <div className="mt-4">
          <SetupWinRateMatrix trades={trades} />
        </div>

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

        {/* Risk-Reward Analytics & Risk of Ruin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <RiskRewardAnalytics trades={trades} />
          <RiskOfRuinCalculator
            winRate={summary.winRate}
            avgWinAmount={avgWin}
            avgLossAmount={avgLoss}
            startingCapital={startingCapital}
          />
        </div>
      </PlanGate>

      {closed.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Close some trades to see your performance analytics."
          steps={["Log a trade", "Close with P&L", "View insights"]}
        />
      )}
    </div>
  );
}
