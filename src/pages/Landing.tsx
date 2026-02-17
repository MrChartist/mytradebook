import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import {
  TrendingUp,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Shield,
  Zap,
  Target,
  LineChart,
  CheckCircle2,
  ChevronRight,
  Star,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: BookOpen,
    title: "Smart Trade Journal",
    description:
      "Log every trade with entry/exit, charts, notes, and tags. Multi-segment support for Equity, F&O, Commodities.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description:
      "Equity curves, drawdown analysis, win-rate by setup, day-of-week heatmaps, and streak tracking.",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description:
      "Price alerts, scanner-based triggers, and Telegram notifications so you never miss a move.",
  },
  {
    icon: Target,
    title: "Trailing Stop Loss",
    description:
      "Segment-based TSL with configurable activation, step, and cooldown — auto-manages your exits.",
  },
  {
    icon: LineChart,
    title: "Broker Integration",
    description:
      "Connect your Dhan account for live prices, auto-sync portfolio, and one-click order execution.",
  },
  {
    icon: Shield,
    title: "Rules & Discipline",
    description:
      "Pre-trade checklists, mistake tagging, and pattern recognition to build consistent habits.",
  },
];

const stats = [
  { value: "10K+", label: "Trades Logged" },
  { value: "98%", label: "Uptime" },
  { value: "5", label: "Market Segments" },
  { value: "<1s", label: "Alert Latency" },
];

const testimonials = [
  {
    name: "Rahul M.",
    role: "Options Trader",
    quote:
      "TradeBook transformed how I review my trades. The segment-based analytics helped me realize my intraday setups were bleeding money while my positional trades were consistently profitable.",
    rating: 5,
  },
  {
    name: "Priya S.",
    role: "Swing Trader",
    quote:
      "The Telegram alerts and trailing stop loss are game-changers. I no longer sit glued to the screen — the system watches my trades and notifies me only when it matters.",
    rating: 5,
  },
  {
    name: "Amit K.",
    role: "Equity Investor",
    quote:
      "Finally a journal built for Indian markets. The Dhan integration, NSE/BSE support, and segment filtering make this indispensable for serious traders.",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 50 trades/month",
      "Basic analytics",
      "1 watchlist",
      "Email support",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "For active traders",
    features: [
      "Unlimited trades",
      "Advanced analytics & reports",
      "Telegram notifications",
      "Trailing stop loss",
      "Broker integration",
      "10 watchlists",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "₹1,499",
    period: "/month",
    description: "For trading desks & groups",
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared studies & alerts",
      "RA compliance mode",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">TradeBook</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate("/login")} className="gap-1.5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-profit/6 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-32 lg:pb-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card mb-8 text-sm text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-warning" />
            Built for Indian Markets — NSE, BSE, MCX
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight max-w-4xl mx-auto mb-6">
            Your Trading Edge,{" "}
            <span className="gradient-text">Quantified.</span>
          </h1>

          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A professional trading journal with real-time alerts, broker integration,
            and segment-based analytics. Stop guessing — start measuring.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-13 px-8 text-base gap-2 shadow-glow"
              onClick={() => navigate("/login")}
            >
              Start Journaling — Free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-13 px-8 text-base gap-2"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See Features <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Stats bar */}
          <div className="mt-16 lg:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold gradient-text">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-24 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to Trade Better
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From journaling to automation — tools designed by traders, for traders.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="premium-card-hover group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Three Steps to Mastery</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: BookOpen,
                title: "Log Your Trades",
                desc: "Add trades manually or auto-sync from your broker. Tag setups, patterns, and mistakes.",
              },
              {
                step: "02",
                icon: BarChart3,
                title: "Analyze Patterns",
                desc: "See what's working. Filter by segment, timeframe, and setup to find your edge.",
              },
              {
                step: "03",
                icon: Target,
                title: "Refine & Repeat",
                desc: "Use insights to build rules, set alerts, and let the system enforce your discipline.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="text-6xl font-black text-primary/10 mb-4">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8">
                    <ChevronRight className="w-6 h-6 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section id="testimonials" className="py-24 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Trusted by Indian Traders</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="premium-card flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start free. Upgrade when you're ready to go pro.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "premium-card flex flex-col",
                  plan.highlighted && "border-primary/40 shadow-glow ring-1 ring-primary/20"
                )}
              >
                {plan.highlighted && (
                  <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                    <Zap className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-profit shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn("w-full", plan.highlighted ? "" : "")}
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => navigate("/login")}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Find Your Edge?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of Indian traders who use TradeBook to journal, analyze, and improve their trading — every single day.
          </p>
          <Button
            size="lg"
            className="h-13 px-10 text-base gap-2 shadow-glow"
            onClick={() => navigate("/login")}
          >
            Get Started — It's Free <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">TradeBook</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>

            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} TradeBook. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
