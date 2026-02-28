import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTrades } from "@/hooks/useTrades";
import {
  BookOpen,
  Bell,
  BarChart3,
  Eye,
  ArrowRight,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ONBOARDING_KEY = "tradebook_onboarding_dismissed";

interface Step {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  route: string;
  completed?: boolean;
}

export function OnboardingWelcome() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { trades } = useTrades();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    setDismissed(stored === "true");
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  const hasTradesLogged = trades.length > 0;
  const hasClosedTrades = trades.some((t) => t.status === "CLOSED");

  const steps: Step[] = [
    {
      id: "trade",
      icon: BookOpen,
      title: "Log Your First Trade",
      description: "Add a trade manually or sync from your broker.",
      action: "Add Trade",
      route: "/trades",
      completed: hasTradesLogged,
    },
    {
      id: "watchlist",
      icon: Eye,
      title: "Create a Watchlist",
      description: "Track symbols you're watching for setups.",
      action: "Open Watchlist",
      route: "/watchlist",
    },
    {
      id: "alert",
      icon: Bell,
      title: "Set a Price Alert",
      description: "Get notified when price hits your level.",
      action: "Create Alert",
      route: "/alerts",
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: "Review Your Analytics",
      description: "See win rate, equity curve, and segment breakdown.",
      action: "View Analytics",
      route: "/analytics",
      completed: hasClosedTrades,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;
  const name = profile?.name || "Trader";

  return (
    <div className="relative rounded-2xl border border-[hsl(var(--tb-accent)/0.3)] bg-card overflow-hidden mb-5">
      {/* Top accent bar */}
      <div className="h-1 bg-[hsl(var(--tb-accent))]" />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--tb-accent)/0.12)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[hsl(var(--tb-accent))]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Welcome, {name}! 👋</h2>
              <p className="text-sm text-muted-foreground">
                Complete these steps to get the most out of TradeBook.
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{completedCount} of {steps.length} completed</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--tb-accent))] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => navigate(step.route)}
              className={cn(
                "text-left rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group",
                step.completed
                  ? "border-[hsl(var(--profit)/0.3)] bg-[hsl(var(--profit)/0.04)]"
                  : "border-border hover:border-[hsl(var(--tb-accent)/0.3)]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    step.completed
                      ? "bg-[hsl(var(--profit)/0.12)]"
                      : "bg-[hsl(var(--tb-accent)/0.1)]"
                  )}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[hsl(var(--profit))]" />
                  ) : (
                    <step.icon className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
                  )}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-sm font-semibold mb-0.5">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </button>
          ))}
        </div>

        {/* Quick dismiss */}
        <div className="mt-4 text-center">
          <button
            onClick={dismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            I know my way around — dismiss this
          </button>
        </div>
      </div>
    </div>
  );
}
