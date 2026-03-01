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
  Eye,
  ChevronDown,
  Star,
  Activity,
  PieChart,
  Layers,
  ArrowUpRight,
  Menu,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
const bentoFeatures = [
  {
    icon: BookOpen,
    title: "Smart Trade Journal",
    description: "Log trades across Equity, F&O, and Commodities with chart uploads, tags, pattern recognition, and post-trade reviews.",
    large: true,
    mockup: "journal",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Equity curves, drawdown analysis, win-rate heatmaps, day-of-week patterns, and segment breakdowns.",
    large: false,
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Price alerts, scanner triggers, and instant Telegram notifications when markets move.",
    large: false,
  },
  {
    icon: Target,
    title: "Trailing Stop Loss",
    description: "Automated TSL engine with configurable activation, step, gap, and segment-specific profiles.",
    large: true,
    mockup: "tsl",
  },
  {
    icon: LineChart,
    title: "Broker Integration",
    description: "Connect Dhan for live prices, portfolio auto-sync, and one-click execution.",
    large: false,
  },
  {
    icon: Shield,
    title: "Rules & Discipline",
    description: "Pre-trade checklists, mistake tagging, and confidence scoring to enforce your edge.",
    large: false,
  },
];

const steps = [
  {
    icon: BookOpen,
    title: "Log Your Trades",
    desc: "Add trades manually or auto-sync from your broker. Tag setups, patterns, and mistakes.",
  },
  {
    icon: Eye,
    title: "Spot Patterns",
    desc: "Segment-level analytics reveal what's working — by setup, time, day, and market condition.",
  },
  {
    icon: Zap,
    title: "Automate & Scale",
    desc: "Set rules, alerts, and trailing stops. Let the system enforce your trading discipline.",
  },
];

const testimonials = [
  {
    name: "Rahul M.",
    initials: "RM",
    role: "Options Trader, Mumbai",
    quote: "TradeBook helped me identify that my Monday morning trades were consistently losing. After adjusting, my win rate went from 42% to 61%.",
    stars: 5,
  },
  {
    name: "Priya S.",
    initials: "PS",
    role: "Swing Trader, Bangalore",
    quote: "The segment-level analytics are a game-changer. I can see exactly which setups work for intraday vs positional.",
    stars: 5,
  },
  {
    name: "Aditya K.",
    initials: "AK",
    role: "F&O Trader, Delhi",
    quote: "I tried 4 journals before TradeBook. None understood Indian markets — segments, lot sizes, MCX. Finally something built for us.",
    stars: 5,
  },
];

