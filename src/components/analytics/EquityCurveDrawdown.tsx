import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { format } from "date-fns";
import type { Trade } from "@/hooks/useTrades";
import type { CapitalTransaction } from "@/hooks/useCapitalTransactions";
import { cn } from "@/lib/utils";
import { TrendingDown, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

interface Props {
  trades: Trade[];
  startingCapital: number;
  capitalTransactions?: CapitalTransaction[];
}

type Period = "1M" | "3M" | "6M" | "1Y" | "ALL";

export function EquityCurveDrawdown({ trades, startingCapital, capitalTransactions = [] }: Props) {
  const [period, setPeriod] = useState<Period>("ALL");

  const totalDeposited = capitalTransactions.filter((t) => t.type === "DEPOSIT").reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawn = capitalTransactions.filter((t) => t.type === "WITHDRAWAL").reduce((s, t) => s + Number(t.amount), 0);
  const netCapitalDeployed = startingCapital + totalDeposited - totalWithdrawn;

  const { curveData, maxDrawdown, maxDrawdownPercent, currentEquity, capitalEventIndices } = useMemo(() => {
    const closed = trades
      .filter((t) => t.status === "CLOSED" && t.closed_at && t.pnl != null)
      .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime());

    // Build unified timeline
    type TimelineEvent = { date: Date; dateStr: string } & (
      | { kind: "trade"; pnl: number }
      | { kind: "capital"; type: "DEPOSIT" | "WITHDRAWAL"; amount: number }
    );

    const events: TimelineEvent[] = [];
    for (const t of closed) {
      events.push({ date: new Date(t.closed_at!), dateStr: format(new Date(t.closed_at!), "dd MMM"), kind: "trade", pnl: t.pnl || 0 });
    }
    for (const ct of capitalTransactions) {
      events.push({ date: new Date(ct.transaction_date), dateStr: format(new Date(ct.transaction_date), "dd MMM"), kind: "capital", type: ct.type, amount: Number(ct.amount) });
    }
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    if (events.length === 0) {
      return { curveData: [], maxDrawdown: 0, maxDrawdownPercent: 0, currentEquity: startingCapital, capitalEventIndices: [] };
    }

    // Filter by period
    const now = new Date();
    const cutoff = (() => {
      switch (period) {
        case "1M": return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        case "3M": return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        case "6M": return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        case "1Y": return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        default: return new Date(0);
      }
    })();
    const filtered = events.filter((e) => e.date >= cutoff);

    let equity = startingCapital;
    let peak = startingCapital;
    let maxDd = 0;
    let maxDdPct = 0;
    const capIndices: number[] = [];

    const data = [{ date: filtered[0]?.dateStr || "Start", equity: startingCapital, drawdown: 0, drawdownPct: 0, capitalEvent: null as string | null }];

    for (const ev of filtered) {
      if (ev.kind === "trade") {
        equity += ev.pnl;
        if (equity > peak) peak = equity;
      } else {
        if (ev.type === "DEPOSIT") {
          equity += ev.amount;
          peak += ev.amount;
        } else {
          equity -= ev.amount;
          peak -= ev.amount;
        }
      }
      const dd = peak - equity;
      const ddPct = peak > 0 ? (dd / peak) * 100 : 0;
      if (dd > maxDd) maxDd = dd;
      if (ddPct > maxDdPct) maxDdPct = ddPct;

      const idx = data.length;
      if (ev.kind === "capital") capIndices.push(idx);

      data.push({
        date: ev.dateStr,
        equity,
        drawdown: -dd,
        drawdownPct: -ddPct,
        capitalEvent: ev.kind === "capital" ? ev.type : null,
      });
    }

    return { curveData: data, maxDrawdown: maxDd, maxDrawdownPercent: maxDdPct, currentEquity: equity, capitalEventIndices: capIndices };
  }, [trades, startingCapital, capitalTransactions, period]);

  const tradingPnl = currentEquity - netCapitalDeployed;
  const tradingPnlPct = netCapitalDeployed > 0 ? (tradingPnl / netCapitalDeployed) * 100 : 0;
  const isProfit = tradingPnl >= 0;

  return (
    <div className="surface-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Equity Curve & Drawdown</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Account growth over time</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {(["1M", "3M", "6M", "1Y", "ALL"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                period === p ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-accent/50">
          <p className="text-xs text-muted-foreground">Current Equity</p>
          <p className="text-lg font-bold font-mono">₹{currentEquity.toLocaleString("en-IN")}</p>
        </div>
        <div className="p-3 rounded-lg bg-accent/50">
          <p className="text-xs text-muted-foreground">Trading P&L</p>
          <p className={cn("text-lg font-bold font-mono", isProfit ? "text-profit" : "text-loss")}>
            {isProfit ? "+" : ""}₹{tradingPnl.toLocaleString("en-IN")}
          </p>
          <p className={cn("text-xs", isProfit ? "text-profit" : "text-loss")}>
            {isProfit ? "+" : ""}{tradingPnlPct.toFixed(2)}%
          </p>
        </div>
        <div className="p-3 rounded-lg bg-loss/5 border border-loss/10">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-loss" /> Max Drawdown
          </p>
          <p className="text-lg font-bold font-mono text-loss">₹{maxDrawdown.toLocaleString("en-IN")}</p>
          <p className="text-xs text-loss">-{maxDrawdownPercent.toFixed(2)}%</p>
        </div>
        <div className="p-3 rounded-lg bg-accent/50">
          <p className="text-xs text-muted-foreground">Net Capital Deployed</p>
          <p className="text-lg font-bold font-mono">₹{netCapitalDeployed.toLocaleString("en-IN")}</p>
          {(totalDeposited > 0 || totalWithdrawn > 0) && (
            <p className="text-xs text-muted-foreground">
              <span className="text-profit">+{totalDeposited.toLocaleString("en-IN")}</span>
              {" / "}
              <span className="text-loss">-{totalWithdrawn.toLocaleString("en-IN")}</span>
            </p>
          )}
        </div>
      </div>

      {/* Equity Curve Chart */}
      {curveData.length > 1 ? (
        <div className="space-y-2">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curveData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isProfit ? "hsl(152, 60%, 42%)" : "hsl(0, 72%, 55%)"} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={isProfit ? "hsl(152, 60%, 42%)" : "hsl(0, 72%, 55%)"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} dx={-5} />
                <ReferenceLine y={startingCapital} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.5} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-md)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "equity") return [`₹${value.toLocaleString("en-IN")}`, "Equity"];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    if (item?.capitalEvent) {
                      return `${label} (${item.capitalEvent === "DEPOSIT" ? "💰 Deposit" : "💸 Withdrawal"})`;
                    }
                    return label;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke={isProfit ? "hsl(152, 60%, 42%)" : "hsl(0, 72%, 55%)"}
                  strokeWidth={2}
                  fill="url(#equityGradient)"
                />
                {/* Capital event markers */}
                {capitalEventIndices.map((idx) => {
                  const point = curveData[idx];
                  if (!point) return null;
                  return (
                    <ReferenceDot
                      key={idx}
                      x={point.date}
                      y={point.equity}
                      r={5}
                      fill={point.capitalEvent === "DEPOSIT" ? "hsl(152, 60%, 42%)" : "hsl(0, 72%, 55%)"}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Drawdown Chart */}
          <div className="h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={curveData} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, "Drawdown"]}
                />
                <Bar dataKey="drawdownPct" fill="hsl(0, 72%, 55%)" opacity={0.6} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
          Close some trades to see your equity curve
        </div>
      )}
    </div>
  );
}
