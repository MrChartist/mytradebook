import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  TrendingUp, ArrowRight, BarChart3, Bell, BookOpen, Shield, Target,
  LineChart, CheckCircle2, Zap, Eye, ChevronDown, Star, Quote, Activity,
  PieChart, Layers, Clock, ArrowUpRight, ArrowDownRight, Minus, Play,
  Smartphone, Globe, Lock, Sparkles, Award, Users, Calendar, MousePointerClick,
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

/* ─── Motion Wrappers ───────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
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

/* ─── Data ──────────────────────────────────────────────── */
const features = [
  { icon: BookOpen, title: "Smart Journal", description: "Multi-segment trade logging with charts, tags, notes, and pattern recognition.", color: "hsl(24 90% 55%)" },
  { icon: BarChart3, title: "Deep Analytics", description: "Equity curves, drawdown analysis, win-rate heatmaps, and segment breakdowns.", color: "hsl(152 60% 42%)" },
  { icon: Bell, title: "Real-Time Alerts", description: "Price alerts, scanner triggers, and instant Telegram notifications.", color: "hsl(210 80% 55%)" },
  { icon: Target, title: "Trailing Stop Loss", description: "Segment-based TSL with configurable activation, step, gap, and cooldown.", color: "hsl(340 75% 55%)" },
  { icon: LineChart, title: "Broker Integration", description: "Connect Dhan for live prices, portfolio auto-sync, and one-click execution.", color: "hsl(45 90% 50%)" },
  { icon: Shield, title: "Rules Engine", description: "Pre-trade checklists, mistake tagging, and discipline enforcement.", color: "hsl(270 60% 55%)" },
];

const steps = [
  { step: "01", icon: BookOpen, title: "Log Your Trades", desc: "Add trades manually or auto-sync from Dhan. Tag setups, patterns, and mistakes." },
  { step: "02", icon: Eye, title: "Spot Patterns", desc: "Segment-level analytics reveal what's working — by setup, time, and condition." },
  { step: "03", icon: Zap, title: "Automate & Scale", desc: "Set rules, alerts, and trailing stops. Let the system enforce your discipline." },
];

const testimonials = [
  { name: "Rahul M.", role: "Options Trader, Mumbai", quote: "TradeBook helped me identify that my Monday morning trades were consistently losing. After adjusting my strategy, my win rate went from 42% to 61%.", stars: 5, avatar: "R" },
  { name: "Priya S.", role: "Swing Trader, Bangalore", quote: "The segment-level analytics are a game-changer. I can see exactly which setups work for intraday vs positional, and the Telegram alerts keep me disciplined.", stars: 5, avatar: "P" },
  { name: "Aditya K.", role: "F&O Trader, Delhi", quote: "I tried 4 journals before TradeBook. None understood Indian markets — segments, lot sizes, MCX. Finally something built for how we actually trade.", stars: 5, avatar: "A" },
];

const faqs = [
  { q: "Is TradeBook free to use?", a: "Yes! The Free plan includes up to 50 trades/month, basic analytics, and 1 watchlist — forever free. Upgrade to Pro for unlimited trades, Telegram notifications, broker integration, and advanced analytics." },
  { q: "Which brokers are supported?", a: "Currently we support Dhan for live prices, portfolio auto-sync, and one-click order execution. More brokers (Zerodha, Angel One) are on the roadmap." },
  { q: "Is my trading data safe?", a: "Absolutely. All data is encrypted at rest and in transit. Your data is yours — we never share, sell, or use it for any purpose other than powering your dashboard." },
  { q: "Can I use TradeBook for Commodities and F&O?", a: "Yes! TradeBook supports 5 market segments: Equity Intraday, Equity Positional, Futures, Options, and Commodities. Each segment has its own analytics and reporting." },
  { q: "How does the 14-day Pro trial work?", a: "Every new signup gets full Pro access for 14 days — no credit card required. After the trial, you can continue on the Free plan or upgrade to keep Pro features." },
  { q: "Do you offer refunds?", a: "Yes, we offer a full refund within 7 days of purchase if you're not satisfied. No questions asked." },
];

const pricingPlans = [
  {
    name: "Free", price: "₹0", period: "forever", description: "Get started with the basics",
    features: ["Up to 50 trades/month", "Basic analytics", "1 watchlist", "Community support"],
    cta: "Start Free", highlighted: false,
  },
  {
    name: "Pro", price: "₹499", period: "/mo", description: "For active, serious traders",
    features: ["Unlimited trades", "Advanced analytics & reports", "Telegram notifications", "Trailing stop loss engine", "Broker integration (Dhan)", "10 watchlists", "Priority support"],
    cta: "Start 14-Day Trial", highlighted: true,
  },
  {
    name: "Team", price: "₹1,499", period: "/mo", description: "For trading desks & groups",
    features: ["Everything in Pro", "5 team members", "Shared studies & alerts", "RA compliance mode", "API access", "Dedicated manager"],
    cta: "Contact Sales", highlighted: false,
  },
];

