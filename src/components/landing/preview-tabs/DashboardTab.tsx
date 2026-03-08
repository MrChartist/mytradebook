import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  BarChart3, Bell, Target, TrendingUp, Flame, Wallet,
  Radio, ArrowUpRight, Trophy, Plus, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Mock Data ── */
const months = ["All Time", "Jan", "Feb", "Mar"];
const segments = ["All", "Intraday", "Positional", "Futures", "Options"];

const tickerItems = [
  { symbol: "RELIANCE", ltp: 2948.5, pnl: 3200, pct: 1.8 },
  { symbol: "HDFCBANK", ltp: 1645.2, pnl: -850, pct: -0.6 },
  { symbol: "NIFTY 24500 CE", ltp: 185.0, pnl: 1100, pct: 4.2 },
  { symbol: "TATAMOTORS", ltp: 982.3, pnl: 2400, pct: 2.1 },
];

const chartBars = [
  { x: 6, h: 34, up: true }, { x: 42, h: 20, up: false }, { x: 78, h: 46, up: true },
  { x: 114, h: 30, up: true }, { x: 150, h: 14, up: false }, { x: 186, h: 52, up: true },
  { x: 222, h: 24, up: true }, { x: 258, h: 40, up: true }, { x: 294, h: 10, up: false },
  { x: 330, h: 56, up: true }, { x: 366, h: 32, up: true },
];

const alerts = [
  { sym: "RELIANCE", cond: "Price > ₹2,950", type: "Price", triggered: true },
  { sym: "NIFTY", cond: "RSI < 30", type: "Technical", triggered: false },
  { sym: "HDFCBANK", cond: "Price < ₹1,600", type: "Price", triggered: false },
];

const positions = [
  { sym: "RELIANCE", type: "LONG", entry: 2820, ltp: 2948.5, pnl: 3200, qty: 25 },
  { sym: "HDFCBANK", type: "SHORT", entry: 1680, ltp: 1645.2, pnl: 850, qty: 50 },
  { sym: "NIFTY CE", type: "LONG", entry: 140, ltp: 185, pnl: 1100, qty: 25 },
];

const equityCurvePoints = "0,48 30,45 60,42 90,38 120,35 150,31 180,36 210,30 240,26 270,23 300,28 330,21 360,18 390,14 420,11 450,8";

/* ── Animated Counter ── */
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

/* ── Premium KPI Card (mirrors real DashboardKPICards) ── */
function KPICard({
  label, value, icon: Icon, iconColor, iconBg, colored, accent, glowClass,
  children,
}: {
  label: string; value: string;
  icon: React.ElementType; iconColor: string; iconBg: string;
  colored?: boolean; accent?: boolean; glowClass?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn(
      "rounded-[1.25rem] border border-border/25 bg-card p-3 sm:p-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-md",
      glowClass
    )} style={{ boxShadow: "var(--shadow-sm), inset 0 1px 0 0 hsl(0 0% 100% / 0.08)" }}>
      {/* Accent top bar */}
      {accent && (
        <div className={cn(
          "absolute top-0 left-0 right-0 h-[3px] rounded-t-[1.25rem]",
          colored ? "bg-profit" : "bg-primary"
        )} />
      )}
      {/* Corner glow */}
      {accent && (
        <div className={cn(
          "absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.04] pointer-events-none",
          colored ? "bg-profit" : "bg-primary"
        )} />
      )}

      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[9px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", iconColor)} />
        </div>
      </div>

      <p className={cn(
        "text-lg sm:text-2xl font-bold font-mono tracking-tight leading-none",
        colored ? "text-profit" : "text-foreground"
      )}>{value}</p>

      {children}
    </div>
  );
}

/* ── Inner Panel (sub-card for breakdown metrics) ── */
function InnerPanel({ label, value, colored }: { label: string; value: string; colored?: boolean }) {
  return (
    <div className="rounded-xl bg-[hsl(var(--card-inner))] border border-border/10 px-2.5 py-1.5 sm:px-3 sm:py-2 flex-1">
      <p className="text-[8px] sm:text-[10px] text-muted-foreground">{label}</p>
      <p className={cn(
        "text-[10px] sm:text-xs font-bold font-mono mt-0.5",
        colored !== undefined ? (colored ? "text-profit" : "text-loss") : "text-foreground"
      )}>{value}</p>
    </div>
  );
}

