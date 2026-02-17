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
  Zap,
  Target,
  LineChart,
  CheckCircle2,
  ChevronRight,
  Star,
  Play,
  ArrowUpRight,
  Sparkles,
  Clock,
  Layers,
  Send,
  Activity,
  PieChart,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─── Animated counter hook ─────────────────────────────── */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
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
  }, [end, duration, startOnView]);

  return { count, ref };
}

/* ─── Fade-in on scroll component ───────────────────────── */
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8",
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
    accent: "primary" as const,
    span: "col-span-1",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Equity curves, drawdown, win-rate heatmaps, streak tracking, and segment breakdowns.",
    accent: "profit" as const,
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description: "Price alerts, scanner triggers, and instant Telegram notifications.",
    accent: "warning" as const,
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: Target,
    title: "Trailing Stop Loss",
    description: "Segment-based TSL with configurable activation, step, gap, and cooldown.",
    accent: "loss" as const,
    span: "col-span-1",
  },
  {
    icon: LineChart,
    title: "Broker Sync",
    description: "Connect Dhan for live prices, portfolio auto-sync, and one-click execution.",
    accent: "primary" as const,
    span: "col-span-1",
  },
  {
    icon: Shield,
    title: "Rules Engine",
    description: "Pre-trade checklists, mistake tagging, and discipline enforcement.",
    accent: "profit" as const,
    span: "col-span-1",
  },
];

const accentColors = {
  primary: {
    bg: "bg-primary/10",
    bgHover: "group-hover:bg-primary/15",
    text: "text-primary",
    border: "border-primary/20",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.12)]",
  },
  profit: {
    bg: "bg-profit/10",
    bgHover: "group-hover:bg-profit/15",
    text: "text-profit",
    border: "border-profit/20",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--profit)/0.12)]",
  },
  warning: {
    bg: "bg-warning/10",
    bgHover: "group-hover:bg-warning/15",
    text: "text-warning",
    border: "border-warning/20",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--warning)/0.12)]",
  },
  loss: {
    bg: "bg-loss/10",
    bgHover: "group-hover:bg-loss/15",
    text: "text-loss",
    border: "border-loss/20",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--loss)/0.12)]",
  },
};

