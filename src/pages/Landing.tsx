import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  TrendingUp, ArrowRight, BarChart3, Bell, BookOpen, Shield, Target,
  LineChart, CheckCircle2, Zap, Eye, ChevronDown, Star, Quote, Activity,
  PieChart, Layers, Clock, ArrowUpRight, ArrowDownRight, Minus, Play,
  Smartphone, Globe, Lock, Sparkles, Award, Users, Calendar, MousePointerClick,
  Send, CandlestickChart, Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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

/* ─── Motion Wrappers ───────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" as const } },
};

function MotionSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section Label Badge ───────────────────────────────── */
function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-5">
      {children}
    </div>
  );
}

/* ─── Data ──────────────────────────────────────────────── */
const features = [
  { icon: BookOpen, title: "Smart Journal", description: "Multi-segment trade logging with charts, tags, notes, and pattern recognition. Track every trade across Equity, F&O, and Commodities.", color: "hsl(24 90% 55%)", large: true },
  { icon: BarChart3, title: "Deep Analytics", description: "Equity curves, drawdown analysis, win-rate heatmaps, and segment breakdowns.", color: "hsl(152 60% 42%)", large: false },
  { icon: Bell, title: "Real-Time Alerts", description: "Price alerts, scanner triggers, and instant Telegram notifications.", color: "hsl(210 80% 55%)", large: false },
  { icon: Target, title: "Trailing Stop Loss", description: "Segment-based TSL with configurable activation, step, gap, and cooldown.", color: "hsl(340 75% 55%)", large: false },
  { icon: LineChart, title: "Broker Integration", description: "Connect Dhan for live prices, portfolio auto-sync, and one-click execution.", color: "hsl(45 90% 50%)", large: false },
  { icon: Shield, title: "Rules Engine", description: "Pre-trade checklists, mistake tagging, and discipline enforcement.", color: "hsl(270 60% 55%)", large: true },
];

const steps = [
  { step: "01", icon: BookOpen, title: "Log Your Trades", desc: "Add trades manually or auto-sync from Dhan. Tag setups, patterns, and mistakes." },
  { step: "02", icon: Eye, title: "Spot Patterns", desc: "Segment-level analytics reveal what's working — by setup, time, and condition." },
  { step: "03", icon: Zap, title: "Automate & Scale", desc: "Set rules, alerts, and trailing stops. Let the system enforce your discipline." },
];

const testimonials = [
  { name: "Rahul M.", role: "Options Trader, Mumbai", quote: "TradeBook helped me identify that my Monday morning trades were consistently losing. After adjusting my strategy, my win rate went from 42% to 61%.", stars: 5, avatar: "R", featured: true },
  { name: "Priya S.", role: "Swing Trader, Bangalore", quote: "The segment-level analytics are a game-changer. I can see exactly which setups work for intraday vs positional.", stars: 5, avatar: "P", featured: false },
  { name: "Aditya K.", role: "F&O Trader, Delhi", quote: "I tried 4 journals before TradeBook. None understood Indian markets — segments, lot sizes, MCX. Finally something built for how we actually trade.", stars: 5, avatar: "A", featured: false },
];


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

const pricingPlans = [
  {
    name: "Monthly", price: "₹0", originalPrice: "₹199", period: "/mo", description: "Full access, billed monthly",
    features: allFeatures, cta: "Start Free", highlighted: false, isBeta: true,
  },
  {
    name: "Quarterly", price: "₹0", originalPrice: "₹499", period: "/quarter", description: "All features, best for active traders",
    features: allFeatures, cta: "Start Free", highlighted: true, isBeta: true,
  },
  {
    name: "Yearly", price: "₹1,499", originalPrice: null, period: "/year", description: "All features, best value",
    features: allFeatures, cta: "Subscribe", highlighted: false, isBeta: false,
  },
];

