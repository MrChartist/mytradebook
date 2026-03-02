import { useMemo } from "react";
import { useDashboard } from "@/pages/Dashboard";
import { cn } from "@/lib/utils";
import { Wallet, Target, TrendingUp, Bell, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculatePnL } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatting";
import { TradeStatus } from "@/lib/constants";

interface Props {
  alerts: { id: string; last_triggered: string | null; condition_type: string }[];
}

export function DashboardKPICards({ alerts }: Props) {
  const { monthTrades, openTrades, prices } = useDashboard();
  const navigate = useNavigate();

  const closedMonth = useMemo(() => monthTrades.filter((t) => t.status === TradeStatus.CLOSED), [monthTrades]);
  const wins = closedMonth.filter((t) => (t.pnl || 0) > 0);
  const losses = closedMonth.filter((t) => (t.pnl || 0) < 0);

  const realizedPnl = closedMonth.reduce((a, t) => a + (t.pnl || 0), 0);
  const unrealizedPnl = openTrades.reduce((a, t) => {
    const ltp = prices[t.symbol]?.ltp || t.current_price || t.entry_price || 0;
    const entry = t.entry_price || 0;
    const tradeType = t.trade_type === "BUY" ? "LONG" : "SHORT";
    return a + calculatePnL(entry, ltp, t.quantity, tradeType);
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

  const cardBase = "dashboard-card-hover block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] transition-transform";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total P&L */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`MTD P&L: ${formatCurrency(realizedPnl + unrealizedPnl)}`}
        className={cardBase}
        onClick={() => navigate("/reports")}
        onKeyDown={(e) => { if (e.key === "Enter") navigate("/reports"); }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">MTD P&L</span>
          <div className={cn("icon-badge", realizedPnl + unrealizedPnl >= 0 ? "bg-profit/10" : "bg-loss/10")}>
            <Wallet className={cn("w-4.5 h-4.5", realizedPnl + unrealizedPnl >= 0 ? "text-profit" : "text-loss")} />
          </div>
        </div>
        <p className={cn("text-2xl font-bold font-mono", realizedPnl + unrealizedPnl >= 0 ? "text-profit" : "text-loss")}>
          {formatCurrency(realizedPnl + unrealizedPnl)}
        </p>
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Realized</p>
            <p className={cn("text-xs font-bold font-mono", realizedPnl >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(realizedPnl)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Unrealized</p>
            <p className={cn("text-xs font-bold font-mono", unrealizedPnl >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(unrealizedPnl)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
          <span>Today: </span>
          <span className={cn("font-medium", todayPnl >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(todayPnl)}</span>
          <span className="mx-1">•</span>
          <span>Closed: {closedMonth.length} | Open: {openTrades.length}</span>
        </div>
      </div>

      {/* Open Positions */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open Positions: ${openTrades.length}`}
        className={cardBase}
        onClick={() => navigate("/trades?status=OPEN")}
        onKeyDown={(e) => { if (e.key === "Enter") navigate("/trades?status=OPEN"); }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Open Positions</span>
          <div className="icon-badge bg-primary/10">
            <Target className="w-4.5 h-4.5 text-primary" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono">{openTrades.length}</p>
        <p className="text-xs text-muted-foreground mt-2">
          ₹{riskAtSL.toLocaleString("en-IN", { maximumFractionDigits: 0 })} at risk (to SL)
        </p>
        <p className="text-[10px] text-muted-foreground mt-2">{monthTrades.length} total trades this month</p>
      </div>

      {/* Win Rate */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Win Rate: ${winRate.toFixed(1)}%`}
        className={cardBase}
        onClick={() => navigate("/analytics")}
        onKeyDown={(e) => { if (e.key === "Enter") navigate("/analytics"); }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Win Rate</span>
          <div className={cn("icon-badge", winRate >= 50 ? "bg-profit/10" : "bg-loss/10")}>
            <TrendingUp className={cn("w-4.5 h-4.5", winRate >= 50 ? "text-profit" : "text-loss")} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className={cn("text-2xl font-bold font-mono", winRate >= 50 ? "text-profit" : "text-loss")}>{winRate.toFixed(1)}%</p>
          <span className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
            expectancy >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
          )}>
            Exp: {formatCurrency(expectancy)}/trade
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          Closed: {closedMonth.length} | W: {wins.length} | L: {losses.length}
        </p>
      </div>

      {/* Active Alerts */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Active Alerts: ${alerts.length}`}
        className={cardBase}
        onClick={() => navigate("/alerts")}
        onKeyDown={(e) => { if (e.key === "Enter") navigate("/alerts"); }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Alerts</span>
          <div className="icon-badge bg-warning/10">
            <Bell className="w-4.5 h-4.5 text-warning" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold font-mono">{alerts.length}</p>
          {triggeredToday > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">
              {triggeredToday} triggered today
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          Price: {priceAlerts} | Technical: {techAlerts}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-[10px] text-primary font-medium">
          <Plus className="w-3 h-3" /> Create alert
        </span>
      </div>
    </div>
  );
}
