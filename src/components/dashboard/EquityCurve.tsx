import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { date: "Jan 01", value: 100000 },
  { date: "Jan 08", value: 102500 },
  { date: "Jan 15", value: 98000 },
  { date: "Jan 22", value: 105000 },
  { date: "Jan 29", value: 112000 },
  { date: "Feb 05", value: 108500 },
  { date: "Feb 12", value: 115000 },
  { date: "Feb 19", value: 122000 },
  { date: "Feb 26", value: 118500 },
  { date: "Mar 04", value: 128000 },
  { date: "Mar 11", value: 135000 },
  { date: "Mar 18", value: 142000 },
];

export function EquityCurve() {
  const startValue = data[0].value;
  const endValue = data[data.length - 1].value;
  const isProfit = endValue > startValue;
  const strokeColor = isProfit ? "hsl(152, 60%, 42%)" : "hsl(0, 72%, 55%)";
  const fillId = isProfit ? "url(#profitGradient)" : "url(#lossGradient)";

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold">Equity Curve</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Portfolio performance</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {["1W", "1M", "3M", "1Y", "ALL"].map((period) => (
            <button
              key={period}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                period === "3M"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
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
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 11 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              dx={-5}
            />
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
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              fill={fillId}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
