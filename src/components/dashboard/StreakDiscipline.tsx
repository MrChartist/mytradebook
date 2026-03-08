import { useTrades } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import { Trophy, TrendingDown, Zap, Flame, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { StreakShareCard, type StreakCardData } from "@/components/sharing/StreakShareCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toPng } from "html-to-image";
import { toast } from "sonner";

export function StreakDiscipline() {
  const { trades } = useTrades();
  const [shareOpen, setShareOpen] = useState(false);

  const stats = useMemo(() => {
    const closed = trades
      .filter((t) => t.status === "CLOSED" && t.pnl !== null)
      .sort((a, b) => new Date(a.closed_at || 0).getTime() - new Date(b.closed_at || 0).getTime());

    if (closed.length === 0) {
      return { currentStreak: 0, streakType: "win" as const, avgRR: 0, bestTrade: 0, worstTrade: 0, disciplineScore: 0 };
    }

    let streak = 0;
    const lastPnl = closed[closed.length - 1]?.pnl || 0;
    const streakType = lastPnl >= 0 ? ("win" as const) : ("loss" as const);
    for (let i = closed.length - 1; i >= 0; i--) {
      const p = closed[i].pnl || 0;
      if ((streakType === "win" && p >= 0) || (streakType === "loss" && p < 0)) {
        streak++;
      } else break;
    }

    const wins = closed.filter((t) => (t.pnl || 0) > 0);
    const losses = closed.filter((t) => (t.pnl || 0) < 0);
    const avgWin = wins.length > 0 ? wins.reduce((a, t) => a + (t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, t) => a + (t.pnl || 0), 0) / losses.length) : 1;
    const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;

    const pnls = closed.map((t) => t.pnl || 0);
    const bestTrade = Math.max(...pnls);
    const worstTrade = Math.min(...pnls);

    const withSl = closed.filter((t) => t.stop_loss !== null).length;
    const disciplineScore = closed.length > 0 ? Math.round((withSl / closed.length) * 100) : 0;

    return { currentStreak: streak, streakType, avgRR, bestTrade, worstTrade, disciplineScore };
  }, [trades]);

  // Build streak share data
  const streakShareData: StreakCardData = useMemo(() => {
    const closed = trades.filter(t => t.status === "CLOSED" && t.pnl !== null);
    const sorted = [...closed].sort((a, b) => new Date(b.closed_at || 0).getTime() - new Date(a.closed_at || 0).getTime());
    const streakTrades = sorted.slice(0, stats.currentStreak).map(t => ({ symbol: t.symbol, pnl: t.pnl || 0 }));
    const totalStreakPnl = streakTrades.reduce((a, t) => a + t.pnl, 0);
    return {
      streakCount: stats.currentStreak,
      streakType: stats.streakType,
      totalPnl: totalStreakPnl,
      trades: streakTrades,
    };
  }, [trades, stats]);

  return (
    <div className={cn("dashboard-card h-full", stats.streakType === "win" ? "card-glow-profit" : "card-glow-loss")}>
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="icon-badge-sm bg-primary/8">
          <Trophy className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-semibold">Streak & Discipline</h3>
          <p className="text-[10px] text-muted-foreground/50 mt-0.5">Trading consistency</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setShareOpen(true)}
          title="Share streak"
        >
          <Share2 className="w-3 h-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Current Streak */}
        <div className={cn(
          "inner-panel",
          stats.streakType === "win" ? "!bg-profit/[0.06] !border-profit/20" : "!bg-loss/[0.06] !border-loss/20"
        )}>
          <div className="flex items-center gap-1.5 mb-1">
            {stats.streakType === "win" ? (
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-profit" />
                {stats.currentStreak > 3 && <Flame className="w-3 h-3 text-warning" />}
              </div>
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-loss" />
            )}
            <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Streak</p>
          </div>
          <p className={cn("text-lg font-bold font-mono", stats.streakType === "win" ? "text-profit" : "text-loss")}>
            {stats.currentStreak} {stats.streakType === "win" ? "W" : "L"}
          </p>
        </div>

        {/* Avg RR */}
        <div className="inner-panel !p-2.5">
          <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Avg R:R</p>
          <p className={cn("text-lg font-bold font-mono mt-0.5", stats.avgRR >= 1.5 ? "text-profit" : stats.avgRR >= 1 ? "text-foreground" : "text-loss")}>
            1:{stats.avgRR.toFixed(1)}
          </p>
        </div>

        {/* Best Trade */}
        <div className="inner-panel !p-2.5">
          <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Best Trade</p>
          <p className="text-base font-bold mt-0.5 text-profit font-mono">
            +₹{stats.bestTrade.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Worst Trade */}
        <div className="inner-panel">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Worst Trade</p>
          <p className="text-lg font-bold mt-1 text-loss font-mono">
            -₹{Math.abs(stats.worstTrade).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Discipline bar */}
      <div className="mt-3 inner-panel">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">SL Discipline</p>
          <p className="text-xs font-semibold font-mono">{stats.disciplineScore}%</p>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden relative">
          <div
            className={cn(
              "h-full rounded-full transition-all relative bar-shine",
              stats.disciplineScore >= 80
                ? "bg-gradient-to-r from-profit to-profit/80"
                : stats.disciplineScore >= 50
                ? "bg-gradient-to-r from-warning to-warning/80"
                : "bg-gradient-to-r from-loss to-loss/80"
            )}
            style={{ width: `${stats.disciplineScore}%` }}
          >
            {stats.disciplineScore > 30 && (
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/90">
                {stats.disciplineScore}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Streak Share Modal */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-fit p-6">
          <div id="streak-share-card">
            <StreakShareCard data={streakShareData} />
          </div>
          <Button
            className="mt-4 w-full"
            onClick={async () => {
              const el = document.getElementById("streak-share-card");
              if (!el) return;
              try {
                const dataUrl = await toPng(el, { pixelRatio: 2 });
                const link = document.createElement("a");
                link.download = `streak-${stats.currentStreak}${stats.streakType}.png`;
                link.href = dataUrl;
                link.click();
                toast.success("Streak card downloaded!");
              } catch {
                toast.error("Failed to generate image");
              }
            }}
          >
            Download Image
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
