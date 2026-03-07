import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, ArrowRight, BarChart3, Bell, BookOpen, Shield, Target,
  LineChart, CheckCircle2, Zap, Eye, ChevronRight, Star, Quote,
  Activity, PieChart, Layers, Clock, ArrowUp, ArrowDown, Minus,
  Smartphone, Globe, Lock, Sparkles, Brain, List, Calculator,
  FileSpreadsheet, MessageSquare, Lightbulb, FileUp, Trophy,
  Crown, RefreshCw, Menu, X, Send, CandlestickChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import landingLogo from "@/assets/logo.png";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Split components
import { HeroSection } from "@/components/landing/HeroSection";
import {
  useCountUp, fadeUp, staggerContainer, MotionSection, SectionBadge, GradientDivider,
} from "@/components/landing/LandingShared";

/* ─── Data ──────────────────────────────────────────────── */
const features: { icon: any; title: string; description: string; color: string; large: boolean; previewKey: string }[] = [
  { icon: BookOpen, title: "Smart Journal", description: "Multi-segment trade logging with charts, tags, notes, and pattern recognition. Track every trade across Equity, F&O, and Commodities.", color: "hsl(24 90% 55%)", large: true, previewKey: "journal" },
  { icon: BarChart3, title: "Deep Analytics", description: "Equity curves, drawdown analysis, win-rate heatmaps, and segment breakdowns.", color: "hsl(152 60% 42%)", large: false, previewKey: "analytics" },
  { icon: Bell, title: "Real-Time Alerts", description: "Price alerts, scanner triggers, and instant Telegram notifications.", color: "hsl(210 80% 55%)", large: false, previewKey: "alerts" },
  { icon: Target, title: "Trailing Stop Loss", description: "Segment-based TSL with configurable activation, step, gap, and cooldown.", color: "hsl(340 75% 55%)", large: false, previewKey: "" },
  { icon: LineChart, title: "Broker Integration", description: "Connect Dhan for live prices, portfolio auto-sync, and one-click execution.", color: "hsl(45 90% 50%)", large: false, previewKey: "" },
  { icon: Brain, title: "AI Trade Insights", description: "AI-powered analysis of your trading patterns, timing blind-spots, and behavioral suggestions to sharpen your edge.", color: "hsl(270 65% 58%)", large: true, previewKey: "ai" },
  { icon: List, title: "Watchlist & Scanner", description: "Multi-watchlist monitoring with live prices, change %, and custom scanners.", color: "hsl(190 75% 45%)", large: false, previewKey: "watchlist" },
  { icon: Shield, title: "Rules Engine", description: "Pre-trade checklists, mistake tagging, and discipline enforcement.", color: "hsl(270 60% 55%)", large: false, previewKey: "rules" },
  { icon: MessageSquare, title: "Telegram Bot", description: "Automated trade notifications, EOD reports, and morning briefings.", color: "hsl(200 85% 50%)", large: false, previewKey: "telegram" },
  { icon: Calculator, title: "Position Sizing", description: "Risk-based lot calculator with capital management and leverage warnings.", color: "hsl(160 60% 45%)", large: false, previewKey: "sizing" },
  { icon: FileSpreadsheet, title: "CSV Import/Export", description: "Bulk import trades from broker CSVs and export reports for offline review.", color: "hsl(30 70% 50%)", large: false, previewKey: "csv" },
];

const steps = [
  { step: "01", icon: BookOpen, title: "Log Your Trades", desc: "Add trades manually or auto-sync from Dhan. Tag setups, patterns, and mistakes." },
  { step: "02", icon: Eye, title: "Spot Patterns", desc: "Segment-level analytics reveal what's working — by setup, time, and condition." },
  { step: "03", icon: Zap, title: "Automate & Scale", desc: "Set rules, alerts, and trailing stops. Let the system enforce your discipline." },
];

const testimonials = [
  { name: "Rahul M.", role: "Options Trader, Mumbai", style: "Options", quote: "TradeBook helped me identify that my Monday morning trades were consistently losing. After adjusting my strategy, my win rate went from 42% to 61%.", highlight: "win rate went from 42% to 61%", stars: 5, avatar: "R", featured: true },
  { name: "Priya S.", role: "Swing Trader, Bangalore", style: "Swing", quote: "The segment-level analytics are a game-changer. I can see exactly which setups work for intraday vs positional.", highlight: "segment-level analytics", stars: 5, avatar: "P", featured: false },
  { name: "Aditya K.", role: "F&O Trader, Delhi", style: "F&O", quote: "I tried 4 journals before TradeBook. None understood Indian markets — segments, lot sizes, MCX. Finally something built for how we actually trade.", highlight: "built for how we actually trade", stars: 5, avatar: "A", featured: false },
  { name: "Vikram T.", role: "Scalper, Hyderabad", style: "Scalping", quote: "The trading rules checklist changed everything. I used to revenge trade after losses — now the pre-trade checklist keeps me disciplined and my drawdowns are half of what they were.", highlight: "drawdowns are half", stars: 5, avatar: "V", featured: true },
  { name: "Sneha R.", role: "Positional Trader, Pune", style: "Positional", quote: "Getting EOD reports and morning briefings on Telegram means I never miss a setup. It's like having a trading assistant that actually understands my portfolio.", highlight: "EOD reports and morning briefings", stars: 5, avatar: "S", featured: false },
];

const allFeatures = [
  "Unlimited trades", "Advanced analytics & reports", "Telegram notifications",
  "Trailing stop loss engine", "Broker integration (Dhan)", "Unlimited watchlists",
  "Pattern & mistake tracking", "Weekly reports", "Priority support",
];

const shortFeatures = [
  "Unlimited trade logging", "AI-powered trade insights", "Advanced analytics suite",
  "Trailing stop loss engine", "Broker integration (Dhan)",
];

