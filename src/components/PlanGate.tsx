import { ReactNode } from "react";
import { PlanType, PlanLimits } from "@/hooks/useSubscription";

interface PlanGateProps {
  /** Minimum plan required */
  plan: PlanType;
  /** Or gate by specific feature */
  feature?: keyof PlanLimits;
  children: ReactNode;
  /** Fallback message */
  message?: string;
}

/** During beta all features are unlocked — always render children */
export function PlanGate({ children }: PlanGateProps) {
  return <>{children}</>;
}
