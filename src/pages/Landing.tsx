import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import {
  TrendingUp,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Shield,
  Target,
  LineChart,
  CheckCircle2,
  Zap,
  Download,
  Eye,
  Layers,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─── Animated counter ──────────────────────────────────── */
function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

/* ─── Fade-in on scroll ─────────────────────────────────── */
function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    // Start visible immediately for hero elements (delay < 500ms)
    // Use IntersectionObserver for below-fold elements
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "50px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Data ──────────────────────────────────────────────── */
const features = [
  {
    icon: BookOpen,
    title: "Smart Journal",
    description: "Multi-segment trade logging with charts, tags, notes, and pattern recognition.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Equity curves, drawdown analysis, win-rate heatmaps, and segment breakdowns.",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description: "Price alerts, scanner triggers, and instant Telegram notifications.",
  },
  {
    icon: Target,
    title: "Trailing Stop Loss",
    description: "Segment-based TSL with configurable activation, step, gap, and cooldown.",
  },
  {
    icon: LineChart,
    title: "Broker Integration",
    description: "Connect Dhan for live prices, portfolio auto-sync, and one-click execution.",
  },
  {
    icon: Shield,
    title: "Rules Engine",
    description: "Pre-trade checklists, mistake tagging, and discipline enforcement.",
  },
];

const steps = [
  {
    step: "01",
    icon: BookOpen,
    title: "Log Your Trades",
    desc: "Add trades manually or auto-sync from Dhan. Tag setups, patterns, and mistakes.",
  },
  {
    step: "02",
    icon: Eye,
    title: "Spot Patterns",
    desc: "Segment-level analytics reveal what's working — by setup, time, and condition.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Automate & Scale",
    desc: "Set rules, alerts, and trailing stops. Let the system enforce your discipline.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started with the basics",
    features: ["Up to 50 trades/month", "Basic analytics", "1 watchlist", "Community support"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/mo",
    description: "For active, serious traders",
    features: [
      "Unlimited trades",
      "Advanced analytics & reports",
      "Telegram notifications",
      "Trailing stop loss engine",
      "Broker integration (Dhan)",
      "10 watchlists",
      "Priority support",
    ],
    cta: "Start 14-Day Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "₹1,499",
    period: "/mo",
    description: "For trading desks & groups",
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared studies & alerts",
      "RA compliance mode",
      "API access",
      "Dedicated manager",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

/* ─── Main Component ────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Stats: segments and rating are factual product constants
  const s3 = useCountUp(5, 1200);
  const s4 = useCountUp(48, 1500);

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      {/* ── Navbar ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--tb-accent))] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">TradeBook</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-muted">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors duration-200">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="text-muted-foreground"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/login")}
              className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-5 shadow-none"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-16 lg:pt-36 lg:pb-24 text-center">
          {/* Badge */}
          <FadeIn className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--tb-accent)/0.3)] bg-[hsl(var(--tb-accent)/0.08)] text-sm">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--tb-accent))] animate-pulse" />
              <span className="text-[hsl(var(--tb-accent))] font-semibold uppercase tracking-wider text-xs">
                Built for Indian Markets · NSE · MCX
              </span>
            </div>
          </FadeIn>

          {/* Heading */}
          <FadeIn delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8">
              The Ultimate
              <br />
              <span
                className="font-script text-[hsl(var(--tb-accent))] italic"
                style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}
              >
                Trading
              </span>{" "}
              Journal
            </h1>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={200}>
            <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Track, analyze, and improve your trades with real-time alerts,
              broker integration, and segment-based analytics.
              Built for Equity, F&O, and Commodity traders.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={300} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="h-12 px-8 text-base gap-2 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-none"
              onClick={() => navigate("/login")}
            >
              <Download className="w-4 h-4" />
              Start Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base gap-2 rounded-full"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Features <ArrowRight className="w-4 h-4" />
            </Button>
          </FadeIn>

          {/* Stats Row */}
          <FadeIn delay={400}>
            <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
              <div className="text-center" ref={s3.ref}>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {s3.count}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Market Segments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                  14-Day
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Free Pro Trial</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                  100%
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Data Privacy</div>
              </div>
              <div className="text-center" ref={s4.ref}>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                  24/7
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Cloud Access</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span
                className="text-[hsl(var(--tb-accent))] italic"
                style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}
              >
                Trade Better
              </span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From journaling to automation — tools designed by traders, for traders.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 80}>
                <div className="group rounded-2xl border border-border bg-card p-6 h-full transition-all duration-300 hover:border-[hsl(var(--tb-accent)/0.3)] hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--tb-accent)/0.15)] transition-colors">
                    <f.icon className="w-5 h-5 text-[hsl(var(--tb-accent))]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.2]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Three Steps to Mastery</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From first trade to edge mastery — in minutes.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((item, i) => (
              <FadeIn key={item.step} delay={i * 120}>
                <div className="relative group">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-14 -right-3 w-6 border-t-2 border-dashed border-border" />
                  )}
                  <div className="rounded-2xl border border-border bg-card p-6 h-full text-center relative overflow-hidden">
                    <div className="absolute top-3 right-4 text-5xl font-black text-muted-foreground/10 select-none">
                      {item.step}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center mx-auto mb-5">
                      <item.icon className="w-6 h-6 text-[hsl(var(--tb-accent))]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start free. Upgrade when your edge demands it.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {pricingPlans.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 100}>
                <div
                  className={cn(
                    "rounded-2xl border bg-card p-6 flex flex-col relative overflow-hidden transition-all duration-300",
                    plan.highlighted
                      ? "border-[hsl(var(--tb-accent)/0.4)] ring-1 ring-[hsl(var(--tb-accent)/0.15)] scale-[1.02] lg:scale-105"
                      : "border-border hover:border-[hsl(var(--tb-accent)/0.2)]"
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(var(--tb-accent))]" />
                  )}
                  {plan.highlighted && (
                    <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))] text-xs font-semibold mb-4">
                      <Zap className="w-3 h-3" /> Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-3 mb-1 flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-mono">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[hsl(var(--tb-accent))] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn(
                      "w-full h-11 rounded-full",
                      plan.highlighted
                        ? "bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white shadow-none"
                        : ""
                    )}
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => navigate("/login")}
                  >
                    {plan.cta}
                    {plan.highlighted && <ArrowRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.25]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <FadeIn className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">
            Stop Losing Money to
            <br />
            <span
              className="text-[hsl(var(--tb-accent))] italic"
              style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}
            >
              Undisciplined
            </span>{" "}
            Trading
          </h2>
          <p className="text-base text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Start journaling, analyzing, and compounding your trading edge — every single day.
          </p>
          <Button
            size="lg"
            className="h-12 px-10 text-base gap-2 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-none"
            onClick={() => navigate("/login")}
          >
            Get Started — It's Free <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-4">No credit card required · 2-minute setup</p>
        </FadeIn>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--tb-accent))] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">TradeBook</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The trading journal built for Indian markets. Track, analyze, and improve.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:support@tradebook.app" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} TradeBook. All rights reserved. Made with ❤️ in India.
            </p>
            <p className="text-xs text-muted-foreground">
              Not SEBI registered. For educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