const comparisonFeatures = [
  { feature: "Multi-segment support", tradebook: true, others: false },
  { feature: "Indian market focus (NSE/BSE/MCX)", tradebook: true, others: false },
  { feature: "Trailing stop loss engine", tradebook: true, others: false },
  { feature: "Telegram notifications", tradebook: true, others: "Paid" },
  { feature: "Broker integration", tradebook: true, others: "Limited" },
  { feature: "Equity curve & drawdown", tradebook: true, others: true },
  { feature: "Pattern & mistake tagging", tradebook: true, others: false },
  { feature: "Free beta access", tradebook: true, others: "Limited" },
];

/* ─── Floating UI Elements ──────────────────────────────── */
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating mini trade card - top left */}
      <motion.div
        className="absolute top-32 left-[6%] hidden lg:block"
        animate={{ y: [0, -10, 0], rotate: [-2, 0, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-md p-3.5 shadow-lg shadow-black/[0.04] w-44">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-5 rounded-full bg-profit" />
            <div>
              <p className="text-[10px] font-semibold">RELIANCE</p>
              <p className="text-[8px] text-muted-foreground">BUY · ₹2,945</p>
            </div>
          </div>
          <p className="text-[11px] font-mono font-bold text-profit">+₹2,450</p>
        </div>
      </motion.div>

      {/* Floating alert badge - top right */}
      <motion.div
        className="absolute top-40 right-[7%] hidden lg:block"
        animate={{ y: [0, -8, 0], rotate: [1, 3, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <div className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-md px-3.5 py-2.5 shadow-lg shadow-black/[0.04] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--tb-accent)/0.08)] flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold">Alert Triggered</p>
            <p className="text-[8px] text-muted-foreground">NIFTY crossed 24,300</p>
          </div>
        </div>
      </motion.div>

      {/* Floating P&L badge - left side mid */}
      <motion.div
        className="absolute top-[58%] left-[4%] hidden xl:block"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div className="rounded-2xl border border-profit/15 bg-card/80 backdrop-blur-md px-4 py-2.5 shadow-lg shadow-black/[0.04]">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">MTD P&L</p>
          <p className="text-sm font-bold font-mono text-profit">+₹24,850</p>
        </div>
      </motion.div>

      {/* Floating icon scatter */}
      {[
        { Icon: CandlestickChart, top: "20%", left: "14%", delay: 0.5, size: "w-9 h-9" },
        { Icon: Gauge, top: "72%", right: "9%", delay: 1.5, size: "w-8 h-8" },
        { Icon: Activity, top: "28%", right: "15%", delay: 2, size: "w-7 h-7" },
        { Icon: Target, top: "68%", left: "11%", delay: 0.8, size: "w-8 h-8" },
      ].map(({ Icon, delay, size, ...pos }, i) => (
        <motion.div
          key={i}
          className={cn("absolute hidden lg:flex items-center justify-center rounded-2xl border border-border/20 bg-card/50 backdrop-blur-sm shadow-sm", size)}
          style={pos as React.CSSProperties}
          animate={{ y: [0, -6, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <Icon className="w-3.5 h-3.5 text-muted-foreground/40" />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Ticker Bar ────────────────────────────────────────── */
function TickerBar() {
  const tickers = [
    { symbol: "NIFTY 50", price: "24,285", change: "+0.82%", up: true },
    { symbol: "BANKNIFTY", price: "51,440", change: "-0.34%", up: false },
    { symbol: "RELIANCE", price: "2,945", change: "+1.24%", up: true },
    { symbol: "GOLD", price: "71,850", change: "+0.45%", up: true },
    { symbol: "CRUDE", price: "6,420", change: "-1.12%", up: false },
  ];
  return (
    <div className="flex items-center gap-5 px-4 py-2 border-b border-border/20 bg-muted/10 overflow-hidden text-[10px]">
      {tickers.map((t) => (
        <div key={t.symbol} className="flex items-center gap-1.5 shrink-0">
          <span className="text-muted-foreground font-medium">{t.symbol}</span>
          <span className="font-mono font-semibold text-foreground/80">{t.price}</span>
          <span className={cn("font-mono font-semibold", t.up ? "text-profit" : "text-loss")}>{t.change}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Mini UI Mockups for Bento Cards ───────────────────── */
function JournalMiniPreview() {
  return (
    <div className="mt-6 rounded-xl border border-border/20 bg-muted/15 p-4 space-y-3">
      {/* Tags row */}
      <div className="flex items-center gap-2 flex-wrap">
        {["Breakout", "High Vol", "Swing"].map((tag) => (
          <span key={tag} className="px-2.5 py-1 rounded-full bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))] text-[10px] font-semibold">
            {tag}
          </span>
        ))}
      </div>
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Win Rate", value: "68%" },
          { label: "Avg Win", value: "₹12,450" },
          { label: "P. Factor", value: "2.14" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg bg-card/80 border border-border/20 p-2 text-center">
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            <p className="text-xs font-bold font-mono text-foreground">{m.value}</p>
          </div>
        ))}
      </div>
      {/* Avatar stack */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {["R", "P", "A"].map((a, i) => (
            <div key={a} className="w-6 h-6 rounded-full border-2 border-card bg-[hsl(var(--tb-accent)/0.12)] flex items-center justify-center text-[8px] font-bold text-[hsl(var(--tb-accent))]">
              {a}
            </div>
          ))}
        </div>
        <span className="text-[9px] text-muted-foreground">3 traders using this setup</span>
      </div>
    </div>
  );
}

function AlertMiniPreview() {
  return (
    <div className="mt-5 space-y-2">
      {[
        { symbol: "NIFTY", condition: "Price > 24,300", status: "Active", active: true },
        { symbol: "RELIANCE", condition: "% Change > 3%", status: "Triggered", active: false },
      ].map((alert) => (
        <div key={alert.symbol} className="flex items-center gap-2.5 rounded-lg border border-border/20 bg-muted/15 px-3 py-2">
          <div className={cn("w-1.5 h-1.5 rounded-full", alert.active ? "bg-profit animate-pulse" : "bg-[hsl(var(--tb-accent))]")} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold">{alert.symbol}</p>
            <p className="text-[8px] text-muted-foreground">{alert.condition}</p>
          </div>
          <span className={cn("text-[8px] font-semibold px-2 py-0.5 rounded-full", alert.active ? "bg-profit/10 text-profit" : "bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]")}>
            {alert.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function RulesEngineMiniPreview() {
  return (
    <div className="mt-6 space-y-2.5">
      {[
        { rule: "Check market trend before entry", checked: true },
        { rule: "Set stop loss within 2%", checked: true },
        { rule: "Max 3 trades per day", checked: false },
      ].map((r) => (
        <div key={r.rule} className="flex items-center gap-2.5 rounded-lg border border-border/20 bg-muted/15 px-3 py-2.5">
          <div className={cn("w-4 h-4 rounded-md border flex items-center justify-center text-[10px]", r.checked ? "bg-profit/15 border-profit/30 text-profit" : "border-border/40")}>
            {r.checked && <CheckCircle2 className="w-3 h-3" />}
          </div>
          <span className="text-[11px] text-muted-foreground">{r.rule}</span>
        </div>
      ))}
      {/* Mini progress bar */}
      <div className="rounded-lg bg-muted/15 border border-border/20 px-3 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Discipline Score</span>
          <span className="text-[10px] font-bold text-profit">87%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted/40">
          <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-profit to-profit/60" />
        </div>
      </div>
    </div>
  );
}

function AnalyticsMiniPreview() {
  return (
    <div className="mt-5 rounded-lg border border-border/20 bg-muted/15 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-muted-foreground uppercase">This Week</span>
        <span className="text-[10px] font-bold text-profit font-mono">+12.4%</span>
      </div>
      <svg viewBox="0 0 120 30" className="w-full h-7">
        <path d="M0,25 C10,22 20,18 30,15 C40,12 50,20 60,14 C70,8 80,12 90,6 C100,2 110,5 120,3" fill="none" stroke="hsl(var(--profit))" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [heroEmail, setHeroEmail] = useState("");
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const s3 = useCountUp(5, 1200);
  const s4 = useCountUp(50, 1500);
  const s5 = useCountUp(1200, 2000);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      <SEOHead
        title="Trading Journal for Indian Markets — NSE, MCX, F&O"
        description="Track, analyze, and improve your trades with TradeBook. Real-time alerts, broker integration, and segment-based analytics built for Equity, F&O, and Commodity traders in India."
        path="/"
      />
      {/* ── Navbar ───────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-16">
          <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.02 }}>
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--tb-accent))] flex items-center justify-center shadow-[0_0_20px_hsl(var(--tb-accent)/0.25)]">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-logo font-bold tracking-tight">TradeBook</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            {["Features", "Pricing", "Docs"].map((item) => (
              <motion.a
                key={item}
                href={item === "Docs" ? "/docs" : `#${item.toLowerCase()}`}
                className="px-4 py-2 rounded-full hover:bg-muted/50 hover:text-foreground transition-all duration-200"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="sm"
                onClick={() => navigate("/login")}
                className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-5 shadow-[0_4px_12px_hsl(var(--tb-accent)/0.25)]"
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero — Manila inspired soft gradient wash ──────── */}
      <section ref={heroRef} className="relative overflow-hidden">
        <FloatingElements />

        {/* Multi-color pastel gradient wash */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(340_80%_85%/0.25)_0%,transparent_70%)]" />
          <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,hsl(24_90%_80%/0.2)_0%,transparent_70%)]" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,hsl(280_60%_88%/0.15)_0%,transparent_70%)]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-5xl mx-auto px-6 pt-28 pb-10 lg:pt-40 lg:pb-20 text-center">
          {/* Badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex justify-center mb-10">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-card/50 backdrop-blur-sm text-sm"
              whileHover={{ scale: 1.03 }}
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-profit"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-muted-foreground font-medium text-xs tracking-wide">
                Built for Indian Markets
              </span>
            </motion.div>
          </motion.div>

          {/* Heading — oversized with italic cursive accent */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.03] tracking-tight mb-8"
          >
            Know Your{" "}
            <span
              className="text-[hsl(var(--tb-accent))] italic"
              style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}
            >
              Edge
            </span>
            .
            <br />
            Compound It Daily.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0.2}
            className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            The trading journal that shows you <strong className="text-foreground font-semibold">why</strong> you win and{" "}
            <strong className="text-foreground font-semibold">why</strong> you lose — with segment analytics for Equity, F&O, and Commodities.
          </motion.p>

          {/* Email CTA — pill shape */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.3} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto mb-7">
            <Input
              type="email"
              placeholder="Enter your email"
              value={heroEmail}
              onChange={(e) => setHeroEmail(e.target.value)}
              className="h-14 rounded-full px-6 text-base border-border/40 bg-card/80 backdrop-blur-sm shadow-sm flex-1 focus-visible:ring-[hsl(var(--tb-accent)/0.3)]"
            />
            <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="h-14 px-8 text-base gap-2 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-[0_6px_24px_hsl(var(--tb-accent)/0.3)] font-semibold whitespace-nowrap"
                onClick={() => navigate(`/login${heroEmail ? `?email=${encodeURIComponent(heroEmail)}` : ""}`)}
              >
                Get Access
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Micro trust */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.4} className="flex items-center justify-center gap-6 text-xs text-muted-foreground mb-20">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-profit" /> Free during beta</span>
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Bank-grade security</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" /> No credit card</span>
          </motion.div>
        </motion.div>

        {/* ── Dashboard Preview with watermark ────────────── */}
        <div className="relative max-w-6xl mx-auto px-6 pb-24">
          {/* Faded watermark text behind preview (Manila style) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[8rem] lg:text-[12rem] font-black text-muted-foreground/[0.03] uppercase tracking-widest">
              Dashboard
            </span>
          </div>

          <motion.div
            variants={scaleIn} initial="hidden" animate="visible"
            className="relative"
          >
            {/* Soft radial glow */}
            <div className="absolute -inset-16 bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.06)_0%,transparent_70%)] pointer-events-none" />

            {/* Decorative shadow layers for depth */}
            <div className="absolute inset-x-8 -bottom-4 h-8 rounded-3xl bg-foreground/[0.03] blur-xl" />
            <div className="absolute inset-x-4 -bottom-2 h-6 rounded-3xl bg-foreground/[0.04] blur-md" />

            <motion.div
              className="relative rounded-2xl border border-border/40 bg-card overflow-hidden"
              style={{
                boxShadow: "0 25px 60px -15px rgba(0,0,0,0.08), 0 0 0 1px hsl(var(--border)/0.3)",
                transform: "perspective(1200px) rotateX(2deg)",
              }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4 }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-muted/15">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-loss/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-profit/30" />
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-muted/30 text-[10px] text-muted-foreground font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-profit/50" />
                    mytradebook.lovable.app/dashboard
                  </div>
                </div>
              </div>

              <TickerBar />

              {/* Dashboard content */}
              <div className="flex">
                {/* Mini sidebar */}
                <div className="hidden sm:flex flex-col w-14 border-r border-border/15 bg-muted/5 py-3 gap-3 items-center">
                  {[BarChart3, BookOpen, Bell, Target, Eye, Layers, Calendar].map((Icon, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        i === 0 ? "bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]" : "text-muted-foreground/30"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Good Morning,</p>
                      <p className="text-sm font-semibold">Dashboard</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-md bg-profit/8 text-profit text-[10px] font-semibold flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> 4 day streak
                      </div>
                      <div className="px-2 py-1 rounded-md bg-muted/50 text-muted-foreground text-[10px] flex items-center gap-1">
                        <Activity className="w-3 h-3 text-profit animate-pulse" /> Live
                      </div>
                    </div>
                  </div>

                  {/* Today's P&L Hero */}
                  <div className="mb-4 rounded-xl border border-profit/15 bg-gradient-to-r from-profit/5 to-transparent p-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Today's P&L</p>
                        <p className="text-xl font-bold font-mono text-profit">+₹8,450</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-muted-foreground">Win Rate</p>
                        <p className="text-sm font-bold font-mono text-profit">75%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-muted-foreground">Trades</p>
                        <p className="text-sm font-bold font-mono">4/4</p>
                      </div>
                    </div>
                  </div>

                  {/* KPI row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                    {[
                      { label: "MTD P&L", value: "+₹24,850", change: "+12.4%", colored: true },
                      { label: "Win Rate", value: "67.5%", change: "+3.2%", colored: true },
                      { label: "Open Positions", value: "3", change: "₹2.4L invested", colored: false },
                      { label: "Active Alerts", value: "8", change: "2 triggered", colored: false },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded-xl border border-border/20 bg-card p-3">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
                        <p className={cn("text-base font-bold font-mono", kpi.colored ? "text-profit" : "text-foreground")}>{kpi.value}</p>
                        <p className="text-[9px] font-mono mt-0.5 text-muted-foreground">{kpi.change}</p>
                      </div>
                    ))}
                  </div>

                  {/* Equity curve + Recent trades */}
                  <div className="grid sm:grid-cols-5 gap-3">
                    <div className="sm:col-span-3 rounded-xl border border-border/20 bg-card p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] text-muted-foreground font-medium">Equity Curve</p>
                        <p className="text-[10px] text-profit font-mono font-semibold">+₹1,24,850</p>
                      </div>
                      <svg viewBox="0 0 400 80" className="w-full h-14">
                        <defs>
                          <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,65 C20,62 40,58 60,50 C80,42 100,48 130,40 C160,32 180,36 210,28 C240,20 260,24 290,18 C320,12 350,16 370,10 C385,6 395,8 400,5" fill="none" stroke="hsl(var(--profit))" strokeWidth="2" strokeLinecap="round" />
                        <path d="M0,65 C20,62 40,58 60,50 C80,42 100,48 130,40 C160,32 180,36 210,28 C240,20 260,24 290,18 C320,12 350,16 370,10 C385,6 395,8 400,5 L400,80 L0,80 Z" fill="url(#curveGrad)" />
                      </svg>
                    </div>
                    <div className="sm:col-span-2 rounded-xl border border-border/20 bg-card p-3">
                      <p className="text-[10px] text-muted-foreground font-medium mb-2">Recent Trades</p>
                      <div className="space-y-2">
                        {[
                          { sym: "RELIANCE", type: "BUY", pnl: "+₹2,450", up: true },
                          { sym: "NIFTY 24200 CE", type: "BUY", pnl: "+₹8,200", up: true },
                          { sym: "TATAMOTORS", type: "SELL", pnl: "-₹1,100", up: false },
                        ].map((t) => (
                          <div key={t.sym} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Strip ──────────────────────────────────── */}
      <section className="py-12 border-y border-border/20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-[0.18em] font-semibold mb-8">
            Trusted by 1,200+ traders across Indian markets
          </p>
          <div className="flex items-center justify-center gap-12 sm:gap-20 flex-wrap">
            {[
              { name: "NSE", icon: Activity },
              { name: "BSE", icon: BarChart3 },
              { name: "MCX", icon: PieChart },
              { name: "Dhan", icon: Zap },
              { name: "Telegram", icon: Send },
            ].map((l) => (
              <motion.div
                key={l.name}
                className="flex items-center gap-2.5 text-muted-foreground/70 hover:text-muted-foreground transition-colors duration-300"
                whileHover={{ scale: 1.06 }}
              >
                <l.icon className="w-4.5 h-4.5" />
                <span className="text-sm font-semibold tracking-wide">{l.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ────────────────────────────────── */}
      <MotionSection className="py-24 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp}>
            <SectionBadge>By the Numbers</SectionBadge>
          </motion.div>
          <div className="flex items-center justify-center gap-14 sm:gap-24 flex-wrap mt-6">
            {[
              { ref: s3.ref, value: s3.count, suffix: "", label: "Market Segments" },
              { ref: s4.ref, value: s4.count, suffix: "+", label: "Analytics Metrics" },
              { ref: s5.ref, value: s5.count, suffix: "+", label: "Trades Tracked" },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i * 0.1} className="text-center">
                <div className="text-5xl sm:text-7xl font-extrabold tracking-tight" ref={stat.ref}>
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-[0.14em] mt-2.5 font-medium">{stat.label}</div>
              </motion.div>
            ))}
            <motion.div variants={fadeUp} custom={0.3} className="text-center">
              <div className="text-5xl sm:text-7xl font-extrabold tracking-tight">24/7</div>
              <div className="text-xs text-muted-foreground uppercase tracking-[0.14em] mt-2.5 font-medium">Cloud Access</div>
            </motion.div>
          </div>
        </div>
      </MotionSection>

      {/* ── Features Bento Grid — Manila style ────────────── */}
      <section id="features" className="py-24 lg:py-32">
        <MotionSection className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <SectionBadge>Features</SectionBadge>
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Get your{" "}
              <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
                money's
              </span>{" "}
              worth
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              From journaling to automation — tools designed by traders, for traders.
            </p>
          </motion.div>

          {/* Bento Grid with mini UI mockups */}
          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-6 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i * 0.05}
                className={cn(f.large ? "md:col-span-4" : "md:col-span-2")}
              >
                <motion.div
                  className="group rounded-2xl border border-border/40 bg-card/80 p-7 h-full relative overflow-hidden"
                  whileHover={{ y: -3, borderColor: "hsl(var(--tb-accent) / 0.25)" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--tb-accent)/0.01)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <motion.div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                      style={{ backgroundColor: `${f.color.replace(")", " / 0.08)")}` }}
                      whileHover={{ scale: 1.08, rotate: 3 }}
                    >
                      <f.icon className="w-5 h-5" style={{ color: f.color }} />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{f.description}</p>

                    {/* Mini UI previews inside cards */}
                    {f.large && f.title === "Smart Journal" && <JournalMiniPreview />}
                    {f.large && f.title === "Rules Engine" && <RulesEngineMiniPreview />}
                    {!f.large && f.title === "Real-Time Alerts" && <AlertMiniPreview />}
                    {!f.large && f.title === "Deep Analytics" && <AnalyticsMiniPreview />}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </MotionSection>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-muted/10">
        <MotionSection className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <SectionBadge>How It Works</SectionBadge>
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-5 leading-tight">
              Three steps to{" "}
              <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
                mastery
              </span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-base">From first trade to edge mastery — in minutes.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-16 left-[33%] w-[34%] border-t-2 border-dashed border-border/30" />
            <div className="hidden md:block absolute top-16 left-[66%] w-[20%] border-t-2 border-dashed border-border/30" />

            {steps.map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} custom={i * 0.1}>
                <motion.div
                  className="relative rounded-2xl border border-border/40 bg-card/80 p-8 h-full text-center overflow-hidden"
                  whileHover={{ y: -3, borderColor: "hsl(var(--tb-accent) / 0.25)" }}
                >
                  {/* Number watermark */}
                  <div className="absolute top-2 right-4 text-7xl font-black text-muted-foreground/[0.03] select-none">{item.step}</div>
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-[hsl(var(--tb-accent)/0.06)] flex items-center justify-center mx-auto mb-6"
                    whileHover={{ scale: 1.08, rotate: -3 }}
                  >
                    <item.icon className="w-6 h-6 text-[hsl(var(--tb-accent))]" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </MotionSection>
      </section>

      {/* ── Comparison Table ─────────────────────────────── */}
      <section className="py-24 lg:py-32">
        <MotionSection className="max-w-3xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <SectionBadge>Comparison</SectionBadge>
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-5 leading-tight">
              Why{" "}
              <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
                TradeBook
              </span>
              ?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-base">See how we compare to generic trading journals.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl border border-border/40 bg-card/80 overflow-hidden">
            <div className="grid grid-cols-3 gap-0 border-b border-border/30 px-6 py-4 bg-muted/20">
              <span className="text-base font-medium">Feature</span>
              <span className="text-sm font-bold text-center text-[hsl(var(--tb-accent))]">TradeBook</span>
              <span className="text-sm font-medium text-center text-muted-foreground/70">Others</span>
            </div>
            {comparisonFeatures.map((row, i) => (
              <motion.div
                key={row.feature}
                variants={fadeUp}
                custom={i * 0.03}
                className={cn(
                  "grid grid-cols-3 gap-0 border-b border-border/20 last:border-0 px-6 py-4 transition-colors",
                  i % 2 === 0 ? "bg-muted/[0.04]" : ""
                )}
              >
                <span className="text-base">{row.feature}</span>
                <div className="flex justify-center">
                  {row.tradebook === true ? (
                    <CheckCircle2 className="w-5 h-5 text-profit" />
                  ) : (
                    <span className="text-sm text-muted-foreground">{String(row.tradebook)}</span>
                  )}
                </div>
                <div className="flex justify-center">
                  {row.others === true ? (
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/30" />
                  ) : row.others === false ? (
                    <Minus className="w-5 h-5 text-muted-foreground/20" />
                  ) : (
                    <span className="text-xs text-muted-foreground/60 px-2 py-0.5 rounded-full bg-muted/40">{String(row.others)}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </MotionSection>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-24 lg:py-32 bg-muted/10">
        <MotionSection className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <SectionBadge>Pricing</SectionBadge>
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-5 leading-tight">
              Simple,{" "}
              <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
                transparent
              </span>{" "}
              pricing
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-base">One plan. All features. Pick your billing cycle.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-7 items-start">
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.name} variants={fadeUp} custom={i * 0.1}>
                <motion.div
                  className={cn(
                    "rounded-2xl border bg-card/80 p-8 flex flex-col relative overflow-hidden",
                    plan.highlighted
                      ? "border-[hsl(var(--tb-accent)/0.35)] ring-1 ring-[hsl(var(--tb-accent)/0.1)] scale-[1.02] lg:scale-105"
                      : "border-border/40"
                  )}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.3 }}
                >
                  {plan.highlighted && <div className="absolute top-0 left-0 right-0 h-0.5 bg-[hsl(var(--tb-accent))]" />}
                  {plan.highlighted && (
                    <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))] text-xs font-semibold mb-5">
                      <Zap className="w-3 h-3" /> Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.isBeta && (
                    <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-profit/10 text-profit text-[11px] font-semibold mt-2">
                      Free During Beta
                    </div>
                  )}
                  <div className="mt-4 mb-1 flex items-baseline gap-1">
                    {plan.originalPrice && (
                      <span className="text-lg text-muted-foreground/50 line-through mr-1">{plan.originalPrice}</span>
                    )}
                    <span className="text-4xl font-extrabold font-mono">{plan.price}</span>
                    <span className="text-muted-foreground/70 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-7">{plan.description}</p>
                  <ul className="space-y-3.5 flex-1 mb-9">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[hsl(var(--tb-accent))] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      className={cn(
                        "w-full h-12 rounded-full text-base",
                        plan.highlighted ? "bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white shadow-[0_4px_12px_hsl(var(--tb-accent)/0.25)]" : ""
                      )}
                      variant={plan.highlighted ? "default" : "outline"}
                      onClick={() => navigate("/login")}
                    >
                      {plan.cta}
                      {plan.highlighted && <ArrowRight className="w-4 h-4 ml-1" />}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </MotionSection>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-24 lg:py-32">
        <MotionSection className="max-w-6xl mx-auto px-6 lg:px-10">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <SectionBadge>Testimonials</SectionBadge>
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-5 leading-tight">
              Trusted by{" "}
              <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
                real traders
              </span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-base">Here's what traders across India are saying.</p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-7">
            {/* Featured large testimonial — dark accent card */}
            <motion.div variants={fadeUp} className="md:col-span-3">
              <motion.div
                className="rounded-2xl border border-foreground/10 bg-foreground text-background p-9 h-full flex flex-col"
                whileHover={{ y: -3 }}
              >
                <Quote className="w-10 h-10 text-background/15 mb-7" />
                <p className="text-lg leading-relaxed flex-1 mb-7 font-medium">"{testimonials[0].quote}"</p>
                <div className="flex items-center gap-1.5 mb-5">
                  {[...Array(testimonials[0].stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))]" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--tb-accent)/0.2)] flex items-center justify-center text-sm font-bold text-[hsl(var(--tb-accent))]">
                    {testimonials[0].avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonials[0].name}</p>
                    <p className="text-sm text-background/50">{testimonials[0].role}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Two smaller testimonials */}
            <div className="md:col-span-2 flex flex-col gap-7">
              {testimonials.slice(1).map((t, i) => (
                <motion.div key={t.name} variants={fadeUp} custom={(i + 1) * 0.1}>
                  <motion.div
                    className="rounded-2xl border border-border/40 bg-card/80 p-7 h-full flex flex-col"
                    whileHover={{ y: -3, borderColor: "hsl(var(--tb-accent) / 0.25)" }}
                  >
                    <Quote className="w-7 h-7 text-[hsl(var(--tb-accent)/0.12)] mb-4" />
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">"{t.quote}"</p>
                    <div className="flex items-center gap-1.5 mb-3">
                      {[...Array(t.stars)].map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))]" />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[hsl(var(--tb-accent)/0.08)] flex items-center justify-center text-xs font-bold text-[hsl(var(--tb-accent))]">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground/60">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </MotionSection>
      </section>


      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-28 lg:py-36 relative overflow-hidden">
        {/* Soft gradient wash */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.06)_0%,transparent_65%)]" />
        </div>
        <MotionSection className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-extrabold mb-7 leading-tight">
            Stop losing money to
            <br />
            <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
              undisciplined
            </span>{" "}
            trading
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
            Join 1,200+ traders who journal, analyze, and compound their edge — every single day.
          </motion.p>
          <motion.div variants={fadeUp} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              className="h-14 px-12 text-base gap-2.5 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-[0_6px_24px_hsl(var(--tb-accent)/0.3)] font-semibold"
              onClick={() => navigate("/login")}
            >
              Get Started — It's Free <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
          <motion.p variants={fadeUp} className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-3">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Bank-grade encryption</span>
            <span>·</span>
            <span>No credit card required</span>
          </motion.p>
        </MotionSection>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border/20 bg-card/30 py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--tb-accent))] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="font-logo font-bold tracking-tight">TradeBook</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The trading journal built for Indian markets. Track, analyze, and improve.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="/docs" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Support</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="mailto:founder@mrchartist.com" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="/docs" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/15 pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground/80">© {new Date().getFullYear()} TradeBook. All rights reserved. Made with ❤️ in India.</p>
            <p className="text-xs text-muted-foreground/80">Not SEBI registered. For educational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
