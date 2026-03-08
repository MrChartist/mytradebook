import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen, BarChart3, Bell, Brain, List,
  MessageSquare, Calculator, TrendingUp,
  Lightbulb, ArrowUp, ArrowDown, Send, Filter, Search,
  CheckCircle2, Shield, Calendar, LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer, MotionSection, SectionBadge } from "./LandingShared";

/* ─── Feature Data (11 features) ──────────────────────── */
const features = [
  { icon: BookOpen, title: "Smart Journal", description: "Multi-segment trade logging with charts, tags, notes, and pattern recognition across Equity, F&O, and Commodities.", color: "hsl(24 90% 55%)", span: "large", previewKey: "journal" },
  { icon: TrendingUp, title: "Stock Screener", description: "Screen 500+ NSE stocks with live fundamentals — P/E, ROE, market cap, technicals. One-tap deep dives.", color: "hsl(152 60% 42%)", span: "large", previewKey: "screener" },
  { icon: BarChart3, title: "Deep Analytics", description: "Equity curves, drawdown analysis, win-rate heatmaps, and segment breakdowns.", color: "hsl(152 60% 42%)", span: "small", previewKey: "analytics" },
  { icon: Bell, title: "Real-Time Alerts", description: "Price alerts, scanner triggers, and instant Telegram notifications.", color: "hsl(210 80% 55%)", span: "small", previewKey: "alerts" },
  { icon: Brain, title: "AI Trade Insights", description: "AI-powered pattern analysis, timing blind-spots, and behavioral suggestions to sharpen your edge.", color: "hsl(270 65% 58%)", span: "large", previewKey: "ai" },
  { icon: Shield, title: "Rules Engine", description: "Pre-trade checklists enforce discipline. Tag mistakes, track rule adherence, and build consistency.", color: "hsl(160 55% 42%)", span: "small", previewKey: "rules" },
  { icon: Filter, title: "Smart Scanner", description: "Pre-built scans for gainers, losers, 52W highs, undervalued gems. Save custom filter combos.", color: "hsl(340 75% 55%)", span: "small", previewKey: "scanner" },
  { icon: Calendar, title: "Daily Journal & Calendar", description: "Daily mood tracking, pre/post market notes, and a P&L heatmap calendar to visualize your trading rhythm.", color: "hsl(45 85% 50%)", span: "large", previewKey: "calendar" },
  { icon: Calculator, title: "Position Sizing", description: "Risk-based lot calculator with capital management, leverage warnings, and max-risk guardrails.", color: "hsl(190 70% 45%)", span: "small", previewKey: "sizing" },
  { icon: List, title: "Watchlist", description: "Multi-watchlist monitoring with live prices, change %, and custom groupings.", color: "hsl(190 75% 45%)", span: "small", previewKey: "watchlist" },
  { icon: LineChart, title: "Broker Integration", description: "Connect Dhan for live prices, portfolio auto-sync, and one-click execution from your journal.", color: "hsl(24 80% 50%)", span: "small", previewKey: "" },
  { icon: MessageSquare, title: "Telegram Bot", description: "Automated trade notifications, EOD reports, and morning briefings straight to your phone.", color: "hsl(200 85% 50%)", span: "small", previewKey: "telegram" },
];

