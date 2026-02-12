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
  const strokeColor = isProfit ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)";
  const fillColor = isProfit
    ? "url(#profitGradient)"
    : "url(#lossGradient)";

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Equity Curve</h3>
          <p className="text-sm text-muted-foreground">Portfolio performance</p>
        </div>
        <div className="flex gap-2">
          {["1W", "1M", "3M", "1Y", "ALL"].map((period) => (
            <button
              key={period}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                period === "3M"
                  ? "glass-nav-active text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 10%)",
                border: "1px solid hsl(222, 47%, 16%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.4)",
              }}
              labelStyle={{ color: "hsl(210, 40%, 98%)" }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Value"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              fill={fillColor}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
