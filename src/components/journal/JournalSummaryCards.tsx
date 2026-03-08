import { TrendingUp, Target, Clock, Award, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface JournalSummaryCardsProps {
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  avgHoldingTimeMinutes: number;
  bestPattern: string | null;
  topMistake: string | null;
  isLoading: boolean;
}

export function JournalSummaryCards({
  totalPnl,
  winRate,
  totalTrades,
  avgHoldingTimeMinutes,
  bestPattern,
  topMistake,
  isLoading,
}: JournalSummaryCardsProps) {
  const formatHoldingTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="surface-card p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <div className="surface-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className={cn("w-3.5 h-3.5", totalPnl >= 0 ? "text-profit" : "text-loss")} />
          <p className="text-[12px] text-muted-foreground/60">Total P&L</p>
        </div>
        <p className={cn("text-lg font-bold font-mono", totalPnl >= 0 ? "text-profit" : "text-loss")}>
          {totalPnl >= 0 ? "+" : ""}₹{totalPnl.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">
          {((totalPnl / Math.abs(totalPnl || 1)) * 100 * (totalPnl >= 0 ? 1 : -1)).toFixed(1)}%
        </p>
      </div>

      <div className="surface-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3.5 h-3.5 text-primary" />
          <p className="text-[12px] text-muted-foreground/60">Win Rate</p>
        </div>
        <p className="text-lg font-bold font-mono">{winRate.toFixed(1)}%</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">{totalTrades} total trades</p>
      </div>

      <div className="surface-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-3.5 h-3.5 text-warning" />
          <p className="text-[12px] text-muted-foreground/60">Avg Hold Time</p>
        </div>
        <p className="text-lg font-bold font-mono">{formatHoldingTime(avgHoldingTimeMinutes)}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">Per trade</p>
      </div>

      <div className="surface-card p-4">
        <div className="flex items-center gap-2 mb-2">
          {topMistake ? (
            <XCircle className="w-4 h-4 text-loss" />
          ) : (
            <Award className="w-4 h-4 text-warning" />
          )}
          <p className="text-sm text-muted-foreground">
            {topMistake ? "Top Mistake" : "Best Pattern"}
          </p>
        </div>
        <p className="text-2xl font-bold truncate">{topMistake || bestPattern || "N/A"}</p>
        <p className={cn("text-xs mt-1", topMistake ? "text-loss" : "text-profit")}>
          {topMistake ? "Most impact" : "Highest win rate"}
        </p>
      </div>
    </div>
  );
}
