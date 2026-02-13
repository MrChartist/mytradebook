import { useTrades } from "@/hooks/useTrades";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

const SEGMENT_COLORS = [
  "hsl(217, 91%, 60%)",   // primary
  "hsl(142, 71%, 45%)",   // profit
  "hsl(38, 92%, 50%)",    // warning
  "hsl(263, 70%, 50%)",   // purple
  "hsl(0, 84%, 60%)",     // loss
];

const SEGMENT_LABELS: Record<string, string> = {
  Equity_Intraday: "Eq. Intraday",
  Equity_Positional: "Eq. Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "Commodities",
};

export function SegmentBreakdown() {
  const { trades } = useTrades();

  const segmentData = Object.entries(
    trades.reduce<Record<string, number>>((acc, t) => {
      const key = t.segment;
      acc[key] = (acc[key] || 0) + (t.pnl || 0);
      return acc;
    }, {})
  )
    .map(([segment, pnl]) => ({
      name: SEGMENT_LABELS[segment] || segment,
      value: Math.abs(pnl),
      pnl,
      count: trades.filter((t) => t.segment === segment).length,
    }))
    .filter((d) => d.value > 0);

  return (
    <div className="glass-card p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Segment Breakdown</h3>
        <p className="text-sm text-muted-foreground">P&L by market segment</p>
      </div>

      {segmentData.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No trade data yet</p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-[140px] h-[140px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {segmentData.map((_, i) => (
                    <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 10%)",
                    border: "1px solid hsl(222, 47%, 16%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(_, __, props) => {
                    const d = props.payload;
                    return [`₹${d.pnl.toLocaleString()}`, d.name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {segmentData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className={cn("font-semibold font-mono text-xs", d.pnl >= 0 ? "text-profit" : "text-loss")}>
                  {d.pnl >= 0 ? "+" : ""}₹{d.pnl.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
