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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="icon-badge-sm bg-primary/8">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold">Equity Curve</h3>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">Portfolio performance</p>
          </div>
        </div>
        <Link to="/analytics" className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium">
          Analytics <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 11 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 11 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} dx={-5} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload;
                const value = payload[0]?.value as number;
                return (
                  <div className="premium-card !p-3 backdrop-blur-lg text-xs">
                    <p className="font-semibold mb-1">
                      {label}
                      {item?.capitalEvent && (
                        <span className="ml-1 text-muted-foreground">
                          ({item.capitalEvent === "DEPOSIT" ? "💰 Deposit" : "💸 Withdrawal"})
                        </span>
                      )}
                    </p>
                    <p className={cn("font-mono font-bold", value >= startingCapital ? "text-profit" : "text-loss")}>
                      ₹{value?.toLocaleString("en-IN")}
                    </p>
                  </div>
                );
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

// Need cn for tooltip
import { cn } from "@/lib/utils";
