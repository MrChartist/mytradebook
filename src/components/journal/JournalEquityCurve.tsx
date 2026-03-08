import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

interface EquityCurvePoint {
  date: string;
  pnl: number;
  cumulativePnl: number;
}

interface JournalEquityCurveProps {
  data: EquityCurvePoint[];
  isLoading: boolean;
}

export function JournalEquityCurve({ data, isLoading }: JournalEquityCurveProps) {
  if (isLoading) {
    return (
      <div className="surface-card p-5">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-[250px] w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">Equity Curve</h3>
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          No trade data available
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold mb-4">Equity Curve</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
              tickFormatter={(value) => format(parseISO(value), "dd MMM")}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 10%)",
                border: "1px solid hsl(222, 47%, 16%)",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Cumulative P&L"]}
              labelFormatter={(label) => format(parseISO(label), "dd MMM yyyy")}
            />
            <ReferenceLine y={0} stroke="hsl(215, 20%, 35%)" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="cumulativePnl"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(217, 91%, 60%)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
