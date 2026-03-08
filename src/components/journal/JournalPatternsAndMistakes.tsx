import { TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PatternPerformance {
  name: string;
  trades: number;
  wins: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
}

interface MistakeImpact {
  name: string;
  severity: string | null;
  count: number;
  totalLoss: number;
  avgLoss: number;
}

interface JournalPatternsAndMistakesProps {
  patternPerformance: PatternPerformance[];
  mistakeImpact: MistakeImpact[];
  isLoading: boolean;
}

const severityColors: Record<string, string> = {
  low: "bg-warning/10 text-warning border-warning/20",
  medium: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  high: "bg-loss/10 text-loss border-loss/20",
};

export function JournalPatternsAndMistakes({
  patternPerformance,
  mistakeImpact,
  isLoading,
}: JournalPatternsAndMistakesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {[0, 1].map((i) => (
          <div key={i} className="surface-card p-5">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-14 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* Top Patterns */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Top Patterns</h3>
          </div>
          <span className="text-sm text-muted-foreground">Performance</span>
        </div>
        {patternPerformance.length > 0 ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {patternPerformance.map((pattern) => (
              <div
                key={pattern.name}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{pattern.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pattern.trades} trades • Avg: ₹{pattern.avgPnl.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className={cn("font-semibold", pattern.winRate >= 60 ? "text-profit" : "text-warning")}>
                    {pattern.winRate.toFixed(1)}%
                  </p>
                  <p className={cn("text-xs", pattern.totalPnl >= 0 ? "text-profit" : "text-loss")}>
                    {pattern.totalPnl >= 0 ? "+" : ""}₹{pattern.totalPnl.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No pattern data available
          </div>
        )}
      </div>

      {/* Common Mistakes */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-loss" />
            <h3 className="font-semibold">Common Mistakes</h3>
          </div>
          <span className="text-sm text-muted-foreground">Impact</span>
        </div>
        {mistakeImpact.length > 0 ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {mistakeImpact.map((mistake) => (
              <div
                key={mistake.name}
                className="flex items-center justify-between p-3 rounded-lg bg-loss/5 border border-loss/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-loss flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{mistake.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {mistake.count} occurrences
                      </p>
                      {mistake.severity && (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 text-xs rounded border",
                            severityColors[mistake.severity.toLowerCase()] || severityColors.medium
                          )}
                        >
                          {mistake.severity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-semibold text-loss">
                    ₹{Math.abs(mistake.totalLoss).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg: ₹{Math.abs(mistake.avgLoss).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No mistake data available
          </div>
        )}
      </div>
    </div>
  );
}
