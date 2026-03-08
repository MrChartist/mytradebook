import { useAchievements, type EnrichedAchievement } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";
import { Trophy, ChevronRight, Sparkles, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function RecentUnlockCard({ a }: { a: EnrichedAchievement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-profit/20 bg-profit/5 shadow-sm min-w-[80px] shrink-0 relative overflow-hidden liquid-shine">
          <span className="text-2xl drop-shadow-sm">{a.icon}</span>
          <span className="text-[10px] font-semibold text-foreground leading-tight text-center line-clamp-2">
            {a.title}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <p className="font-semibold">{a.icon} {a.title}</p>
        <p className="text-xs text-muted-foreground">{a.description}</p>
        {a.userProgress && (
          <p className="text-xs text-profit mt-1">
            ✓ Unlocked {new Date(a.userProgress.unlocked_at).toLocaleDateString("en-IN")}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function NextUpItem({ a }: { a: EnrichedAchievement }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/15">
      <span className="text-xl shrink-0">{a.icon}</span>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-foreground truncate">{a.title}</span>
          <span className="text-[10px] font-mono text-muted-foreground shrink-0">
            {a.currentProgress}/{a.threshold}
          </span>
        </div>
        <Progress value={a.progressPercent} className="h-1.5" />
      </div>
    </div>
  );
}

function AllAchievementsGrid({ achievements }: { achievements: EnrichedAchievement[] }) {
  const categories = ["milestone", "streak", "profit", "discipline", "achievement"];
  const categoryLabels: Record<string, string> = {
    milestone: "Milestones",
    streak: "Streaks",
    profit: "Profit",
    discipline: "Discipline",
    achievement: "Special",
  };

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {categories.map((cat) => {
        const items = achievements.filter((a) => a.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {categoryLabels[cat] || cat}
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {items.map((a) => (
                <Tooltip key={a.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all",
                        a.unlocked
                          ? "bg-profit/5 border-profit/20 shadow-sm"
                          : "bg-muted/20 border-border/30 opacity-50 grayscale"
                      )}
                    >
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-[10px] font-medium leading-tight line-clamp-2">{a.title}</span>
                      {!a.unlocked && a.threshold > 0 && (
                        <Progress value={a.progressPercent} className="h-1 w-full" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="font-semibold">{a.icon} {a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                    {a.unlocked && a.userProgress && (
                      <p className="text-xs text-profit mt-1">
                        ✓ Unlocked {new Date(a.userProgress.unlocked_at).toLocaleDateString("en-IN")}
                      </p>
                    )}
                    {!a.unlocked && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Progress: {a.currentProgress}/{a.threshold}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AchievementsBadgeGrid() {
  const { achievements, unlockedCount, totalCount, recentUnlocks, nextUp } = useAchievements();
  const overallPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="premium-card p-4 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Achievements</h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {unlockedCount}/{totalCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={overallPercent} className="h-1.5 flex-1" />
          <span className="text-[10px] text-muted-foreground font-medium">{overallPercent}%</span>
        </div>
      </div>

      {/* Recently Unlocked */}
      {recentUnlocks.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-profit" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recently Unlocked</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {recentUnlocks.map((a) => (
              <RecentUnlockCard key={a.id} a={a} />
            ))}
          </div>
        </div>
      )}

      {/* Next Up */}
      {nextUp.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Target className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Next Up</span>
          </div>
          <div className="space-y-1.5">
            {nextUp.map((a) => (
              <NextUpItem key={a.id} a={a} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state when nothing to show */}
      {recentUnlocks.length === 0 && nextUp.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Start trading to unlock your first achievement! 🎯
        </p>
      )}

      {/* View All */}
      {totalCount > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full flex items-center justify-between py-1.5 px-1 text-xs text-muted-foreground hover:text-foreground transition-colors group">
              <span>View all {totalCount} achievements</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                All Achievements
                <span className="text-sm font-normal text-muted-foreground ml-auto">
                  {unlockedCount}/{totalCount}
                </span>
              </DialogTitle>
            </DialogHeader>
            <AllAchievementsGrid achievements={achievements} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
