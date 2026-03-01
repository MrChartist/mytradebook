import { ReactNode } from "react";
import { useSubscription, PlanType, PlanLimits } from "@/hooks/useSubscription";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PlanGateProps {
  /** Minimum plan required */
  plan: PlanType;
  /** Or gate by specific feature */
  feature?: keyof PlanLimits;
  children: ReactNode;
  /** Fallback message */
  message?: string;
}

export function PlanGate({ plan, feature, children, message }: PlanGateProps) {
  const { plan: currentPlan, canAccess } = useSubscription();
  const navigate = useNavigate();

  const planOrder: PlanType[] = ["free", "pro", "team"];
  const hasAccess = feature
    ? canAccess(feature)
    : planOrder.indexOf(currentPlan) >= planOrder.indexOf(plan);

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-30 blur-[2px] select-none" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="surface-card p-6 max-w-sm text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">
            {plan === "team" ? "Team" : "Pro"} Feature
          </h3>
          <p className="text-sm text-muted-foreground">
            {message || `Upgrade to ${plan === "team" ? "Team" : "Pro"} plan to unlock this feature.`}
          </p>
          <Button
            onClick={() => navigate("/settings?tab=billing")}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}
