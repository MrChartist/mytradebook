import { useTrades } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import { Trophy, TrendingDown, Zap } from "lucide-react";
import { useMemo } from "react";

export function StreakDiscipline() {
  const { trades } = useTrades();

  const stats = useMemo(() => {
    const closed = trades
      .filter((t) => t.status === "CLOSED" && t.pnl !== null)
      .sort((a, b) => new Date(a.closed_at || 0).getTime() - new Date(b.closed_at || 0).getTime());

    if (closed.length === 0) {
      return { currentStreak: 0, streakType: "win" as const, avgRR: 0, bestTrade: 0, worstTrade: 0, disciplineScore: 0 };
    }

    // Current streak
    let streak = 0;
    const lastPnl = closed[closed.length - 1]?.pnl || 0;
    const streakType = lastPnl >= 0 ? ("win" as const) : ("loss" as const);
    for (let i = closed.length - 1; i >= 0; i--) {
      const p = closed[i].pnl || 0;
      if ((streakType === "win" && p >= 0) || (streakType === "loss" && p < 0)) {
        streak++;
      } else break;
    }

    // Avg RR
    const wins = closed.filter((t) => (t.pnl || 0) > 0);
    const losses = closed.filter((t) => (t.pnl || 0) < 0);
    const avgWin = wins.length > 0 ? wins.reduce((a, t) => a + (t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, t) => a + (t.pnl || 0), 0) / losses.length) : 1;
    const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Best/worst
    const pnls = closed.map((t) => t.pnl || 0);
    const bestTrade = Math.max(...pnls);
    const worstTrade = Math.min(...pnls);

    // Discipline: % of trades that had a SL set
    const withSl = closed.filter((t) => t.stop_loss !== null).length;
    const disciplineScore = closed.length > 0 ? Math.round((withSl / closed.length) * 100) : 0;

    return { currentStreak: streak, streakType, avgRR, bestTrade, worstTrade, disciplineScore };
  }, [trades]);

  return (
    <div className="surface-card p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">🏆 Streak & Discipline</h3>
        <p className="text-sm text-muted-foreground">Trading consistency</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Current Streak */}
        <div className={cn(
          "p-3 rounded-lg",
          stats.streakType === "win" ? "bg-profit/10 border border-profit/20" : "bg-loss/10 border border-loss/20"
        )}>
          <div className="flex items-center gap-1.5 mb-1">
            {stats.streakType === "win" ? (
              <Zap className="w-3.5 h-3.5 text-profit" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-loss" />
            )}
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Streak</p>
          </div>
          <p className={cn("text-xl font-bold", stats.streakType === "win" ? "text-profit" : "text-loss")}>
            {stats.currentStreak} {stats.streakType === "win" ? "W" : "L"}
          </p>
        </div>

        {/* Avg RR */}
        <div className="p-3 rounded-lg bg-accent/30">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg R:R</p>
          <p className={cn("text-xl font-bold mt-1", stats.avgRR >= 1.5 ? "text-profit" : stats.avgRR >= 1 ? "text-foreground" : "text-loss")}>
            1:{stats.avgRR.toFixed(1)}
          </p>
        </div>

        {/* Best Trade */}
        <div className="p-3 rounded-lg bg-accent/30">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Best Trade</p>
          <p className="text-lg font-bold mt-1 text-profit font-mono">
            +₹{stats.bestTrade.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Worst Trade */}
        <div className="p-3 rounded-lg bg-accent/30">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Worst Trade</p>
          <p className="text-lg font-bold mt-1 text-loss font-mono">
            -₹{Math.abs(stats.worstTrade).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Discipline bar */}
      <div className="mt-3 p-3 rounded-lg bg-accent/30">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">SL Discipline</p>
          <p className="text-xs font-semibold">{stats.disciplineScore}%</p>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              stats.disciplineScore >= 80 ? "bg-profit" : stats.disciplineScore >= 50 ? "bg-warning" : "bg-loss"
            )}
            style={{ width: `${stats.disciplineScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