const pricingPlans = [
  { name: "Monthly", price: "₹0", originalPrice: "₹199", period: "/mo", description: "Full access, billed monthly", features: shortFeatures, cta: "Start Free", highlighted: false, isBeta: true, saveBadge: null, badge: null, badgeIcon: null, showAllNote: true },
  { name: "Quarterly", price: "₹0", originalPrice: "₹499", period: "/quarter", description: "All features, best for active traders", features: allFeatures, cta: "Start Free", highlighted: true, isBeta: true, saveBadge: "Save 17%", badge: "Most Popular", badgeIcon: Zap, showAllNote: false },
  { name: "Yearly", price: "₹1,499", originalPrice: null, period: "/year", description: "All features, best value", features: shortFeatures, cta: "Subscribe", highlighted: false, isBeta: false, saveBadge: "Save 37%", badge: "Best Value", badgeIcon: Crown, showAllNote: true },
];

const comparisonFeatures = [
  { feature: "Multi-segment support", tradebook: true, others: false },
  { feature: "Indian market focus (NSE/BSE/MCX)", tradebook: true, others: false },
  { feature: "Trailing stop loss engine", tradebook: true, others: false },
  { feature: "AI-powered trade insights", tradebook: true, others: false },
  { feature: "Position sizing calculator", tradebook: true, others: "Basic" },
  { feature: "Telegram notifications", tradebook: true, others: "Paid" },
  { feature: "Broker integration", tradebook: true, others: "Limited" },
  { feature: "Equity curve & drawdown", tradebook: true, others: true },
  { feature: "Pattern & mistake tagging", tradebook: true, others: false },
  { feature: "Free beta access", tradebook: true, others: "Limited" },
];

