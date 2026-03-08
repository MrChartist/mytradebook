import { useMemo } from "react";
import { useDashboard } from "@/pages/Dashboard";
import { cn } from "@/lib/utils";
import { Flame, Wallet, Target, TrendingUp, Bell, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculatePnL } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatting";
import { TradeStatus } from "@/lib/constants";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface Props {
  alerts: { id: string; last_triggered: string | null; condition_type: string }[];
}

export function DashboardKPICards({ alerts }: Props) {
  const { monthTrades, openTrades, prices, trades: allTrades } = useDashboard();
  const navigate = useNavigate();

  const today = new Date().toDateString();
  const closedToday = useMemo(() => allTrades.filter(
    (t) => t.status === TradeStatus.CLOSED && t.closed_at && new Date(t.closed_at).toDateString() === today
  ), [allTrades, today]);
  const openTradesAll = useMemo(() => allTrades.filter((t) => t.status === TradeStatus.OPEN), [allTrades]);

  const realizedToday = closedToday.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const unrealizedToday = openTradesAll.reduce((acc, t) => {
    const ltp = prices[t.symbol]?.ltp || t.current_price || t.entry_price;
    const entry = t.entry_price || 0;
    const tradeType = t.trade_type === "BUY" ? "LONG" : "SHORT";
    return acc + calculatePnL(entry, ltp, t.quantity, tradeType);
  }, 0);
  const totalTodayPnl = realizedToday + unrealizedToday;

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
    (a) => a.last_triggered && new Date(a.last_triggered).toDateString() === today
  ).length;

  const priceAlerts = alerts.filter((a) => ["PRICE_GT", "PRICE_LT"].includes(a.condition_type)).length;
  const techAlerts = alerts.length - priceAlerts;

  const cardBase = "premium-card-hover card-hover-lift block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] transition-transform duration-150";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Today's P&L — hero card */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Today's P&L: ${formatCurrency(totalTodayPnl)}`}
        className={cn(cardBase, "relative overflow-hidden sm:col-span-2 lg:col-span-1", totalTodayPnl >= 0 ? "card-glow-profit" : "card-glow-loss")}
        onClick={() => navigate("/reports")}
        onKeyDown={(e) => { if (e.key === "Enter") navigate("/reports"); }}
      >
        {/* Accent top bar */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-[3px] rounded-t-[1.25rem]",
          totalTodayPnl >= 0 ? "bg-profit" : "bg-loss"
        )} />
        {/* Gradient overlay */}
        <div className={cn(
          "absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-[0.04] pointer-events-none",
          totalTodayPnl >= 0 ? "bg-profit" : "bg-loss"
        )} />
        <div className="flex items-center justify-between mb-3">
          <span className="kpi-label">Today's P&L</span>
          <div className={cn("icon-badge", totalTodayPnl >= 0 ? "bg-profit/10" : "bg-loss/10")}>
            <Flame className={cn("w-4.5 h-4.5", totalTodayPnl >= 0 ? "text-profit" : "text-loss")} />
          </div>
        </div>
        <AnimatedNumber
          value={totalTodayPnl}
          formatFn={(n) => formatCurrency(n)}
          className={cn("kpi-value", totalTodayPnl >= 0 ? "text-profit" : "text-loss")}
        />
        <div className="flex gap-3 mt-3">
          <div className="inner-panel flex-1">
            <p className="kpi-sublabel">Realized</p>
            <p className={cn("text-xs font-bold font-mono mt-0.5", realizedToday >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(realizedToday)}</p>
          </div>
          <div className="inner-panel flex-1">
            <p className="kpi-sublabel">Unrealized</p>
            <p className={cn("text-xs font-bold font-mono mt-0.5", unrealizedToday >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(unrealizedToday)}</p>
          </div>
        </div>
        <p className="kpi-sublabel mt-2">
          {closedToday.length} closed • {openTradesAll.length} open
        </p>
      </div>

      {/* MTD P&L */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`MTD P&L: ${formatCurrency(realizedPnl + unrealizedPnl)}`}
        className={cn(cardBase, realizedPnl + unrealizedPnl >= 0 ? "card-glow-profit" : "card-glow-loss")}
        onClick={() => navigate("/reports")}
        onKeyDown={(e) => { if (e.key === "Enter") navigate("/reports"); }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="kpi-label">MTD P&L</span>
          <div className={cn("icon-badge", realizedPnl + unrealizedPnl >= 0 ? "bg-profit/10" : "bg-loss/10")}>
            <Wallet className={cn("w-4.5 h-4.5", realizedPnl + unrealizedPnl >= 0 ? "text-profit" : "text-loss")} />
          </div>
        </div>
        <p className={cn("text-[28px] font-bold font-mono leading-none", realizedPnl + unrealizedPnl >= 0 ? "text-profit" : "text-loss")}>
          {formatCurrency(realizedPnl + unrealizedPnl)}
        </p>
        <div className="flex gap-3 mt-3">
          <div className="inner-panel flex-1">
            <p className="text-[10px] text-muted-foreground">Realized</p>
            <p className={cn("text-xs font-bold font-mono mt-0.5", realizedPnl >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(realizedPnl)}</p>
          </div>
          <div className="inner-panel flex-1">
            <p className="text-[10px] text-muted-foreground">Unrealized</p>
            <p className={cn("text-xs font-bold font-mono mt-0.5", unrealizedPnl >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(unrealizedPnl)}</p>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open Positions: ${openTrades.length}`}
        className={cn(cardBase, "card-glow-primary")}
        onClick={() => navigate("/trades?status=OPEN")}
        onKeyDown={(e) => { if (e.key === "Enter") navigate("/trades?status=OPEN"); }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Open Positions</span>
          <div className="icon-badge bg-primary/10">
            <Target className="w-4.5 h-4.5 text-primary" />
          </div>
        </div>
        <p className="text-[28px] font-bold font-mono leading-none">{openTrades.length}</p>
        <div className="inner-panel mt-3">
          <p className="text-[10px] text-muted-foreground">Risk to SL</p>
          <p className="text-xs font-semibold font-mono text-loss mt-0.5">₹{riskAtSL.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">{monthTrades.length} total trades this month</p>
      </div>

      {/* Win Rate */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Win Rate: ${winRate.toFixed(1)}%`}
        className={cn(cardBase, winRate >= 50 ? "card-glow-profit" : "card-glow-loss")}
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
          <p className={cn("text-[28px] font-bold font-mono leading-none", winRate >= 50 ? "text-profit" : "text-loss")}>{winRate.toFixed(1)}%</p>
        </div>
        {/* Mini circular progress */}
        <div className="flex items-center gap-2 mt-3">
          <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0">
            <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2.5" stroke="hsl(var(--muted))" />
            <circle
              cx="12" cy="12" r="10" fill="none" strokeWidth="2.5"
              stroke={winRate >= 50 ? "hsl(var(--profit))" : "hsl(var(--loss))"}
              strokeDasharray={`${(winRate / 100) * 62.83} 62.83`}
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
            />
          </svg>
          <span className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
            expectancy >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
          )}>
            Exp: {formatCurrency(expectancy)}/trade
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Closed: {closedMonth.length} | W: {wins.length} | L: {losses.length}
        </p>
      </div>

      {/* Active Alerts */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Active Alerts: ${alerts.length}`}
        className={cn(cardBase, "card-glow-primary")}
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
          <p className="text-[28px] font-bold font-mono leading-none">{alerts.length}</p>
          {triggeredToday > 0 && (
            <div className="flex items-center gap-1">
              <span className="pulse-dot bg-warning" />
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">
                {triggeredToday} triggered
              </span>
            </div>
          )}
        </div>
        <div className="inner-panel mt-3">
          <p className="text-[10px] text-muted-foreground">
            Price: {priceAlerts} | Technical: {techAlerts}
          </p>
        </div>
        <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-primary font-medium">
          <Plus className="w-3 h-3" /> Create alert
        </span>
      </div>
    </div>
  );
}