/* ── Main DashboardTab ── */
export function DashboardTab() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const todayPnl = useAnimatedValue(12450, isInView);
  const mtdPnl = useAnimatedValue(24850, isInView);
  const winRateVal = useAnimatedValue(67.5, isInView);

  return (
    <div ref={ref} className="min-w-0 space-y-3 sm:space-y-5">

      {/* ── Row 1: Greeting + Live ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight">
            Good morning, <span className="text-primary">Mr. Chartist</span> 👋
          </h1>
          <div className="hidden sm:flex items-center gap-2.5 mt-1">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Saturday, 8 March 2026</p>
            <span className="text-muted-foreground/30">•</span>
            <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">Market Open</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border border-border/20">
          <Radio className="w-3 h-3 text-profit animate-pulse" />
          <span className="text-[10px] sm:text-xs text-profit font-semibold">Live</span>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground">• 9:45 AM</span>
        </div>
      </div>

      {/* ── Row 2: Filters ── */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="flex gap-0.5 bg-muted/60 rounded-full p-0.5 border border-border/30">
          {months.map((m, i) => (
            <span key={m} className={cn(
              "px-2.5 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-medium rounded-full transition-colors",
              i === 3 ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            )}>{m}</span>
          ))}
        </div>
        <div className="w-px h-5 bg-border/30 hidden sm:block" />
        <div className="flex gap-1 flex-wrap">
          {segments.map((s, i) => (
            <span key={s} className={cn(
              "px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-medium rounded-full border transition-colors",
              i === 0
                ? "border-primary/20 bg-primary/[0.06] text-primary shadow-sm"
                : "border-border/50 text-muted-foreground hover:bg-muted/30"
            )}>{s}</span>
          ))}
        </div>
      </div>

      {/* ── Floating Trade Ticker ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-r border-border/30 bg-muted/30">
            <Radio className="w-3 h-3 text-profit animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Open</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="ticker-scroll flex items-center gap-6 py-2 px-3 whitespace-nowrap">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <div key={`${item.symbol}-${i}`} className="inline-flex items-center gap-2 shrink-0">
                  <span className="text-[10px] sm:text-xs font-semibold text-foreground">{item.symbol}</span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground">₹{item.ltp.toLocaleString("en-IN")}</span>
                  <span className={cn(
                    "text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full",
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

      {/* ── KPI Cards — 5-column premium grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {/* Today's P&L — hero card */}
        <KPICard
          label="Today's P&L"
          value={`+₹${Math.round(todayPnl).toLocaleString("en-IN")}`}
          icon={Flame} iconColor="text-profit" iconBg="bg-profit/10"
          colored accent glowClass="card-glow-profit"
        >
          <div className="flex gap-2 mt-3">
            <InnerPanel label="Realized" value="+₹8,400" colored />
            <InnerPanel label="Unrealized" value="+₹4,050" colored />
          </div>
          <p className="text-[8px] sm:text-[10px] text-muted-foreground mt-2">2 closed • 3 open</p>
        </KPICard>

        {/* MTD P&L */}
        <KPICard
          label="MTD P&L"
          value={`+₹${Math.round(mtdPnl).toLocaleString("en-IN")}`}
          icon={Wallet} iconColor="text-profit" iconBg="bg-profit/10"
          colored accent glowClass="card-glow-profit"
        >
          <div className="flex gap-2 mt-3">
            <InnerPanel label="Realized" value="+₹18,200" colored />
            <InnerPanel label="Unrealized" value="+₹6,650" colored />
          </div>
        </KPICard>

        {/* Open Positions */}
        <KPICard
          label="Open Positions"
          value="3"
          icon={Target} iconColor="text-primary" iconBg="bg-primary/10"
        >
          <div className="rounded-xl bg-[hsl(var(--card-inner))] border border-border/10 px-2.5 py-1.5 sm:px-3 sm:py-2 mt-3">
            <p className="text-[8px] sm:text-[10px] text-muted-foreground">Risk to SL</p>
            <p className="text-[10px] sm:text-xs font-semibold font-mono text-loss mt-0.5">₹24,000</p>
          </div>
          <p className="text-[8px] sm:text-[10px] text-muted-foreground mt-2">12 total trades this month</p>
        </KPICard>

        {/* Win Rate — with circular progress */}
        <KPICard
          label="Win Rate"
          value={`${winRateVal.toFixed(1)}%`}
          icon={TrendingUp} iconColor="text-profit" iconBg="bg-profit/10"
          colored glowClass="card-glow-profit"
        >
          <div className="flex items-center gap-2 mt-3">
            <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
              <circle cx="14" cy="14" r="11" fill="none" strokeWidth="3" stroke="hsl(var(--muted))" />
              <circle
                cx="14" cy="14" r="11" fill="none" strokeWidth="3"
                stroke="hsl(var(--profit))"
                strokeDasharray={`${(67.5 / 100) * 69.12} 69.12`}
                strokeLinecap="round"
                transform="rotate(-90 14 14)"
              />
            </svg>
            <span className="text-[8px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full bg-profit/10 text-profit">
              Exp: +₹1,540/trade
            </span>
          </div>
          <p className="text-[8px] sm:text-[10px] text-muted-foreground mt-2">
            Closed: 12 | W: 8 | L: 4
          </p>
        </KPICard>

        {/* Active Alerts */}
        <KPICard
          label="Active Alerts"
          value="8"
          icon={Bell} iconColor="text-warning" iconBg="bg-warning/10"
        >
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            <span className="text-[8px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">
              2 triggered
            </span>
          </div>
          <div className="rounded-xl bg-[hsl(var(--card-inner))] border border-border/10 px-2.5 py-1.5 sm:px-3 sm:py-2 mt-2">
            <p className="text-[8px] sm:text-[10px] text-muted-foreground">
              Price: 5 | Technical: 3
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-1 text-[8px] sm:text-[10px] text-primary font-medium">
            <Plus className="w-3 h-3" /> Create alert
          </span>
        </KPICard>
      </div>

      {/* ── Chart + Alerts Row ── */}
      <div className="grid sm:grid-cols-3 gap-2 sm:gap-3">
        {/* Daily P&L Chart */}
        <div className="sm:col-span-2 rounded-[1.25rem] border border-border/25 bg-card p-3 sm:p-4" style={{ boxShadow: "var(--shadow-sm), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-semibold">Daily P&L by Segment</p>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground">Stacked by market segment</p>
              </div>
            </div>
            <div className="flex gap-1">
              {["1W", "1M", "3M"].map((r, i) => (
                <span key={r} className={cn(
                  "px-2 py-1 text-[8px] sm:text-[9px] font-medium rounded-lg transition-colors",
                  i === 1 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/40"
                )}>{r}</span>
              ))}
            </div>
          </div>

          <svg viewBox="0 0 400 80" className="w-full h-16 sm:h-24" preserveAspectRatio="none">
            <line x1="0" y1="40" x2="400" y2="40" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
            {chartBars.map((bar, i) => (
              <rect key={i} x={bar.x} y={80 - bar.h} width="26" height={bar.h} rx="5"
                fill={bar.up ? "hsl(var(--profit))" : "hsl(var(--loss))"}
                opacity={bar.up ? 0.8 : 0.6}
              />
            ))}
          </svg>

          <div className="flex gap-4 mt-2">
            {[
              { label: "Intraday", color: "bg-[hsl(240_60%_60%)]" },
              { label: "Options", color: "bg-[hsl(280_60%_55%)]" },
              { label: "Futures", color: "bg-[hsl(38_92%_50%)]" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", s.color)} />
                <span className="text-[8px] sm:text-[9px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="rounded-[1.25rem] border border-border/25 bg-card p-3 sm:p-4" style={{ boxShadow: "var(--shadow-sm), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-primary" />
              <p className="text-[10px] sm:text-xs font-semibold">Active Alerts</p>
            </div>
            <span className="text-[8px] sm:text-[10px] text-primary font-medium cursor-pointer hover:underline">View all →</span>
          </div>
          <div className="space-y-1">
            {alerts.map((a) => (
              <div key={a.sym} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] sm:text-[11px] font-semibold">{a.sym}</p>
                    {a.triggered && <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />}
                  </div>
                  <p className="text-[7px] sm:text-[9px] text-muted-foreground">{a.cond}</p>
                </div>
                <span className={cn(
                  "text-[7px] sm:text-[9px] px-2 py-0.5 rounded-lg font-medium",
                  a.type === "Technical" ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                )}>{a.type}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[8px] sm:text-[10px] text-primary font-medium cursor-pointer hover:underline">
            <Plus className="w-3 h-3" /> Create alert
          </div>
        </div>
      </div>

      {/* ── Equity Curve ── */}
      <div className="rounded-[1.25rem] border border-border/25 bg-card p-3 sm:p-4" style={{ boxShadow: "var(--shadow-sm), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold">Equity Curve</p>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground">Cumulative P&L — Capital: ₹5,00,000</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-profit" />
            <span className="text-[10px] sm:text-xs font-bold font-mono text-profit">+₹24,850</span>
            <span className="text-[8px] sm:text-[9px] text-profit bg-profit/10 px-1.5 py-0.5 rounded-full font-medium">+4.97%</span>
          </div>
        </div>
        <svg viewBox="0 0 460 60" className="w-full h-14 sm:h-20" preserveAspectRatio="none">
          <defs>
            <linearGradient id="eq-fill-landing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,60 ${equityCurvePoints} 460,60`} fill="url(#eq-fill-landing)" />
          <polyline points={equityCurvePoints} fill="none" stroke="hsl(var(--profit))" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx="450" cy="8" r="3" fill="hsl(var(--profit))" />
          <circle cx="450" cy="8" r="5" fill="hsl(var(--profit))" opacity="0.2" />
        </svg>
      </div>

      {/* ── Open Positions + Streak ── */}
      <div className="grid sm:grid-cols-5 gap-2 sm:gap-3">
        {/* Positions Table */}
        <div className="sm:col-span-3 rounded-[1.25rem] border border-border/25 bg-card p-3 sm:p-4" style={{ boxShadow: "var(--shadow-sm), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-primary" />
              <p className="text-[10px] sm:text-xs font-semibold">Open Positions</p>
            </div>
            <span className="text-[8px] sm:text-[10px] text-primary font-medium cursor-pointer hover:underline">View all →</span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-[7px] sm:text-[9px] font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border/15">
            <span>Symbol</span>
            <span className="text-center">Type</span>
            <span className="text-right">Entry</span>
            <span className="text-right">LTP</span>
            <span className="text-right">P&L</span>
          </div>

          {positions.map((p) => (
            <div key={p.sym} className="grid grid-cols-5 gap-2 py-2.5 border-b border-border/8 last:border-0 items-center">
              <span className="text-[9px] sm:text-[11px] font-semibold truncate">{p.sym}</span>
              <span className={cn(
                "text-[8px] sm:text-[9px] font-semibold text-center px-1.5 py-0.5 rounded-lg mx-auto",
                p.type === "LONG" ? "text-profit bg-profit/10" : "text-loss bg-loss/10"
              )}>{p.type}</span>
              <span className="text-[8px] sm:text-[10px] font-mono text-muted-foreground text-right">₹{p.entry.toLocaleString("en-IN")}</span>
              <span className="text-[8px] sm:text-[10px] font-mono text-foreground text-right">₹{p.ltp.toLocaleString("en-IN")}</span>
              <span className={cn(
                "text-[8px] sm:text-[10px] font-mono font-bold text-right",
                p.pnl >= 0 ? "text-profit" : "text-loss"
              )}>
                +₹{p.pnl.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>

        {/* Streak & Discipline */}
        <div className="sm:col-span-2 rounded-[1.25rem] border border-border/25 bg-card p-3 sm:p-4" style={{ boxShadow: "var(--shadow-sm), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </div>
            <p className="text-[10px] sm:text-xs font-semibold">Streak & Discipline</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">Current streak</span>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-profit" />
                <span className="text-[11px] sm:text-sm font-bold font-mono text-profit">5 wins</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">Avg R:R ratio</span>
              <span className="text-[11px] sm:text-sm font-bold font-mono text-foreground">1:2.4</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">Discipline score</span>
              <div className="flex items-center gap-2">
                <div className="w-16 sm:w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[92%] rounded-full bg-primary" />
                </div>
                <span className="text-[11px] sm:text-sm font-bold font-mono text-foreground">92%</span>
              </div>
            </div>

            {/* Weekly heatmap */}
            <div>
              <p className="text-[8px] sm:text-[9px] text-muted-foreground mb-1.5">This week</p>
              <div className="flex gap-1.5">
                {["M", "T", "W", "T", "F"].map((d, i) => {
                  const wins = [1, 1, 1, 0, 1];
                  return (
                    <div key={`${d}-${i}`} className="flex flex-col items-center gap-1">
                      <div className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[8px] sm:text-[9px] font-bold",
                        wins[i] ? "bg-profit/15 text-profit border border-profit/20" : "bg-loss/10 text-loss border border-loss/15"
                      )}>
                        {wins[i] ? "W" : "L"}
                      </div>
                      <span className="text-[7px] sm:text-[8px] text-muted-foreground">{d}</span>
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
