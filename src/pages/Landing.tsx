import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  TrendingUp, ArrowRight, BarChart3, Bell, BookOpen, Shield,
  Zap, Target, LineChart, CheckCircle2, Star, Play, ArrowUpRight,
  Sparkles, Layers, Activity, PieChart, Eye, Globe, Database,
  Menu, X, ChevronDown, TrendingDown, Users, Award, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   Hooks
───────────────────────────────────────────────────────── */
function useCountUp(end: number, duration = 2200) {
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
          const s = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - s) / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(e * end));
            if (p < 1) requestAnimationFrame(tick);
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

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

/* ─────────────────────────────────────────────────────────
   FadeIn — reveal on scroll
───────────────────────────────────────────────────────── */
function FadeIn({
  children, className, delay = 0, direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden = {
    up: "opacity-0 translate-y-10",
    left: "opacity-0 -translate-x-10",
    right: "opacity-0 translate-x-10",
    none: "opacity-0",
  }[direction];

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100 translate-x-0 translate-y-0" : hidden,
        className
      )}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Platform", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Reviews", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "Smart Trade Journal",
    description: "Multi-segment logging with setup tags, notes, charts, and pattern learning. Every trade tells a story.",
    color: "from-violet-500/20 to-indigo-500/20",
    border: "hover:border-violet-500/40",
    span: "md:col-span-2",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Equity curves, drawdown analysis, and win-rate heatmaps that reveal your true edge.",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "hover:border-emerald-500/40",
    span: "",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Price triggers, scanner conditions, and Telegram push notifications in under a second.",
    color: "from-amber-500/20 to-orange-500/20",
    border: "hover:border-amber-500/40",
    span: "",
  },
  {
    icon: Target,
    title: "Trailing Stop Loss Engine",
    description: "Automated TSL with configurable activation level, step size, gap, and cooldown — per segment.",
    color: "from-rose-500/20 to-pink-500/20",
    border: "hover:border-rose-500/40",
    span: "",
  },
  {
    icon: LineChart,
    title: "Broker Integration",
    description: "Connect Dhan for live portfolio sync, real-time prices, and one-click order placement.",
    color: "from-sky-500/20 to-blue-500/20",
    border: "hover:border-sky-500/40",
    span: "md:col-span-2",
  },
];

const STEPS = [
  { step: "01", icon: BookOpen, title: "Log Your Trades", desc: "Add trades manually or auto-sync from Dhan. Tag setups, patterns, and mistakes.", color: "violet" },
  { step: "02", icon: Eye, title: "Uncover Your Edge", desc: "Segment analytics reveal what is actually working — by setup, time, volatility, and segment.", color: "emerald" },
  { step: "03", icon: Zap, title: "Automate & Scale", desc: "Set rules, alerts, and trailing stops. The system enforces your discipline 24/7.", color: "amber" },
];

