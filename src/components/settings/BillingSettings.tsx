import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { Progress } from "@/components/ui/progress";
import ReferralCard from "@/components/settings/ReferralCard";

const allFeatures = [
  "Unlimited trades",
  "Advanced analytics & reports",
  "Telegram notifications",
  "Trailing stop loss engine",
  "Broker integration (Dhan)",
  "Unlimited watchlists",
  "Pattern & mistake tracking",
  "Weekly reports",
  "Priority support",
];

const billingPlans = [
  {
    name: "Monthly",
    price: "₹0",
    originalPrice: "₹199",
    period: "/mo",
    isBeta: true,
    popular: false,
    cta: "Current Plan",
  },
  {
    name: "Quarterly",
    price: "₹0",
    originalPrice: "₹499",
    period: "/quarter",
    isBeta: true,
    popular: true,
    cta: "Current Plan",
  },
  {
    name: "Yearly",
    price: "₹1,499",
    originalPrice: null,
    period: "/year",
    isBeta: false,
    popular: false,
    cta: "Coming Soon",
  },
];

export default function BillingSettings() {
  const { plan, isTrialing, trialDaysLeft, isTrialExpired, limits } = useSubscription();

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="surface-card p-6">
        <h3 className="text-lg font-semibold mb-1">Your Plan</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isTrialing
            ? `You're on a Pro trial — ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining.`
            : isTrialExpired
            ? "Your Pro trial has expired. Upgrade to continue using premium features."
            : `You're on the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`}
        </p>

        {limits.maxTradesPerMonth < Infinity && (
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Monthly trade limit</span>
              <span>{limits.maxTradesPerMonth} trades/month</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        )}

        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Payment integration coming soon</p>
              <p className="text-xs text-muted-foreground">
                Razorpay / Stripe integration will be available shortly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral */}
      <ReferralCard />

      {/* Plan Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Your Billing Cycle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {billingPlans.map((p) => (
            <div
              key={p.name}
              className={cn(
                "surface-card p-5 space-y-4 relative",
                p.popular && "ring-2 ring-primary"
              )}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs px-3">
                    Recommended
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{p.name}</h4>
                </div>
              </div>

              {p.isBeta && (
                <Badge variant="secondary" className="text-[11px]">
                  Free During Beta
                </Badge>
              )}

              <div>
                {p.originalPrice && (
                  <span className="text-base text-muted-foreground line-through mr-2">
                    {p.originalPrice}
                  </span>
                )}
                <span className="text-2xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>

              <ul className="space-y-2">
                {allFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={p.popular ? "default" : "outline"}
                className="w-full"
                disabled
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
