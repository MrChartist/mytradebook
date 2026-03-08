import { ReactNode } from "react";
import { PlanType, PlanLimits, useSubscription } from "@/hooks/useSubscription";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PlanGateProps {
  plan: PlanType;
  feature?: keyof PlanLimits;
  children: ReactNode;
  message?: string;
}

export function PlanGate({ plan, feature, children, message }: PlanGateProps) {
  const { plan: currentPlan, canAccess, isTrialing } = useSubscription();
  const navigate = useNavigate();

  const planRank: Record<PlanType, number> = { free: 0, pro: 1, team: 2 };
  const hasAccess = feature ? canAccess(feature) : planRank[currentPlan] >= planRank[plan];

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative rounded-xl border border-border bg-card/50 p-6 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-base font-semibold">
        {message || `Upgrade to ${plan === "team" ? "Team" : "Pro"} to unlock this feature`}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {isTrialing
          ? "Your trial has expired. Upgrade to continue using this feature."
          : "This feature is available on a higher plan."}
      </p>
      <Button
        onClick={() => navigate("/settings?tab=billing")}
        className="gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Upgrade Now
      </Button>
    </div>
  );
}