const segmentTabs = [
  {
    id: "equity", label: "Equity", icon: TrendingUp,
    title: "Intraday & Positional Equity",
    description: "Track cash-market trades with split segments for intraday scalps and positional swing trades.",
    stats: [{ label: "Segments", value: "2" }, { label: "Metrics", value: "15+" }, { label: "Holding", value: "1d–90d" }],
    features: ["Intraday vs Positional split", "Sector-wise P&L heatmap", "Day-of-week analysis", "Brokerage tracking"],
  },
  {
    id: "fno", label: "F&O", icon: Activity,
    title: "Futures & Options",
    description: "Purpose-built for derivatives traders. Log option chains, strategy legs, and Greeks tracking.",
    stats: [{ label: "Strategy Types", value: "10+" }, { label: "Greeks", value: "4" }, { label: "Expiries", value: "Auto" }],
    features: ["Multi-leg strategy logging", "Option chain selector", "Lot-size aware P&L", "Expiry-based performance"],
  },
  {
    id: "commodities", label: "Commodities", icon: PieChart,
    title: "MCX Commodities",
    description: "Track Gold, Silver, Crude, Natural Gas with commodity-specific lot sizes and session analysis.",
    stats: [{ label: "Instruments", value: "20+" }, { label: "Sessions", value: "2" }, { label: "Margin", value: "Auto" }],
    features: ["MCX instrument support", "Session-wise analytics", "Commodity-specific lots", "Margin utilization"],
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
  { feature: "Free tier available", tradebook: true, others: "Limited" },
];

/* ─── FAQ Accordion Item ────────────────────────────────── */
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.05}
      className="border border-border rounded-2xl overflow-hidden bg-card"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-medium text-sm pr-4">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Marquee logos ─────────────────────────────────────── */
