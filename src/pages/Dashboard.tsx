import { useMemo } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { AlertsWidget } from "@/components/dashboard/AlertsWidget";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { TodaysPnl } from "@/components/dashboard/TodaysPnl";
import { SegmentBreakdown } from "@/components/dashboard/SegmentBreakdown";
import { OpenPositionsTable } from "@/components/dashboard/OpenPositionsTable";
import { CalendarHeatmap } from "@/components/dashboard/CalendarHeatmap";
import { StreakDiscipline } from "@/components/dashboard/StreakDiscipline";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  Wallet,
  TrendingUp,
  Target,
  AlertCircle,
  Radio,
} from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { useAlerts } from "@/hooks/useAlerts";
import { useLivePrices } from "@/hooks/useLivePrices";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { trades, summary, isLoading: tradesLoading } = useTrades();
  const { alerts, isLoading: alertsLoading } = useAlerts({ active: true });

  const openTrades = trades.filter((t) => t.status === "OPEN");
  
  const openTradeSymbols = useMemo(() => {
    return openTrades.map((t) => t.symbol);
  }, [openTrades]);

  const { prices, isPolling, lastUpdated } = useLivePrices(openTradeSymbols, 30000);

  const capitalAtRisk = openTrades.reduce((acc, t) => {
    const currentPrice = prices[t.symbol]?.ltp || t.current_price || t.entry_price;
    return acc + currentPrice * t.quantity;
  }, 0);

  const triggeredAlerts = alerts.filter((a) => a.last_triggered).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your trading overview.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isPolling && openTradeSymbols.length > 0 ? (
            <>
              <Radio className="w-3 h-3 text-profit animate-pulse" />
              <span className="text-profit">Live</span>
              {lastUpdated && (
                <span>• {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              )}
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
              Market Open • NSE
            </>
          )}
        </div>
      </div>

      {/* Top Row: Today's P&L + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tradesLoading ? (
          <>
            <Skeleton className="h-36" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <TodaysPnl />
            <StatCard
              title="Open Positions"
              value={String(summary.openPositions)}
              change={`₹${capitalAtRisk.toLocaleString()} at risk`}
              changeType="neutral"
              icon={Target}
              subtitle={`${trades.length} total trades`}
            />
            <StatCard
              title="Win Rate"
              value={`${summary.winRate.toFixed(1)}%`}
              change={`${summary.closedToday} closed today`}
              changeType={summary.winRate >= 50 ? "profit" : "loss"}
              icon={TrendingUp}
              subtitle="Closed trades"
            />
            <StatCard
              title="Active Alerts"
              value={String(alerts.length)}
              change={triggeredAlerts > 0 ? `${triggeredAlerts} triggered` : "Monitoring"}
              changeType={triggeredAlerts > 0 ? "loss" : "neutral"}
              icon={AlertCircle}
              subtitle="Price & technical"
            />
          </>
        )}
      </div>

      {/* Equity Curve + Segment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EquityCurve />
        </div>
        <div>
          <SegmentBreakdown />
        </div>
      </div>

      {/* Open Positions Table */}
      <OpenPositionsTable />

      {/* Calendar + Streak + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CalendarHeatmap />
        <StreakDiscipline />
        <AlertsWidget />
      </div>

      {/* Performance Metrics */}
      <PerformanceMetrics />

      {/* Quick Actions FAB */}
      <QuickActions />
    </div>
  );
}
