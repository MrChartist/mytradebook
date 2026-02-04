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

export default function Dashboard() {
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
        <StatCard
          title="Portfolio Value"
          value="₹14,25,000"
          change="+₹42,000 (3.04%)"
          changeType="profit"
          icon={Wallet}
          subtitle="All segments"
        />
        <StatCard
          title="Today's P&L"
          value="+₹18,500"
          change="+1.32% today"
          changeType="profit"
          icon={TrendingUp}
          subtitle="5 trades executed"
        />
        <StatCard
          title="Open Positions"
          value="8"
          change="₹2,85,000 at risk"
          changeType="neutral"
          icon={Target}
          subtitle="Across 3 segments"
        />
        <StatCard
          title="Active Alerts"
          value="12"
          change="2 triggered"
          changeType="loss"
          icon={AlertCircle}
          subtitle="Price & technical"
        />
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
