import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTrades } from "@/hooks/useTrades";
import { useWatchlists } from "@/hooks/useWatchlists";
import { useAlerts } from "@/hooks/useAlerts";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useDailyJournal } from "@/hooks/useDailyJournal";
import {
  BookOpen, Bell, BarChart3, Eye, ArrowRight, X, CheckCircle2, Sparkles, Link, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ONBOARDING_KEY = "tradebook_onboarding_dismissed";

interface Step {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  route: string;
  completed?: boolean;
}

export function OnboardingWelcome() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { trades } = useTrades();
  const { watchlists } = useWatchlists();
  const { alerts } = useAlerts();
  const { settings } = useUserSettings();
  const { entries: journalEntries } = useDailyJournal();
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(ONBOARDING_KEY) === "true"; } catch { return false; }
  });

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setDismissed(true);
  };

  const hasTradesLogged = trades.length > 0;
  const hasWatchlists = watchlists.length > 0;
  const hasAlerts = alerts.length > 0;
  const hasBrokerConnected = !!settings?.dhan_verified_at;
  const hasJournalEntry = journalEntries.length > 0;
  const hasClosedTrades = trades.some((t) => t.status === "CLOSED");

  const steps: Step[] = [
    { id: "trade", icon: BookOpen, title: "Log Your First Trade", description: "Add a trade manually or sync from your broker.", route: "/trades", completed: hasTradesLogged },
    { id: "watchlist", icon: Eye, title: "Create a Watchlist", description: "Track symbols you're watching for setups.", route: "/watchlist", completed: hasWatchlists },
    { id: "alert", icon: Bell, title: "Set a Price Alert", description: "Get notified when price hits your level.", route: "/alerts", completed: hasAlerts },
    { id: "broker", icon: Link, title: "Connect Your Broker", description: "Link your Dhan account for auto-sync.", route: "/settings?tab=integrations", completed: hasBrokerConnected },
    { id: "journal", icon: FileText, title: "Write a Journal Entry", description: "Reflect on your trading day.", route: "/journal", completed: hasJournalEntry },
    { id: "analytics", icon: BarChart3, title: "Review Your Analytics", description: "See win rate, equity curve, and segment breakdown.", route: "/analytics", completed: hasClosedTrades },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;
  const name = profile?.name || "Trader";

  useEffect(() => {
    if (completedCount === steps.length && !dismissed) dismiss();
  }, [completedCount, steps.length, dismissed]);

  if (dismissed) return null;

  return (
    <div className="premium-card card-glow-primary !mb-5">
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 rounded-t-[1.25rem]",
        "bg-gradient-to-r from-primary via-primary/80 to-primary/50"
      )} />

      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
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

      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>{completedCount} of {steps.length} completed</span>
          <span className="font-mono">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-500 relative bar-shine bg-gradient-to-r from-primary to-primary/70"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => navigate(step.route)}
            className={cn(
              "text-left inner-panel transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group",
              step.completed && "!border-profit/20 !bg-profit/[0.03]"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  step.completed ? "bg-profit/10" : "bg-primary/10"
                )}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-profit" />
                ) : (
                  <step.icon className="w-4 h-4 text-primary" />
                )}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-sm font-semibold mb-0.5">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={dismiss}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          I know my way around — dismiss this
        </button>
      </div>
    </div>
  );
}