/* ─── Mini Preview Components ─────────────────────────── */
function JournalMiniPreview() {
  return (
    <div className="mt-6 rounded-xl border border-border/10 bg-muted/5 p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {["Breakout", "High Vol", "Swing"].map((tag) => (
          <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[10px] font-semibold">{tag}</span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{ label: "Win Rate", value: "68%" }, { label: "Avg Win", value: "₹12,450" }, { label: "P. Factor", value: "2.14" }].map((m) => (
          <div key={m.label} className="rounded-lg bg-card/60 border border-border/10 p-2 text-center">
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            <p className="text-xs font-bold font-mono text-foreground">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenerMiniPreview() {
  const stocks = [
    { symbol: "RELIANCE", ltp: "₹2,945", change: "+1.24%", pe: "28.4", up: true },
    { symbol: "TCS", ltp: "₹4,128", change: "+0.67%", pe: "32.1", up: true },
    { symbol: "INFY", ltp: "₹1,856", change: "-0.38%", pe: "26.8", up: false },
  ];
  return (
    <div className="mt-6 rounded-xl border border-border/10 bg-muted/5 overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-border/8">
        <Search className="w-3 h-3 text-muted-foreground" />
        <span className="text-[9px] text-muted-foreground">Search 500+ NSE stocks…</span>
      </div>
      <div className="divide-y divide-border/8">
        {stocks.map((s) => (
          <div key={s.symbol} className="grid grid-cols-4 items-center px-3.5 py-2">
            <span className="text-[10px] font-semibold text-foreground">{s.symbol}</span>
            <span className="text-[10px] font-mono text-muted-foreground">{s.ltp}</span>
            <span className={cn("text-[9px] font-mono font-semibold flex items-center gap-0.5", s.up ? "text-profit" : "text-loss")}>
              {s.up ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}{s.change}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground">{s.pe}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsMiniPreview() {
  return (
    <div className="mt-5 rounded-lg border border-border/10 bg-muted/5 p-3">
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

function AlertMiniPreview() {
  return (
    <div className="mt-5 space-y-2">
      {[{ symbol: "NIFTY", condition: "Price > 24,300", status: "Active", active: true }, { symbol: "RELIANCE", condition: "% Change > 3%", status: "Triggered", active: false }].map((alert) => (
        <div key={alert.symbol} className="flex items-center gap-2.5 rounded-lg border border-border/10 bg-muted/5 px-3 py-2">
          <div className={cn("w-1.5 h-1.5 rounded-full", alert.active ? "bg-profit animate-pulse" : "bg-primary")} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold">{alert.symbol}</p>
            <p className="text-[8px] text-muted-foreground">{alert.condition}</p>
          </div>
          <span className={cn("text-[8px] font-semibold px-2 py-0.5 rounded-full", alert.active ? "bg-profit/10 text-profit" : "bg-primary/10 text-primary")}>{alert.status}</span>
        </div>
      ))}
    </div>
  );
}

function AIInsightsMiniPreview() {
  return (
    <div className="mt-6 space-y-2.5">
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/10 bg-amber-500/[0.03] px-3.5 py-3">
        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /></div>
        <div><p className="text-[11px] font-semibold text-foreground leading-snug">Win rate drops 23% after 2 PM</p><p className="text-[9px] text-muted-foreground mt-0.5">Consider limiting afternoon trades to high-conviction setups only.</p></div>
      </div>
      <div className="flex items-start gap-2.5 rounded-lg border border-profit/10 bg-profit/[0.03] px-3.5 py-3">
        <div className="w-6 h-6 rounded-lg bg-profit/10 flex items-center justify-center shrink-0 mt-0.5"><TrendingUp className="w-3.5 h-3.5 text-profit" /></div>
        <div><p className="text-[11px] font-semibold text-foreground leading-snug">Breakout setups: 78% win rate</p><p className="text-[9px] text-muted-foreground mt-0.5">Your best performing pattern across all segments.</p></div>
      </div>
    </div>
  );
}

function RulesMiniPreview() {
  return (
    <div className="mt-5 space-y-2">
      {[{ rule: "Check market trend", done: true }, { rule: "Set stop loss ≤ 2%", done: true }, { rule: "Max 3 trades/day", done: false }].map((r) => (
        <div key={r.rule} className="flex items-center gap-2.5 rounded-lg border border-border/10 bg-muted/5 px-3 py-2">
          <div className={cn("w-4 h-4 rounded border flex items-center justify-center", r.done ? "bg-profit/10 border-profit/30" : "border-border/30")}>
            {r.done && <CheckCircle2 className="w-3 h-3 text-profit" />}
          </div>
          <span className={cn("text-[10px]", r.done ? "text-muted-foreground line-through" : "text-foreground")}>{r.rule}</span>
        </div>
      ))}
    </div>
  );
}

function CalendarMiniPreview() {
  const days = [
    { day: "Mon", pnl: "+₹2.4k", mood: "😊", positive: true },
    { day: "Tue", pnl: "-₹800", mood: "😤", positive: false },
    { day: "Wed", pnl: "+₹5.1k", mood: "🔥", positive: true },
    { day: "Thu", pnl: "+₹1.2k", mood: "😊", positive: true },
    { day: "Fri", pnl: "—", mood: "📝", positive: null },
  ];
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">This Week</span>
        <span className="text-[10px] font-bold text-profit font-mono">+₹7,900</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {days.map((d) => (
          <div key={d.day} className={cn("rounded-lg border p-2 text-center", d.positive === true ? "border-profit/15 bg-profit/[0.03]" : d.positive === false ? "border-loss/15 bg-loss/[0.03]" : "border-border/10 bg-muted/5")}>
            <p className="text-[8px] text-muted-foreground uppercase mb-1">{d.day}</p>
            <p className="text-base mb-0.5">{d.mood}</p>
            <p className={cn("text-[9px] font-mono font-semibold", d.positive === true ? "text-profit" : d.positive === false ? "text-loss" : "text-muted-foreground")}>{d.pnl}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-[8px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-profit/20" /> Profit day</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-loss/20" /> Loss day</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-muted/30" /> No trades</span>
      </div>
    </div>
  );
}

function ScannerMiniPreview() {
  return (
    <div className="mt-5 space-y-2.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        {["Top Gainers", "Undervalued", "Momentum"].map((p, i) => (
          <span key={p} className={cn("px-2.5 py-1 rounded-full text-[9px] font-semibold", i === 0 ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground")}>{p}</span>
        ))}
      </div>
      <div className="rounded-lg border border-border/10 bg-muted/5 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" /><span className="text-[9px] text-muted-foreground">12 results matched</span></div>
        <span className="text-[8px] font-semibold text-primary">View all →</span>
      </div>
    </div>
  );
}

function SizingMiniPreview() {
  return (
    <div className="mt-5 rounded-lg border border-border/10 bg-muted/5 p-3 space-y-2">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[{ label: "Capital", value: "₹5L" }, { label: "Risk", value: "2%" }, { label: "Lot Size", value: "3 lots" }].map((m) => (
          <div key={m.label} className="rounded-md bg-card/60 border border-border/10 py-1.5 px-1">
            <p className="text-[7px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            <p className="text-[11px] font-bold font-mono text-foreground">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground">
        <Shield className="w-2.5 h-2.5" />Max risk: ₹10,000 per trade
      </div>
    </div>
  );
}

function WatchlistMiniPreview() {
  return (
    <div className="mt-5 space-y-1.5">
      {[{ symbol: "RELIANCE", price: "₹2,945", change: "+1.24%", up: true }, { symbol: "NIFTY 50", price: "₹24,285", change: "+0.82%", up: true }, { symbol: "HDFCBANK", price: "₹1,612", change: "-0.45%", up: false }].map((t) => (
        <div key={t.symbol} className="flex items-center justify-between rounded-lg border border-border/10 bg-muted/5 px-3 py-2">
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
      <div className="rounded-lg border border-border/10 bg-muted/5 p-3">
        <div className="flex items-center gap-2 mb-1.5"><div className="w-5 h-5 rounded-full bg-[hsl(200_85%_50%/0.1)] flex items-center justify-center"><Send className="w-2.5 h-2.5 text-[hsl(200_85%_50%)]" /></div><span className="text-[9px] font-semibold text-muted-foreground">TradeBook Bot</span></div>
        <p className="text-[10px] font-mono leading-relaxed text-foreground">📊 EOD Report: <span className="text-profit font-bold">+₹12,450</span> | 5W-2L | Win Rate 71%</p>
      </div>
      <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" /><span className="text-[8px] text-muted-foreground">Auto-sends at market close</span></div>
    </div>
  );
}

const previewMap: Record<string, React.ReactNode> = {
  journal: <JournalMiniPreview />,
  screener: <ScreenerMiniPreview />,
  analytics: <AnalyticsMiniPreview />,
  alerts: <AlertMiniPreview />,
  ai: <AIInsightsMiniPreview />,
  rules: <RulesMiniPreview />,
  scanner: <ScannerMiniPreview />,
  calendar: <CalendarMiniPreview />,
  sizing: <SizingMiniPreview />,
  watchlist: <WatchlistMiniPreview />,
  telegram: <TelegramMiniPreview />,
};

/* ─── Features Section ────────────────────────────────── */
export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32" aria-label="Features">
      <MotionSection className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-20">
          <SectionBadge>Features</SectionBadge>
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight">
            Everything you need to{" "}
            <span className="accent-script">trade</span>{" "}better
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed">
            Journal, analyze, and automate — tools designed by traders, for traders.
          </p>
        </motion.div>

        {/* Bento Grid — 12 features */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {features.map((f, i) => {
            const isLarge = f.span === "large";
            return (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i * 0.04}
                className={cn(
                  isLarge ? "md:col-span-7" : "md:col-span-5",
                  /* Alternate large cards left/right */
                  i % 4 === 2 && isLarge && "md:col-start-6"
                )}
              >
                <motion.div
                  className="group rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm p-7 sm:p-8 h-full relative overflow-hidden transition-colors duration-300"
                  style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}
                  whileHover={{ y: -3, borderColor: "hsl(var(--border) / 0.5)" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Subtle hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    <motion.div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${f.color.replace(")", " / 0.08)")}` }}
                      whileHover={{ scale: 1.06 }}
                    >
                      <f.icon className="w-5 h-5" style={{ color: f.color }} />
                    </motion.div>

                    <h3 className="text-lg font-bold mb-1.5 tracking-tight">{f.title}</h3>
                    <p className="text-[15px] text-muted-foreground leading-relaxed">{f.description}</p>

                    {f.previewKey && previewMap[f.previewKey]}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </MotionSection>
    </section>
  );
}
