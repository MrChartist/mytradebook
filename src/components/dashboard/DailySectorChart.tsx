import { useMemo, useState } from "react";
import { useDashboard } from "@/pages/Dashboard";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
} from "recharts";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isWeekend, isSameDay } from "date-fns";
import { BarChart3 } from "lucide-react";

const SEGMENT_COLORS: Record<string, string> = {
  Equity_Intraday: "hsl(240, 60%, 60%)",
  Equity_Positional: "hsl(152, 60%, 42%)",
  Futures: "hsl(38, 92%, 50%)",
  Options: "hsl(280, 60%, 55%)",
  Commodities: "hsl(200, 60%, 50%)",
};

const SEGMENT_SHORT: Record<string, string> = {
  Equity_Intraday: "Intraday",
  Equity_Positional: "Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "MCX",
};

export function DailySectorChart() {
  const { monthTrades, selectedMonth } = useDashboard();
  const [range, setRange] = useState("1M");

  const closedTrades = useMemo(() => monthTrades.filter((t) => t.status === "CLOSED"), [monthTrades]);

  const days = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth) > new Date() ? new Date() : endOfMonth(selectedMonth);
    return eachDayOfInterval({ start, end }).filter((d) => !isWeekend(d));
  }, [selectedMonth]);

  const segments = useMemo(() => {
    const s = new Set<string>();
    closedTrades.forEach((t) => s.add(t.segment));
    return Array.from(s);
  }, [closedTrades]);

  const chartData = useMemo(() => {
    let cumulative = 0;
    return days.map((day) => {
      const dayTrades = closedTrades.filter((t) => t.closed_at && isSameDay(new Date(t.closed_at), day));
      const entry: Record<string, any> = {
        date: format(day, "dd"),
        fullDate: format(day, "MMM dd"),
        trades: dayTrades.length,
        totalPnl: dayTrades.reduce((a, t) => a + (t.pnl || 0), 0),
      };

      segments.forEach((seg) => {
        const segTrades = dayTrades.filter((t) => t.segment === seg);
        entry[seg] = segTrades.reduce((a, t) => a + (t.pnl || 0), 0);
      });

      cumulative += entry.totalPnl;
      entry.cumulative = cumulative;
      return entry;
    });
  }, [days, closedTrades, segments]);

  const topSectors = useMemo(() => {
    const sectorPnl: Record<string, number> = {};
    closedTrades.forEach((t) => {
      sectorPnl[t.segment] = (sectorPnl[t.segment] || 0) + (t.pnl || 0);
    });
    return Object.entries(sectorPnl)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 3);
  }, [closedTrades]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    const wins = closedTrades.filter(
      (t) => t.closed_at && format(new Date(t.closed_at), "dd") === label && (t.pnl || 0) > 0
    ).length;
    const total = data.trades;

    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold mb-1.5">{data.fullDate}</p>
        <p className={data.totalPnl >= 0 ? "text-profit font-semibold" : "text-loss font-semibold"}>
          Total: ₹{data.totalPnl.toLocaleString("en-IN")}
        </p>
        <p className="text-muted-foreground">{total} trades | {wins}W-{total - wins}L</p>
        <div className="mt-1.5 pt-1.5 border-t border-border space-y-0.5">
          {segments.map((seg) => {
            const val = data[seg];
            if (!val) return null;
            return (
              <div key={seg} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{SEGMENT_SHORT[seg] || seg}</span>
                <span className={val >= 0 ? "text-profit" : "text-loss"}>₹{val.toLocaleString("en-IN")}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-badge-sm bg-primary/10">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Daily P&L by Segment</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Stacked by market segment</p>
          </div>
        </div>
        <div className="flex gap-1 bg-muted rounded-full p-0.5">
          {["1W", "1M", "3M"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                range === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[260px]">
        {chartData.length === 0 || closedTrades.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No closed trades this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 10 }} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} dx={-5} />
              <Tooltip content={<CustomTooltip />} />
              {segments.map((seg) => (
                <Bar key={seg} dataKey={seg} stackId="pnl" fill={SEGMENT_COLORS[seg] || "hsl(220, 9%, 70%)"} radius={[2, 2, 0, 0]} barSize={18} />
              ))}
              <Line type="monotone" dataKey="cumulative" stroke="hsl(240, 60%, 60%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {topSectors.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {topSectors.map(([seg, pnl]) => (
            <span
              key={seg}
              className={`text-[10px] font-medium px-2 py-1 rounded-full border ${
                pnl >= 0 ? "border-profit/20 bg-profit/5 text-profit" : "border-loss/20 bg-loss/5 text-loss"
              }`}
            >
              {SEGMENT_SHORT[seg] || seg}: {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
