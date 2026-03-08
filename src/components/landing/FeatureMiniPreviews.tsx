import React from "react";
import {
  Lightbulb, ArrowUp, ArrowDown, Send, Search,
  CheckCircle2, Shield, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Journal ─────────────────────────────────────────── */
export function JournalMiniPreview() {
  const trades = [
    { symbol: "RELIANCE", type: "Long", pnl: "+₹4,200", positive: true, tags: ["Breakout"] },
    { symbol: "NIFTY 24500 CE", type: "Long", pnl: "+₹8,250", positive: true, tags: ["Momentum"] },
    { symbol: "HDFCBANK", type: "Short", pnl: "-₹1,800", positive: false, tags: ["Reversal"] },
  ];
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {["Breakout", "High Vol", "Swing"].map((tag) => (
          <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[10px] font-semibold">{tag}</span>
        ))}
      </div>
      <div className="rounded-xl border border-border/10 bg-muted/5 overflow-hidden divide-y divide-border/8">
        {trades.map((t) => (
          <div key={t.symbol} className="flex items-center justify-between px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className={cn("w-1 h-5 rounded-full", t.positive ? "bg-profit" : "bg-loss")} />
              <div>
                <p className="text-[10px] font-semibold text-foreground">{t.symbol}</p>
                <p className="text-[8px] text-muted-foreground">{t.type} · {t.tags[0]}</p>
              </div>
            </div>
            <span className={cn("text-[11px] font-bold font-mono", t.positive ? "text-profit" : "text-loss")}>{t.pnl}</span>
          </div>
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

/* ─── Screener ────────────────────────────────────────── */
export function ScreenerMiniPreview() {
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

/* ─── Analytics ───────────────────────────────────────── */
export function AnalyticsMiniPreview() {
  return (
    <div className="mt-5 rounded-lg border border-border/10 bg-muted/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-muted-foreground uppercase">This Week</span>
        <span className="text-[10px] font-bold text-profit font-mono">+12.4%</span>
      </div>
      <svg viewBox="0 0 120 30" className="w-full h-7">
        <defs>
          <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,25 C10,22 20,18 30,15 C40,12 50,20 60,14 C70,8 80,12 90,6 C100,2 110,5 120,3 L120,30 L0,30 Z" fill="url(#eq-fill)" />
        <path d="M0,25 C10,22 20,18 30,15 C40,12 50,20 60,14 C70,8 80,12 90,6 C100,2 110,5 120,3" fill="none" stroke="hsl(var(--profit))" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ─── Alerts ──────────────────────────────────────────── */
export function AlertMiniPreview() {
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

/* ─── AI Insights ─────────────────────────────────────── */
export function AIInsightsMiniPreview() {
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

/* ─── Rules Engine ────────────────────────────────────── */
export function RulesMiniPreview() {
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

/* ─── Calendar ────────────────────────────────────────── */
export function CalendarMiniPreview() {
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

/* ─── Scanner ─────────────────────────────────────────── */
export function ScannerMiniPreview() {
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

/* ─── Position Sizing ─────────────────────────────────── */
export function SizingMiniPreview() {
  return (
    <div className="mt-5 rounded-lg border border-border/10 bg-muted/5 p-3 space-y-2.5">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[{ label: "Capital", value: "₹5L" }, { label: "Risk", value: "2%" }, { label: "Lot Size", value: "3 lots" }].map((m) => (
          <div key={m.label} className="rounded-md bg-card/60 border border-border/10 py-1.5 px-1">
            <p className="text-[7px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            <p className="text-[11px] font-bold font-mono text-foreground">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-profit to-profit/60" />
      </div>
      <div className="flex items-center justify-between text-[8px] text-muted-foreground">
        <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" />Max risk: ₹10,000</span>
        <span className="text-profit font-semibold">40% utilized</span>
      </div>
    </div>
  );
}

/* ─── Watchlist ────────────────────────────────────────── */
export function WatchlistMiniPreview() {
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

/* ─── Broker Integration ──────────────────────────────── */
export function BrokerMiniPreview() {
  return (
    <div className="mt-5 space-y-2">
      <div className="flex items-center gap-2.5 rounded-lg border border-profit/15 bg-profit/[0.03] px-3 py-2.5">
        <div className="w-2 h-2 rounded-full bg-profit animate-pulse" />
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-foreground">Dhan Connected</p>
          <p className="text-[8px] text-muted-foreground">Live sync · Portfolio auto-imported</p>
        </div>
        <span className="text-[8px] font-semibold text-profit px-2 py-0.5 rounded-full bg-profit/10">Active</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[{ label: "Positions", value: "12" }, { label: "Orders Today", value: "5" }].map((m) => (
          <div key={m.label} className="rounded-md bg-muted/5 border border-border/10 py-1.5 px-2 text-center">
            <p className="text-[7px] text-muted-foreground uppercase">{m.label}</p>
            <p className="text-[11px] font-bold font-mono text-foreground">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Telegram ────────────────────────────────────────── */
export function TelegramMiniPreview() {
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

/* ─── Preview Map ─────────────────────────────────────── */
export const previewMap: Record<string, React.ReactNode> = {
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
  broker: <BrokerMiniPreview />,
  telegram: <TelegramMiniPreview />,
};
