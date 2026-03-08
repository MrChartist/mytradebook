import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

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
    maxTradesPerMonth: 20,
    maxWatchlists: 3,
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
    maxWatchlists: Infinity,
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

  const computedValues = useMemo(() => {
    const sub = subscription;
    const now = new Date();

    // Determine trial status
    const trialEndsAt = sub?.trial_ends_at ? new Date(sub.trial_ends_at) : null;
    const isTrialing = sub?.status === "trialing" && trialEndsAt !== null && trialEndsAt > now;
    const isTrialExpired = sub?.status === "trialing" && trialEndsAt !== null && trialEndsAt <= now;
    const trialDaysLeft = isTrialing && trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    // Effective plan: trialing users get pro features, expired trial → free
    let effectivePlan: PlanType;
    if (isTrialing) {
      effectivePlan = "pro";
    } else if (isTrialExpired) {
      effectivePlan = "free";
    } else if (sub?.status === "active" || sub?.status === "past_due") {
      effectivePlan = (sub.plan as PlanType) || "free";
    } else {
      effectivePlan = "free";
    }

    const limits = PLAN_LIMITS[effectivePlan];
    const isPro = effectivePlan === "pro" || effectivePlan === "team";
    const isTeam = effectivePlan === "team";

    const canAccess = (feature: keyof PlanLimits): boolean => {
      const val = limits[feature];
      if (typeof val === "boolean") return val;
      if (typeof val === "number") return val > 0;
      return true;
    };

    return {
      effectivePlan,
      limits,
      isPro,
      isTeam,
      isTrialing,
      isTrialExpired,
      trialDaysLeft,
      trialEndsAt,
      canAccess,
    };
  }, [subscription]);

  return {
    subscription,
    isLoading,
    plan: computedValues.effectivePlan,
    limits: computedValues.limits,
    isPro: computedValues.isPro,
    isTeam: computedValues.isTeam,
    isTrialing: computedValues.isTrialing,
    isTrialExpired: computedValues.isTrialExpired,
    trialDaysLeft: computedValues.trialDaysLeft,
    trialEndsAt: computedValues.trialEndsAt,
    canAccess: computedValues.canAccess,
  };
}
