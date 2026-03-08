import { useAchievements } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

export function AchievementsBadgeGrid() {
  const { achievements, unlockedCount, totalCount } = useAchievements();

  const categories = ["milestone", "streak", "profit", "discipline", "achievement"];
  const categoryLabels: Record<string, string> = {
    milestone: "Milestones",
    streak: "Streaks",
    profit: "Profit",
    discipline: "Discipline",
    achievement: "Special",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold">Achievements</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {unlockedCount}/{totalCount} unlocked
        </span>
      </div>

      <Progress value={(unlockedCount / Math.max(totalCount, 1)) * 100} className="h-2" />

      {categories.map((cat) => {
        const items = achievements.filter((a) => a.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {categoryLabels[cat] || cat}
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {items.map((a) => (
                <Tooltip key={a.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all cursor-default",
                        a.unlocked
                          ? "bg-primary/10 border-primary/30 shadow-sm"
                          : "bg-muted/30 border-border/50 opacity-40 grayscale"
                      )}
                    >
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-[10px] font-medium leading-tight line-clamp-2">
                        {a.title}
                      </span>
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