function LogoMarquee() {
  const logos = [
    { name: "NSE", icon: Activity },
    { name: "BSE", icon: BarChart3 },
    { name: "MCX", icon: PieChart },
    { name: "Dhan", icon: Zap },
    { name: "Telegram", icon: Bell },
  ];
  return (
    <div className="relative overflow-hidden py-4">
      <div className="flex animate-[marquee_20s_linear_infinite] gap-12">
        {[...logos, ...logos, ...logos].map((l, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0 opacity-40 hover:opacity-70 transition-opacity">
            <l.icon className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wide">{l.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Animated Ticker ───────────────────────────────────── */
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
          <span className={cn("font-mono font-semibold", t.up ? "text-profit" : "text-loss")}>{t.change}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Floating Particles (Hero BG) ──────────────────────── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[hsl(var(--tb-accent)/0.15)]"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeSegment, setActiveSegment] = useState("equity");
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const s3 = useCountUp(5, 1200);
  const s4 = useCountUp(50, 1500);
  const s5 = useCountUp(1200, 2000);

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [user, loading, navigate]);

  const activeTab = segmentTabs.find((t) => t.id === activeSegment)!;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      {/* ── Navbar ───────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.02 }}>
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--tb-accent))] flex items-center justify-center shadow-[0_0_20px_hsl(var(--tb-accent)/0.3)]">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">TradeBook</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            {["Features", "Segments", "Pricing", "FAQ"].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-3.5 py-2 rounded-full hover:bg-muted hover:text-foreground transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-muted-foreground">
              Sign In
            </Button>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="sm"
                onClick={() => navigate("/login")}
                className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-5 shadow-[0_4px_15px_hsl(var(--tb-accent)/0.3)]"
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden">
        <FloatingParticles />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.3]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.08)_0%,transparent_70%)] pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-5xl mx-auto px-6 pt-20 pb-12 lg:pt-32 lg:pb-20 text-center">
          {/* Badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex justify-center mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--tb-accent)/0.3)] bg-[hsl(var(--tb-accent)/0.06)] text-sm backdrop-blur-sm"
              whileHover={{ scale: 1.03, borderColor: "hsl(24 90% 55% / 0.5)" }}
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-[hsl(var(--tb-accent))]"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[hsl(var(--tb-accent))] font-semibold uppercase tracking-wider text-xs">
                Built for Indian Markets · NSE · BSE · MCX
              </span>
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6"
          >
            Know Your Edge.
            <br />
            <motion.span
              className="text-[hsl(var(--tb-accent))] italic inline-block"
              style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}
              animate={{ rotate: [-1, 1, -1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              Compound
            </motion.span>{" "}
            It Daily.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0.2}
            className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            The trading journal that shows you <strong className="text-foreground">why</strong> you win and{" "}
            <strong className="text-foreground">why</strong> you lose — with segment analytics for Equity, F&O, and Commodities.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.3} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="h-14 px-10 text-base gap-2.5 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-[0_8px_30px_hsl(var(--tb-accent)/0.35)] font-semibold"
                onClick={() => navigate("/login")}
              >
                Start Free — No Card Needed
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base gap-2 rounded-full border-border/60 hover:border-[hsl(var(--tb-accent)/0.4)]"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Play className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
                See How It Works
              </Button>
            </motion.div>
          </motion.div>

          {/* Micro trust */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.35} className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-14">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-profit" /> 14-day Pro trial</span>
            <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Bank-grade security</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" /> 2-min setup</span>
          </motion.div>

          {/* ── Dashboard Preview ─────────────────────────── */}
          <motion.div
            variants={scaleIn} initial="hidden" animate="visible"
            className="relative mx-auto max-w-5xl"
          >
            {/* Multi-layered glow */}
            <div className="absolute -inset-8 bg-[hsl(var(--tb-accent)/0.05)] rounded-[2rem] blur-3xl" />
            <div className="absolute -inset-4 bg-[hsl(var(--tb-accent)/0.03)] rounded-3xl blur-xl" />

            <motion.div
              className="relative rounded-2xl border border-border/60 bg-card overflow-hidden"
              style={{ boxShadow: "0 25px 60px -15px rgba(0,0,0,0.1), 0 0 0 1px hsl(var(--border)/0.5)" }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
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

              <TickerBar />

              {/* Dashboard content */}
              <div className="flex">
                {/* Mini sidebar */}
                <div className="hidden sm:flex flex-col w-14 border-r border-border/30 bg-muted/10 py-3 gap-3 items-center">
                  {[BarChart3, BookOpen, Bell, Target, Eye, Layers, Calendar].map((Icon, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        i === 0 ? "bg-[hsl(var(--tb-accent)/0.12)] text-[hsl(var(--tb-accent))]" : "text-muted-foreground/50"
                      )}
                      whileHover={{ scale: 1.15, backgroundColor: "hsl(var(--tb-accent) / 0.08)" }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </motion.div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 sm:p-5">
                  {/* Header */}
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
                      <div className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-[10px] flex items-center gap-1">
                        <Activity className="w-3 h-3 text-profit animate-pulse" />
                        Live
                      </div>
                    </div>
                  </div>

                  {/* Today's P&L Hero Card */}
                  <div className="mb-4 rounded-xl border border-profit/20 bg-gradient-to-r from-profit/5 to-transparent p-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Today's P&L</p>
                        <p className="text-xl font-bold font-mono text-profit">+₹8,450</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-muted-foreground">Win Rate Today</p>
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
                      { label: "MTD P&L", value: "+₹24,850", change: "+12.4%", up: true },
                      { label: "Win Rate", value: "67.5%", change: "+3.2%", up: true },
                      { label: "Open Positions", value: "3", change: "₹2.4L invested", up: true },
                      { label: "Active Alerts", value: "8", change: "2 triggered", up: true },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded-xl border border-border/40 bg-card p-3">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
                        <p className={cn("text-base font-bold font-mono", kpi.label.includes("P&L") || kpi.label.includes("Win") ? "text-profit" : "text-foreground")}>{kpi.value}</p>
                        {kpi.change && <p className="text-[9px] font-mono mt-0.5 text-muted-foreground">{kpi.change}</p>}
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
                        <path d="M0,65 C20,62 40,58 60,50 C80,42 100,48 130,40 C160,32 180,36 210,28 C240,20 260,24 290,18 C320,12 350,16 370,10 C385,6 395,8 400,5" fill="none" stroke="hsl(var(--profit))" strokeWidth="2" strokeLinecap="round" />
                        <path d="M0,65 C20,62 40,58 60,50 C80,42 100,48 130,40 C160,32 180,36 210,28 C240,20 260,24 290,18 C320,12 350,16 370,10 C385,6 395,8 400,5 L400,80 L0,80 Z" fill="url(#curveGrad)" />
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
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Logo Marquee ─────────────────────────────────── */}
      <section className="py-6 border-y border-border/50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <LogoMarquee />
        </div>
      </section>

      {/* ── Stats Row ────────────────────────────────────── */}
      <MotionSection className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
            {[
              { ref: s3.ref, value: s3.count, suffix: "", label: "Market Segments" },
              { ref: s4.ref, value: s4.count, suffix: "+", label: "Analytics Metrics" },
              { ref: s5.ref, value: s5.count, suffix: "+", label: "Trades Tracked" },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i * 0.1} className="text-center">
                <div className="text-3xl sm:text-5xl font-bold tracking-tight" ref={stat.ref}>
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1.5">{stat.label}</div>
              </motion.div>
            ))}
            <motion.div variants={fadeUp} custom={0.3} className="text-center">
              <div className="text-3xl sm:text-5xl font-bold tracking-tight flex items-center gap-1.5 justify-center">
                <Clock className="w-7 h-7 text-[hsl(var(--tb-accent))]" />
                24/7
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1.5">Cloud Access</div>
            </motion.div>
          </div>
        </div>
      </MotionSection>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-28">
        <MotionSection className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
                Trade Better
              </span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From journaling to automation — tools designed by traders, for traders.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i * 0.05}>
                <motion.div
                  className="group rounded-2xl border border-border bg-card p-6 h-full relative overflow-hidden"
                  whileHover={{ y: -6, borderColor: "hsl(var(--tb-accent) / 0.3)" }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Subtle gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--tb-accent)/0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${f.color} / 0.1)`.replace("hsl(", "hsl(").replace(")", " / 0.1)") }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <f.icon className="w-5 h-5" style={{ color: f.color }} />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </MotionSection>
      </section>

      {/* ── Segment Showcase ─────────────────────────────── */}
      <section id="segments" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.12) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <MotionSection className="relative max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Built for{" "}
              <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
                Every Segment
              </span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Whether you trade equity, derivatives, or commodities — TradeBook understands your market.
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mb-10">
            {segmentTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveSegment(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                  activeSegment === tab.id
                    ? "bg-[hsl(var(--tb-accent))] text-white shadow-[0_4px_15px_hsl(var(--tb-accent)/0.3)]"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSegment}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <div className="grid md:grid-cols-2">
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-3">{activeTab.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{activeTab.description}</p>
                  <div className="flex items-center gap-6 mb-6">
                    {activeTab.stats.map((s) => (
                      <div key={s.label}>
                        <p className="text-xl font-bold font-mono text-[hsl(var(--tb-accent))]">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <ul className="space-y-2.5">
                    {activeTab.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[hsl(var(--tb-accent))] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-muted/30 border-l border-border/50 p-8 flex items-center justify-center">
                  <div className="w-full max-w-xs space-y-3">
                    {activeSegment === "equity" && (
                      <><MockTradeCard sym="RELIANCE" type="BUY" entry="₹2,890" pnl="+₹2,450" up /><MockTradeCard sym="TATAMOTORS" type="SELL" entry="₹985" pnl="-₹780" up={false} /><MockTradeCard sym="INFY" type="BUY" entry="₹1,540" pnl="+₹1,120" up /></>
                    )}
                    {activeSegment === "fno" && (
                      <><MockTradeCard sym="NIFTY 24200 CE" type="BUY" entry="₹185" pnl="+₹8,200" up /><MockTradeCard sym="BANKNIFTY 51000 PE" type="BUY" entry="₹320" pnl="-₹4,500" up={false} /><MockTradeCard sym="NIFTY FUT MAR" type="SELL" entry="₹24,100" pnl="+₹3,750" up /></>
                    )}
                    {activeSegment === "commodities" && (
                      <><MockTradeCard sym="GOLD APR" type="BUY" entry="₹71,200" pnl="+₹5,800" up /><MockTradeCard sym="CRUDE MAR" type="SELL" entry="₹6,540" pnl="+₹3,200" up /><MockTradeCard sym="SILVER MAR" type="BUY" entry="₹82,100" pnl="-₹2,100" up={false} /></>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </MotionSection>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <MotionSection className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Three Steps to Mastery</h2>
            <p className="text-muted-foreground max-w-md mx-auto">From first trade to edge mastery — in minutes.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} custom={i * 0.1}>
                <motion.div
                  className="relative rounded-2xl border border-border bg-card p-6 h-full text-center overflow-hidden"
                  whileHover={{ y: -4, borderColor: "hsl(var(--tb-accent) / 0.3)" }}
                >
                  {i < 2 && <div className="hidden md:block absolute top-14 -right-3 w-6 border-t-2 border-dashed border-border" />}
                  <div className="absolute top-3 right-4 text-5xl font-black text-muted-foreground/8 select-none">{item.step}</div>
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center mx-auto mb-5"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <item.icon className="w-6 h-6 text-[hsl(var(--tb-accent))]" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </MotionSection>
      </section>

      {/* ── Comparison Table ─────────────────────────────── */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.12) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <MotionSection className="relative max-w-3xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why{" "}
              <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
                TradeBook
              </span>
              ?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">See how we compare to generic trading journals.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-3 gap-0 border-b border-border px-6 py-4 bg-muted/30">
              <span className="text-sm font-medium">Feature</span>
              <span className="text-sm font-bold text-center text-[hsl(var(--tb-accent))]">TradeBook</span>
              <span className="text-sm font-medium text-center text-muted-foreground">Others</span>
            </div>
            {comparisonFeatures.map((row, i) => (
              <motion.div
                key={row.feature}
                variants={fadeUp}
                custom={i * 0.03}
                className="grid grid-cols-3 gap-0 border-b border-border/50 last:border-0 px-6 py-3.5 hover:bg-muted/20 transition-colors"
              >
                <span className="text-sm">{row.feature}</span>
                <div className="flex justify-center">
                  {row.tradebook === true ? (
                    <CheckCircle2 className="w-5 h-5 text-profit" />
                  ) : (
                    <span className="text-sm text-muted-foreground">{String(row.tradebook)}</span>
                  )}
                </div>
                <div className="flex justify-center">
                  {row.others === true ? (
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/40" />
                  ) : row.others === false ? (
                    <Minus className="w-5 h-5 text-muted-foreground/30" />
                  ) : (
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">{String(row.others)}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </MotionSection>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-20 lg:py-28">
        <MotionSection className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Start free. Upgrade when your edge demands it.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.name} variants={fadeUp} custom={i * 0.1}>
                <motion.div
                  className={cn(
                    "rounded-2xl border bg-card p-6 flex flex-col relative overflow-hidden",
                    plan.highlighted
                      ? "border-[hsl(var(--tb-accent)/0.4)] ring-1 ring-[hsl(var(--tb-accent)/0.15)] scale-[1.02] lg:scale-105"
                      : "border-border"
                  )}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  {plan.highlighted && <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(var(--tb-accent))]" />}
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
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      className={cn(
                        "w-full h-11 rounded-full",
                        plan.highlighted ? "bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white shadow-[0_4px_15px_hsl(var(--tb-accent)/0.3)]" : ""
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
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--tb-accent) / 0.12) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <MotionSection className="relative max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Trusted by{" "}
              <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
                Real Traders
              </span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">Here's what traders across India are saying about TradeBook.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i * 0.1}>
                <motion.div
                  className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col"
                  whileHover={{ y: -4, borderColor: "hsl(var(--tb-accent) / 0.3)" }}
                >
                  <Quote className="w-8 h-8 text-[hsl(var(--tb-accent)/0.2)] mb-4" />
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(t.stars)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))]" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center text-sm font-bold text-[hsl(var(--tb-accent))]">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </MotionSection>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="py-20 lg:py-28">
        <MotionSection className="max-w-3xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Everything you need to know about TradeBook.</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={faq.q} question={faq.q} answer={faq.a} index={i} />
            ))}
          </div>
        </MotionSection>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.06)_0%,transparent_70%)] pointer-events-none" />
        <MotionSection className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
            Stop Losing Money to
            <br />
            <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
              Undisciplined
            </span>{" "}
            Trading
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Join 1,200+ traders who journal, analyze, and compound their edge — every single day.
          </motion.p>
          <motion.div variants={fadeUp} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              className="h-14 px-10 text-base gap-2.5 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-[0_8px_30px_hsl(var(--tb-accent)/0.35)] font-semibold"
              onClick={() => navigate("/login")}
            >
              Get Started — It's Free <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
          <motion.p variants={fadeUp} className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-3">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Bank-grade encryption</span>
            <span>·</span>
            <span>No credit card required</span>
          </motion.p>
        </MotionSection>
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
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TradeBook. All rights reserved. Made with ❤️ in India.</p>
            <p className="text-xs text-muted-foreground">Not SEBI registered. For educational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Mock trade card ───────────────────────────────────── */
function MockTradeCard({ sym, type, entry, pnl, up }: { sym: string; type: string; entry: string; pnl: string; up: boolean }) {
  return (
    <motion.div
      className="rounded-xl border border-border/50 bg-card p-3.5 flex items-center justify-between"
      whileHover={{ scale: 1.02, borderColor: "hsl(var(--tb-accent) / 0.3)" }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
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
    </motion.div>
  );
}
