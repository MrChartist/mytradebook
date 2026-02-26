import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import {
  TrendingUp, ArrowRight, BarChart3, Bell, BookOpen, Shield, Zap,
  Target, LineChart, CheckCircle2, ChevronRight, Star, Play,
  Sparkles, PieChart, Eye, Globe, Menu, X, Activity, ChevronDown,
  Check, Minus, Twitter, Send, Linkedin, ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Animated counter ───────────────────────────────────── */
function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);
  return { count, ref };
}

/* ── Fade-in on scroll ───────────────────────────────────── */
function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("transition-all duration-700 ease-out", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── Ticker strip ────────────────────────────────────────── */
const tickers = [
  { sym: "NIFTY 50", val: "22,847.30", chg: "+0.84%" }, { sym: "BANKNIFTY", val: "48,210.55", chg: "+0.62%" },
  { sym: "RELIANCE", val: "1,432.10", chg: "+1.20%" }, { sym: "HDFCBANK", val: "1,618.40", chg: "-0.33%" },
  { sym: "INFY", val: "1,782.55", chg: "+0.91%" }, { sym: "TCS", val: "3,920.00", chg: "+0.45%" },
  { sym: "NIFTY MIDCAP", val: "51,320.80", chg: "+1.10%" }, { sym: "GOLD MCX", val: "61,485", chg: "+0.37%" },
];
function TickerStrip() {
  return (
    <div className="w-full overflow-hidden py-2 border-y border-white/5 bg-black/40">
      <div className="flex animate-[marquee_30s_linear_infinite] gap-12 w-max">
        {[...tickers, ...tickers].map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-mono whitespace-nowrap">
            <span className="text-white/50 uppercase tracking-wider">{t.sym}</span>
            <span className="text-white/80 font-semibold">{t.val}</span>
            <span className={t.chg.startsWith("+") ? "text-emerald-400" : "text-red-400"}>{t.chg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard Mockup ────────────────────────────────────── */
function DashboardPreview() {
  return (
    <div className="relative w-full max-w-[1000px] mx-auto mt-12 perspective-1000">
      <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-3xl shadow-[0_0_80px_rgba(99,102,241,0.2)] overflow-hidden transform-gpu rotate-x-[10deg] scale-[0.96] hover:rotate-x-0 hover:scale-100 transition-all duration-700 ease-out group">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 bg-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 px-5 py-1 rounded-full bg-black/30 text-xs text-white/40 border border-white/5 font-mono">
              <Globe className="w-3 h-3" /> app.tradebook.in/dashboard
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold tracking-wider">LIVE</span>
          </div>
        </div>
        <div className="p-5 md:p-7 grid gap-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Net P&L", value: "+₹34,250", color: "text-emerald-400" },
              { label: "Win Rate", value: "72.4%", color: "text-blue-400" },
              { label: "Profit Factor", value: "2.8×", color: "text-purple-400" },
              { label: "Active Trades", value: "3", color: "text-white" },
            ].map((k, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/5 p-3 flex flex-col gap-1">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{k.label}</span>
                <span className={cn("text-xl font-bold font-mono", k.color)}>{k.value}</span>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-xl border border-white/5 bg-white/5 p-4 h-[180px]">
              <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-3">Equity Curve</span>
              <svg viewBox="0 0 400 120" className="w-full h-[130px] drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]" preserveAspectRatio="none">
                <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient></defs>
                <path d="M0 100 Q40 80 80 90 T160 60 T240 40 T320 20 T400 10" fill="none" stroke="#34d399" strokeWidth="2.5" />
                <path d="M0 100 Q40 80 80 90 T160 60 T240 40 T320 20 T400 10 V120 H0Z" fill="url(#g1)" />
              </svg>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 p-4 h-[180px] flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-3">Recent Trades</span>
              <div className="flex-1 flex flex-col gap-2 justify-between">
                {[
                  { sym: "NIFTY 22800CE", pnl: "+₹8,450", win: true },
                  { sym: "RELIANCE", pnl: "+₹1,200", win: true },
                  { sym: "BANKNIFTY", pnl: "-₹3,400", win: false },
                  { sym: "HDFCBANK", pnl: "+₹5,600", win: true },
                ].map((t, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.03]">
                    <span className="text-[10px] font-semibold text-white/70 truncate mr-2">{t.sym}</span>
                    <span className={cn("text-[10px] font-mono font-bold", t.win ? "text-emerald-400" : "text-red-400")}>{t.pnl}</span>
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

/* ── Stat counter card ───────────────────────────────────── */
function StatCard({ end, prefix = "", suffix = "", label }: { end: number; prefix?: string; suffix?: string; label: string }) {
  const { count, ref } = useCountUp(end, 1800);
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-bold font-mono text-white mb-1">{prefix}{count.toLocaleString("en-IN")}{suffix}</p>
      <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
    </div>
  );
}

/* ── FAQ item ────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border border-white/5 rounded-2xl p-5 transition-all duration-300 cursor-pointer", open ? "bg-white/5 border-white/10" : "bg-white/[0.02] hover:bg-white/[0.04]")} onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-white/90 font-medium text-sm md:text-base">{q}</span>
        <ChevronDown className={cn("w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-300", open && "rotate-180 text-primary")} />
      </div>
      {open && <p className="mt-4 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-4">{a}</p>}
    </div>
  );
}

const features = [
  { icon: BookOpen, title: "Smart Journaling Engine", description: "Multi-segment trade logging with charts, tags, notes, and advanced pattern recognition to discover your real edge.", span: "col-span-1 md:col-span-2" },
  { icon: BarChart3, title: "Deep Analytics", description: "Equity curves, max drawdown, win-rate heatmaps, time-of-day performance, and segment breakdowns.", span: "col-span-1" },
  { icon: Target, title: "Dynamic TSL Engine", description: "Segment-based trailing stop-loss with configurable activation, step, gap, and cooldown logic.", span: "col-span-1" },
  { icon: LineChart, title: "Dhan Broker Sync", description: "Live prices, portfolio auto-sync, and one-click execution directly from your journal.", span: "col-span-1 md:col-span-2" },
  { icon: Shield, title: "Risk & Rules Engine", description: "Pre-trade checklists, mistake tagging, and discipline enforcement algorithms built for retail traders.", span: "col-span-1 md:col-span-3" },
];

const testimonials = [
  { name: "Rahul M.", role: "Options Trader · Mumbai", text: "Finally a journal that understands F&O. The segment analytics changed how I see my trades — my win rate went from 51% to 67% in 3 months.", stars: 5 },
  { name: "Deepa S.", role: "Equity Trader · Hyderabad", text: "The Telegram alerts saved me from 2 bad trades last week. Setup was under 5 minutes and it just works perfectly with everything.", stars: 5 },
  { name: "Arjun K.", role: "Futures Trader · Delhi", text: "I used spreadsheets for 4 years. Switching to TradeBook was the single best decision for my trading. The mistake log alone is priceless.", stars: 5 },
  { name: "Priya V.", role: "Swing Trader · Pune", text: "The equity curve and drawdown chart showed me exactly when I overtrade. Couldn't see this in any other tool. Worth every rupee.", stars: 5 },
];

const faqItems = [
  { q: "Is TradeBook free to use?", a: "Yes! The Starter plan is free forever — no credit card required. You get 50 trades/month, core analytics, and community access. Upgrade to Pro for unlimited trades, Dhan integration, Telegram alerts, and more." },
  { q: "Which brokers are supported?", a: "We currently support Dhan with full API integration (live prices, auto-sync, order execution). You can also use any broker manually by importing trades via our journal. More broker integrations are planned." },
  { q: "Is my trading data safe and private?", a: "Absolutely. All data is encrypted at rest and in transit. We use Supabase with row-level security — your data is only accessible by you. We never sell or share your trading data." },
  { q: "Can I import trades from Excel or Zerodha?", a: "You can add trades manually with full details, or sync automatically via Dhan. CSV import from other brokers is on our roadmap for the next release." },
  { q: "How does the Dhan broker integration work?", a: "Connect your Dhan API key once in Settings → Integrations. We then fetch live prices for your watchlist and alerts, and can auto-log your closed positions. It's read-only by default — execution is opt-in." },
  { q: "What is the RA Mode (Research Analyst)?", a: "RA Mode removes quantity and P&L from Telegram notifications, so registered Research Analysts can share their trade calls publicly without disclosing personal position sizes — fully compliant." },
  { q: "Do I need any technical knowledge?", a: "None at all. Setup takes 2 minutes — sign up, log your first trade, and your dashboard is live. The only optional technical step is connecting your Dhan API key, which takes another 2 minutes." },
];

const pricingPlans = [
  {
    name: "Starter", price: "₹0", period: "forever",
    description: "Perfect for traders just getting started with data-driven journaling.",
    features: ["Up to 50 trades/month", "Core analytics dashboard", "1 strategy watchlist", "Community forum access"],
    cta: "Begin Free", highlighted: false,
  },
  {
    name: "Pro Trader", price: "₹499", period: "/month",
    description: "For the serious retail professional who wants every edge.",
    features: ["Unlimited trade logging", "Deep segment analytics & heatmaps", "Telegram alerts (multi-chat)", "Automated TSL engine", "Dhan broker integration", "Priority support"],
    cta: "Start 14-Day Trial", highlighted: true,
  },
];

const comparison = [
  { feature: "Multi-segment analytics", us: true, sheet: false },
  { feature: "Automated Telegram alerts", us: true, sheet: false },
  { feature: "Trailing stop-loss engine", us: true, sheet: false },
  { feature: "Broker sync (Dhan)", us: true, sheet: false },
  { feature: "Mistake tagging & review", us: true, sheet: false },
  { feature: "Zero setup time", us: true, sheet: false },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > window.innerHeight * 0.5);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [user, loading, navigate]);

  return (
    <div className="dark min-h-screen bg-[#030303] text-white selection:bg-primary/30 overflow-x-hidden font-sans">

      {/* ── Scroll progress bar ── */}
      <div className="fixed top-0 left-0 z-[100] h-[2px] bg-gradient-to-r from-primary to-purple-400 transition-all duration-100" style={{ width: `${scrollProgress}%` }} />

      {/* ── Background blobs ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px] opacity-50 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[150px] opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
      </div>

      {/* ── Announcement bar ── */}
      {!announcementDismissed && (
        <div className="relative z-50 bg-gradient-to-r from-primary/80 to-purple-600/80 backdrop-blur-sm text-white text-xs md:text-sm py-2.5 px-4 text-center font-medium flex items-center justify-center gap-3">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
          <span>🎉 Dhan Auto-Sync is now live — connect your broker in 2 minutes. <a href="#features" className="underline underline-offset-2 font-bold hover:text-white/80">See how it works →</a></span>
          <button onClick={() => setAnnouncementDismissed(true)} className="ml-2 hover:opacity-70 transition-opacity flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Island Navbar ── */}
      <div className={cn(
        "fixed left-0 right-0 z-40 flex justify-center transition-all duration-500 px-4",
        announcementDismissed ? "top-4" : "top-[50px] md:top-[54px]"
      )}>
        {/* Desktop Island */}
        <nav className={cn(
          "hidden md:flex items-center gap-2 transition-all duration-500 rounded-full border px-2 py-2",
          scrolled
            ? "bg-black/70 backdrop-blur-2xl border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] scale-[0.98]"
            : "bg-white/[0.04] backdrop-blur-xl border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
        )}>
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/8 transition-all group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">TradeBook</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Links */}
          <div className="flex items-center gap-1">
            {[["#features", "Features"], ["#how-it-works", "How It Works"], ["#pricing", "Pricing"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="px-3.5 py-1.5 text-[13px] font-medium text-white/55 hover:text-white hover:bg-white/8 rounded-full transition-all duration-150"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Actions */}
          <div className="flex items-center gap-1.5 pr-1">
            <button
              onClick={() => navigate("/login")}
              className="px-3.5 py-1.5 text-[13px] font-medium text-white/55 hover:text-white hover:bg-white/8 rounded-full transition-all duration-150"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-1.5 text-[13px] font-semibold text-white rounded-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-[0_0_16px_rgba(99,102,241,0.4)] hover:shadow-[0_0_24px_rgba(99,102,241,0.6)] hover:scale-105 transition-all duration-200"
            >
              Get Started →
            </button>
          </div>
        </nav>

        {/* Mobile Island */}
        <div className="md:hidden w-full max-w-sm">
          <div className={cn(
            "flex items-center justify-between transition-all duration-500 rounded-2xl border px-4 py-3",
            scrolled ? "bg-black/80 backdrop-blur-2xl border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]" : "bg-white/[0.05] backdrop-blur-xl border-white/10"
          )}>
            <button onClick={() => navigate("/")} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-white">TradeBook</span>
            </button>
            <button className="p-1.5 text-white/60 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {/* Mobile Dropdown */}
          <div className={cn(
            "mt-2 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-[320px] opacity-100 shadow-[0_8px_32px_rgba(0,0,0,0.6)]" : "max-h-0 opacity-0"
          )}>
            <div className="flex flex-col p-3 gap-1">
              {[["#features", "Features"], ["#how-it-works", "How It Works"], ["#pricing", "Pricing"], ["#faq", "FAQ"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 rounded-xl transition-all">
                  {label}
                </a>
              ))}
              <div className="h-px bg-white/8 my-1" />
              <button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}
                className="px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 rounded-xl transition-all text-left">
                Sign In
              </button>
              <button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}
                className="mx-1 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-all">
                Get Started →
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10" style={{ paddingTop: announcementDismissed ? "80px" : "122px" }}>

        {/* ── Hero ── */}
        <section className="relative max-w-7xl mx-auto px-6 pt-10 lg:pt-16 text-center">
          <FadeIn className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-white/60">Your trading data.</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="font-semibold text-white/90">Your edge. Your alpha.</span>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tighter leading-[1.05] max-w-5xl mx-auto mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 pb-2">
              The operating system<br className="hidden md:block" />
              for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">quantified trading.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-base sm:text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light px-4">
              Stop trading on intuition. Identify your true edge with institutional-grade journaling, segment analytics, and automated execution — built for Indian retail traders.
            </p>
          </FadeIn>

          <FadeIn delay={300} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 w-full max-w-md mx-auto sm:max-w-none px-4">
            <Button size="lg" className="w-full sm:w-auto h-12 md:h-14 px-7 md:px-9 text-base md:text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_40px_rgba(99,102,241,0.5)] border border-white/10 hover:scale-105 transition-all" onClick={() => navigate("/login")}>
              Start Your Free Journal <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 md:h-14 px-7 md:px-9 text-base md:text-lg rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md hover:scale-105 transition-all" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              <Play className="w-4 h-4 mr-2" /> Explore Platform
            </Button>
          </FadeIn>

          {/* NSE/BSE badge row */}
          <FadeIn delay={350}>
            <div className="flex items-center justify-center gap-2 mb-12 text-xs text-white/30">
              {["NSE", "BSE", "MCX", "NFO", "F&O"].map(m => (
                <span key={m} className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 font-mono">{m}</span>
              ))}
              <span className="ml-1">All Segments Supported</span>
            </div>
          </FadeIn>

          <FadeIn delay={400}>
            <DashboardPreview />
          </FadeIn>
        </section>

        {/* ── Live Ticker ── */}
        <div className="mt-20">
          <TickerStrip />
        </div>

        {/* ── Stats Strip ── */}
        <section className="py-20 border-b border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-10">Built for Indian retail traders</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard end={12000} suffix="+" label="Trades Logged" />
              <StatCard prefix="₹" end={24} suffix="Cr+ Tracked" label="P&L Tracked" />
              <StatCard end={72} suffix="%" label="Avg Win Rate" />
              <StatCard end={2} suffix=" min" label="Setup Time" />
            </div>
          </div>
        </section>

        {/* ── Why TradeBook ── */}
        <section className="py-28 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FadeIn>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary uppercase tracking-wider mb-6">
                  <Sparkles className="w-3 h-3" /> Why TradeBook
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                  Spreadsheets don't<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">teach you anything.</span>
                </h2>
                <p className="text-white/50 text-lg leading-relaxed mb-8">
                  We built TradeBook because most retail traders fail not from bad setups — but from poor record-keeping, no pattern recognition, and zero discipline enforcement. One tool to fix all three.
                </p>
                <Button onClick={() => navigate("/login")} className="h-11 px-6 rounded-full bg-primary text-white hover:bg-primary/90 font-semibold">
                  Start Journaling Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </FadeIn>

              <FadeIn delay={150}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
                  <div className="grid grid-cols-3 gap-px bg-white/5">
                    <div className="px-5 py-4 bg-[#030303] text-xs text-white/30 uppercase tracking-wider font-semibold">Feature</div>
                    <div className="px-5 py-4 bg-[#030303] text-center text-xs text-white/30 uppercase tracking-wider font-semibold">Spreadsheet</div>
                    <div className="px-5 py-4 bg-primary/10 text-center text-xs text-primary uppercase tracking-wider font-semibold">TradeBook</div>
                  </div>
                  {comparison.map((row, i) => (
                    <div key={i} className="grid grid-cols-3 gap-px bg-white/5">
                      <div className="px-5 py-3.5 bg-[#030303] text-sm text-white/70">{row.feature}</div>
                      <div className="px-5 py-3.5 bg-[#030303] flex justify-center">
                        <Minus className="w-4 h-4 text-white/20" />
                      </div>
                      <div className="px-5 py-3.5 bg-primary/5 flex justify-center">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-28 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">From signup to insight<br />in under 5 minutes.</h2>
              <p className="text-white/40 max-w-xl mx-auto">No manual spreadsheets. No confusing setup. Just data-driven precision.</p>
            </FadeIn>
            <div className="relative grid md:grid-cols-4 gap-8">
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              {[
                { step: "01", title: "Create Account", desc: "Sign up with Google or email. No credit card, no friction.", chip: "Google Sign-In" },
                { step: "02", title: "Log Your Trades", desc: "Add trades manually or auto-sync from Dhan in one click.", chip: "Dhan API" },
                { step: "03", title: "Set Smart Alerts", desc: "Configure price alerts, TSL rules, and Telegram notifications.", chip: "Telegram" },
                { step: "04", title: "Discover Your Edge", desc: "Review mistakes, track equity curve, and build discipline.", chip: "Analytics" },
              ].map((item, i) => (
                <FadeIn key={item.step} delay={i * 120} className="text-center group">
                  <div className="relative inline-flex mb-6">
                    <div className="w-20 h-20 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-300">
                      <span className="text-2xl font-black font-mono text-white/20 group-hover:text-primary transition-colors">{item.step}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white/90">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">{item.desc}</p>
                  <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/50 font-mono">{item.chip}</span>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Bento ── */}
        <section id="features" className="py-28 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">Everything you need to<br />scale your edge.</h2>
              <p className="text-white/40 max-w-xl mx-auto">An interconnected ecosystem of analytics, journaling, alerts and execution — not a glorified spreadsheet.</p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <FadeIn key={f.title} delay={i * 90} className={f.span}>
                  <div className="group relative h-full rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-8 overflow-hidden transition-all duration-500 hover:border-white/15 hover:shadow-[0_0_40px_rgba(99,102,241,0.08)]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] -mr-24 -mt-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300">
                        <f.icon className="w-5 h-5 text-white/70 group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white/90">{f.title}</h3>
                      <p className="text-white/40 leading-relaxed text-sm">{f.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-28 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">Loved by Indian traders.</h2>
              <p className="text-white/40 max-w-xl mx-auto">From F&O veterans to swing traders — see what the community is saying.</p>
            </FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {testimonials.map((t, i) => (
                <FadeIn key={t.name} delay={i * 100}>
                  <div className="h-full rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 p-6 flex flex-col gap-4 transition-all duration-300">
                    <div className="flex gap-0.5">
                      {[...Array(t.stars)].map((_, s) => <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed flex-1">"{t.text}"</p>
                    <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/90">{t.name}</p>
                        <p className="text-[11px] text-white/30">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-28 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">Invest in your discipline.</h2>
              <p className="text-white/40 max-w-xl mx-auto">Simple, transparent pricing. One profitable trade pays for a lifetime of Pro.</p>
            </FadeIn>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {pricingPlans.map((plan, i) => (
                <FadeIn key={plan.name} delay={i * 150}>
                  <div className={cn(
                    "relative rounded-[2rem] p-8 md:p-10 flex flex-col h-full transition-all duration-300",
                    plan.highlighted
                      ? "bg-gradient-to-b from-white/10 to-white/5 border border-white/20 shadow-[0_0_80px_rgba(99,102,241,0.15)] md:-translate-y-4"
                      : "bg-white/[0.02] border border-white/5 hover:border-white/10"
                  )}>
                    {plan.highlighted && (
                      <div className="absolute top-0 inset-x-0 flex justify-center -mt-3.5">
                        <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]">Most Popular</span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-white/40 text-sm mb-6">{plan.description}</p>
                    <div className="flex items-baseline gap-1.5 mb-8 pb-8 border-b border-white/10">
                      <span className="text-5xl font-bold font-mono">{plan.price}</span>
                      <span className="text-white/30 text-sm">{plan.period}</span>
                    </div>
                    <ul className="space-y-3.5 mb-8 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-3 text-white/70 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => navigate("/login")} className={cn("w-full h-12 rounded-full font-bold transition-all hover:scale-[1.02]",
                      plan.highlighted ? "bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-white/5 text-white border border-white/10 hover:bg-white/10")}>
                      {plan.cta}
                    </Button>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-28 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-3xl mx-auto px-6">
            <FadeIn className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">Any questions?</h2>
              <p className="text-white/40">Everything you need to know before you start.</p>
            </FadeIn>
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <FAQItem q={item.q} a={item.a} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 md:py-28 relative overflow-hidden border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-purple-600/20 to-transparent border border-white/10 p-10 md:p-16 lg:p-20 text-center backdrop-blur-xl shadow-[0_0_100px_rgba(99,102,241,0.2)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
              <p className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-4">Join 500+ traders this month</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-5">Start trading like<br />a machine.</h2>
              <p className="text-xl text-white/50 mb-10 max-w-xl mx-auto font-light">Data over emotion. Setup takes exactly 2 minutes. No credit card.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={() => navigate("/login")} className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-white/90 font-bold hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] w-full sm:w-auto">
                  Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <button className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/30"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-black/60 py-14 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-base tracking-tight">TradeBook</span>
              </div>
              <p className="text-white/30 text-sm leading-relaxed mb-5">The operating system for quantified retail trading in India.</p>
              <div className="flex gap-3">
                {[
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" },
                  { icon: Send, href: "#", label: "Telegram" },
                ].map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} aria-label={label} className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all">
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
            {/* Product */}
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider font-semibold mb-5">Product</p>
              <ul className="space-y-3 text-sm text-white/30">
                {["Features", "Pricing", "Analytics", "Alerts", "Dhan Integration"].map(l => (
                  <li key={l}><a href="#features" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            {/* Company */}
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider font-semibold mb-5">Company</p>
              <ul className="space-y-3 text-sm text-white/30">
                {[["About", "#"], ["Blog", "#"], ["Careers", "#"], ["Contact", "#"]].map(([l, h]) => (
                  <li key={l}><a href={h} className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            {/* Newsletter */}
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider font-semibold mb-5">Weekly Insights</p>
              <p className="text-white/30 text-sm mb-4">Get trading insights & product updates every week.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="your@email.com" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 min-w-0" />
                <button className="px-3 py-2 bg-primary rounded-xl text-white hover:bg-primary/80 transition-colors flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs">© 2026 TradeBook Systems. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-white/20">
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>NSE · BSE · MCX</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Back to top ── */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary/80 backdrop-blur-sm border border-primary/40 flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

    </div>
  );
}
