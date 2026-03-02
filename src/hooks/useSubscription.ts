import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PlanType = "free" | "pro" | "team";

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: string;
  payment_provider: string | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  maxTradesPerMonth: number;
  maxWatchlists: number;
  advancedAnalytics: boolean;
  telegramNotifications: boolean;
  brokerIntegration: boolean;
  weeklyReports: boolean;
  trailingSL: boolean;
  teamMembers: number;
  apiAccess: boolean;
}

// During beta: all features unlocked for everyone
const BETA_LIMITS: PlanLimits = {
  maxTradesPerMonth: Infinity,
  maxWatchlists: Infinity,
  advancedAnalytics: true,
  telegramNotifications: true,
  brokerIntegration: true,
  weeklyReports: true,
  trailingSL: true,
  teamMembers: 5,
  apiAccess: true,
};

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: BETA_LIMITS,
  pro: BETA_LIMITS,
  team: BETA_LIMITS,
};

export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) {
        console.error("Subscription fetch error:", error);
        return null;
      }
      return data as unknown as Subscription;
    },
    enabled: !!user?.id,
  });

  // During beta, everyone gets full access
  const effectivePlan: PlanType = "pro";
  const limits = PLAN_LIMITS[effectivePlan];

  const canAccess = (_feature: keyof PlanLimits): boolean => true;

  return {
    subscription,
    isLoading,
    plan: effectivePlan,
    limits,
    isPro: true,
    isTeam: true,
    isTrialing: false,
    isTrialExpired: false,
    trialDaysLeft: 0,
    trialEndsAt: null,
    canAccess,
  };
}