const testimonials = [
  {
    name: "Rahul M.",
    role: "Options Trader · 3yr exp",
    quote: "The segment analytics showed me my intraday setups were bleeding money while positional was consistently profitable. Game-changer.",
    avatar: "RM",
    color: "bg-primary/15 text-primary",
  },
  {
    name: "Priya S.",
    role: "Swing Trader · 5yr exp",
    quote: "Telegram alerts + trailing stop loss means I no longer sit glued to the screen. The system watches my trades for me.",
    avatar: "PS",
    color: "bg-profit/15 text-profit",
  },
  {
    name: "Amit K.",
    role: "Equity Investor · 7yr exp",
    quote: "Finally a journal built for Indian markets. Dhan integration, NSE/BSE, segment filtering — indispensable for serious traders.",
    avatar: "AK",
    color: "bg-warning/15 text-warning",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started with the basics",
    features: [
      "Up to 50 trades/month",
      "Basic analytics dashboard",
      "1 watchlist",
      "Community support",
    ],
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
      "5 team members included",
      "Shared studies & alerts",
      "RA compliance mode",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

/* ─── Dashboard Preview Component ───────────────────────── */
function DashboardPreview() {
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Browser chrome */}
      <div className="rounded-t-2xl border border-border border-b-0 bg-card px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-loss/40" />
          <div className="w-3 h-3 rounded-full bg-warning/40" />
          <div className="w-3 h-3 rounded-full bg-profit/40" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1 rounded-lg bg-muted text-xs text-muted-foreground font-mono">
            app.tradebook.in/dashboard
          </div>
        </div>
      </div>

      {/* Dashboard mockup */}
      <div className="rounded-b-2xl border border-border bg-card overflow-hidden p-4 lg:p-6">
        {/* Top KPI row */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "Today's P&L", value: "+₹12,450", color: "text-profit", icon: TrendingUp },
            { label: "Win Rate", value: "68.2%", color: "text-primary", icon: PieChart },
            { label: "Open Trades", value: "4", color: "text-foreground", icon: Activity },
            { label: "Alerts Active", value: "12", color: "text-warning", icon: Bell },
          ].map((kpi) => (
            <div key={kpi.label} className="inner-panel flex flex-col gap-1 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] lg:text-xs text-muted-foreground">{kpi.label}</span>
                <kpi.icon className="w-3 h-3 text-muted-foreground/50" />
              </div>
              <span className={cn("text-sm lg:text-lg font-bold font-mono", kpi.color)}>
                {kpi.value}
              </span>
            </div>
          ))}
        </div>

        {/* Chart + Trades row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Equity curve mockup */}
          <div className="col-span-2 inner-panel p-3 h-36 lg:h-48 relative overflow-hidden">
            <span className="text-[10px] lg:text-xs text-muted-foreground mb-2 block">Equity Curve</span>
            <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 100 Q20 95 40 88 T80 75 T120 60 T160 55 T200 45 T240 50 T280 35 T320 30 T360 20 T400 15"
                fill="none"
                stroke="hsl(var(--profit))"
                strokeWidth="2"
                className="animate-[draw_2s_ease-out_forwards]"
              />
              <path
                d="M0 100 Q20 95 40 88 T80 75 T120 60 T160 55 T200 45 T240 50 T280 35 T320 30 T360 20 T400 15 V120 H0Z"
                fill="url(#eq-grad)"
              />
            </svg>
          </div>

          {/* Recent trades mockup */}
          <div className="inner-panel p-3 h-36 lg:h-48">
            <span className="text-[10px] lg:text-xs text-muted-foreground mb-2 block">Recent Trades</span>
            <div className="space-y-2">
              {[
                { sym: "RELIANCE", pnl: "+₹2,340", type: "BUY", win: true },
                { sym: "NIFTY 24500CE", pnl: "-₹890", type: "BUY", win: false },
                { sym: "HDFCBANK", pnl: "+₹1,560", type: "BUY", win: true },
                { sym: "TATAMOTORS", pnl: "+₹3,210", type: "SELL", win: true },
              ].map((t) => (
                <div key={t.sym} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full", t.win ? "bg-profit" : "bg-loss")} />
                    <span className="text-[10px] lg:text-xs font-medium truncate max-w-[80px] lg:max-w-[120px]">{t.sym}</span>
                  </div>
                  <span className={cn("text-[10px] lg:text-xs font-mono font-semibold", t.win ? "text-profit" : "text-loss")}>
                    {t.pnl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Glow behind preview */}
      <div className="absolute -inset-4 -z-10 bg-primary/5 rounded-3xl blur-2xl" />
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const s1 = useCountUp(10000, 2000);
  const s2 = useCountUp(98, 1800);
  const s3 = useCountUp(5, 1200);

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">TradeBook</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors duration-200">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors duration-200">Reviews</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate("/login")} className="gap-1.5 shadow-glow">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background art */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[10%] w-[600px] h-[600px] bg-primary/6 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 right-[15%] w-[500px] h-[500px] bg-profit/5 rounded-full blur-[140px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.6) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Animated grid lines */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8 lg:pt-24 lg:pb-12">
          {/* Badge */}
          <FadeIn className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-profit" />
              </span>
              <span className="text-muted-foreground">Built for Indian Markets</span>
              <span className="font-semibold text-foreground">NSE · BSE · MCX</span>
            </div>
          </FadeIn>

          {/* Heading */}
          <FadeIn delay={100} className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-bold leading-[1.08] tracking-tight max-w-4xl mx-auto mb-6">
              Your Trading Edge,
              <br />
              <span className="gradient-text">Quantified & Automated.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200} className="text-center">
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The professional trading journal that combines real-time alerts, broker integration,
              and segment-based analytics — so you can stop guessing and start compounding.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={300} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Button
              size="lg"
              className="h-12 px-8 text-base gap-2 shadow-glow rounded-xl"
              onClick={() => navigate("/login")}
            >
              Start Free — No Card Required <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base gap-2 rounded-xl"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Play className="w-3.5 h-3.5" /> See How It Works
            </Button>
          </FadeIn>

          <FadeIn delay={350} className="text-center mb-12">
            <p className="text-xs text-muted-foreground">
              Trusted by <span className="font-semibold text-foreground">2,500+</span> Indian traders · Setup in 2 minutes
            </p>
          </FadeIn>

          {/* Dashboard Preview */}
          <FadeIn delay={400}>
            <DashboardPreview />
          </FadeIn>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────── */}
      <section className="py-16 border-y border-border/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center" ref={s1.ref}>
              <div className="text-3xl lg:text-4xl font-bold font-mono gradient-text">
                {s1.count.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground mt-1">Trades Logged</div>
            </div>
            <div className="text-center" ref={s2.ref}>
              <div className="text-3xl lg:text-4xl font-bold font-mono gradient-text">
                {s2.count}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Uptime SLA</div>
            </div>
            <div className="text-center" ref={s3.ref}>
              <div className="text-3xl lg:text-4xl font-bold font-mono gradient-text">
                {s3.count}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Market Segments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold font-mono gradient-text">&lt;1s</div>
              <div className="text-sm text-muted-foreground mt-1">Alert Latency</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (Bento Grid) ────────────────────────── */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Sparkles className="w-3 h-3" /> FEATURES
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Everything You Need to<br className="hidden sm:block" /> Trade Better
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              From journaling to automation — tools designed by traders, for traders.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const ac = accentColors[f.accent];
              return (
                <FadeIn key={f.title} delay={i * 80} className={f.span}>
                  <div
                    className={cn(
                      "group relative rounded-2xl border bg-card p-6 h-full transition-all duration-300 cursor-default",
                      "hover:border-transparent hover:-translate-y-1",
                      ac.glow
                    )}
                  >
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
                        ac.bg,
                        ac.bgHover
                      )}
                    >
                      <f.icon className={cn("w-5 h-5", ac.text)} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                    <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/4 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Layers className="w-3 h-3" /> HOW IT WORKS
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Three Steps to Mastery</h2>
            <p className="text-muted-foreground max-w-md mx-auto">From first trade to edge mastery — in minutes.</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                icon: BookOpen,
                title: "Log Your Trades",
                desc: "Add trades manually or auto-sync from Dhan. Tag setups, patterns, and mistakes for every entry.",
                color: "primary" as const,
              },
              {
                step: "02",
                icon: Eye,
                title: "Spot Your Patterns",
                desc: "Segment-level analytics reveal what's working. See win-rate by setup, time, and market condition.",
                color: "profit" as const,
              },
              {
                step: "03",
                icon: Zap,
                title: "Automate & Scale",
                desc: "Set rules, alerts, and trailing stops. Let the system enforce your discipline while you focus on setups.",
                color: "warning" as const,
              },
            ].map((item, i) => {
              const ac = accentColors[item.color];
              return (
                <FadeIn key={item.step} delay={i * 120}>
                  <div className="relative group">
                    {/* Connector line */}
                    {i < 2 && (
                      <div className="hidden md:block absolute top-14 -right-3 w-6 border-t-2 border-dashed border-border" />
                    )}
                    <div className="surface-card p-6 h-full text-center relative overflow-hidden">
                      <div className="absolute top-3 right-4 text-5xl font-black text-muted/40 select-none">
                        {item.step}
                      </div>
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5",
                          ac.bg
                        )}
                      >
                        <item.icon className={cn("w-6 h-6", ac.text)} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section id="testimonials" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Star className="w-3 h-3" /> TESTIMONIALS
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Loved by Indian Traders</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Hear from traders who've transformed their process with TradeBook.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div className="surface-card p-6 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", t.color)}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-24 lg:py-32 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-[10%] w-[500px] h-[500px] bg-primary/4 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Zap className="w-3 h-3" /> PRICING
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start free. Upgrade when your edge demands it.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {pricingPlans.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 100}>
                <div
                  className={cn(
                    "rounded-2xl border bg-card p-6 flex flex-col relative overflow-hidden transition-all duration-300",
                    plan.highlighted
                      ? "border-primary/30 shadow-glow ring-1 ring-primary/10 scale-[1.02] lg:scale-105"
                      : "border-border hover:border-primary/15"
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
                  )}
                  {plan.highlighted && (
                    <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
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
                        <CheckCircle2 className="w-4 h-4 text-profit shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn(
                      "w-full h-11 rounded-xl",
                      plan.highlighted && "shadow-glow"
                    )}
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => navigate("/login")}
                  >
                    {plan.cta} {plan.highlighted && <ArrowRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/6 rounded-full blur-[180px]" />
        </div>

        <FadeIn className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Send className="w-3 h-3" /> READY?
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
            Stop Losing Money to<br /> Undisciplined Trading
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Join 2,500+ Indian traders who use TradeBook to journal, analyze, and compound their edge — every single day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-12 px-10 text-base gap-2 shadow-glow rounded-xl"
              onClick={() => navigate("/login")}
            >
              Get Started — It's Free <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">No credit card required · 2-minute setup · Cancel anytime</p>
        </FadeIn>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" />
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
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status Page</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Refund Policy</a></li>
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
