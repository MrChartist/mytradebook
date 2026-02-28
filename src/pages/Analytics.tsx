import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Target, Activity, CalendarDays } from "lucide-react";
import { subDays, subMonths, subYears, isAfter, startOfDay } from "date-fns";
import { useTrades } from "@/hooks/useTrades";
import { useUserSettings } from "@/hooks/useUserSettings";
import { StatCard } from "@/components/dashboard/StatCard";
import { EquityCurveDrawdown } from "@/components/analytics/EquityCurveDrawdown";
import { RiskRewardAnalytics } from "@/components/analytics/RiskRewardAnalytics";
import { SegmentPerformance } from "@/components/analytics/SegmentPerformance";
import { TimeOfDayAnalysis } from "@/components/analytics/TimeOfDayAnalysis";
import { DayOfWeekAnalysis } from "@/components/analytics/DayOfWeekAnalysis";
import { StreakTracker } from "@/components/analytics/StreakTracker";
import { SetupTagPerformance } from "@/components/analytics/SetupTagPerformance";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DateRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "All" },
];

function getDateCutoff(range: DateRange): Date | null {
  const now = new Date();
  switch (range) {
    case "1W": return subDays(now, 7);
    case "1M": return subMonths(now, 1);
    case "3M": return subMonths(now, 3);
    case "6M": return subMonths(now, 6);
    case "1Y": return subYears(now, 1);
    case "ALL": return null;
  }
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>("ALL");
  const { trades: allTrades, summary } = useTrades();
  const { settings } = useUserSettings();

  const trades = useMemo(() => {
    const cutoff = getDateCutoff(dateRange);
    if (!cutoff) return allTrades;
    return allTrades.filter((t) => {
      const d = new Date(t.entry_time);
      return isAfter(d, startOfDay(cutoff));
    });
  }, [allTrades, dateRange]);

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
  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Deep dive into your trading performance.</p>
        </div>
        {/* Date range filter */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          {DATE_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setDateRange(r.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                dateRange === r.value
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Win Rate" value={`${winRate.toFixed(1)}%`} change={`${closed.length} trades`} changeType={winRate >= 50 ? "profit" : "loss"} icon={Target} subtitle="Closed" href="/trades?status=CLOSED" />
        <StatCard title="Total P&L" value={`₹${totalPnl.toLocaleString("en-IN")}`} change={`${wins.length}W / ${losses.length}L`} changeType={totalPnl >= 0 ? "profit" : "loss"} icon={BarChart3} subtitle={dateRange === "ALL" ? "All time" : `Last ${dateRange}`} href="/reports" />
        <StatCard title="Avg Win" value={`₹${avgWin.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change={`${wins.length} wins`} changeType="profit" icon={TrendingUp} subtitle="Per trade" href="/journal" />
        <StatCard title="Avg Loss" value={`₹${avgLoss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change={`${losses.length} losses`} changeType="loss" icon={TrendingDown} subtitle="Per trade" href="/journal" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Expectancy" value={`₹${expectancy.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change="Per trade" changeType={expectancy >= 0 ? "profit" : "loss"} icon={Activity} subtitle="Expected" href="/reports" />
        <StatCard title="Profit Factor" value={profitFactor.toFixed(2)} change={profitFactor >= 1.5 ? "Strong" : profitFactor >= 1 ? "Positive" : "Weak"} changeType={profitFactor >= 1 ? "profit" : "loss"} icon={BarChart3} subtitle="Ratio" href="/journal" />
        <StatCard title="Best Trade" value={`₹${bestTrade.toLocaleString("en-IN")}`} change="Single trade" changeType="profit" icon={TrendingUp} subtitle="Max profit" href="/trades?status=CLOSED" />
        <StatCard title="Worst Trade" value={`₹${worstTrade.toLocaleString("en-IN")}`} change="Single trade" changeType="loss" icon={TrendingDown} subtitle="Max loss" href="/trades?status=CLOSED" />
      </div>

      <EquityCurveDrawdown trades={trades} startingCapital={startingCapital} />
      <SegmentPerformance trades={trades} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TimeOfDayAnalysis trades={trades} />
        <DayOfWeekAnalysis trades={trades} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StreakTracker trades={trades} />
        <SetupTagPerformance trades={trades} />
      </div>

      <RiskRewardAnalytics trades={trades} />

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
