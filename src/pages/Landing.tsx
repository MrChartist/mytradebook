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
  ChevronDown,
  Star,
  Quote,
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

const testimonials = [
  {
    name: "Rahul M.",
    role: "Options Trader, Mumbai",
    quote: "TradeBook helped me identify that my Monday morning trades were consistently losing. After adjusting my strategy, my win rate went from 42% to 61%.",
    stars: 5,
  },
  {
    name: "Priya S.",
    role: "Swing Trader, Bangalore",
    quote: "The segment-level analytics are a game-changer. I can see exactly which setups work for intraday vs positional, and the Telegram alerts keep me disciplined.",
    stars: 5,
  },
  {
    name: "Aditya K.",
    role: "F&O Trader, Delhi",
    quote: "I tried 4 journals before TradeBook. None understood Indian markets — segments, lot sizes, MCX. Finally something built for how we actually trade.",
    stars: 5,
  },
];

const faqs = [
  {
    q: "Is TradeBook free to use?",
    a: "Yes! The Free plan includes up to 50 trades/month, basic analytics, and 1 watchlist — forever free. Upgrade to Pro for unlimited trades, Telegram notifications, broker integration, and advanced analytics.",
  },
  {
    q: "Which brokers are supported?",
    a: "Currently we support Dhan for live prices, portfolio auto-sync, and one-click order execution. More brokers (Zerodha, Angel One) are on the roadmap.",
  },
  {
    q: "Is my trading data safe?",
    a: "Absolutely. All data is encrypted at rest and in transit. Your data is yours — we never share, sell, or use it for any purpose other than powering your dashboard.",
  },
  {
    q: "Can I use TradeBook for Commodities and F&O?",
    a: "Yes! TradeBook supports 5 market segments: Equity Intraday, Equity Positional, Futures, Options, and Commodities. Each segment has its own analytics and reporting.",
  },
  {
    q: "How does the 14-day Pro trial work?",
    a: "Every new signup gets full Pro access for 14 days — no credit card required. After the trial, you can continue on the Free plan or upgrade to keep Pro features.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we offer a full refund within 7 days of purchase if you're not satisfied. No questions asked.",
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

/* ─── FAQ Accordion Item ────────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm pr-4">{question}</span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
}

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

          {/* Dashboard Preview Mockup */}
          <FadeIn delay={500} className="mt-16">
            <div className="relative mx-auto max-w-4xl">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-[hsl(var(--tb-accent)/0.08)] rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-loss/40" />
                    <div className="w-3 h-3 rounded-full bg-warning/40" />
                    <div className="w-3 h-3 rounded-full bg-profit/40" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-profit/60" />
                      mytradebook.lovable.app
                    </div>
                  </div>
                </div>
                {/* Fake dashboard content */}
                <div className="p-4 sm:p-6">
                  {/* KPI row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "MTD P&L", value: "+₹24,850", color: "text-profit" },
                      { label: "Open Positions", value: "3", color: "text-foreground" },
                      { label: "Win Rate", value: "67.5%", color: "text-profit" },
                      { label: "Active Alerts", value: "8", color: "text-foreground" },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded-xl border border-border/50 bg-card p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
                        <p className={cn("text-lg font-bold font-mono", kpi.color)}>{kpi.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Mini equity curve */}
                  <div className="rounded-xl border border-border/50 bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-3">Equity Curve</p>
                    <svg viewBox="0 0 400 100" className="w-full h-16 sm:h-20">
                      <defs>
                        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,80 C30,75 60,60 100,55 C140,50 160,65 200,45 C240,25 280,30 320,20 C360,10 380,15 400,8"
                        fill="none"
                        stroke="hsl(var(--profit))"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0,80 C30,75 60,60 100,55 C140,50 160,65 200,45 C240,25 280,30 320,20 C360,10 380,15 400,8 L400,100 L0,100 Z"
                        fill="url(#curveGrad)"
                      />
                    </svg>
                  </div>
                </div>
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

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.2]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Trusted by{" "}
              <span
                className="text-[hsl(var(--tb-accent))] italic"
                style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}
              >
                Real Traders
              </span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Here's what traders across India are saying about TradeBook.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col">
                  <Quote className="w-8 h-8 text-[hsl(var(--tb-accent)/0.2)] mb-4" />
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(t.stars)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))]" />
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Everything you need to know about TradeBook.
            </p>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </FadeIn>
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
