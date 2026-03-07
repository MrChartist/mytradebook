import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen, BarChart3, Bell, LineChart, Brain, List, Shield,
  MessageSquare, Calculator, CheckCircle2, TrendingUp,
  Lightbulb, ArrowUp, ArrowDown, Send, Filter, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer, MotionSection, SectionBadge } from "./LandingShared";

const features = [
  { icon: BookOpen, title: "Smart Journal", description: "Multi-segment trade logging with charts, tags, notes, and pattern recognition. Track every trade across Equity, F&O, and Commodities.", color: "hsl(24 90% 55%)", large: true, previewKey: "journal" },
  { icon: TrendingUp, title: "Stock Screener", description: "Screen 500+ NSE stocks with live fundamentals — P/E, ROE, market cap, technicals, and more. One-tap deep dives into any stock.", color: "hsl(152 60% 42%)", large: true, previewKey: "screener" },
  { icon: BarChart3, title: "Deep Analytics", description: "Equity curves, drawdown analysis, win-rate heatmaps, and segment breakdowns.", color: "hsl(152 60% 42%)", large: false, previewKey: "analytics" },
  { icon: Bell, title: "Real-Time Alerts", description: "Price alerts, scanner triggers, and instant Telegram notifications.", color: "hsl(210 80% 55%)", large: false, previewKey: "alerts" },
  { icon: Filter, title: "Smart Scanner", description: "Pre-built scans for Top Gainers, Losers, 52W Highs, undervalued gems, and momentum plays. Save custom filter combos.", color: "hsl(340 75% 55%)", large: false, previewKey: "scanner" },
  { icon: Brain, title: "AI Trade Insights", description: "AI-powered analysis of your trading patterns, timing blind-spots, and behavioral suggestions to sharpen your edge.", color: "hsl(270 65% 58%)", large: true, previewKey: "ai" },
  { icon: List, title: "Watchlist", description: "Multi-watchlist monitoring with live prices, change %, and custom groupings.", color: "hsl(190 75% 45%)", large: false, previewKey: "watchlist" },
  { icon: LineChart, title: "Broker Integration", description: "Connect Dhan for live prices, portfolio auto-sync, and one-click execution.", color: "hsl(45 90% 50%)", large: false, previewKey: "" },
  { icon: Shield, title: "Rules Engine", description: "Pre-trade checklists, mistake tagging, and discipline enforcement.", color: "hsl(270 60% 55%)", large: false, previewKey: "rules" },
  { icon: MessageSquare, title: "Telegram Bot", description: "Automated trade notifications, EOD reports, and morning briefings.", color: "hsl(200 85% 50%)", large: false, previewKey: "telegram" },
  { icon: Calculator, title: "Position Sizing", description: "Risk-based lot calculator with capital management and leverage warnings.", color: "hsl(160 60% 45%)", large: false, previewKey: "sizing" },
];

/* Mini Preview Components */
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

function ScreenerMiniPreview() {
  const stocks = [
    { symbol: "RELIANCE", ltp: "₹2,945.30", change: "+1.24%", pe: "28.4", up: true },
    { symbol: "TCS", ltp: "₹4,128.50", change: "+0.67%", pe: "32.1", up: true },
    { symbol: "INFY", ltp: "₹1,856.10", change: "-0.38%", pe: "26.8", up: false },
  ];
  return (
    <div className="mt-6 rounded-xl border border-border/20 bg-muted/15 overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-border/15">
        <Search className="w-3 h-3 text-muted-foreground" />
        <span className="text-[9px] text-muted-foreground">Search 500+ NSE stocks…</span>
      </div>
      <div className="divide-y divide-border/15">
        <div className="grid grid-cols-4 px-3.5 py-1.5">
          {["Stock", "LTP", "Chg%", "P/E"].map((h) => (
            <span key={h} className="text-[7px] text-muted-foreground uppercase tracking-wider font-semibold">{h}</span>
          ))}
        </div>
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

function ScannerMiniPreview() {
  const presets = ["Top Gainers", "Undervalued", "Momentum"];
  return (
    <div className="mt-5 space-y-2.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        {presets.map((p, i) => (
          <span key={p} className={cn("px-2.5 py-1 rounded-full text-[9px] font-semibold transition-colors", i === 0 ? "bg-[hsl(var(--tb-accent)/0.12)] text-[hsl(var(--tb-accent))]" : "bg-muted/40 text-muted-foreground")}>{p}</span>
        ))}
      </div>
      <div className="rounded-lg border border-border/20 bg-muted/15 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
          <span className="text-[9px] text-muted-foreground">12 results matched</span>
        </div>
        <span className="text-[8px] font-semibold text-[hsl(var(--tb-accent))]">View all →</span>
      </div>
      <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground">
        <Filter className="w-2.5 h-2.5" />Save custom filter combos for quick access
      </div>
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

const previewMap: Record<string, React.ReactNode> = {
  journal: <JournalMiniPreview />,
  analytics: <AnalyticsMiniPreview />,
  alerts: <AlertMiniPreview />,
  ai: <AIInsightsMiniPreview />,
  watchlist: <WatchlistMiniPreview />,
  rules: <RulesEngineMiniPreview />,
  telegram: <TelegramMiniPreview />,
  sizing: <PositionSizingMiniPreview />,
  screener: <ScreenerMiniPreview />,
  scanner: <ScannerMiniPreview />,
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32" aria-label="Features">
      <MotionSection className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div variants={fadeUp} className="text-center mb-20">
          <SectionBadge>Features</SectionBadge>
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-[1.1]">Get your{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>money's</span>{" "}worth</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed">From journaling to automation — tools designed by traders, for traders.</p>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} variants={fadeUp} custom={i * 0.04} className={cn(f.large ? "md:col-span-4" : "md:col-span-2")}>
              <motion.div className="group rounded-2xl border border-border/40 bg-card/80 p-7 sm:p-8 h-full relative overflow-hidden" whileHover={{ y: -4, borderColor: "hsl(var(--tb-accent) / 0.3)" }} transition={{ duration: 0.3, ease: "easeOut" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--tb-accent)/0.02)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <motion.div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${f.color.replace(")", " / 0.08)")}` }} whileHover={{ scale: 1.08, rotate: 3 }}>
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-1.5">{f.title}</h3>
                  <p className="text-[15px] text-foreground/80 leading-relaxed">{f.description}</p>
                  {f.previewKey && previewMap[f.previewKey]}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </MotionSection>
    </section>
  );
}
