import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTrades } from "@/hooks/useTrades";
import { toast } from "sonner";
import { useCallback, useMemo } from "react";

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
  sort_order: number;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
}

export interface EnrichedAchievement extends Achievement {
  unlocked: boolean;
  userProgress: UserAchievement | undefined;
  currentProgress: number;
  progressPercent: number;
}

export function useAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { trades } = useTrades();

  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Achievement[];
    },
    staleTime: 1000 * 60 * 60,
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["user-achievements", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!user?.id,
  });

  const unlockAchievement = useMutation({
    mutationFn: async ({ achievementId, progress }: { achievementId: string; progress: number }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_achievements")
        .upsert({
          user_id: user.id,
          achievement_id: achievementId,
          progress,
          unlocked_at: new Date().toISOString(),
        }, { onConflict: "user_id,achievement_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
    },
  });

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));

  // Compute current progress for each achievement key
  const progressMap = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === "CLOSED");
    const totalClosed = closedTrades.length;
    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const reviewedCount = closedTrades.filter((t) => t.reviewed_at).length;

    const sorted = [...closedTrades].sort(
      (a, b) => new Date(b.closed_at!).getTime() - new Date(a.closed_at!).getTime()
    );
    let winStreak = 0;
    for (const t of sorted) {
      if ((t.pnl || 0) > 0) winStreak++;
      else break;
    }

    const winRate = totalClosed >= 20
      ? (closedTrades.filter((t) => (t.pnl || 0) > 0).length / totalClosed) * 100
      : 0;

    const map: Record<string, number> = {
      first_trade: Math.min(totalClosed, 1),
      trades_10: Math.min(totalClosed, 10),
      trades_50: Math.min(totalClosed, 50),
      trades_100: Math.min(totalClosed, 100),
      trades_500: Math.min(totalClosed, 500),
      win_streak_3: Math.min(winStreak, 3),
      win_streak_5: Math.min(winStreak, 5),
      win_streak_10: Math.min(winStreak, 10),
      first_profit: closedTrades.some((t) => (t.pnl || 0) > 0) ? 1 : 0,
      profit_10k: Math.min(Math.max(Math.floor(totalPnl), 0), 10000),
      profit_100k: Math.min(Math.max(Math.floor(totalPnl), 0), 100000),
      first_review: Math.min(reviewedCount, 1),
      reviews_10: Math.min(reviewedCount, 10),
      win_rate_70: Math.floor(winRate),
    };
    return map;
  }, [trades]);

  const checkAchievements = useCallback(async () => {
    if (!user?.id || achievements.length === 0) return;

    const newUnlocks: { achievement: Achievement; progress: number }[] = [];

    for (const a of achievements) {
      if (unlockedIds.has(a.id)) continue;
      const progress = progressMap[a.key] ?? 0;
      if (progress >= a.threshold) {
        newUnlocks.push({ achievement: a, progress });
      }
    }

    for (const { achievement, progress } of newUnlocks) {
      await unlockAchievement.mutateAsync({ achievementId: achievement.id, progress });
      toast.success(`🏆 Achievement Unlocked: ${achievement.icon} ${achievement.title}`, {
        description: achievement.description,
        duration: 5000,
      });
    }
  }, [user?.id, achievements, progressMap, unlockedIds, unlockAchievement]);

  const enrichedAchievements: EnrichedAchievement[] = useMemo(() => {
    return achievements.map((a) => {
      const ua = userAchievements.find((u) => u.achievement_id === a.id);
      const currentProgress = ua?.progress ?? (progressMap[a.key] ?? 0);
      const progressPercent = a.threshold > 0
        ? Math.min((currentProgress / a.threshold) * 100, 100)
        : 0;
      return {
        ...a,
        unlocked: unlockedIds.has(a.id),
        userProgress: ua,
        currentProgress,
        progressPercent,
      };
    });
  }, [achievements, userAchievements, unlockedIds, progressMap]);

  const recentUnlocks = useMemo(() => {
    return enrichedAchievements
      .filter((a) => a.unlocked && a.userProgress?.unlocked_at)
      .sort((a, b) => new Date(b.userProgress!.unlocked_at).getTime() - new Date(a.userProgress!.unlocked_at).getTime())
      .slice(0, 3);
  }, [enrichedAchievements]);

  const nextUp = useMemo(() => {
    return enrichedAchievements
      .filter((a) => !a.unlocked && a.progressPercent > 0)
      .sort((a, b) => b.progressPercent - a.progressPercent)
      .slice(0, 2);
  }, [enrichedAchievements]);

  return {
    achievements: enrichedAchievements,
    unlockedCount: userAchievements.length,
    totalCount: achievements.length,
    recentUnlocks,
    nextUp,
    checkAchievements,
  };
}
