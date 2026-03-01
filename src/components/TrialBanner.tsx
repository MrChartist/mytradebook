import { useSubscription } from "@/hooks/useSubscription";
import { Clock, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function TrialBanner() {
  const { isTrialing, isTrialExpired, trialDaysLeft, plan } = useSubscription();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (!isTrialing && !isTrialExpired) return null;
  if (plan !== "free" && !isTrialing) return null;

  return (
    <div className="relative px-4 py-2.5 flex items-center justify-center gap-3 text-sm bg-primary/5 border-b border-primary/10">
      {isTrialExpired ? (
        <>
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Your Pro trial has ended.</span>
          <Button
            size="sm"
            variant="default"
            className="h-7 text-xs px-3"
            onClick={() => navigate("/settings?tab=billing")}
          >
            Upgrade
          </Button>
        </>
      ) : (
        <>
          <Clock className="w-4 h-4 text-primary" />
          <span>
            Pro trial: <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}</strong> left
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-3"
            onClick={() => navigate("/settings?tab=billing")}
          >
            View Plans
          </Button>
        </>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 text-muted-foreground hover:text-foreground"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
