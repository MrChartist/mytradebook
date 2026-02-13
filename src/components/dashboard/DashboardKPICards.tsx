import { useMemo } from "react";
import { useDashboard } from "@/pages/Dashboard";
import { cn } from "@/lib/utils";
import { Wallet, Target, TrendingUp, Bell, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";

const fmt = (v: number) =>
  `${v >= 0 ? "+" : ""}₹${Math.abs(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

interface Props {
  alerts: { id: string; last_triggered: string | null; condition_type: string }[];
}

export function DashboardKPICards({ alerts }: Props) {
  const { monthTrades, openTrades, prices } = useDashboard();

  const closedMonth = useMemo(() => monthTrades.filter((t) => t.status === "CLOSED"), [monthTrades]);
  const wins = closedMonth.filter((t) => (t.pnl || 0) > 0);
  const losses = closedMonth.filter((t) => (t.pnl || 0) < 0);

  const realizedPnl = closedMonth.reduce((a, t) => a + (t.pnl || 0), 0);
  const unrealizedPnl = openTrades.reduce((a, t) => {
    const ltp = prices[t.symbol]?.ltp || t.current_price || t.entry_price || 0;
    const entry = t.entry_price || 0;
    return a + (t.trade_type === "BUY" ? (ltp - entry) * t.quantity : (entry - ltp) * t.quantity);
  }, 0);

  const todayClosed = closedMonth.filter(
    (t) => t.closed_at && new Date(t.closed_at).toDateString() === new Date().toDateString()
  );
  const todayPnl = todayClosed.reduce((a, t) => a + (t.pnl || 0), 0);

  const riskAtSL = openTrades.reduce((a, t) => {
    if (!t.stop_loss || !t.entry_price) return a;
    const risk = t.trade_type === "BUY"
      ? (t.entry_price - t.stop_loss) * t.quantity
      : (t.stop_loss - t.entry_price) * t.quantity;
    return a + Math.max(0, risk);
  }, 0);

  const winRate = closedMonth.length > 0 ? (wins.length / closedMonth.length) * 100 : 0;
  const expectancy = closedMonth.length > 0 ? realizedPnl / closedMonth.length : 0;

  const triggeredToday = alerts.filter(
    (a) => a.last_triggered && new Date(a.last_triggered).toDateString() === new Date().toDateString()
  ).length;

  const priceAlerts = alerts.filter((a) => ["PRICE_GT", "PRICE_LT"].includes(a.condition_type)).length;
  const techAlerts = alerts.length - priceAlerts;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total P&L */}
      <Link to="/trades" className="surface-card-hover p-4 block">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">MTD P&L</span>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", realizedPnl + unrealizedPnl >= 0 ? "bg-profit/8" : "bg-loss/8")}>
            <Wallet className={cn("w-4 h-4", realizedPnl + unrealizedPnl >= 0 ? "text-profit" : "text-loss")} />
          </div>
        </div>
        <p className={cn("text-2xl font-bold", realizedPnl + unrealizedPnl >= 0 ? "text-profit" : "text-loss")}>
          {fmt(realizedPnl + unrealizedPnl)}
        </p>
        <div className="flex gap-3 mt-2">
          <div>
            <p className="text-[10px] text-muted-foreground">Realized</p>
            <p className={cn("text-xs font-semibold", realizedPnl >= 0 ? "text-profit" : "text-loss")}>{fmt(realizedPnl)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Unrealized</p>
            <p className={cn("text-xs font-semibold", unrealizedPnl >= 0 ? "text-profit" : "text-loss")}>{fmt(unrealizedPnl)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
          <span>Today: </span>
          <span className={cn("font-medium", todayPnl >= 0 ? "text-profit" : "text-loss")}>{fmt(todayPnl)}</span>
          <span className="mx-1">•</span>
          <span>Closed: {closedMonth.length} | Open: {openTrades.length}</span>
        </div>
      </Link>

      {/* Open Positions */}
      <Link to="/trades" className="surface-card-hover p-4 block">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Open Positions</span>
          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
        </div>
        <p className="text-2xl font-bold">{openTrades.length}</p>
        <p className="text-xs text-muted-foreground mt-1">
          ₹{riskAtSL.toLocaleString("en-IN", { maximumFractionDigits: 0 })} at risk (to SL)
        </p>
        <p className="text-[10px] text-muted-foreground mt-1.5">{monthTrades.length} total trades this month</p>
      </Link>

      {/* Win Rate */}
      <div className="surface-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Win Rate</span>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", winRate >= 50 ? "bg-profit/8" : "bg-loss/8")}>
            <TrendingUp className={cn("w-4 h-4", winRate >= 50 ? "text-profit" : "text-loss")} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className={cn("text-2xl font-bold", winRate >= 50 ? "text-profit" : "text-loss")}>{winRate.toFixed(1)}%</p>
          <span className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
            expectancy >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
          )}>
            Exp: {fmt(expectancy)}/trade
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Closed: {closedMonth.length} | W: {wins.length} | L: {losses.length}
        </p>
      </div>

      {/* Active Alerts */}
      <div className="surface-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Alerts</span>
          <div className="w-8 h-8 rounded-lg bg-warning/8 flex items-center justify-center">
            <Bell className="w-4 h-4 text-warning" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">{alerts.length}</p>
          {triggeredToday > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">
              {triggeredToday} triggered today
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Price: {priceAlerts} | Technical: {techAlerts}
        </p>
        <Link to="/alerts" className="mt-2 inline-flex items-center gap-1 text-[10px] text-primary font-medium hover:underline">
          <Plus className="w-3 h-3" /> Create alert
        </Link>
      </div>
    </div>
  );
}
