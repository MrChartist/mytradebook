import { useMemo, useState } from "react";
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { subDays, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import type { Trade } from "@/hooks/useTrades";

interface Props {
  trades: Trade[];
}

type ComparePreset = "week" | "month" | "quarter";

function getMetrics(trades: Trade[]) {
  const closed = trades.filter((t) => t.status === "CLOSED");
  const wins = closed.filter((t) => (t.pnl || 0) > 0);
  const losses = closed.filter((t) => (t.pnl || 0) < 0);
  const totalPnl = closed.reduce((a, t) => a + (t.pnl || 0), 0);
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((a, t) => a + (t.pnl || 0), 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, t) => a + (t.pnl || 0), 0)) / losses.length : 0;
  const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : wins.length > 0 ? Infinity : 0;
  const bestTrade = closed.length > 0 ? Math.max(...closed.map((t) => t.pnl || 0)) : 0;
  const worstTrade = closed.length > 0 ? Math.min(...closed.map((t) => t.pnl || 0)) : 0;

  return {
    totalTrades: closed.length,
    totalPnl,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    bestTrade,
    worstTrade,
    wins: wins.length,
    losses: losses.length,
  };
}

function DeltaIndicator({ current, previous, format: fmt = "number", suffix = "" }: {
  current: number;
  previous: number;
  format?: "number" | "currency" | "percent";
  suffix?: string;
}) {
  if (previous === 0 && current === 0) return <Minus className="w-3 h-3 text-muted-foreground" />;
  const delta = current - previous;
  const pctChange = previous !== 0 ? ((delta / Math.abs(previous)) * 100) : current > 0 ? 100 : -100;
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  return (
    <div className={cn("flex items-center gap-0.5 text-[9px] font-medium",
      isNeutral ? "text-muted-foreground" : isPositive ? "text-profit" : "text-loss"
    )}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : isNeutral ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{isPositive ? "+" : ""}{pctChange.toFixed(1)}%{suffix}</span>
    </div>
  );
}

export function ComparativePeriodAnalysis({ trades }: Props) {
  const [preset, setPreset] = useState<ComparePreset>("month");

  const { current, previous, currentLabel, previousLabel } = useMemo(() => {
    const now = new Date();
    let currentFrom: Date, currentTo: Date, prevFrom: Date, prevTo: Date;
    let curLabel: string, prevLabel: string;

    switch (preset) {
      case "week": {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        currentFrom = weekStart;
        currentTo = now;
        prevFrom = subDays(weekStart, 7);
        prevTo = subDays(weekStart, 1);
        curLabel = "This Week";
        prevLabel = "Last Week";
        break;
      }
      case "month": {
        currentFrom = startOfMonth(now);
        currentTo = now;
        const lastMonth = subMonths(now, 1);
        prevFrom = startOfMonth(lastMonth);
        prevTo = endOfMonth(lastMonth);
        curLabel = "This Month";
        prevLabel = "Last Month";
        break;
      }
      case "quarter": {
        currentFrom = subDays(now, 90);
        currentTo = now;
        prevFrom = subDays(now, 180);
        prevTo = subDays(now, 91);
        curLabel = "Last 90 Days";
        prevLabel = "Prior 90 Days";
        break;
      }
    }

    const filterByRange = (from: Date, to: Date) => trades.filter((t) => {
      const d = new Date(t.closed_at || t.entry_time);
      return isWithinInterval(d, { start: from, end: to });
    });

    return {
      current: getMetrics(filterByRange(currentFrom, currentTo)),
      previous: getMetrics(filterByRange(prevFrom, prevTo)),
      currentLabel: curLabel,
      previousLabel: prevLabel,
    };
  }, [trades, preset]);

  const metrics = [
    { label: "Total P&L", cur: current.totalPnl, prev: previous.totalPnl, fmt: "currency" as const },
    { label: "Win Rate", cur: current.winRate, prev: previous.winRate, fmt: "percent" as const },
    { label: "Trades", cur: current.totalTrades, prev: previous.totalTrades, fmt: "number" as const },
    { label: "Profit Factor", cur: current.profitFactor === Infinity ? 999 : current.profitFactor, prev: previous.profitFactor === Infinity ? 999 : previous.profitFactor, fmt: "number" as const },
    { label: "Avg Win", cur: current.avgWin, prev: previous.avgWin, fmt: "currency" as const },
    { label: "Avg Loss", cur: current.avgLoss, prev: previous.avgLoss, fmt: "currency" as const },
    { label: "Best Trade", cur: current.bestTrade, prev: previous.bestTrade, fmt: "currency" as const },
    { label: "Worst Trade", cur: current.worstTrade, prev: previous.worstTrade, fmt: "currency" as const },
  ];

  const formatValue = (val: number, fmt: "number" | "currency" | "percent") => {
    if (fmt === "currency") return `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    if (fmt === "percent") return `${val.toFixed(1)}%`;
    if (val === 999) return "∞";
    return val.toFixed(val % 1 === 0 ? 0 : 2);
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="icon-badge-sm bg-primary/10">
            <ArrowLeftRight className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Period Comparison</h3>
            <p className="text-[10px] text-muted-foreground">Track your improvement over time</p>
          </div>
        </div>
        <div className="flex gap-0.5 bg-muted/40 rounded-lg p-0.5 border border-border/15">
          {(["week", "month", "quarter"] as ComparePreset[]).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium rounded-md transition-all capitalize",
                preset === p ? "bg-card shadow-sm text-foreground" : "text-muted-foreground/60 hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/30">
              <th className="text-left pb-2 font-medium">Metric</th>
              <th className="text-right pb-2 font-medium">{previousLabel}</th>
              <th className="text-right pb-2 font-medium">{currentLabel}</th>
              <th className="text-right pb-2 font-medium">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/15">
            {metrics.map((m) => (
              <tr key={m.label} className="hover:bg-muted/20 transition-colors">
                <td className="py-2 text-muted-foreground text-[11px]">{m.label}</td>
                <td className="py-2 text-right font-mono text-[11px]">{formatValue(m.prev, m.fmt)}</td>
                <td className={cn("py-2 text-right font-mono font-semibold text-[11px]",
                  m.label === "Total P&L" || m.label === "Best Trade" || m.label === "Avg Win"
                    ? m.cur >= 0 ? "text-profit" : "text-loss"
                    : m.label === "Worst Trade" || m.label === "Avg Loss"
                      ? "text-loss"
                      : ""
                )}>
                  {formatValue(m.cur, m.fmt)}
                </td>
                <td className="py-2 text-right">
                  <DeltaIndicator current={m.cur} previous={m.prev} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