const faqs = [
  {
    q: "Is TradeBook free to use?",
    a: "Yes! The Free plan includes up to 50 trades/month, basic analytics, and 1 watchlist — forever free. Upgrade to Pro for unlimited trades and advanced features.",
  },
  {
    q: "Which brokers are supported?",
    a: "Currently we support Dhan for live prices, portfolio auto-sync, and one-click order execution. More brokers are on the roadmap.",
  },
  {
    q: "Is my trading data safe?",
    a: "Absolutely. All data is encrypted at rest and in transit. Your data is yours — we never share, sell, or use it for any other purpose.",
  },
  {
    q: "Can I use TradeBook for Commodities and F&O?",
    a: "Yes! TradeBook supports 5 market segments: Equity Intraday, Equity Positional, Futures, Options, and Commodities.",
  },
  {
    q: "How does the 14-day Pro trial work?",
    a: "Every new signup gets full Pro access for 14 days — no credit card required. After the trial, continue free or upgrade.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we offer a full refund within 7 days of purchase. No questions asked.",
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

const segmentTabs = [
  {
    id: "equity",
    label: "Equity",
    icon: TrendingUp,
    title: "Intraday & Positional Equity",
    description: "Track cash-market trades with split segments for intraday scalps and positional swing trades.",
    features: ["Intraday vs Positional split", "Sector-wise P&L heatmap", "Day-of-week analysis", "Brokerage tracking"],
  },
  {
    id: "fno",
    label: "F&O",
    icon: Activity,
    title: "Futures & Options",
    description: "Purpose-built for derivatives traders. Log option chains, strategy legs, and lot-size-aware P&L.",
    features: ["Multi-leg strategy logging", "Option chain selector", "Lot-size aware P&L", "Expiry-based performance"],
  },
  {
    id: "commodities",
    label: "Commodities",
    icon: PieChart,
    title: "MCX Commodities",
    description: "Track Gold, Silver, Crude and more with commodity-specific lot sizes and session-based analysis.",
    features: ["MCX instrument support", "Session-wise analytics", "Commodity-specific lots", "Margin tracking"],
  },
];

/* ─── FAQ Accordion Item ──────────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className={cn("font-medium text-[15px] pr-4 transition-colors", open && "text-primary")}>{question}</span>
        <ChevronDown className={cn(
          "w-4 h-4 shrink-0 transition-transform duration-300 text-muted-foreground",
          open && "rotate-180 text-primary"
        )} />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: open ? contentRef.current?.scrollHeight ?? 200 : 0, opacity: open ? 1 : 0 }}
      >
        <div ref={contentRef} className="pb-5 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeSegment, setActiveSegment] = useState("equity");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const activeTab = segmentTabs.find((t) => t.id === activeSegment)!;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      {/* ── Floating Island Navbar ─────────────────────────── */}
      <nav className="island-nav max-w-2xl w-[calc(100%-2rem)]">
        {/* Logo */}
        <div className="flex items-center gap-2 pl-2 pr-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight hidden sm:inline">TradeBook</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {[
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/login")}
            className="text-muted-foreground text-sm hidden sm:inline-flex"
          >
            Sign In
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/login")}
            className="rounded-full px-4 text-sm h-8"
          >
            Get Started
          </Button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1.5 rounded-full hover:bg-muted/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-4 right-4 z-50 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl p-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button
              size="sm"
              onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
              className="mt-2 rounded-full"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-12 lg:pt-32 lg:pb-20 text-center">
          {/* Badge */}
          <FadeIn className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground text-xs font-medium">
                Built for Indian Markets · NSE · BSE · MCX
              </span>
            </div>
          </FadeIn>

          {/* Heading */}
          <FadeIn delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-5">
              Know Your Edge.
              <br />
              <span className="relative inline-block">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-xl">Compound</span>
              </span>{" "}
              It Daily.
            </h1>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={200}>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              The trading journal that shows you <strong className="text-foreground">why</strong> you win and{" "}
              <strong className="text-foreground">why</strong> you lose — with segment analytics for Equity, F&O, and Commodities.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={300} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Button
              size="lg"
              className="h-12 px-8 text-base gap-2.5 rounded-full font-semibold shadow-none"
              onClick={() => navigate("/login")}
            >
              Start Free — No Card Needed
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-7 text-base gap-2 rounded-full"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              See How It Works
            </Button>
          </FadeIn>

          <FadeIn delay={350}>
            <p className="text-xs text-muted-foreground mb-12">
              14-day Pro trial · No credit card · 2-minute setup
            </p>
          </FadeIn>

          {/* Social proof - avatar stack */}
          <FadeIn delay={400} className="flex items-center justify-center gap-4 mb-14">
            <div className="flex -space-x-2">
              {["RM", "PS", "AK", "VJ", "NS"].map((initials, i) => (
                <div
                  key={initials}
                  className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                  style={{
                    background: `hsl(${24 + i * 30} ${70 + i * 5}% ${50 + i * 3}%)`,
                    zIndex: 5 - i,
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">10,000+ traders</p>
              <p className="text-xs text-muted-foreground">improving their edge daily</p>
            </div>
          </FadeIn>

          {/* ── Dashboard Preview ─────────────────────────── */}
          <FadeIn delay={500}>
            <div className="relative mx-auto max-w-5xl">
              <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/[0.08] dark:shadow-black/30">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-profit/40" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-muted/50 text-[10px] text-muted-foreground font-mono">
                      mytradebook.lovable.app/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="flex">
                  {/* Mini sidebar */}
                  <div className="hidden sm:flex flex-col w-14 border-r border-border/30 bg-muted/10 py-3 gap-3 items-center">
                    {[BarChart3, BookOpen, Bell, Target, Eye, Layers].map((Icon, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          i === 0
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground/40"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Good Morning,</p>
                        <p className="text-sm font-semibold">Dashboard</p>
                      </div>
                      <div className="px-2.5 py-1 rounded-md bg-profit/10 text-profit text-[10px] font-semibold flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        4 day streak
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                      {[
                        { label: "MTD P&L", value: "+₹24,850", sub: "+12.4%", color: true },
                        { label: "Win Rate", value: "67.5%", sub: "+3.2%", color: true },
                        { label: "Open Positions", value: "3", sub: "" },
                        { label: "Active Alerts", value: "8", sub: "2 triggered" },
                      ].map((kpi) => (
                        <div key={kpi.label} className="rounded-xl border border-border/40 bg-card p-3">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
                          <p className={cn("text-base font-bold font-mono", kpi.color ? "text-profit" : "text-foreground")}>{kpi.value}</p>
                          {kpi.sub && <p className="text-[9px] font-mono mt-0.5 text-profit/70">{kpi.sub}</p>}
                        </div>
                      ))}
                    </div>

                    <div className="grid sm:grid-cols-5 gap-3">
                      <div className="sm:col-span-3 rounded-xl border border-border/40 bg-card p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] text-muted-foreground font-medium">Equity Curve</p>
                          <p className="text-[10px] text-profit font-mono font-semibold">+₹1,24,850</p>
                        </div>
                        <svg viewBox="0 0 400 80" className="w-full h-14">
                          <defs>
                            <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,65 C20,62 40,58 60,50 C80,42 100,48 130,40 C160,32 180,36 210,28 C240,20 260,24 290,18 C320,12 350,16 370,10 C385,6 395,8 400,5" fill="none" stroke="hsl(var(--profit))" strokeWidth="2" strokeLinecap="round" />
                          <path d="M0,65 C20,62 40,58 60,50 C80,42 100,48 130,40 C160,32 180,36 210,28 C240,20 260,24 290,18 C320,12 350,16 370,10 C385,6 395,8 400,5 L400,80 L0,80 Z" fill="url(#curveGrad)" />
                        </svg>
                      </div>
                      <div className="sm:col-span-2 rounded-xl border border-border/40 bg-card p-3">
                        <p className="text-[10px] text-muted-foreground font-medium mb-2">Recent Trades</p>
                        {[
                          { sym: "RELIANCE", pnl: "+₹2,450", up: true },
                          { sym: "NIFTY CE", pnl: "+₹8,200", up: true },
                          { sym: "TATAMOTORS", pnl: "-₹1,100", up: false },
                        ].map((t) => (
                          <div key={t.sym} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-1 h-4 rounded-full", t.up ? "bg-profit" : "bg-loss")} />
                              <span className="text-[10px] font-semibold">{t.sym}</span>
                            </div>
                            <span className={cn("text-[10px] font-mono font-semibold", t.up ? "text-profit" : "text-loss")}>{t.pnl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Trust Strip ──────────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground mb-6">Trusted by traders across all Indian exchanges</p>
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
            {["NSE", "BSE", "MCX", "NCDEX"].map((exchange) => (
              <span key={exchange} className="text-lg font-bold text-muted-foreground/30 tracking-widest">
                {exchange}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — Bento Grid ────────────────────────── */}
      <section id="features" className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Features</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to Trade Better
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From journaling to automation — tools designed by traders, for traders.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bentoFeatures.map((f, i) => (
              <FadeIn
                key={f.title}
                delay={i * 80}
                className={cn(f.large && "lg:col-span-2")}
              >
                <div className={cn(
                  "group rounded-2xl border border-border bg-card p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/15 hover:-translate-y-1",
                  f.large && "flex flex-col sm:flex-row gap-5"
                )}>
                  {/* Icon + Text */}
                  <div className={cn("flex-1", f.large && "min-w-0")}>
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>

                  {/* Mockup for large cards */}
                  {f.large && f.mockup === "journal" && (
                    <div className="sm:w-56 shrink-0 rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
                      {[
                        { sym: "RELIANCE", tag: "Breakout", pnl: "+₹2,450", up: true },
                        { sym: "NIFTY CE", tag: "Momentum", pnl: "+₹8,200", up: true },
                        { sym: "TATAMOTORS", tag: "Reversal", pnl: "-₹780", up: false },
                      ].map((t) => (
                        <div key={t.sym} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                          <div>
                            <p className="text-[10px] font-semibold">{t.sym}</p>
                            <p className="text-[8px] text-muted-foreground">{t.tag}</p>
                          </div>
                          <span className={cn("text-[10px] font-mono font-semibold", t.up ? "text-profit" : "text-loss")}>{t.pnl}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {f.large && f.mockup === "tsl" && (
                    <div className="sm:w-56 shrink-0 rounded-xl border border-border/50 bg-muted/30 p-3">
                      <p className="text-[9px] text-muted-foreground font-medium mb-2">TSL Engine</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Activation</span>
                          <span className="font-mono font-semibold text-profit">1.5%</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Trail Step</span>
                          <span className="font-mono font-semibold">0.5%</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Current SL</span>
                          <span className="font-mono font-semibold text-primary">₹2,856</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted mt-2">
                          <div className="h-full w-3/4 rounded-full bg-primary" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Segment Showcase ─────────────────────────────── */}
      <section id="segments" className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-10">
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Segments</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Built for Every Market
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Whether you trade equity, derivatives, or commodities — TradeBook understands your market.
            </p>
          </FadeIn>

          {/* Tabs — simple text underline */}
          <FadeIn delay={100}>
            <div className="flex items-center justify-center gap-1 mb-10 border-b border-border">
              {segmentTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSegment(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors",
                    activeSegment === tab.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeSegment === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-3">{activeTab.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{activeTab.description}</p>
                  <ul className="space-y-3">
                    {activeTab.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-border p-8 flex items-center justify-center bg-muted/20">
                  <div className="w-full max-w-xs space-y-3">
                    {activeSegment === "equity" && (
                      <>
                        <MockTradeCard sym="RELIANCE" type="BUY" entry="₹2,890" pnl="+₹2,450" up />
                        <MockTradeCard sym="TATAMOTORS" type="SELL" entry="₹985" pnl="-₹780" up={false} />
                        <MockTradeCard sym="INFY" type="BUY" entry="₹1,540" pnl="+₹1,120" up />
                      </>
                    )}
                    {activeSegment === "fno" && (
                      <>
                        <MockTradeCard sym="NIFTY 24200 CE" type="BUY" entry="₹185" pnl="+₹8,200" up />
                        <MockTradeCard sym="BANKNIFTY PE" type="BUY" entry="₹320" pnl="-₹4,500" up={false} />
                        <MockTradeCard sym="NIFTY FUT" type="SELL" entry="₹24,100" pnl="+₹3,750" up />
                      </>
                    )}
                    {activeSegment === "commodities" && (
                      <>
                        <MockTradeCard sym="GOLD APR" type="BUY" entry="₹71,200" pnl="+₹5,800" up />
                        <MockTradeCard sym="CRUDE MAR" type="SELL" entry="₹6,540" pnl="+₹3,200" up />
                        <MockTradeCard sym="SILVER MAR" type="BUY" entry="₹82,100" pnl="-₹2,100" up={false} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── How It Works — Step Cards with SVG Connectors ── */}
      <section id="how-it-works" className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">How It Works</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Three Steps to Trading Mastery</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From first trade to edge mastery — in minutes.
            </p>
          </FadeIn>

          <div className="relative">
            {/* SVG curved arrow connectors (desktop only) */}
            <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 200" preserveAspectRatio="xMidYMid meet">
              {/* Arrow 1→2 */}
              <path d="M250,100 C310,60 360,60 420,100" fill="none" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 4" />
              <polygon points="415,95 425,100 415,105" fill="hsl(var(--muted-foreground))" opacity="0.4" />
              {/* Arrow 2→3 */}
              <path d="M490,100 C550,60 600,60 660,100" fill="none" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 4" />
              <polygon points="655,95 665,100 655,105" fill="hsl(var(--muted-foreground))" opacity="0.4" />
            </svg>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {steps.map((item, i) => (
                <FadeIn key={i} delay={i * 120}>
                  <div className="text-center">
                    {/* Step label */}
                    <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Step {i + 1}</p>

                    <div className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/15 hover:-translate-y-1">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Pricing</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start free. Upgrade when your edge demands it.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {pricingPlans.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 100}>
                <div className={cn(
                  "rounded-2xl border bg-card p-6 flex flex-col h-full transition-all duration-300 hover:shadow-lg",
                  plan.highlighted
                    ? "border-primary shadow-lg ring-1 ring-primary/20 scale-[1.02] lg:scale-105 relative"
                    : "border-border hover:border-primary/15"
                )}>
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      <Zap className="w-3 h-3" /> Most Popular
                    </div>
                  )}

                  {/* Gradient header for highlighted */}
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary to-primary/60" />
                  )}

                  <h3 className="text-xl font-bold mt-1">{plan.name}</h3>
                  <div className="mt-3 mb-1 flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-mono">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn(
                      "w-full h-11 rounded-full",
                      plan.highlighted
                        ? "shadow-none"
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
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Testimonials</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Trusted by Real Traders
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Here's what traders across India are saying.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/15">
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(t.stars)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                    "{t.quote}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground bg-primary">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section id="faq" className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn className="text-center mb-10">
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">FAQ</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Everything you need to know about TradeBook.
            </p>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="rounded-2xl border border-border bg-card px-6 sm:px-8">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <FadeIn className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
            Ready to Find Your Edge?
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Start journaling, analyzing, and compounding your trading edge — every single day.
          </p>
          <Button
            size="lg"
            className="h-14 px-12 text-lg gap-2.5 rounded-full font-semibold shadow-none"
            onClick={() => navigate("/login")}
          >
            Get Started — It's Free <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-xs text-muted-foreground mt-4">No credit card required · 2-minute setup</p>
        </FadeIn>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border py-12 bg-card/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
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
                <li><a href="#segments" className="hover:text-foreground transition-colors">Segments</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:support@tradebook.app" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
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

/* ─── Mock trade card for segment showcase ──────────────── */
function MockTradeCard({ sym, type, entry, pnl, up }: { sym: string; type: string; entry: string; pnl: string; up: boolean }) {
  return (
    <div className={cn(
      "rounded-xl border bg-card p-3.5 flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5",
      up ? "border-profit/20 hover:border-profit/40" : "border-loss/20 hover:border-loss/40"
    )}
    style={{ boxShadow: up ? "inset 3px 0 0 hsl(var(--profit) / 0.4)" : "inset 3px 0 0 hsl(var(--loss) / 0.4)" }}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-1.5 h-8 rounded-full", up ? "bg-profit" : "bg-loss")} />
        <div>
          <p className="text-xs font-semibold">{sym}</p>
          <p className="text-[10px] text-muted-foreground">{type} · {entry}</p>
        </div>
      </div>
      <span className={cn("text-xs font-mono font-semibold", up ? "text-profit" : "text-loss")}>{pnl}</span>
    </div>
  );
}
