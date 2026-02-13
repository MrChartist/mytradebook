import { useMemo } from "react";
import type { Trade } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import { Flame, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface Props {
  trades: Trade[];
}

export function StreakTracker({ trades }: Props) {
  const stats = useMemo(() => {
    const closed = trades
      .filter((t) => t.status === "CLOSED" && t.closed_at)
      .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime());

    if (closed.length === 0) return null;

    let currentWin = 0, currentLoss = 0;
    let maxWin = 0, maxLoss = 0;
    let tempWin = 0, tempLoss = 0;

    // Also track avg qty during win/loss streaks for oversize detection
    const streakQtys: { win: number[]; loss: number[] } = { win: [], loss: [] };
    const normalQtys: number[] = [];

    for (const t of closed) {
      const isWin = (t.pnl || 0) > 0;
      if (isWin) {
        tempWin++;
        tempLoss = 0;
        streakQtys.win.push(t.quantity);
      } else {
        tempLoss++;
        tempWin = 0;
        streakQtys.loss.push(t.quantity);
      }
      normalQtys.push(t.quantity);
      maxWin = Math.max(maxWin, tempWin);
      maxLoss = Math.max(maxLoss, tempLoss);
    }

    currentWin = tempWin;
    currentLoss = tempLoss;

    // Behavioral insight: avg position size during streaks vs overall
    const avgQty = normalQtys.length ? normalQtys.reduce((a, b) => a + b, 0) / normalQtys.length : 0;
    const avgWinStreakQty = streakQtys.win.length ? streakQtys.win.reduce((a, b) => a + b, 0) / streakQtys.win.length : 0;
    const avgLossStreakQty = streakQtys.loss.length ? streakQtys.loss.reduce((a, b) => a + b, 0) / streakQtys.loss.length : 0;

    const oversizingAfterWins = avgQty > 0 ? ((avgWinStreakQty - avgQty) / avgQty) * 100 : 0;
    const oversizingAfterLosses = avgQty > 0 ? ((avgLossStreakQty - avgQty) / avgQty) * 100 : 0;

    // Recent streak visualization (last 20)
    const recent = closed.slice(-20).map((t) => ({
      symbol: t.symbol,
      pnl: t.pnl || 0,
      isWin: (t.pnl || 0) > 0,
    }));

    return {
      currentWin,
      currentLoss,
      maxWin,
      maxLoss,
      recent,
      oversizingAfterWins,
      oversizingAfterLosses,
      totalClosed: closed.length,
    };
  }, [trades]);

  if (!stats) {
    return (
      <div className="surface-card p-8 text-center">
        <Flame className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="font-semibold mb-1">No Streak Data</h3>
        <p className="text-sm text-muted-foreground">Close trades to track your streaks.</p>
      </div>
    );
  }

  const isOnWinStreak = stats.currentWin > 0;
  const currentStreak = isOnWinStreak ? stats.currentWin : stats.currentLoss;

  return (
    <div className="surface-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <Flame className="w-4 h-4 text-warning" />
          Streak Tracker
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Win/loss streaks and behavioral patterns</p>
      </div>

      {/* Current streak */}
      <div className={cn(
        "p-4 rounded-xl text-center",
        isOnWinStreak ? "bg-profit/5 border border-profit/15" : "bg-loss/5 border border-loss/15"
      )}>
        <p className="text-xs text-muted-foreground mb-1">Current Streak</p>
        <p className={cn("text-3xl font-bold", isOnWinStreak ? "text-profit" : "text-loss")}>
          {currentStreak} {isOnWinStreak ? "W" : "L"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isOnWinStreak ? "🔥 Keep it going!" : "Hold your discipline"}
        </p>
      </div>

      {/* Max streaks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-profit/5 border border-profit/10 text-center">
          <TrendingUp className="w-4 h-4 text-profit mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Longest Win</p>
          <p className="text-xl font-bold text-profit">{stats.maxWin}</p>
        </div>
        <div className="p-3 rounded-lg bg-loss/5 border border-loss/10 text-center">
          <TrendingDown className="w-4 h-4 text-loss mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Longest Loss</p>
          <p className="text-xl font-bold text-loss">{stats.maxLoss}</p>
        </div>
      </div>

      {/* Recent streak viz */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Last {stats.recent.length} trades</p>
        <div className="flex gap-0.5 flex-wrap">
          {stats.recent.map((t, i) => (
            <div
              key={i}
              title={`${t.symbol}: ${t.isWin ? "+" : ""}₹${t.pnl.toLocaleString("en-IN")}`}
              className={cn(
                "w-5 h-5 rounded-sm flex items-center justify-center text-[8px] font-bold transition-all cursor-default",
                t.isWin ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"
              )}
            >
              {t.isWin ? "W" : "L"}
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral insight */}
      {(Math.abs(stats.oversizingAfterWins) > 10 || Math.abs(stats.oversizingAfterLosses) > 10) && (
        <div className="p-3 rounded-lg bg-warning/5 border border-warning/10 space-y-1">
          <p className="text-xs font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            Behavioral Insight
          </p>
          {stats.oversizingAfterWins > 10 && (
            <p className="text-xs text-muted-foreground">
              ⚠️ You tend to <strong className="text-warning">oversize by {stats.oversizingAfterWins.toFixed(0)}%</strong> during winning streaks
            </p>
          )}
          {stats.oversizingAfterLosses > 10 && (
            <p className="text-xs text-muted-foreground">
              ⚠️ You tend to <strong className="text-warning">oversize by {stats.oversizingAfterLosses.toFixed(0)}%</strong> during losing streaks (revenge trading?)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
