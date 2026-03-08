import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Clock, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrialBanner() {
  const { isTrialing, isTrialExpired, trialDaysLeft } = useSubscription();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem("trial-banner-dismissed") === "true"
  );

  if (dismissed || (!isTrialing && !isTrialExpired)) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("trial-banner-dismissed", "true");
  };

  return (
    <div className={`px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium border-b ${
      isTrialExpired
        ? "bg-destructive/10 border-destructive/20 text-destructive"
        : "bg-primary/10 border-primary/20 text-primary"
    }`}>
      <Clock className="w-4 h-4 shrink-0" />
      <span>
        {isTrialExpired
          ? "Your Pro trial has expired."
          : `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left in your Pro trial.`}
      </span>
      <Button
        size="sm"
        variant={isTrialExpired ? "destructive" : "default"}
        className="h-7 text-xs gap-1"
        onClick={() => navigate("/settings?tab=billing")}
      >
        <Sparkles className="w-3 h-3" />
        Upgrade
      </Button>
      {!isTrialExpired && (
        <button onClick={handleDismiss} className="ml-1 text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
