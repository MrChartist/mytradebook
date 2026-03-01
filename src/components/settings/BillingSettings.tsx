import { useSubscription, PlanType } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Crown, Sparkles, Check, AlertTriangle, 
  Clock, Zap, Users, BarChart3, Bot, 
  TrendingUp, Bell, LineChart 
} from "lucide-react";
import { cn } from "@/lib/utils";

const plans: {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: typeof Crown;
  popular?: boolean;
}[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started with basic trading journal",
    icon: Zap,
    features: [
      "50 trades/month",
      "1 watchlist",
      "Basic analytics",
      "Calendar view",
      "Manual trade logging",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "For serious traders who want an edge",
    icon: Sparkles,
    popular: true,
    features: [
      "Unlimited trades",
      "10 watchlists",
      "Advanced analytics",
      "Telegram notifications",
      "Dhan broker integration",
      "Weekly reports",
      "Trailing stop-loss engine",
      "Pattern & mistake tracking",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "₹1,499",
    period: "/month",
    description: "For teams and research analysts",
    icon: Users,
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared studies & research",
      "RA compliance mode",
      "API access",
      "Priority support",
    ],
  },
];

export default function BillingSettings() {
  const {
    plan,
    isTrialing,
    isTrialExpired,
    trialDaysLeft,
    trialEndsAt,
    subscription,
    isLoading,
  } = useSubscription();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="surface-card p-6 animate-pulse h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <div className="surface-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Current Plan</h3>
            <p className="text-sm text-muted-foreground">
              Manage your subscription and billing
            </p>
          </div>
          <Badge
            variant={plan === "free" ? "secondary" : "default"}
            className={cn(
              "text-sm px-3 py-1",
              plan === "pro" && "bg-primary text-primary-foreground",
              plan === "team" && "bg-primary text-primary-foreground"
            )}
          >
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </Badge>
        </div>

        {/* Trial Banner */}
        {isTrialing && !isTrialExpired && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  Pro trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining
                </p>
                <p className="text-xs text-muted-foreground">
                  Your trial ends on{" "}
                  {trialEndsAt?.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  . Add a payment method to continue using Pro features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trial Expired */}
        {isTrialExpired && (
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Your Pro trial has ended
                </p>
                <p className="text-xs text-muted-foreground">
                  You're now on the Free plan. Upgrade to continue using Pro features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Provider Notice */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Payment integration coming soon</p>
              <p className="text-xs text-muted-foreground">
                Razorpay integration will be available shortly. Until then, enjoy your current plan!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isCurrent = p.id === plan;
            return (
              <div
                key={p.id}
                className={cn(
                  "surface-card p-5 space-y-4 relative",
                  p.popular && "ring-2 ring-primary",
                  isCurrent && "border-primary/30"
                )}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-xs px-3">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <p.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{p.name}</h4>
                  </div>
                </div>

                <div>
                  <span className="text-2xl font-bold">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>

                <p className="text-sm text-muted-foreground">{p.description}</p>

                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrent ? "outline" : p.popular ? "default" : "outline"}
                  className="w-full"
                  disabled={isCurrent || !p.popular}
                >
                  {isCurrent
                    ? "Current Plan"
                    : p.id === "free"
                    ? "Downgrade"
                    : "Coming Soon"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
