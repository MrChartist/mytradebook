import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
} from "recharts";
import { format } from "date-fns";
import { useDashboard } from "@/pages/Dashboard";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useCapitalTransactions } from "@/hooks/useCapitalTransactions";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export function EquityCurve() {
  const { trades } = useDashboard();
  const { settings } = useUserSettings();
  const { transactions: capitalTransactions } = useCapitalTransactions();
  const startingCapital = (settings as any)?.starting_capital ?? 500000;

  const { data, isProfit, capitalEventIndices } = useMemo(() => {
    const closed = trades
      .filter((t) => t.status === "CLOSED" && t.closed_at && t.pnl != null)
      .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime());

    type TimelineEvent = { date: Date; dateStr: string } & (
      | { kind: "trade"; pnl: number }
      | { kind: "capital"; type: "DEPOSIT" | "WITHDRAWAL"; amount: number }
    );

    const events: TimelineEvent[] = [];
    for (const t of closed) {
      events.push({ date: new Date(t.closed_at!), dateStr: format(new Date(t.closed_at!), "MMM dd"), kind: "trade", pnl: t.pnl || 0 });
    }
    for (const ct of capitalTransactions) {
      events.push({ date: new Date(ct.transaction_date), dateStr: format(new Date(ct.transaction_date), "MMM dd"), kind: "capital", type: ct.type, amount: Number(ct.amount) });
    }
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    if (events.length === 0) {
      return { data: [{ date: "Start", value: startingCapital, capitalEvent: null }], isProfit: true, capitalEventIndices: [] as number[] };
    }

    let equity = startingCapital;
    let peak = startingCapital;
    const capIndices: number[] = [];
    const result = [{ date: events[0].dateStr, value: startingCapital, capitalEvent: null as string | null }];

    for (const ev of events) {
      if (ev.kind === "trade") {
        equity += ev.pnl;
        if (equity > peak) peak = equity;
      } else {
        if (ev.type === "DEPOSIT") { equity += ev.amount; peak += ev.amount; }
        else { equity -= ev.amount; peak -= ev.amount; }
      }
      const idx = result.length;
      if (ev.kind === "capital") capIndices.push(idx);
      result.push({ date: ev.dateStr, value: equity, capitalEvent: ev.kind === "capital" ? ev.type : null });
    }

    return { data: result, isProfit: equity >= startingCapital, capitalEventIndices: capIndices };
  }, [trades, capitalTransactions, startingCapital]);

  const strokeColor = isProfit ? "hsl(152, 60%, 42%)" : "hsl(0, 72%, 55%)";
  const fillId = isProfit ? "url(#profitGradient)" : "url(#lossGradient)";

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="icon-badge-sm bg-primary/10">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Equity Curve</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Portfolio performance</p>
          </div>
        </div>
        <Link to="/analytics" className="flex items-center gap-1 text-xs text-primary hover:underline">
          View Analytics <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 11 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 11 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} dx={-5} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(225, 15%, 92%)",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
                fontSize: "13px",
              }}
              labelStyle={{ color: "hsl(222, 47%, 11%)", fontWeight: 600 }}
              formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Value"]}
              labelFormatter={(label, payload) => {
                const item = payload?.[0]?.payload;
                if (item?.capitalEvent) return `${label} (${item.capitalEvent === "DEPOSIT" ? "💰 Deposit" : "💸 Withdrawal"})`;
                return label;
              }}
            />
            <Area type="monotone" dataKey="value" stroke={strokeColor} strokeWidth={2} fill={fillId} />
            {capitalEventIndices.map((idx) => {
              const point = data[idx];
              if (!point) return null;
              return (
                <ReferenceDot
                  key={idx}
                  x={point.date}
                  y={point.value}
                  r={4}
                  fill={point.capitalEvent === "DEPOSIT" ? "hsl(152, 60%, 42%)" : "hsl(0, 72%, 55%)"}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
