import { useMemo } from "react";
import { useDashboard } from "@/pages/Dashboard";
import { cn } from "@/lib/utils";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ArrowUp, ArrowDown, Calendar } from "lucide-react";

const fmt = (v: number) =>
  `₹${Math.abs(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

interface MetricItem {
  label: string;
  value: string;
  delta?: number;
  highlight?: boolean;
}

export function DashboardMonthlyMetrics() {
  const { trades, selectedMonth } = useDashboard();

  const monthStart = selectedMonth ? startOfMonth(selectedMonth) : null;
  const monthEnd = selectedMonth ? endOfMonth(selectedMonth) : null;
  const prevMonthStart = selectedMonth ? startOfMonth(subMonths(selectedMonth, 1)) : null;
  const prevMonthEnd = selectedMonth ? endOfMonth(subMonths(selectedMonth, 1)) : null;

  const getMonthClosed = (start: Date, end: Date) =>
    trades.filter((t) => {
      if (t.status !== "CLOSED" || !t.closed_at) return false;
      const d = new Date(t.closed_at);
      return d >= start && d <= end;
    });

  const current = useMemo(() => monthStart && monthEnd ? getMonthClosed(monthStart, monthEnd) : trades.filter(t => t.status === "CLOSED"), [trades, monthStart, monthEnd]);
  const prev = useMemo(() => prevMonthStart && prevMonthEnd ? getMonthClosed(prevMonthStart, prevMonthEnd) : [], [trades, prevMonthStart, prevMonthEnd]);

  const calcMetrics = (closed: typeof current) => {
    const wins = closed.filter((t) => (t.pnl || 0) > 0);
    const losses = closed.filter((t) => (t.pnl || 0) < 0);
    const totalPnl = closed.reduce((a, t) => a + (t.pnl || 0), 0);
    const avgWin = wins.length ? wins.reduce((a, t) => a + (t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + (t.pnl || 0), 0) / losses.length) : 0;
    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
    const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;
    const expectancy = closed.length > 0 ? totalPnl / closed.length : 0;
    const bestTrade = closed.length ? Math.max(...closed.map((t) => t.pnl || 0)) : 0;
    const worstTrade = closed.length ? Math.min(...closed.map((t) => t.pnl || 0)) : 0;

    return { closed: closed.length, wins: wins.length, losses: losses.length, totalPnl, avgWin, avgLoss, winRate, profitFactor, expectancy, bestTrade, worstTrade };
  };

  const cm = useMemo(() => calcMetrics(current), [current]);
  const pm = useMemo(() => calcMetrics(prev), [prev]);

  const delta = (cur: number, prv: number) => {
    if (prv === 0) return undefined;
    return ((cur - prv) / Math.abs(prv)) * 100;
  };

  const metrics: MetricItem[] = [
    { label: "Closed Trades", value: String(cm.closed), delta: delta(cm.closed, pm.closed) },
    { label: "Win Rate", value: `${cm.winRate.toFixed(1)}%`, delta: cm.winRate - pm.winRate, highlight: true },
    { label: "Avg Win", value: `₹${cm.avgWin.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, delta: delta(cm.avgWin, pm.avgWin) },
    { label: "Avg Loss", value: `₹${cm.avgLoss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, delta: delta(cm.avgLoss, pm.avgLoss) },
    { label: "Profit Factor", value: cm.profitFactor.toFixed(2), delta: delta(cm.profitFactor, pm.profitFactor), highlight: true },
    { label: "Expectancy", value: `₹${cm.expectancy.toLocaleString("en-IN", { maximumFractionDigits: 0 })}/trade`, delta: delta(cm.expectancy, pm.expectancy) },
    { label: "Best Trade", value: `+${fmt(cm.bestTrade)}` },
    { label: "Worst Trade", value: `-${fmt(Math.abs(cm.worstTrade))}` },
  ];

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="icon-badge-sm bg-primary/10">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Monthly Performance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {monthStart && monthEnd ? `${format(monthStart, "dd MMM")} – ${format(monthEnd, "dd MMM yyyy")}` : "All time"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={cn(
              "p-3.5 rounded-2xl transition-all",
              m.highlight ? "bg-primary/5 border border-primary/10" : "bg-muted/50"
            )}
          >
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{m.label}</p>
            <p className={cn("text-lg font-bold mt-1.5", m.highlight && "text-primary")}>
              {m.value}
            </p>
            {m.delta !== undefined && m.delta !== 0 && (
              <div className={cn(
                "flex items-center gap-0.5 mt-1.5 text-[10px] font-medium",
                m.delta > 0 ? "text-profit" : "text-loss"
              )}>
                {m.delta > 0 ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                {Math.abs(m.delta).toFixed(1)}% vs prev
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
