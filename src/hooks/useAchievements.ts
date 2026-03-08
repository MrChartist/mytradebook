import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTrades } from "@/hooks/useTrades";
import { toast } from "sonner";
import { useCallback } from "react";

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

export function useAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { trades } = useTrades();

  // Fetch all achievement definitions
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
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Fetch user's unlocked achievements
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

  // Check and unlock achievements based on current trade data
  const checkAchievements = useCallback(async () => {
    if (!user?.id || achievements.length === 0) return;

    const closedTrades = trades.filter((t) => t.status === "CLOSED");
    const totalClosed = closedTrades.length;
    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const reviewedCount = closedTrades.filter((t) => t.reviewed_at).length;

    // Calculate current win streak
    const sorted = [...closedTrades].sort(
      (a, b) => new Date(b.closed_at!).getTime() - new Date(a.closed_at!).getTime()
    );
    let winStreak = 0;
    for (const t of sorted) {
      if ((t.pnl || 0) > 0) winStreak++;
      else break;
    }

    const newUnlocks: { achievement: Achievement; progress: number }[] = [];

    for (const a of achievements) {
      if (unlockedIds.has(a.id)) continue;

      let shouldUnlock = false;
      let progress = 0;

      switch (a.key) {
        case "first_trade":
          shouldUnlock = totalClosed >= 1;
          progress = Math.min(totalClosed, 1);
          break;
        case "trades_10":
          shouldUnlock = totalClosed >= 10;
          progress = Math.min(totalClosed, 10);
          break;
        case "trades_50":
          shouldUnlock = totalClosed >= 50;
          progress = Math.min(totalClosed, 50);
          break;
        case "trades_100":
          shouldUnlock = totalClosed >= 100;
          progress = Math.min(totalClosed, 100);
          break;
        case "trades_500":
          shouldUnlock = totalClosed >= 500;
          progress = Math.min(totalClosed, 500);
          break;
        case "win_streak_3":
          shouldUnlock = winStreak >= 3;
          progress = Math.min(winStreak, 3);
          break;
        case "win_streak_5":
          shouldUnlock = winStreak >= 5;
          progress = Math.min(winStreak, 5);
          break;
        case "win_streak_10":
          shouldUnlock = winStreak >= 10;
          progress = Math.min(winStreak, 10);
          break;
        case "first_profit":
          shouldUnlock = closedTrades.some((t) => (t.pnl || 0) > 0);
          progress = shouldUnlock ? 1 : 0;
          break;
        case "profit_10k":
          shouldUnlock = totalPnl >= 10000;
          progress = Math.min(Math.floor(totalPnl), 10000);
          break;
        case "profit_100k":
          shouldUnlock = totalPnl >= 100000;
          progress = Math.min(Math.floor(totalPnl), 100000);
          break;
        case "first_review":
          shouldUnlock = reviewedCount >= 1;
          progress = Math.min(reviewedCount, 1);
          break;
        case "reviews_10":
          shouldUnlock = reviewedCount >= 10;
          progress = Math.min(reviewedCount, 10);
          break;
        case "win_rate_70": {
          const winRate = totalClosed >= 20
            ? (closedTrades.filter((t) => (t.pnl || 0) > 0).length / totalClosed) * 100
            : 0;
          shouldUnlock = totalClosed >= 20 && winRate >= 70;
          progress = Math.floor(winRate);
          break;
        }
      }

      if (shouldUnlock) {
        newUnlocks.push({ achievement: a, progress });
      }
    }

    // Unlock new achievements
    for (const { achievement, progress } of newUnlocks) {
      await unlockAchievement.mutateAsync({ achievementId: achievement.id, progress });
      toast.success(`🏆 Achievement Unlocked: ${achievement.icon} ${achievement.title}`, {
        description: achievement.description,
        duration: 5000,
      });
    }
  }, [user?.id, achievements, trades, unlockedIds, unlockAchievement]);

  const enrichedAchievements = achievements.map((a) => ({
    ...a,
    unlocked: unlockedIds.has(a.id),
    userProgress: userAchievements.find((ua) => ua.achievement_id === a.id),
  }));

  return {
    achievements: enrichedAchievements,
    unlockedCount: userAchievements.length,
    totalCount: achievements.length,
    checkAchievements,
  };
}
