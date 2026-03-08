import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  BarChart3, Bell, Target, TrendingUp, Flame, Wallet,
  Radio, ArrowUpRight, Trophy, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Mock Data ── */

const months = ["All", "Jan", "Feb", "Mar"];
const segments = ["All", "Intraday", "Positional", "Futures", "Options"];

const tickerItems = [
  { symbol: "RELIANCE", ltp: 2948.5, pnl: 3200, pct: 1.8 },
  { symbol: "HDFCBANK", ltp: 1645.2, pnl: -850, pct: -0.6 },
  { symbol: "NIFTY 24500 CE", ltp: 185.0, pnl: 1100, pct: 4.2 },
];

const chartBars = [
  { x: 8, h: 32, up: true }, { x: 44, h: 18, up: false }, { x: 80, h: 42, up: true },
  { x: 116, h: 28, up: true }, { x: 152, h: 12, up: false }, { x: 188, h: 48, up: true },
  { x: 224, h: 22, up: true }, { x: 260, h: 38, up: true }, { x: 296, h: 8, up: false },
  { x: 332, h: 52, up: true }, { x: 368, h: 30, up: true },
];

const alerts = [
  { sym: "RELIANCE", cond: "Price > ₹2,950", type: "Price" },
  { sym: "NIFTY", cond: "RSI < 30", type: "Technical" },
  { sym: "HDFCBANK", cond: "Price < ₹1,600", type: "Price" },
];

const positions = [
  { sym: "RELIANCE", type: "LONG", entry: 2820, ltp: 2948.5, pnl: 3200, qty: 25 },
  { sym: "HDFCBANK", type: "SHORT", entry: 1680, ltp: 1645.2, pnl: 850, qty: 50 },
  { sym: "NIFTY CE", type: "LONG", entry: 140, ltp: 185, pnl: 1100, qty: 25 },
];

const equityCurvePoints = "0,42 25,40 50,38 75,36 100,33 125,30 150,34 175,28 200,25 225,22 250,26 275,20 300,18 325,15 350,12 375,10 400,7";

/* ── Animated Counter Hook ── */
function useAnimatedValue(target: number, inView: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  const animated = useRef(false);
  useEffect(() => {
    if (!inView || animated.current) return;
    animated.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return value;
}

/* ── KPI Card Component (matches real premium-card style) ── */
function KPICard({
  label, value, sub, icon: Icon, iconColor, iconBg, colored, accent, glowClass,
}: {
  label: string; value: string; sub: string;
  icon: React.ElementType; iconColor: string; iconBg: string;
  colored?: boolean; accent?: boolean; glowClass?: string;
}) {
  return (
    <div className={cn(
      "rounded-[1rem] border border-border/20 bg-card p-2.5 sm:p-3 relative overflow-hidden transition-all hover:scale-[1.02]",
      accent && "sm:col-span-1",
      glowClass
    )} style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-profit/60 via-profit to-profit/60 rounded-t-[1rem]" />
      )}
      {accent && (
        <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-[0.04] pointer-events-none bg-profit" />
      )}
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <span className="text-[7px] sm:text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn("w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", iconColor)} />
        </div>
      </div>
      <p className={cn("text-sm sm:text-base font-bold font-mono tracking-tight leading-none", colored ? "text-profit" : "text-foreground")}>{value}</p>
      <p className="text-[6px] sm:text-[7px] font-mono mt-1 sm:mt-1.5 text-muted-foreground">{sub}</p>
    </div>
  );
}

