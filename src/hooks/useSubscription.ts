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

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxTradesPerMonth: 50,
    maxWatchlists: 1,
    advancedAnalytics: false,
    telegramNotifications: false,
    brokerIntegration: false,
    weeklyReports: false,
    trailingSL: false,
    teamMembers: 0,
    apiAccess: false,
  },
  pro: {
    maxTradesPerMonth: Infinity,
    maxWatchlists: 10,
    advancedAnalytics: true,
    telegramNotifications: true,
    brokerIntegration: true,
    weeklyReports: true,
    trailingSL: true,
    teamMembers: 0,
    apiAccess: false,
  },
  team: {
    maxTradesPerMonth: Infinity,
    maxWatchlists: Infinity,
    advancedAnalytics: true,
    telegramNotifications: true,
    brokerIntegration: true,
    weeklyReports: true,
    trailingSL: true,
    teamMembers: 5,
    apiAccess: true,
  },
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

  const isTrialing = subscription?.status === "trialing";
  const trialEndsAt = subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at)
    : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isTrialExpired = isTrialing && trialDaysLeft <= 0;

  // Effective plan: if trial expired and no payment, fall back to free
  const effectivePlan: PlanType =
    isTrialExpired ? "free" : (subscription?.plan as PlanType) || "free";

  const limits = PLAN_LIMITS[effectivePlan];

  const canAccess = (feature: keyof PlanLimits): boolean => {
    const value = limits[feature];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0;
    return false;
  };

  const isPro = effectivePlan === "pro" || effectivePlan === "team";
  const isTeam = effectivePlan === "team";

  return {
    subscription,
    isLoading,
    plan: effectivePlan,
    limits,
    isPro,
    isTeam,
    isTrialing,
    isTrialExpired,
    trialDaysLeft,
    trialEndsAt,
    canAccess,
  };
}
