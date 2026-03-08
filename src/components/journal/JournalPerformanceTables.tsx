import { Star, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface RatingPerformance {
  rating: number;
  trades: number;
  wins: number;
  winRate: number;
  totalPnl: number;
}

interface ConfidencePerformance {
  confidence: number;
  trades: number;
  wins: number;
  winRate: number;
  totalPnl: number;
}

interface JournalPerformanceTablesProps {
  performanceByRating: RatingPerformance[];
  performanceByConfidence: ConfidencePerformance[];
  isLoading: boolean;
}

export function JournalPerformanceTables({
  performanceByRating,
  performanceByConfidence,
  isLoading,
}: JournalPerformanceTablesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {[0, 1].map((i) => (
          <div key={i} className="surface-card p-5">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* Performance by Rating */}
      <div className="surface-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-warning" />
          <h3 className="font-semibold">Performance by Rating</h3>
        </div>
        
        {performanceByRating.length > 0 ? (
          <>
            <div className="h-[150px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceByRating}>
                  <XAxis
                    dataKey="rating"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 47%, 16%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Win Rate"]}
                    labelFormatter={(label) => `Rating: ${label}/10`}
                  />
                  <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                    {performanceByRating.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.winRate >= 50 ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {performanceByRating.map((item) => (
                <div
                  key={item.rating}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Rating {item.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.trades} trades
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(item.winRate >= 50 ? "text-profit" : "text-loss")}>
                      {item.winRate.toFixed(1)}%
                    </span>
                    <span className={cn("font-mono", item.totalPnl >= 0 ? "text-profit" : "text-loss")}>
                      {item.totalPnl >= 0 ? "+" : ""}₹{item.totalPnl.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </div>

      {/* Performance by Confidence */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Performance by Confidence</h3>
        </div>
        
        {performanceByConfidence.length > 0 ? (
          <>
            <div className="h-[150px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceByConfidence}>
                  <XAxis
                    dataKey="confidence"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 47%, 16%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Win Rate"]}
                    labelFormatter={(label) => `Confidence: ${label}/5`}
                  />
                  <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                    {performanceByConfidence.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.winRate >= 50 ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {performanceByConfidence.map((item) => (
                <div
                  key={item.confidence}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Confidence {item.confidence}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.trades} trades
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(item.winRate >= 50 ? "text-profit" : "text-loss")}>
                      {item.winRate.toFixed(1)}%
                    </span>
                    <span className={cn("font-mono", item.totalPnl >= 0 ? "text-profit" : "text-loss")}>
                      {item.totalPnl >= 0 ? "+" : ""}₹{item.totalPnl.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