/* ── Main DashboardTab ── */
export function DashboardTab() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const todayPnl = useAnimatedValue(12450, isInView);
  const mtdPnl = useAnimatedValue(24850, isInView);
  const openPos = useAnimatedValue(3, isInView);
  const winRate = useAnimatedValue(67.5, isInView);
  const activeAlerts = useAnimatedValue(8, isInView);

  return (
    <div ref={ref} className="min-w-0 space-y-3 sm:space-y-4">

      {/* ── Row 1: Greeting + Live status ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-sm sm:text-lg font-bold tracking-tight">
            Good morning, <span className="text-primary">Mr. Chartist</span> 👋
          </h1>
          <div className="hidden sm:flex items-center gap-2 mt-0.5">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Saturday, 8 March 2026</p>
            <span className="text-muted-foreground/30 text-[10px]">•</span>
            <div className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
              <span className="text-[9px] text-muted-foreground font-medium">Market Open</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] bg-muted/50 rounded-full px-2.5 py-1">
          <Radio className="w-2.5 h-2.5 text-profit animate-pulse" />
          <span className="text-profit font-medium">Live</span>
          <span className="text-muted-foreground">• 9:45 AM</span>
        </div>
      </div>

      {/* ── Row 2: Month + Segment filters ── */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="flex gap-0.5 bg-muted/60 rounded-full p-0.5 border border-border/30">
          {months.map((m, i) => (
            <span key={m} className={cn(
              "px-2 sm:px-2.5 py-0.5 sm:py-1 text-[7px] sm:text-[8px] font-medium rounded-full transition-colors",
              i === 3 ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            )}>{m}</span>
          ))}
        </div>
        <div className="w-px h-4 bg-border/30 hidden sm:block" />
        <div className="flex gap-1 flex-wrap">
          {segments.map((s, i) => (
            <span key={s} className={cn(
              "px-2 sm:px-3 py-0.5 sm:py-1 text-[7px] sm:text-[8px] font-medium rounded-full border transition-colors",
              i === 0
                ? "border-primary/15 bg-primary/[0.06] text-primary shadow-sm"
                : "border-border/50 text-muted-foreground"
            )}>{s}</span>
          ))}
        </div>
      </div>

      {/* ── Floating Trade Ticker ── */}
      <div className="relative overflow-hidden rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 border-r border-border/30 bg-muted/30">
            <Radio className="w-2.5 h-2.5 text-profit animate-pulse" />
            <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Open</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="ticker-scroll flex items-center gap-5 py-1.5 px-2.5 whitespace-nowrap">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <div key={`${item.symbol}-${i}`} className="inline-flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-foreground">{item.symbol}</span>
                  <span className="text-[8px] sm:text-[9px] font-mono text-muted-foreground">₹{item.ltp.toLocaleString("en-IN")}</span>
                  <span className={cn(
                    "text-[7px] sm:text-[8px] font-mono font-semibold px-1 py-0.5 rounded-full",
                    item.pnl >= 0 ? "text-profit bg-profit/10" : "text-loss bg-loss/10"
                  )}>
                    {item.pnl >= 0 ? "+" : ""}₹{item.pnl} ({item.pct >= 0 ? "+" : ""}{item.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards — 5 columns (matching real dashboard) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
        <KPICard
          label="Today's P&L" value={`+₹${Math.round(todayPnl).toLocaleString("en-IN")}`}
          sub="Real +₹8.4K · Unreal +₹4K · 2 closed"
          icon={Flame} iconColor="text-profit" iconBg="bg-profit/10"
          colored accent glowClass="card-glow-profit"
        />
        <KPICard
          label="MTD P&L" value={`+₹${Math.round(mtdPnl).toLocaleString("en-IN")}`}
          sub="Realized +₹18.2K · Unrealized +₹6.6K"
          icon={Wallet} iconColor="text-profit" iconBg="bg-profit/10"
          colored glowClass="card-glow-profit"
        />
        <KPICard
          label="Open Positions" value={String(Math.round(openPos))}
          sub="₹2.4L risk to SL · 12 total MTD"
          icon={Target} iconColor="text-primary" iconBg="bg-primary/10"
        />
        <KPICard
          label="Win Rate" value={`${winRate.toFixed(1)}%`}
          sub="W: 8 · L: 4 · Exp: +₹1.5K/trade"
          icon={TrendingUp} iconColor="text-profit" iconBg="bg-profit/10"
          colored glowClass="card-glow-profit"
        />
        <KPICard
          label="Active Alerts" value={String(Math.round(activeAlerts))}
          sub="Price: 5 · Technical: 3"
          icon={Bell} iconColor="text-primary" iconBg="bg-primary/10"
        />
      </div>

      {/* ── Chart + Alerts Row ── */}
      <div className="grid sm:grid-cols-3 gap-1.5 sm:gap-2">
        {/* Daily P&L Chart */}
        <div className="sm:col-span-2 rounded-[1rem] border border-border/20 bg-card p-2.5 sm:p-3" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-semibold">Daily P&L by Segment</p>
                <p className="text-[7px] sm:text-[8px] text-muted-foreground">Stacked by market segment</p>
              </div>
            </div>
            <div className="flex gap-1">
              {["1W", "1M", "3M"].map((r, i) => (
                <span key={r} className={cn("px-1.5 py-0.5 text-[6px] sm:text-[7px] font-medium rounded", i === 1 ? "bg-primary/10 text-primary" : "text-muted-foreground")}>{r}</span>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 400 75" className="w-full h-14 sm:h-16" preserveAspectRatio="none">
            <line x1="0" y1="37.5" x2="400" y2="37.5" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
            {chartBars.map((bar, i) => (
              <rect key={i} x={bar.x} y={75 - bar.h} width="24" height={bar.h} rx="4" fill={bar.up ? "hsl(var(--profit))" : "hsl(var(--loss))"} opacity={bar.up ? 0.8 : 0.65} />
            ))}
            {/* Segment color indicators */}
            <rect x="8" y="75" width="4" height="2" rx="1" fill="hsl(240 60% 60%)" opacity="0.6" />
            <rect x="44" y="75" width="4" height="2" rx="1" fill="hsl(38 92% 50%)" opacity="0.6" />
          </svg>
          <div className="flex gap-3 mt-1.5">
            {[{ label: "Intraday", color: "bg-[hsl(240_60%_60%)]" }, { label: "Options", color: "bg-[hsl(280_60%_55%)]" }, { label: "Futures", color: "bg-[hsl(38_92%_50%)]" }].map((s) => (
              <div key={s.label} className="flex items-center gap-1">
                <div className={cn("w-1.5 h-1.5 rounded-full", s.color)} />
                <span className="text-[6px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="rounded-[1rem] border border-border/20 bg-card p-2.5 sm:p-3" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
          <div className="flex items-center justify-between mb-2 sm:mb-2.5">
            <div className="flex items-center gap-1.5">
              <Bell className="w-3 h-3 text-primary" />
              <p className="text-[9px] sm:text-[10px] font-semibold">Active Alerts</p>
            </div>
            <span className="text-[7px] sm:text-[8px] text-primary font-medium">View all →</span>
          </div>
          <div className="space-y-0.5">
            {alerts.map((a) => (
              <div key={a.sym} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                <div>
                  <p className="text-[8px] sm:text-[9px] font-semibold">{a.sym}</p>
                  <p className="text-[6px] sm:text-[7px] text-muted-foreground">{a.cond}</p>
                </div>
                <span className="text-[6px] sm:text-[7px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground font-medium">{a.type}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[7px] text-primary font-medium">
            <Plus className="w-2.5 h-2.5" /> Create alert
          </div>
        </div>
      </div>

      {/* ── Equity Curve ── */}
      <div className="rounded-[1rem] border border-border/20 bg-card p-2.5 sm:p-3" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-semibold">Equity Curve</p>
              <p className="text-[7px] sm:text-[8px] text-muted-foreground">Cumulative P&L — Capital: ₹5,00,000</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="w-3 h-3 text-profit" />
            <span className="text-[8px] sm:text-[9px] font-bold font-mono text-profit">+₹24,850</span>
          </div>
        </div>
        <svg viewBox="0 0 400 50" className="w-full h-10 sm:h-12" preserveAspectRatio="none">
          <defs>
            <linearGradient id="eq-fill-preview" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.15" />
              <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,50 ${equityCurvePoints} 400,50`} fill="url(#eq-fill-preview)" />
          <polyline points={equityCurvePoints} fill="none" stroke="hsl(var(--profit))" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="400" cy="7" r="2.5" fill="hsl(var(--profit))" />
        </svg>
      </div>

      {/* ── Open Positions + Streak ── */}
      <div className="grid sm:grid-cols-5 gap-1.5 sm:gap-2">
        {/* Open Positions table */}
        <div className="sm:col-span-3 rounded-[1rem] border border-border/20 bg-card p-2.5 sm:p-3" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-primary" />
              <p className="text-[9px] sm:text-[10px] font-semibold">Open Positions</p>
            </div>
            <span className="text-[7px] sm:text-[8px] text-primary font-medium">View all →</span>
          </div>
          {/* Table header */}
          <div className="grid grid-cols-5 gap-1 text-[6px] sm:text-[7px] font-semibold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/15">
            <span>Symbol</span>
            <span className="text-center">Type</span>
            <span className="text-right">Entry</span>
            <span className="text-right">LTP</span>
            <span className="text-right">P&L</span>
          </div>
          {positions.map((p) => (
            <div key={p.sym} className="grid grid-cols-5 gap-1 py-1.5 border-b border-border/8 last:border-0 items-center">
              <span className="text-[8px] sm:text-[9px] font-semibold truncate">{p.sym}</span>
              <span className={cn("text-[7px] font-medium text-center px-1 py-0.5 rounded", p.type === "LONG" ? "text-profit bg-profit/10" : "text-loss bg-loss/10")}>{p.type}</span>
              <span className="text-[7px] sm:text-[8px] font-mono text-muted-foreground text-right">₹{p.entry}</span>
              <span className="text-[7px] sm:text-[8px] font-mono text-foreground text-right">₹{p.ltp}</span>
              <span className={cn("text-[7px] sm:text-[8px] font-mono font-semibold text-right", p.pnl >= 0 ? "text-profit" : "text-loss")}>
                {p.pnl >= 0 ? "+" : ""}₹{p.pnl.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>

        {/* Streak & Discipline */}
        <div className="sm:col-span-2 rounded-[1rem] border border-border/20 bg-card p-2.5 sm:p-3" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-2.5 h-2.5 text-primary" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-semibold">Streak & Discipline</p>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-muted-foreground">Current streak</span>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-profit" />
                <span className="text-[10px] sm:text-[11px] font-bold font-mono text-profit">5 wins</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-muted-foreground">Avg R:R ratio</span>
              <span className="text-[10px] sm:text-[11px] font-bold font-mono text-foreground">1:2.4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-muted-foreground">Discipline score</span>
              <span className="text-[10px] sm:text-[11px] font-bold font-mono text-foreground">92%</span>
            </div>
            {/* Weekly heatmap */}
            <div>
              <p className="text-[7px] text-muted-foreground mb-1">This week</p>
              <div className="flex gap-1">
                {["M", "T", "W", "T", "F"].map((d, i) => {
                  const wins = [1, 1, 1, 0, 1];
                  return (
                    <div key={d} className="flex flex-col items-center gap-0.5">
                      <div className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-[6px] font-bold",
                        wins[i] ? "bg-profit/20 text-profit" : "bg-loss/15 text-loss"
                      )}>
                        {wins[i] ? "W" : "L"}
                      </div>
                      <span className="text-[5px] text-muted-foreground">{d}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
