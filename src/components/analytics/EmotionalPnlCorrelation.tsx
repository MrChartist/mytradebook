import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import type { Trade } from "@/hooks/useTrades";

interface Props {
  trades: Trade[];
}

const EMOTION_COLORS: Record<string, string> = {
  calm: "hsl(var(--profit))",
  confident: "hsl(152 60% 50%)",
  anxious: "hsl(var(--warning))",
  fomo: "hsl(var(--loss))",
  greedy: "hsl(0 72% 60%)",
  fearful: "hsl(var(--loss))",
  neutral: "hsl(var(--muted-foreground))",
};

export function EmotionalPnlCorrelation({ trades }: Props) {
  const closed = useMemo(() => trades.filter((t) => t.status === "CLOSED" && t.emotion_tag), [trades]);

  const chartData = useMemo(() => {
    const map = new Map<string, { emotion: string; totalPnl: number; count: number; wins: number }>();

    closed.forEach((t) => {
      const emotion = t.emotion_tag!;
      if (!map.has(emotion)) map.set(emotion, { emotion, totalPnl: 0, count: 0, wins: 0 });
      const entry = map.get(emotion)!;
      entry.totalPnl += t.pnl || 0;
      entry.count++;
      if ((t.pnl || 0) > 0) entry.wins++;
    });

    return Array.from(map.values())
      .map((e) => ({
        ...e,
        avgPnl: e.totalPnl / e.count,
        winRate: (e.wins / e.count) * 100,
      }))
      .sort((a, b) => b.avgPnl - a.avgPnl);
  }, [closed]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="premium-card space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Emotional P&L Correlation</h3>
        <p className="text-xs text-muted-foreground">Average P&L by emotion tag</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="emotion"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            className="capitalize"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [
              `₹${value.toFixed(0)}`,
              name === "avgPnl" ? "Avg P&L" : name,
            ]}
            labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
          />
          <ReferenceLine y={0} stroke="hsl(var(--border))" />
          <Bar dataKey="avgPnl" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((entry) => (
              <Cell
                key={entry.emotion}
                fill={EMOTION_COLORS[entry.emotion.toLowerCase()] || "hsl(var(--primary))"}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        {chartData.map((e) => (
          <div
            key={e.emotion}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border",
              e.avgPnl >= 0 ? "border-profit/20 bg-profit/5 text-profit" : "border-loss/20 bg-loss/5 text-loss"
            )}
          >
            <span className="capitalize">{e.emotion}</span>
            <span className="font-mono">{e.winRate.toFixed(0)}% WR</span>
            <span className="text-muted-foreground">({e.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