/* ─── Mini UI Mockups for Bento Cards ───────────────────── */
function JournalMiniPreview() {
  return (
    <div className="mt-6 rounded-xl border border-border/20 bg-muted/15 p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {["Breakout", "High Vol", "Swing"].map((tag) => (
          <span key={tag} className="px-2.5 py-1 rounded-full bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))] text-[10px] font-semibold">{tag}</span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{ label: "Win Rate", value: "68%" }, { label: "Avg Win", value: "₹12,450" }, { label: "P. Factor", value: "2.14" }].map((m) => (
          <div key={m.label} className="rounded-lg bg-card/80 border border-border/20 p-2 text-center">
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            <p className="text-xs font-bold font-mono text-foreground">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {["R", "P", "A"].map((a) => (
            <div key={a} className="w-6 h-6 rounded-full border-2 border-card bg-[hsl(var(--tb-accent)/0.12)] flex items-center justify-center text-[8px] font-bold text-[hsl(var(--tb-accent))]">{a}</div>
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
      {[{ symbol: "NIFTY", condition: "Price > 24,300", status: "Active", active: true }, { symbol: "RELIANCE", condition: "% Change > 3%", status: "Triggered", active: false }].map((alert) => (
        <div key={alert.symbol} className="flex items-center gap-2.5 rounded-lg border border-border/20 bg-muted/15 px-3 py-2">
          <div className={cn("w-1.5 h-1.5 rounded-full", alert.active ? "bg-profit animate-pulse" : "bg-[hsl(var(--tb-accent))]")} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold">{alert.symbol}</p>
            <p className="text-[8px] text-muted-foreground">{alert.condition}</p>
          </div>
          <span className={cn("text-[8px] font-semibold px-2 py-0.5 rounded-full", alert.active ? "bg-profit/10 text-profit" : "bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]")}>{alert.status}</span>
        </div>
      ))}
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

function AIInsightsMiniPreview() {
  return (
    <div className="mt-6 space-y-2.5">
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/15 bg-amber-500/[0.04] px-3.5 py-3">
        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /></div>
        <div><p className="text-[11px] font-semibold text-foreground leading-snug">Win rate drops 23% after 2 PM</p><p className="text-[9px] text-muted-foreground mt-0.5">Consider limiting afternoon trades to high-conviction setups only.</p></div>
      </div>
      <div className="flex items-start gap-2.5 rounded-lg border border-profit/15 bg-profit/[0.04] px-3.5 py-3">
        <div className="w-6 h-6 rounded-lg bg-profit/10 flex items-center justify-center shrink-0 mt-0.5"><TrendingUp className="w-3.5 h-3.5 text-profit" /></div>
        <div><p className="text-[11px] font-semibold text-foreground leading-snug">Breakout setups: 78% win rate</p><p className="text-[9px] text-muted-foreground mt-0.5">Your best performing pattern across all segments.</p></div>
      </div>
      <p className="text-[9px] text-[hsl(var(--tb-accent))] font-semibold cursor-pointer">View 3 more insights →</p>
    </div>
  );
}

function WatchlistMiniPreview() {
  return (
    <div className="mt-5 space-y-1.5">
      {[{ symbol: "RELIANCE", price: "₹2,945.30", change: "+1.24%", up: true }, { symbol: "NIFTY 50", price: "₹24,285", change: "+0.82%", up: true }, { symbol: "HDFCBANK", price: "₹1,612.50", change: "-0.45%", up: false }].map((t) => (
        <div key={t.symbol} className="flex items-center justify-between rounded-lg border border-border/20 bg-muted/15 px-3 py-2">
          <div className="flex items-center gap-2"><div className={cn("w-1 h-4 rounded-full", t.up ? "bg-profit" : "bg-loss")} /><span className="text-[10px] font-semibold">{t.symbol}</span></div>
          <div className="flex items-center gap-3"><span className="text-[10px] font-mono text-muted-foreground">{t.price}</span><span className={cn("text-[9px] font-mono font-semibold flex items-center gap-0.5", t.up ? "text-profit" : "text-loss")}>{t.up ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}{t.change}</span></div>
        </div>
      ))}
    </div>
  );
}

function TelegramMiniPreview() {
  return (
    <div className="mt-5 space-y-2">
      <div className="rounded-lg border border-border/20 bg-muted/15 p-3 relative">
        <div className="flex items-center gap-2 mb-1.5"><div className="w-5 h-5 rounded-full bg-[hsl(200_85%_50%/0.12)] flex items-center justify-center"><Send className="w-2.5 h-2.5 text-[hsl(200_85%_50%)]" /></div><span className="text-[9px] font-semibold text-muted-foreground">TradeBook Bot</span></div>
        <p className="text-[10px] font-mono leading-relaxed text-foreground">📊 EOD Report: <span className="text-profit font-bold">+₹12,450</span> | 5W-2L | Win Rate 71%</p>
      </div>
      <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" /><span className="text-[8px] text-muted-foreground">Auto-sends at market close</span></div>
    </div>
  );
}

function PositionSizingMiniPreview() {
  return (
    <div className="mt-5 rounded-lg border border-border/20 bg-muted/15 p-3 space-y-2">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[{ label: "Capital", value: "₹5L" }, { label: "Risk", value: "2%" }, { label: "Lot Size", value: "3 lots" }].map((m) => (
          <div key={m.label} className="rounded-md bg-card/80 border border-border/20 py-1.5 px-1"><p className="text-[7px] text-muted-foreground uppercase tracking-wider">{m.label}</p><p className="text-[11px] font-bold font-mono text-foreground">{m.value}</p></div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground"><Shield className="w-2.5 h-2.5" />Max risk: ₹10,000 per trade</div>
    </div>
  );
}

function CSVImportMiniPreview() {
  return (
    <div className="mt-5 rounded-lg border border-border/20 bg-muted/15 p-3">
      <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-[hsl(30_70%_50%/0.08)] flex items-center justify-center"><FileUp className="w-4 h-4 text-[hsl(30_70%_50%)]" /></div><div><p className="text-[10px] font-semibold text-foreground">trades_feb2026.csv</p><p className="text-[8px] text-muted-foreground">Zerodha format • 4 columns mapped</p></div></div>
      <div className="mt-2 flex items-center gap-1.5"><div className="flex-1 h-1 rounded-full bg-muted/40"><div className="h-full w-full rounded-full bg-profit" /></div><span className="text-[8px] font-semibold text-profit">234 trades imported ✓</span></div>
    </div>
  );
}

function RulesEngineMiniPreview() {
  return (
    <div className="mt-5 space-y-2">
      {[{ rule: "Check market trend", checked: true }, { rule: "Set stop loss ≤ 2%", checked: true }, { rule: "Max 3 trades/day", checked: false }].map((r) => (
        <div key={r.rule} className="flex items-center gap-2 rounded-lg border border-border/20 bg-muted/15 px-3 py-2">
          <div className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px]", r.checked ? "bg-profit/15 border-profit/30 text-profit" : "border-border/40")}>{r.checked && <CheckCircle2 className="w-2.5 h-2.5" />}</div>
          <span className="text-[10px] text-muted-foreground">{r.rule}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        jsonLd={{
          "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "TradeBook",
          "applicationCategory": "FinanceApplication", "operatingSystem": "Web",
          "description": "Trading journal and analytics platform for Indian markets — NSE, BSE, MCX.",
          "url": "https://mytradebook.lovable.app",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "1200", "bestRating": "5" }
        }}
      />

      {/* ── Navbar ────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-3xl px-4"
      >
        <div className="flex items-center justify-between px-3 pl-4 py-2 rounded-full border border-border/40 bg-card/80 backdrop-blur-xl shadow-lg shadow-foreground/[0.03]">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.03 }}>
            <img src={landingLogo} alt="TradeBook" className="h-8 object-contain" />
          </motion.div>
          <div className="hidden md:flex items-center gap-0.5 text-sm text-muted-foreground">
            {["Features", "Pricing", "Docs"].map((item) => (
              <motion.a key={item} href={item === "Docs" ? "/docs" : `#${item.toLowerCase()}`} className="px-3.5 py-1.5 rounded-full hover:bg-muted/60 hover:text-foreground transition-colors duration-200 text-[13px] font-medium" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{item}</motion.a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation menu">
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden sm:inline-flex text-muted-foreground hover:text-foreground text-[13px] h-8 px-3 rounded-full">Sign In</Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Button size="sm" onClick={() => navigate("/login?mode=signup")} className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-4 h-8 text-[13px] font-semibold shadow-[0_4px_12px_hsl(var(--tb-accent)/0.25)]">Get Started</Button>
            </motion.div>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2 }} className="md:hidden mt-2 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-lg p-4 space-y-1">
              {[{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "Docs", href: "/docs" }, { label: "FAQ", href: "#faq" }].map((item) => (
                <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">{item.label}</a>
              ))}
              <div className="pt-2 border-t border-border/30 mt-2"><Button variant="ghost" className="w-full justify-center rounded-xl text-sm" onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}>Sign In</Button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Trust Strip + Stats ───────────────────────────── */}
      <section className="py-20 bg-muted/10 dot-pattern" aria-label="Trust and statistics">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-[0.18em] font-semibold mb-8">Trusted by 1,200+ traders across Indian markets</p>
          <div className="flex items-center justify-center gap-12 sm:gap-20 flex-wrap">
            {[{ name: "NSE", icon: Activity }, { name: "BSE", icon: BarChart3 }, { name: "MCX", icon: PieChart }, { name: "Dhan", icon: Zap }, { name: "Telegram", icon: Send }].map((l) => (
              <motion.div key={l.name} className="flex items-center gap-2.5 text-muted-foreground/70 hover:text-muted-foreground transition-colors duration-300" whileHover={{ scale: 1.06 }}>
                <l.icon className="w-4.5 h-4.5" /><span className="text-sm font-semibold tracking-wide">{l.name}</span>
              </motion.div>
            ))}
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--tb-accent)/0.2)] to-transparent my-10" />
          <div className="flex items-center justify-center gap-10 sm:gap-20 flex-wrap">
            {[{ ref: s3.ref, value: s3.count, suffix: "", label: "Market Segments" }, { ref: s4.ref, value: s4.count, suffix: "+", label: "Analytics Metrics" }, { ref: s5.ref, value: s5.count, suffix: "+", label: "Trades Tracked" }].map((stat) => (
              <div key={stat.label} className="text-center"><div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[hsl(var(--tb-accent))]" ref={stat.ref}>{stat.value}{stat.suffix}</div><div className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] mt-1.5 font-medium">{stat.label}</div></div>
            ))}
            <div className="text-center"><div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[hsl(var(--tb-accent))]">24/7</div><div className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] mt-1.5 font-medium">Cloud Access</div></div>
          </div>
        </div>
      </section>

      <GradientDivider />

      {/* ── Features Bento Grid ──────────────────────────── */}
      <section id="features" className="py-24 lg:py-32" aria-label="Features">
        <MotionSection className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <SectionBadge>Features</SectionBadge>
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight">Get your{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>money's</span>{" "}worth</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">From journaling to automation — tools designed by traders, for traders.</p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5">
            {features.map((f, i) => {
              const previewMap: Record<string, React.ReactNode> = { journal: <JournalMiniPreview />, analytics: <AnalyticsMiniPreview />, alerts: <AlertMiniPreview />, ai: <AIInsightsMiniPreview />, watchlist: <WatchlistMiniPreview />, rules: <RulesEngineMiniPreview />, telegram: <TelegramMiniPreview />, sizing: <PositionSizingMiniPreview />, csv: <CSVImportMiniPreview /> };
              return (
                <motion.div key={f.title} variants={fadeUp} custom={i * 0.04} className={cn(f.large ? "md:col-span-4" : "md:col-span-2")}>
                  <motion.div className="group rounded-2xl border border-border/40 bg-card/80 p-6 sm:p-7 h-full relative overflow-hidden" whileHover={{ y: -4, borderColor: "hsl(var(--tb-accent) / 0.3)" }} transition={{ duration: 0.3, ease: "easeOut" }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--tb-accent)/0.02)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                      <motion.div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${f.color.replace(")", " / 0.08)")}` }} whileHover={{ scale: 1.08, rotate: 3 }}>
                        <f.icon className="w-5 h-5" style={{ color: f.color }} />
                      </motion.div>
                      <h3 className="text-lg font-bold mb-1.5">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                      {f.previewKey && previewMap[f.previewKey]}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </MotionSection>
      </section>

      <GradientDivider />

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-muted/10 dot-pattern" aria-label="How it works">
        <MotionSection className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <SectionBadge>How It Works</SectionBadge>
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-5 leading-tight">Three steps to{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>mastery</span></h2>
            <p className="text-muted-foreground max-w-md mx-auto text-base">From first trade to edge mastery — in minutes.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} custom={i * 0.1} className="relative">
                {i < steps.length - 1 && (<div className="hidden md:flex absolute top-16 -right-5 z-10 w-10 items-center justify-center"><ChevronRight className="w-5 h-5 text-[hsl(var(--tb-accent))] opacity-40" /></div>)}
                <motion.div className="relative rounded-2xl border border-border/40 bg-card p-8 h-full text-center overflow-hidden" whileHover={{ y: -3, borderColor: "hsl(var(--tb-accent) / 0.25)" }}>
                  <div className="absolute top-2 right-4 text-7xl font-black text-[hsl(var(--tb-accent))] opacity-[0.07] select-none">{item.step}</div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--tb-accent))] mb-3">Step {item.step}</p>
                  <motion.div className="w-14 h-14 rounded-2xl bg-[hsl(var(--tb-accent)/0.06)] ring-4 ring-[hsl(var(--tb-accent)/0.04)] flex items-center justify-center mx-auto mb-6" whileHover={{ scale: 1.08, rotate: -3 }}>
                    <item.icon className="w-6 h-6 text-[hsl(var(--tb-accent))]" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <motion.div variants={fadeUp} className="text-center mt-14">
            <p className="text-muted-foreground mb-5">Ready to start? It takes less than 60 seconds.</p>
            <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button size="lg" className="h-12 px-8 gap-2 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-[0_4px_16px_hsl(var(--tb-accent)/0.25)] font-semibold" onClick={() => navigate("/login?mode=signup")}>Create Free Account <ArrowRight className="w-4 h-4" /></Button>
            </motion.div>
          </motion.div>
        </MotionSection>
      </section>

      <GradientDivider />

      {/* ── Comparison Table ─────────────────────────────── */}
      <section className="py-24 lg:py-32" aria-label="Comparison">
        <MotionSection className="max-w-3xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <SectionBadge>Comparison</SectionBadge>
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-5 leading-tight">Why{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>TradeBook</span>?</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-base">See how we compare to generic trading journals.</p>
          </motion.div>
          <motion.div variants={fadeUp} className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 gap-0 border-b border-border/40 px-6 py-5 bg-muted/30">
              <span className="text-base font-semibold text-foreground">Feature</span>
              <span className="text-sm font-bold text-center text-[hsl(var(--tb-accent))] flex items-center justify-center gap-1.5"><Trophy className="w-4 h-4" />TradeBook</span>
              <span className="text-sm font-medium text-center text-muted-foreground/70">Others</span>
            </div>
            {comparisonFeatures.map((row, i) => (
              <motion.div key={row.feature} variants={fadeUp} custom={i * 0.05} className={cn("grid grid-cols-3 gap-0 border-b border-border/20 last:border-0 px-6 py-4 transition-colors duration-200 hover:bg-[hsl(var(--tb-accent)/0.04)]", i % 2 === 0 ? "bg-muted/10" : "")}>
                <span className="text-base text-foreground/90">{row.feature}</span>
                <div className="flex justify-center">{row.tradebook === true ? <CheckCircle2 className="w-5 h-5 text-profit drop-shadow-[0_0_4px_rgba(34,197,94,0.3)]" /> : <span className="text-sm text-muted-foreground">{String(row.tradebook)}</span>}</div>
                <div className="flex justify-center">{row.others === true ? <CheckCircle2 className="w-5 h-5 text-muted-foreground/40" /> : row.others === false ? <Minus className="w-5 h-5 text-muted-foreground/30" /> : <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">{String(row.others)}</span>}</div>
              </motion.div>
            ))}
            <div className="flex items-center justify-between px-6 py-4 bg-[hsl(var(--tb-accent)/0.06)] border-t border-border/30">
              <p className="text-sm text-muted-foreground">All features included in <span className="font-semibold text-foreground">free beta</span></p>
              <Button size="sm" className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white" onClick={() => navigate("/login?mode=signup")}>Start Free <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </motion.div>
        </MotionSection>
      </section>

      <GradientDivider />

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-24 lg:py-32 bg-muted/10 dot-pattern" aria-label="Pricing">
        <MotionSection className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <SectionBadge>Pricing</SectionBadge>
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-5 leading-tight">Simple,{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>transparent</span>{" "}pricing</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-base">One plan. All features. Pick your billing cycle.</p>
          </motion.div>
          <motion.div variants={fadeUp} className="flex justify-center mb-12">
            <div className="inline-flex items-center bg-muted/50 rounded-full p-1 gap-0.5">
              <button className="px-5 py-2 rounded-full text-sm font-medium bg-card shadow-sm text-foreground transition-colors">Monthly</button>
              <button className="px-5 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Annual</button>
            </div>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-7 items-start">
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.name} variants={fadeUp} custom={i * 0.1}>
                <motion.div className={cn("rounded-2xl border bg-card/80 p-8 flex flex-col relative overflow-hidden", plan.highlighted ? "border-[hsl(var(--tb-accent)/0.35)] ring-1 ring-[hsl(var(--tb-accent)/0.1)] scale-[1.02] lg:scale-105 shadow-glow shimmer-cta dot-pattern" : "border-border/40")} whileHover={{ y: -3 }} transition={{ duration: 0.3 }}>
                  {plan.highlighted && <div className="absolute top-0 left-0 right-0 h-0.5 bg-[hsl(var(--tb-accent))]" />}
                  {plan.badge && <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))] text-xs font-semibold mb-5">{plan.badgeIcon && <plan.badgeIcon className="w-3 h-3" />} {plan.badge}</div>}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.isBeta && <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-profit/10 text-profit text-[11px] font-semibold mt-2">Free During Beta</div>}
                  <div className="mt-4 mb-1 flex items-baseline gap-1 flex-wrap">
                    {plan.originalPrice && <span className="text-lg text-muted-foreground/50 line-through mr-1">{plan.originalPrice}</span>}
                    <span className="text-4xl font-extrabold font-mono">{plan.price}</span>
                    <span className="text-muted-foreground/70 text-sm">{plan.period}</span>
                    {plan.saveBadge && <span className="ml-2 px-2 py-0.5 rounded-full bg-profit/10 text-profit text-[10px] font-bold">{plan.saveBadge}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-7">{plan.description}</p>
                  <ul className="space-y-3.5 flex-1 mb-4">
                    {plan.features.map((f) => (<li key={f} className="flex items-start gap-2.5 text-sm"><CheckCircle2 className="w-4 h-4 text-[hsl(var(--tb-accent))] shrink-0 mt-0.5" /><span>{f}</span></li>))}
                  </ul>
                  {plan.showAllNote && <p className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[hsl(var(--tb-accent))]" /> All features included</p>}
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={!plan.showAllNote ? "mt-5" : ""}>
                    <Button className={cn("w-full h-12 rounded-full text-base", plan.highlighted ? "bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white shadow-[0_4px_12px_hsl(var(--tb-accent)/0.25)]" : "")} variant={plan.highlighted ? "default" : "outline"} onClick={() => navigate("/login?mode=signup")}>{plan.cta}{plan.highlighted && <ArrowRight className="w-4 h-4 ml-1" />}</Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 mt-14">
            {[{ icon: Lock, text: "No credit card required" }, { icon: RefreshCw, text: "Cancel anytime" }, { icon: Shield, text: "14-day money-back guarantee" }].map((item) => (
              <div key={item.text} className="flex items-center gap-2 bg-muted/40 rounded-full px-4 py-2 text-sm text-muted-foreground"><item.icon className="w-3.5 h-3.5" /><span>{item.text}</span></div>
            ))}
          </motion.div>
        </MotionSection>
      </section>

      <GradientDivider />

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-24 lg:py-32" aria-label="Testimonials">
        <MotionSection className="max-w-6xl mx-auto px-6 lg:px-10">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <SectionBadge>Testimonials</SectionBadge>
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-5 leading-tight">Trusted by{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>real traders</span></h2>
            <p className="text-muted-foreground max-w-md mx-auto text-base">Here's what traders across India are saying.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-7">
            {/* Featured card 1 */}
            <motion.div variants={fadeUp} className="md:col-span-2">
              <motion.div className="rounded-2xl border border-foreground/10 bg-foreground text-background p-9 h-full flex flex-col dot-pattern relative overflow-hidden" whileHover={{ y: -3 }}>
                <Quote className="w-10 h-10 text-background/15 mb-7" />
                <p className="text-lg leading-relaxed flex-1 mb-7 font-medium">"{testimonials[0].quote.split(testimonials[0].highlight).map((part, i, arr) => (<React.Fragment key={i}>{part}{i < arr.length - 1 && <span className="text-[hsl(var(--tb-accent))] font-bold">{testimonials[0].highlight}</span>}</React.Fragment>))}"</p>
                <div className="flex items-center gap-1.5 mb-5">{[...Array(testimonials[0].stars)].map((_, j) => (<Star key={j} className="w-4 h-4 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))]" />))}</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--tb-accent)/0.2)] flex items-center justify-center text-sm font-bold text-[hsl(var(--tb-accent))]">{testimonials[0].avatar}</div>
                  <div><p className="font-semibold">{testimonials[0].name}</p><p className="text-sm text-background/50">{testimonials[0].role}</p><span className="inline-block mt-1 bg-[hsl(var(--tb-accent)/0.15)] text-[hsl(var(--tb-accent))] rounded-full px-2 py-0.5 text-[10px] font-semibold">{testimonials[0].style}</span></div>
                </div>
              </motion.div>
            </motion.div>

            {/* Regular cards */}
            <div className="space-y-7">
              {[1, 2].map((idx) => (
                <motion.div key={idx} variants={fadeUp} custom={idx * 0.1}>
                  <motion.div className="rounded-2xl border border-border/40 bg-card p-7 h-full flex flex-col" whileHover={{ y: -3, borderColor: "hsl(var(--tb-accent) / 0.25)" }}>
                    <Quote className="w-6 h-6 text-[hsl(var(--tb-accent)/0.15)] mb-4" />
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">"{testimonials[idx].quote.split(testimonials[idx].highlight).map((part, i, arr) => (<React.Fragment key={i}>{part}{i < arr.length - 1 && <span className="text-[hsl(var(--tb-accent))] font-semibold">{testimonials[idx].highlight}</span>}</React.Fragment>))}"</p>
                    <div className="flex items-center gap-1 mb-3">{[...Array(testimonials[idx].stars)].map((_, j) => (<Star key={j} className="w-3 h-3 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))]" />))}</div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[hsl(var(--tb-accent)/0.08)] flex items-center justify-center text-xs font-bold text-[hsl(var(--tb-accent))]">{testimonials[idx].avatar}</div>
                      <div><p className="text-sm font-semibold">{testimonials[idx].name}</p><p className="text-xs text-muted-foreground/60">{testimonials[idx].role}</p></div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Featured card 2 + small card */}
          <div className="grid md:grid-cols-3 gap-7 mt-7">
            <motion.div variants={fadeUp} custom={0.2}>
              <motion.div className="rounded-2xl border border-border/40 bg-card p-7 h-full flex flex-col" whileHover={{ y: -3, borderColor: "hsl(var(--tb-accent) / 0.25)" }}>
                <Quote className="w-6 h-6 text-[hsl(var(--tb-accent)/0.15)] mb-4" />
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">"{testimonials[3].quote.split(testimonials[3].highlight).map((part, i, arr) => (<React.Fragment key={i}>{part}{i < arr.length - 1 && <span className="text-[hsl(var(--tb-accent))] font-semibold">{testimonials[3].highlight}</span>}</React.Fragment>))}"</p>
                <div className="flex items-center gap-1 mb-3">{[...Array(testimonials[3].stars)].map((_, j) => (<Star key={j} className="w-3 h-3 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))]" />))}</div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--tb-accent)/0.08)] flex items-center justify-center text-xs font-bold text-[hsl(var(--tb-accent))]">{testimonials[3].avatar}</div>
                  <div><p className="text-sm font-semibold">{testimonials[3].name}</p><p className="text-xs text-muted-foreground/60">{testimonials[3].role}</p></div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeUp} custom={0.3} className="md:col-span-2">
              <motion.div className="rounded-2xl border border-foreground/10 bg-foreground text-background p-9 h-full flex flex-col dot-pattern relative overflow-hidden" whileHover={{ y: -3 }}>
                <Quote className="w-10 h-10 text-background/15 mb-7" />
                <p className="text-lg leading-relaxed flex-1 mb-7 font-medium">"{testimonials[3].quote.split(testimonials[3].highlight).map((part, i, arr) => (<React.Fragment key={i}>{part}{i < arr.length - 1 && <span className="text-[hsl(var(--tb-accent))] font-bold">{testimonials[3].highlight}</span>}</React.Fragment>))}"</p>
                <div className="flex items-center gap-1.5 mb-5">{[...Array(testimonials[3].stars)].map((_, j) => (<Star key={j} className="w-4 h-4 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))]" />))}</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--tb-accent)/0.2)] flex items-center justify-center text-sm font-bold text-[hsl(var(--tb-accent))]">{testimonials[3].avatar}</div>
                  <div><p className="font-semibold">{testimonials[3].name}</p><p className="text-sm text-background/50">{testimonials[3].role}</p><span className="inline-block mt-1 bg-[hsl(var(--tb-accent)/0.15)] text-[hsl(var(--tb-accent))] rounded-full px-2 py-0.5 text-[10px] font-semibold">{testimonials[3].style}</span></div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* 5th testimonial */}
          <motion.div variants={fadeUp} custom={0.4} className="mt-7">
            <motion.div className="rounded-2xl border border-[hsl(var(--tb-accent)/0.2)] bg-[hsl(var(--tb-accent)/0.04)] p-7 flex flex-col md:flex-row md:items-center gap-6" whileHover={{ y: -2, borderColor: "hsl(var(--tb-accent) / 0.4)" }}>
              <Quote className="w-7 h-7 text-[hsl(var(--tb-accent)/0.2)] shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{testimonials[4].quote.split(testimonials[4].highlight).map((part, i, arr) => (<React.Fragment key={i}>{part}{i < arr.length - 1 && <span className="text-[hsl(var(--tb-accent))] font-semibold">{testimonials[4].highlight}</span>}</React.Fragment>))}"</p>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 mr-2">{[...Array(testimonials[4].stars)].map((_, j) => (<Star key={j} className="w-3.5 h-3.5 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))]" />))}</div>
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--tb-accent)/0.08)] flex items-center justify-center text-xs font-bold text-[hsl(var(--tb-accent))]">{testimonials[4].avatar}</div>
                <div><p className="text-sm font-semibold">{testimonials[4].name}</p><p className="text-xs text-muted-foreground/60">{testimonials[4].role}</p><span className="inline-block mt-0.5 bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))] rounded-full px-2 py-0.5 text-[10px] font-semibold">{testimonials[4].style}</span></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats strip */}
          <motion.div variants={fadeUp} className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-muted/40 rounded-full px-4 py-2 text-sm font-medium"><span className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} className="w-3 h-3 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))]" />))}</span>4.9/5 average rating</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="inline-flex items-center gap-1.5 bg-muted/40 rounded-full px-4 py-2 text-sm font-medium">1,200+ active traders</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="inline-flex items-center gap-1.5 bg-muted/40 rounded-full px-4 py-2 text-sm font-medium">42,000+ trades tracked</span>
          </motion.div>
        </MotionSection>
      </section>

      <GradientDivider />

      {/* ── Built for Indian Markets ────────────────────── */}
      <section className="py-24 lg:py-32 bg-muted/10 dot-pattern" aria-label="Built for Indian markets">
        <MotionSection className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <motion.div variants={fadeUp}>
              <SectionBadge>Made in India</SectionBadge>
              <h2 className="text-4xl lg:text-6xl font-extrabold mb-5 leading-tight">Built for{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>Indian</span>{" "}markets</h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">Unlike generic journals, TradeBook understands Indian market structure — segments, lot sizes, INR formatting, and market hours (9:15 AM – 3:30 PM).</p>
              <ul className="space-y-2.5 mb-8">
                {["NSE, BSE & MCX exchange support", "INR currency with Indian numbering (Lakhs, Crores)", "Dhan broker integration for auto-sync", "Indian market hours & holiday awareness"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm rounded-lg bg-muted/5 px-3 py-2.5 group hover:bg-muted/15 transition-colors cursor-default">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(var(--tb-accent))] shrink-0" /><span className="flex-1">{item}</span><ChevronRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors" />
                  </li>
                ))}
              </ul>
              <Button size="lg" className="rounded-full bg-gradient-primary text-primary-foreground" onClick={() => navigate("/login?mode=signup")}>Start Journaling <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </motion.div>
            <motion.div variants={fadeUp} custom={0.15}>
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="h-[3px] flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#128807]" /></div>
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-foreground mb-4">Market Segments</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[{ label: "Equity", color: "hsl(152 60% 42%)", Icon: TrendingUp }, { label: "F&O", color: "hsl(24 90% 55%)", Icon: Layers }, { label: "Commodity", color: "hsl(45 90% 50%)", Icon: CandlestickChart }, { label: "Currency", color: "hsl(210 80% 55%)", Icon: Globe }, { label: "Intraday", color: "hsl(340 75% 55%)", Icon: Zap }, { label: "Positional", color: "hsl(270 60% 55%)", Icon: Clock }].map((seg) => (
                      <motion.div key={seg.label} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border/40 bg-card text-sm font-semibold cursor-default transition-colors" style={{ borderColor: `${seg.color.replace(")", " / 0.25)")}` }} whileHover={{ backgroundColor: `${seg.color.replace(")", " / 0.08)")}`, scale: 1.03 }}>
                        <seg.Icon className="w-3.5 h-3.5 shrink-0" style={{ color: seg.color }} /><span style={{ color: seg.color }}>{seg.label}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-profit" /></span>
                    <span>Market Open — 09:15 AM to 03:30 PM IST</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </MotionSection>
      </section>

      <GradientDivider />

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="py-24 lg:py-32 bg-muted/10 dot-pattern" aria-label="Frequently asked questions">
        <MotionSection className="max-w-4xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <SectionBadge>FAQ</SectionBadge>
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-4 leading-tight">Got{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>questions</span>?</h2>
            <p className="text-muted-foreground text-base">Everything you need to know about TradeBook</p>
          </motion.div>
          <motion.div variants={fadeUp}>
            {(() => {
              const faqs = [
                { q: "Is my data safe?", a: "Absolutely. All data is encrypted at rest and in transit with bank-grade security. We never share or sell your trading data to anyone." },
                { q: "Can I import from Zerodha, Angel One, or other brokers?", a: "Yes! Our CSV import supports all major Indian brokers. Simply export your trade history as CSV and import it into TradeBook with automatic column mapping." },
                { q: "Is it really free during beta?", a: "Yes — all features are completely free during the beta period. No credit card required. We'll notify you before any pricing changes." },
                { q: "Does it work on mobile?", a: "TradeBook is a Progressive Web App (PWA) that works beautifully on any device — phone, tablet, or desktop. Install it on your home screen for a native app experience." },
                { q: "How is TradeBook different from a spreadsheet?", a: "Unlike spreadsheets, TradeBook offers automated analytics, segment-level breakdowns, trailing stop loss tracking, real-time alerts, and AI-powered insights — all purpose-built for Indian market traders." },
                { q: "What broker integrations are supported?", a: "Currently Dhan is supported with live sync for real-time portfolio tracking. For all other brokers — Zerodha, Angel One, Groww, Upstox, and more — you can import trades via CSV with smart column mapping." },
                { q: "Can I track F&O and multi-leg strategies?", a: "Yes! Full options support with multi-leg strategies, strategy-level P&L tracking, and segment-wise breakdowns for Futures, Options, and Commodities." },
                { q: "Do you have AI-powered insights?", a: "Yes — AI analyzes your trading patterns, identifies recurring mistakes, highlights your best setups, and suggests actionable improvements to sharpen your edge." },
                { q: "Can I set alerts and notifications?", a: "Set price alerts, percentage-change alerts, and volume spike alerts. Get notified via in-app notifications or Telegram for real-time monitoring." },
                { q: "Is there a trading rules checklist?", a: "Yes! Create custom pre-trade checklists to enforce discipline. Review your rules before every trade and track how often you follow them." },
              ];
              const left = faqs.slice(0, 5);
              const right = faqs.slice(5);
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
                  <Accordion type="single" collapsible className="space-y-3">
                    {left.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-l-${i}`} className="rounded-xl border border-border/40 bg-card/80 px-5 data-[state=open]:border-l-2 data-[state=open]:border-l-[hsl(var(--tb-accent))] data-[state=open]:border-[hsl(var(--tb-accent)/0.25)]">
                        <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-4"><span className="flex items-center gap-3"><span className="text-[10px] font-mono text-muted-foreground/60">{String(i + 1).padStart(2, "0")}</span>{faq.q}</span></AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-8">{faq.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <Accordion type="single" collapsible className="space-y-3">
                    {right.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-r-${i}`} className="rounded-xl border border-border/40 bg-card/80 px-5 data-[state=open]:border-l-2 data-[state=open]:border-l-[hsl(var(--tb-accent))] data-[state=open]:border-[hsl(var(--tb-accent)/0.25)]">
                        <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-4"><span className="flex items-center gap-3"><span className="text-[10px] font-mono text-muted-foreground/60">{String(i + 6).padStart(2, "0")}</span>{faq.q}</span></AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-8">{faq.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })()}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-14">
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-[hsl(var(--tb-accent)/0.4)] via-border/30 to-[hsl(var(--tb-accent)/0.4)]">
              <div className="rounded-2xl bg-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><BookOpen className="w-5 h-5 text-[hsl(var(--tb-accent))]" />Want to dive deeper?</h3>
                  <p className="text-sm text-muted-foreground mb-3">Explore our comprehensive documentation with visual guides</p>
                  <div className="flex flex-wrap gap-2">
                    {["Getting Started", "Trade Management", "Analytics", "AI Insights", "Alerts & Notifications"].map(tag => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider font-medium bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
                <Button onClick={() => navigate("/docs")} className="gap-2 shrink-0"><BookOpen className="w-4 h-4" />Browse Documentation</Button>
              </div>
            </div>
          </motion.div>
        </MotionSection>
      </section>

      <GradientDivider />

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-28 lg:py-36 relative overflow-hidden" aria-label="Call to action">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.12)_0%,transparent_60%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.04)_0%,transparent_70%)]" />
        </div>
        <MotionSection className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["bg-[hsl(var(--tb-accent))]", "bg-[hsl(var(--profit))]", "bg-[hsl(var(--ring))]"].map((bg, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full ${bg} border-2 border-background`} />
                ))}
              </div>
              <span className="text-sm font-semibold">1,200+ traders</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold"><BarChart3 className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />42,000+ trades logged</div>
          </motion.div>
          <motion.div variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="mb-7">
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-extrabold leading-tight">Stop losing money to</motion.h2>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-extrabold leading-tight"><span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>undisciplined</span>{" "}trading</motion.h2>
          </motion.div>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">Join 1,200+ traders who journal, analyze, and compound their edge — every single day.</motion.p>
          <motion.div variants={fadeUp} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Button size="lg" className="shimmer-cta h-14 px-12 text-base gap-2.5 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-[0_6px_24px_hsl(var(--tb-accent)/0.3)] font-semibold" onClick={() => navigate("/login?mode=signup")}>Get Started — It's Free <ArrowRight className="w-4 h-4" aria-hidden="true" /></Button>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5"><Lock className="w-3 h-3" /> Bank-grade encryption</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5"><Shield className="w-3 h-3" /> No credit card required</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5"><Clock className="w-3 h-3" /> Setup in 2 minutes</span>
          </motion.div>
        </MotionSection>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--tb-accent)/0.3)] to-transparent max-w-md mx-auto mt-16" />
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border/30 bg-card/50 dot-pattern py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5"><img src={landingLogo} alt="TradeBook" className="h-8 object-contain" /></div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">The trading journal built for Indian markets. Track, analyze, and improve.</p>
              <div className="flex items-center gap-2">
                <a href="/login?mode=signup" className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[hsl(var(--tb-accent))] text-white rounded-full px-4 py-1.5 hover:bg-[hsl(var(--tb-accent-hover))] transition-colors">Get Started <ArrowRight className="w-3 h-3" /></a>
                <ThemeToggle />
              </div>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.1em] font-bold text-muted-foreground/60 mb-5">Product</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><a href="#features" className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="/docs" className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.1em] font-bold text-muted-foreground/60 mb-5">Support</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><a href="mailto:founder@mrchartist.com" className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="/docs" className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#faq" className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.1em] font-bold text-muted-foreground/60 mb-5">Legal</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><a href="/privacy" className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--tb-accent)/0.25)] to-transparent mb-7" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5">© {new Date().getFullYear()} TradeBook. All rights reserved. <span className="inline-flex items-center gap-1">Made with ❤️ in <span className="inline-flex gap-[2px]"><span className="w-1.5 h-1.5 rounded-full bg-[#FF9933]" /><span className="w-1.5 h-1.5 rounded-full bg-white border border-border/40" /><span className="w-1.5 h-1.5 rounded-full bg-[#138808]" /></span> India</span></p>
            <span className="text-[10px] text-muted-foreground/60 bg-muted/30 rounded-full px-3 py-1">Not SEBI registered · For educational purposes only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