const TESTIMONIALS = [
  {
    name: "Rahul M.", role: "Options Trader · 3+ yrs", avatar: "RM", rating: 5,
    quote: "The segment analytics showed me that my intraday setups were bleeding money while positional was consistently profitable. Completely changed how I allocate capital.",
    gradient: "from-violet-500/20 to-indigo-500/20",
  },
  {
    name: "Priya S.", role: "Swing Trader · 5+ yrs", avatar: "PS", rating: 5,
    quote: "Telegram alerts + trailing stop loss means I no longer sit glued to the screen. TradeBook watches my trades while I focus on finding the next setup.",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    name: "Amit K.", role: "Equity Investor · 7+ yrs", avatar: "AK", rating: 5,
    quote: "Finally a journal built for Indian markets. Dhan integration, NSE/BSE, segment filtering — I recommended it to our entire trading group.",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "₹0",
    period: "forever",
    tagline: "Start your quantified journey.",
    features: ["50 trades per month", "Essential analytics", "1 strategy watchlist", "Community support"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro Trader",
    price: "₹499",
    period: "/month",
    tagline: "Built for the serious retail professional.",
    features: ["Unlimited trade logging", "Full analytics suite + heatmaps", "Telegram notifications", "Trailing stop-loss engine", "Dhan broker sync", "10 watchlists", "Priority support"],
    cta: "Start 14-Day Trial",
    highlight: true,
  },
  {
    name: "Team",
    price: "₹1,499",
    period: "/month",
    tagline: "For trading desks and prop groups.",
    features: ["Everything in Pro", "5 team seats", "Shared studies & alerts", "RA compliance mode", "API access", "Dedicated account manager"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const STATS = [
  { end: 12500, suffix: "+", label: "Trades Logged" },
  { end: 98, suffix: "%", label: "Uptime SLA" },
  { end: 5, suffix: "", label: "Market Segments" },
  { end: 2500, suffix: "+", label: "Active Traders" },
];

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */
function NavBar({ onCTA }: { onCTA: () => void }) {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const scroll = useCallback((href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-black/70 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_40px_rgba(0,0,0,0.6)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(109,40,217,0.45)] group-hover:scale-105 transition-transform duration-200">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">TradeBook</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-white/60">
            {NAV_LINKS.map(link => (
              <button key={link.label} onClick={() => scroll(link.href)}
                className="hover:text-white transition-colors duration-200 focus:outline-none">
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onCTA} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Sign In
            </button>
            <Button onClick={onCTA}
              className="h-9 px-5 rounded-full bg-white text-black hover:bg-white/90 font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-105">
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div className={cn(
        "fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col justify-center items-center gap-8 transition-all duration-400",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {NAV_LINKS.map(link => (
          <button key={link.label} onClick={() => scroll(link.href)}
            className="text-3xl font-bold text-white/80 hover:text-white active:scale-95 transition-all">
            {link.label}
          </button>
        ))}
        <div className="flex flex-col gap-3 mt-4 w-60">
          <Button variant="outline" onClick={() => { setOpen(false); onCTA(); }}
            className="h-12 rounded-full border-white/20 text-white hover:bg-white/10 text-base">
            Sign In
          </Button>
          <Button onClick={() => { setOpen(false); onCTA(); }}
            className="h-12 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-semibold shadow-[0_0_30px_rgba(109,40,217,0.5)]">
            Get Started Free
          </Button>
        </div>
      </div>
    </>
  );
}

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-4xl mx-auto mt-12 lg:mt-16">
      {/* Ambient glow */}
      <div className="absolute -inset-8 bg-gradient-to-b from-violet-600/20 via-indigo-600/10 to-transparent rounded-[3rem] blur-3xl -z-10" />

      {/* Browser frame */}
      <div className="rounded-2xl border border-white/10 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] bg-black/60 backdrop-blur-xl transform transition-all duration-700 ease-out hover:shadow-[0_40px_120px_rgba(109,40,217,0.2)]">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/5 bg-white/[0.03]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 text-[11px] text-white/40 px-4 py-1 rounded-full font-mono">
              <Globe className="w-3 h-3" />
              app.tradebook.in/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Net P&L", value: "+₹34,250", up: true, icon: TrendingUp },
              { label: "Win Rate", value: "72.4%", up: true, icon: PieChart },
              { label: "Open Trades", value: "3", up: null, icon: Activity },
              { label: "Alerts", value: "8 Active", up: null, icon: Bell },
            ].map((kpi, i) => (
              <div key={i} className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 rounded-xl p-3 flex flex-col gap-1.5 transition-colors group cursor-default">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">{kpi.label}</span>
                  <kpi.icon className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
                <span className={cn("text-lg font-bold font-mono", kpi.up === true ? "text-emerald-400" : kpi.up === false ? "text-rose-400" : "text-white/80")}>
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>

          {/* Chart row */}
          <div className="grid sm:grid-cols-3 gap-3">
            {/* Equity curve */}
            <div className="sm:col-span-2 bg-white/[0.03] border border-white/5 rounded-xl p-4 h-40 sm:h-52 relative overflow-hidden">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium block mb-3">Equity Curve</span>
              <svg viewBox="0 0 400 140" className="w-full h-full drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 120 C40 100 60 110 90 95 S130 70 160 60 S220 40 260 30 S330 20 400 8" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0 120 C40 100 60 110 90 95 S130 70 160 60 S220 40 260 30 S330 20 400 8 V145 H0Z" fill="url(#eg)" />
              </svg>
            </div>

            {/* Recent trades */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 h-40 sm:h-52 flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium block mb-3">Recent Trades</span>
              <div className="flex-1 flex flex-col justify-between">
                {[
                  { sym: "NIFTY 23200CE", pnl: "+₹8,450", win: true },
                  { sym: "RELIANCE", pnl: "+₹1,200", win: true },
                  { sym: "BANKNIFTY 47000PE", pnl: "-₹3,100", win: false },
                  { sym: "HDFCBANK", pnl: "+₹5,600", win: true },
                ].map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-default">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", t.win ? "bg-emerald-400" : "bg-rose-400")} />
                      <span className="text-[11px] text-white/70 font-medium truncate max-w-[90px]">{t.sym}</span>
                    </div>
                    <span className={cn("text-[11px] font-mono font-bold", t.win ? "text-emerald-400" : "text-rose-400")}>{t.pnl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCounter({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(end);
  return (
    <div ref={ref} className="text-center px-4 py-2">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-white/40 mt-1.5 font-medium">{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const goApp = useCallback(() => navigate("/login"), [navigate]);
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="dark min-h-screen bg-[#050508] text-white selection:bg-violet-500/30 selection:text-white overflow-x-hidden antialiased">

      {/* ── Global ambient glows ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-[20%] -left-[15%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-violet-700/15 blur-[120px]" />
        <div className="absolute top-[40%] -right-[20%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-700/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[30vh] bg-violet-900/10 blur-[100px]" />
      </div>

      <NavBar onCTA={goApp} />

      <main className="relative z-10">

        {/* ════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════ */}
        <section className="pt-28 sm:pt-36 lg:pt-44 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">

          <FadeIn className="flex justify-center mb-7">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-white/60">Built for Indian Markets</span>
              <span className="w-px h-3 bg-white/15" />
              <span className="font-semibold text-white/90 tracking-wide">NSE · BSE · MCX</span>
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <h1 className="text-[2.6rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[5.2rem] font-bold tracking-tighter max-w-5xl mx-auto mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/50">
                The trading journal built for
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
                serious Indian traders.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={160}>
            <p className="text-base sm:text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Stop guessing. Start compounding. TradeBook combines intelligent journaling, segment-level analytics, real-time alerts, and broker automation — in one sleek platform.
            </p>
          </FadeIn>

          <FadeIn delay={240} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-5">
            <Button
              onClick={goApp}
              size="lg"
              className="w-full sm:w-auto h-13 sm:h-14 px-7 sm:px-8 text-base sm:text-lg rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-[0_0_40px_rgba(109,40,217,0.45)] border border-violet-500/40 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_60px_rgba(109,40,217,0.55)] active:scale-95"
            >
              Start Free — No Card Required <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollTo("features")}
              className="w-full sm:w-auto h-13 sm:h-14 px-7 sm:px-8 text-base sm:text-lg rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:border-white/20 backdrop-blur-sm font-medium transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 mr-2 fill-current" /> See the Platform
            </Button>
          </FadeIn>

          <FadeIn delay={300}>
            <p className="text-xs sm:text-sm text-white/30 mb-2">
              Trusted by <span className="text-white/60 font-semibold">2,500+</span> Indian traders · Setup in under 2 minutes
            </p>
          </FadeIn>

          <FadeIn delay={380}>
            <DashboardMockup />
          </FadeIn>
        </section>

        {/* ════════════════════════════════════════════
            STATS BAR
        ════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 border-y border-white/5 bg-white/[0.015]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x sm:divide-white/5">
            {STATS.map((s) => (
              <StatCounter key={s.label} end={s.end} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            FEATURES BENTO GRID
        ════════════════════════════════════════════ */}
        <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-5 tracking-widest uppercase">
              <Sparkles className="w-3 h-3" /> Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Everything a serious trader needs.
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-base sm:text-lg">
              From journaling to automating your discipline — tools built by traders, for traders.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 80} className={cn("h-full", f.span)}>
                <div className={cn(
                  "group relative h-full rounded-2xl sm:rounded-3xl border border-white/5 bg-white/[0.025] p-6 sm:p-8 overflow-hidden transition-all duration-400 cursor-default",
                  "hover:border-white/15 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]",
                  f.border
                )}>
                  {/* Card glow */}
                  <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[inherit] bg-gradient-to-br pointer-events-none", f.color)} />

                  {/* Top accent line on hover */}
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                      <f.icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2.5 text-white/90">{f.title}</h3>
                    <p className="text-sm sm:text-base text-white/50 leading-relaxed">{f.description}</p>
                  </div>

                  <ArrowUpRight className="absolute bottom-5 right-5 w-4 h-4 text-white/10 group-hover:text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-5 tracking-widest uppercase">
                <Layers className="w-3 h-3" /> Methodology
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">Three steps to your edge.</h2>
              <p className="text-white/50 max-w-md mx-auto">From first trade logged to fully automated discipline — in minutes.</p>
            </FadeIn>

            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 relative">
              {/* Connector line — desktop only */}
              <div className="hidden sm:block absolute top-16 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-violet-500/30 via-indigo-500/30 to-amber-500/30" />

              {STEPS.map((item, i) => (
                <FadeIn key={item.step} delay={i * 120} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                  <div className="relative bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] rounded-2xl sm:rounded-3xl p-7 sm:p-8 text-center transition-all duration-300 group hover:-translate-y-1">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-5xl sm:text-6xl font-black text-white/[0.04] select-none group-hover:text-white/[0.07] transition-colors pointer-events-none">{item.step}</div>
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 transition-all duration-300 group-hover:scale-110",
                      i === 0 ? "bg-violet-500/15 text-violet-400" : i === 1 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                    )}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-white/90">{item.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            TESTIMONIALS
        ════════════════════════════════════════════ */}
        <section id="testimonials" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-5 tracking-widest uppercase">
              <Star className="w-3 h-3 fill-current" /> Trader Reviews
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">Loved by 2,500+ Indian traders.</h2>
            <p className="text-white/50 max-w-md mx-auto">Don't take our word for it — hear from those who've transformed their process.</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div className="group h-full bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1">
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-white/60 leading-relaxed flex-1 mb-6 italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-5 border-t border-white/5">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br flex-shrink-0", t.gradient)}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white/90">{t.name}</p>
                      <p className="text-xs text-white/40">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            PRICING
        ════════════════════════════════════════════ */}
        <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-5 tracking-widest uppercase">
                <Zap className="w-3 h-3" /> Pricing
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing.</h2>
              <p className="text-white/50 max-w-md mx-auto">Start free. Upgrade when your edge demands it. One profitable trade covers the Pro tier for months.</p>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:items-start">
              {PRICING.map((plan, i) => (
                <FadeIn key={plan.name} delay={i * 100}>
                  <div className={cn(
                    "relative rounded-2xl sm:rounded-3xl border p-7 sm:p-8 flex flex-col transition-all duration-300",
                    plan.highlight
                      ? "bg-gradient-to-b from-violet-600/20 to-indigo-600/10 border-violet-500/40 shadow-[0_0_60px_rgba(109,40,217,0.2)] lg:-translate-y-2"
                      : "bg-white/[0.03] border-white/5 hover:border-white/15 hover:bg-white/[0.05]"
                  )}>
                    {plan.highlight && (
                      <>
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
                        <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                          <span className="bg-violet-600 text-white text-[11px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-[0_0_20px_rgba(109,40,217,0.5)]">
                            Most Popular
                          </span>
                        </div>
                      </>
                    )}

                    <h3 className="text-xl font-bold mb-1.5 text-white/90">{plan.name}</h3>
                    <p className="text-sm text-white/40 mb-6">{plan.tagline}</p>

                    <div className="flex items-baseline gap-1.5 mb-7 pb-7 border-b border-white/5">
                      <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight">{plan.price}</span>
                      <span className="text-white/40 text-sm">{plan.period}</span>
                    </div>

                    <ul className="space-y-3.5 flex-1 mb-8">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={goApp}
                      className={cn(
                        "w-full h-12 rounded-full text-base font-semibold transition-all hover:scale-[1.02] active:scale-98",
                        plan.highlight
                          ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_30px_rgba(109,40,217,0.4)] border border-violet-500/30"
                          : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                      )}
                    >
                      {plan.cta} {plan.highlight && <ArrowRight className="w-4 h-4 ml-1.5" />}
                    </Button>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={200} className="text-center mt-10">
              <p className="text-sm text-white/30">All plans include a 14-day money-back guarantee. No questions asked.</p>
            </FadeIn>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            CTA BANNER
        ════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
          <FadeIn className="max-w-4xl mx-auto">
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-violet-600/20 via-indigo-600/15 to-transparent p-10 sm:p-14 md:p-20 text-center">
              {/* Decorative glows */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-600/30 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-semibold mb-6 tracking-widest uppercase">
                  <Award className="w-3 h-3" /> Ready to Get Started?
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
                  Start trading with <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">precision.</span>
                </h2>
                <p className="text-lg sm:text-xl text-white/50 mb-10 max-w-xl mx-auto font-light leading-relaxed">
                  Join 2,500+ Indian traders who've eliminated guesswork and discovered their true edge — for free.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button onClick={goApp} size="lg"
                    className="w-full sm:w-auto h-14 px-8 rounded-full bg-white text-black hover:bg-white/90 text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95">
                    Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
                <p className="text-xs text-white/30 mt-5">No credit card · 2-min setup · Cancel anytime</p>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-12 sm:py-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(109,40,217,0.4)]">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">TradeBook</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                The professional trading journal built for Indian markets. Track, analyze, and compound your edge.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2.5 text-sm text-white/40">
                {["Features", "Pricing", "How It Works", "Changelog"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white/70 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2.5 text-sm text-white/40">
                {["Documentation", "Community", "Status Page", "Contact"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white/70 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5 text-sm text-white/40">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white/70 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">© 2026 TradeBook Systems Pvt. Ltd. All rights reserved.</p>
            <p className="text-xs text-white/25">SEBI Registered Research Analyst | Made with ❤️ for Indian traders</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
