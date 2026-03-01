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
  Quote,
  Activity,
  PieChart,
  Layers,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
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

const segmentTabs = [
  {
    id: "equity",
    label: "Equity",
    icon: TrendingUp,
    title: "Intraday & Positional Equity",
    description: "Track cash-market trades with split segments for intraday scalps and positional swing trades. See per-segment win rates, average holding periods, and sector breakdowns.",
    stats: [
      { label: "Segments", value: "2" },
      { label: "Metrics", value: "15+" },
      { label: "Holding", value: "1d–90d" },
    ],
    features: ["Intraday vs Positional split", "Sector-wise P&L heatmap", "Day-of-week analysis", "Brokerage & charges tracking"],
  },
  {
    id: "fno",
    label: "F&O",
    icon: Activity,
    title: "Futures & Options",
    description: "Purpose-built for derivatives traders. Log option chains, strategy legs, Greeks tracking, and lot-size-aware position sizing with expiry-based analytics.",
    stats: [
      { label: "Strategy Types", value: "10+" },
      { label: "Greeks", value: "4" },
      { label: "Expiries", value: "Auto" },
    ],
    features: ["Multi-leg strategy logging", "Option chain selector", "Lot-size aware P&L", "Expiry-based performance"],
  },
  {
    id: "commodities",
    label: "Commodities",
    icon: PieChart,
    title: "MCX Commodities",
    description: "Track Gold, Silver, Crude, Natural Gas, and other MCX instruments with commodity-specific lot sizes, margin requirements, and session-based analysis.",
    stats: [
      { label: "Instruments", value: "20+" },
      { label: "Sessions", value: "2" },
      { label: "Margin", value: "Auto" },
    ],
    features: ["MCX instrument support", "Session-wise analytics", "Commodity-specific lot sizes", "Margin utilization tracking"],
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

/* ─── Animated ticker line for dashboard mockup ──────────── */
function TickerBar() {
  const tickers = [
    { symbol: "NIFTY 50", price: "24,285", change: "+0.82%", up: true },
    { symbol: "BANKNIFTY", price: "51,440", change: "-0.34%", up: false },
    { symbol: "RELIANCE", price: "2,945", change: "+1.24%", up: true },
    { symbol: "GOLD", price: "71,850", change: "+0.45%", up: true },
    { symbol: "CRUDE", price: "6,420", change: "-1.12%", up: false },
  ];

  return (
    <div className="flex items-center gap-5 px-4 py-2 border-b border-border/30 bg-muted/20 overflow-hidden text-[10px]">
      {tickers.map((t) => (
        <div key={t.symbol} className="flex items-center gap-1.5 shrink-0">
          <span className="text-muted-foreground font-medium">{t.symbol}</span>
          <span className="font-mono font-semibold text-foreground/80">{t.price}</span>
          <span className={cn("font-mono font-semibold", t.up ? "text-profit" : "text-loss")}>
            {t.change}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeSegment, setActiveSegment] = useState("equity");

  const s3 = useCountUp(5, 1200);
  const s4 = useCountUp(50, 1500);

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const activeTab = segmentTabs.find((t) => t.id === activeSegment)!;

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
            <a href="#segments" className="hover:text-foreground transition-colors duration-200">Segments</a>
            <a href="#pricing" className="hover:text-foreground transition-colors duration-200">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors duration-200">FAQ</a>
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
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-12 lg:pt-32 lg:pb-20 text-center">
          {/* Badge */}
          <FadeIn className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--tb-accent)/0.3)] bg-[hsl(var(--tb-accent)/0.08)] text-sm">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--tb-accent))] animate-pulse" />
              <span className="text-[hsl(var(--tb-accent))] font-semibold uppercase tracking-wider text-xs">
                Built for Indian Markets · NSE · BSE · MCX
              </span>
            </div>
          </FadeIn>

          {/* Heading */}
          <FadeIn delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
              Know Your Edge.
              <br />
              <span
                className="text-[hsl(var(--tb-accent))] italic"
                style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}
              >
                Compound
              </span>{" "}
              It Daily.
            </h1>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={200}>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              The trading journal that shows you <strong className="text-foreground">why</strong> you win and{" "}
              <strong className="text-foreground">why</strong> you lose — with segment analytics for Equity, F&O, and Commodities.
              Stop guessing. Start compounding.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={300} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              size="lg"
              className="h-13 px-10 text-base gap-2.5 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-none font-semibold"
              onClick={() => navigate("/login")}
            >
              Start Free — No Card Needed
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-13 px-8 text-base gap-2 rounded-full"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              See How It Works
            </Button>
          </FadeIn>

          {/* Micro trust line */}
          <FadeIn delay={350}>
            <p className="text-xs text-muted-foreground mb-12">
              14-day Pro trial · No credit card · 2-minute setup
            </p>
          </FadeIn>

          {/* ── Social Proof Trust Strip ───────────────────── */}
          <FadeIn delay={400}>
            <div className="flex items-center justify-center gap-6 sm:gap-10 mb-14 flex-wrap">
              {["NSE", "BSE", "MCX"].map((exchange) => (
                <div key={exchange} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-card/60">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide text-muted-foreground">{exchange}</span>
                </div>
              ))}
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Minus className="w-4 h-4" />
                <span>All Indian exchanges supported</span>
              </div>
            </div>
          </FadeIn>

          {/* ── Dashboard Preview ─────────────────────────── */}
          <FadeIn delay={500}>
            <div className="relative mx-auto max-w-5xl">
              {/* Glow effect */}
              <div className="absolute -inset-6 bg-[hsl(var(--tb-accent)/0.06)] rounded-3xl blur-3xl" />
              <div className="relative rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/5">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-loss/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-profit/50" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-muted/50 text-[10px] text-muted-foreground font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-profit/60" />
                      mytradebook.lovable.app/dashboard
                    </div>
                  </div>
                </div>

                {/* Ticker bar */}
                <TickerBar />

                {/* Dashboard content */}
                <div className="flex">
                  {/* Mini sidebar */}
                  <div className="hidden sm:flex flex-col w-14 border-r border-border/30 bg-muted/10 py-3 gap-3 items-center">
                    {[BarChart3, BookOpen, Bell, Target, Eye, Layers].map((Icon, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          i === 0
                            ? "bg-[hsl(var(--tb-accent)/0.12)] text-[hsl(var(--tb-accent))]"
                            : "text-muted-foreground/50 hover:text-muted-foreground"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-4 sm:p-5">
                    {/* Welcome */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Good Morning,</p>
                        <p className="text-sm font-semibold">Dashboard</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-md bg-profit/10 text-profit text-[10px] font-semibold flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" />
                          4 day streak
                        </div>
                      </div>
                    </div>

                    {/* KPI row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                      {[
                        { label: "MTD P&L", value: "+₹24,850", change: "+12.4%", up: true },
                        { label: "Win Rate", value: "67.5%", change: "+3.2%", up: true },
                        { label: "Open Positions", value: "3", change: "", up: true },
                        { label: "Active Alerts", value: "8", change: "2 triggered", up: true },
                      ].map((kpi) => (
                        <div key={kpi.label} className="rounded-xl border border-border/40 bg-card p-3">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
                          <p className={cn("text-base font-bold font-mono", kpi.label.includes("P&L") || kpi.label.includes("Win") ? "text-profit" : "text-foreground")}>{kpi.value}</p>
                          {kpi.change && (
                            <p className={cn("text-[9px] font-mono mt-0.5", kpi.up ? "text-profit/70" : "text-loss/70")}>{kpi.change}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Equity curve + Recent trades */}
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
                          <path
                            d="M0,65 C20,62 40,58 60,50 C80,42 100,48 130,40 C160,32 180,36 210,28 C240,20 260,24 290,18 C320,12 350,16 370,10 C385,6 395,8 400,5"
                            fill="none"
                            stroke="hsl(var(--profit))"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M0,65 C20,62 40,58 60,50 C80,42 100,48 130,40 C160,32 180,36 210,28 C240,20 260,24 290,18 C320,12 350,16 370,10 C385,6 395,8 400,5 L400,80 L0,80 Z"
                            fill="url(#curveGrad)"
                          />
                        </svg>
                      </div>

                      <div className="sm:col-span-2 rounded-xl border border-border/40 bg-card p-3">
                        <p className="text-[10px] text-muted-foreground font-medium mb-2">Recent Trades</p>
                        <div className="space-y-2">
                          {[
                            { sym: "RELIANCE", type: "BUY", pnl: "+₹2,450", up: true },
                            { sym: "NIFTY 24200 CE", type: "BUY", pnl: "+₹8,200", up: true },
                            { sym: "TATAMOTORS", type: "SELL", pnl: "-₹1,100", up: false },
                          ].map((t) => (
                            <div key={t.sym} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-1 h-4 rounded-full", t.up ? "bg-profit" : "bg-loss")} />
                                <div>
                                  <p className="text-[10px] font-semibold leading-tight">{t.sym}</p>
                                  <p className="text-[8px] text-muted-foreground">{t.type}</p>
                                </div>
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
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Stats Row ────────────────────────────────────── */}
      <section className="py-12 border-y border-border/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
            <div className="text-center" ref={s3.ref}>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight">{s3.count}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Market Segments</div>
            </div>
            <div className="text-center" ref={s4.ref}>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight">{s4.count}+</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Analytics Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight">14</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Day Free Trial</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-1 justify-center">
                <Clock className="w-6 h-6 text-[hsl(var(--tb-accent))]" />
                24/7
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Cloud Access</div>
            </div>
          </div>
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

      {/* ── Segment Showcase ─────────────────────────────── */}
      <section id="segments" className="py-20 lg:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.2]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Built for{" "}
              <span
                className="text-[hsl(var(--tb-accent))] italic"
                style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}
              >
                Every Segment
              </span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Whether you trade equity, derivatives, or commodities — TradeBook understands your market.
            </p>
          </FadeIn>

          {/* Tabs */}
          <FadeIn delay={100}>
            <div className="flex items-center justify-center gap-2 mb-10">
              {segmentTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSegment(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                    activeSegment === tab.id
                      ? "bg-[hsl(var(--tb-accent))] text-white shadow-none"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-[hsl(var(--tb-accent)/0.3)]"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Tab content */}
          <FadeIn delay={150}>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="grid md:grid-cols-2">
                {/* Left: Info */}
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-3">{activeTab.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{activeTab.description}</p>

                  {/* Mini stats */}
                  <div className="flex items-center gap-6 mb-6">
                    {activeTab.stats.map((s) => (
                      <div key={s.label}>
                        <p className="text-xl font-bold font-mono text-[hsl(var(--tb-accent))]">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-2.5">
                    {activeTab.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[hsl(var(--tb-accent))] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Visual */}
                <div className="bg-muted/30 border-l border-border/50 p-8 flex items-center justify-center">
                  <div className="w-full max-w-xs space-y-3">
                    {/* Mock trade cards */}
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
                        <MockTradeCard sym="BANKNIFTY 51000 PE" type="BUY" entry="₹320" pnl="-₹4,500" up={false} />
                        <MockTradeCard sym="NIFTY FUT MAR" type="SELL" entry="₹24,100" pnl="+₹3,750" up />
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

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6">
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
      <section id="pricing" className="py-20 lg:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.2]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6">
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
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
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
      <section id="faq" className="py-20 lg:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.2]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6">
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
      <section className="py-20 lg:py-28">
        <FadeIn className="max-w-3xl mx-auto px-6 text-center">
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
            className="h-13 px-10 text-base gap-2.5 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-none font-semibold"
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
    <div className="rounded-xl border border-border/50 bg-card p-3.5 flex items-center justify-between transition-all hover:border-[hsl(var(--tb-accent)/0.3)]">
      <div className="flex items-center gap-3">
        <div className={cn("w-1.5 h-8 rounded-full", up ? "bg-profit" : "bg-loss")} />
        <div>
          <p className="text-xs font-semibold">{sym}</p>
          <p className="text-[10px] text-muted-foreground">{type} · {entry}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-xs font-mono font-bold", up ? "text-profit" : "text-loss")}>{pnl}</p>
        <div className="flex items-center justify-end">
          {up ? <ArrowUpRight className="w-3 h-3 text-profit" /> : <ArrowDownRight className="w-3 h-3 text-loss" />}
        </div>
      </div>
    </div>
  );
}
