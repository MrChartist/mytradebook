import { StatCard } from "@/components/dashboard/StatCard";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { AlertsWidget } from "@/components/dashboard/AlertsWidget";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import {
  Wallet,
  TrendingUp,
  Target,
  AlertCircle,
} from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { useAlerts } from "@/hooks/useAlerts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { trades, summary, isLoading: tradesLoading } = useTrades();
  const { alerts, isLoading: alertsLoading } = useAlerts({ active: true });

  const openTrades = trades.filter((t) => t.status === "OPEN");
  const capitalAtRisk = openTrades.reduce(
    (acc, t) => acc + t.entry_price * t.quantity,
    0
  );

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
          <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
          Market Open • NSE
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tradesLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Total P&L"
              value={`${summary.totalPnl >= 0 ? "+" : ""}₹${summary.totalPnl.toLocaleString()}`}
              change={`${summary.winRate.toFixed(1)}% win rate`}
              changeType={summary.totalPnl >= 0 ? "profit" : "loss"}
              icon={Wallet}
              subtitle="All segments"
            />
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve - Takes 2 columns */}
        <div className="lg:col-span-2">
          <EquityCurve />
        </div>

        {/* Alerts Widget */}
        <div>
          <AlertsWidget />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTrades />
        <PerformanceMetrics />
      </div>
    </div>
  );
}
