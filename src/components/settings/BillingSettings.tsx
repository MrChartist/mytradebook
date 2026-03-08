import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, BarChart3, Crown } from "lucide-react";
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
    icon: Zap,
  },
  {
    name: "Quarterly",
    price: "₹0",
    originalPrice: "₹499",
    period: "/quarter",
    isBeta: true,
    popular: true,
    cta: "Current Plan",
    icon: Zap,
  },
  {
    name: "Yearly",
    price: "₹1,499",
    originalPrice: null,
    period: "/year",
    isBeta: false,
    popular: false,
    cta: "Coming Soon",
    icon: Crown,
  },
];

export default function BillingSettings() {
  const { plan, isTrialing, trialDaysLeft, isTrialExpired, limits } = useSubscription();

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="surface-card p-5 lg:p-6">
        <h3 className="text-base font-semibold mb-1">Your Plan</h3>
        <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
          {isTrialing
            ? `You're on a Pro trial — ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining.`
            : isTrialExpired
            ? "Your Pro trial has expired. Upgrade to continue using premium features."
            : `You're on the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`}
        </p>

        {limits.maxTradesPerMonth < Infinity && (
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-[11px] text-muted-foreground/60">
              <span>Monthly trade limit</span>
              <span className="font-mono">{limits.maxTradesPerMonth} trades/month</span>
            </div>
            <Progress value={0} className="h-1.5" />
          </div>
        )}

        <div className="p-3.5 rounded-lg bg-muted/30 border border-border/15">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-[13px] font-medium">Payment integration coming soon</p>
              <p className="text-[11px] text-muted-foreground/60">
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
        <h3 className="text-base font-semibold mb-4">Choose Your Billing Cycle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {billingPlans.map((p) => (
            <div
              key={p.name}
              className={cn(
                "surface-card p-5 space-y-3.5 relative overflow-hidden transition-all duration-200",
                p.popular && "ring-1 ring-primary/30 border-primary/15"
              )}
            >
              {/* Top accent for popular */}
              {p.popular && (
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}

              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-[9px] px-2.5 py-0.5 font-bold tracking-wide">
                    Recommended
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-1">
                <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                  <p.icon className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-semibold text-[15px]">{p.name}</h4>
              </div>

              {p.isBeta && (
                <Badge variant="secondary" className="text-[9px] font-bold tracking-wide px-2 py-0.5">
                  Free During Beta
                </Badge>
              )}

              <div className="flex items-baseline gap-1.5">
                {p.originalPrice && (
                  <span className="text-[13px] text-muted-foreground/40 line-through font-mono">
                    {p.originalPrice}
                  </span>
                )}
                <span className="text-2xl font-extrabold font-mono tracking-tight">{p.price}</span>
                <span className="text-[12px] text-muted-foreground/60">{p.period}</span>
              </div>

              <ul className="space-y-2">
                {allFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px]">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={p.popular ? "default" : "outline"}
                className={cn("w-full h-9 text-[13px]", p.popular && "bg-primary hover:bg-primary/90")}
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
