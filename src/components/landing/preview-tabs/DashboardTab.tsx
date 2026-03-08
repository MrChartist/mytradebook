import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  BarChart3, Bell, Target, TrendingUp, ArrowUpRight,
  Home, ChevronRight, Flame, Wallet, Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── mock data ── */
const kpiCards = [
  { label: "TODAY'S P&L", value: 12450, format: (n: number) => `+₹${Math.round(n).toLocaleString("en-IN")}`, sub: "Real +₹8.4K · Unreal +₹4K", icon: ArrowUpRight, iconColor: "text-profit", iconBg: "bg-profit/10", colored: true, accent: true },
  { label: "MTD P&L", value: 24850, format: (n: number) => `+₹${Math.round(n).toLocaleString("en-IN")}`, sub: "Realized +₹18.2K  Unrealized +₹6.6K", icon: BarChart3, iconColor: "text-profit", iconBg: "bg-profit/10", colored: true },
  { label: "OPEN POSITIONS", value: 3, format: (n: number) => String(Math.round(n)), sub: "₹2.4L at risk (to SL)", icon: Target, iconColor: "text-primary", iconBg: "bg-primary/10", colored: false },
  { label: "WIN RATE", value: 67.5, format: (n: number) => `${n.toFixed(1)}%`, sub: "W: 8 | L: 4 | Exp: +₹1.5K", icon: TrendingUp, iconColor: "text-primary", iconBg: "bg-primary/10", colored: true },
  { label: "ACTIVE ALERTS", value: 8, format: (n: number) => String(Math.round(n)), sub: "Price: 5 | Technical: 3", icon: Bell, iconColor: "text-primary", iconBg: "bg-primary/10", colored: false },
];

const chartBars = [
  { x: 15, h: 32, up: true }, { x: 55, h: 18, up: false }, { x: 95, h: 42, up: true },
  { x: 135, h: 28, up: true }, { x: 175, h: 12, up: false }, { x: 215, h: 48, up: true },
  { x: 255, h: 22, up: true }, { x: 295, h: 38, up: true }, { x: 335, h: 8, up: false },
  { x: 375, h: 52, up: true },
];

const alerts = [
  { sym: "RELIANCE", cond: "Price > ₹2,950", type: "Price" },
  { sym: "NIFTY", cond: "RSI < 30", type: "Technical" },
  { sym: "HDFCBANK", cond: "Price < ₹1,600", type: "Price" },
];

const tickerItems = [
  { symbol: "RELIANCE", ltp: 2948.5, pnl: 3200, pct: 1.8 },
  { symbol: "HDFCBANK", ltp: 1645.2, pnl: -850, pct: -0.6 },
  { symbol: "NIFTY 24500 CE", ltp: 185.0, pnl: 1100, pct: 4.2 },
];

const equityCurvePoints = "0,40 30,38 60,35 90,30 120,32 150,28 180,22 210,18 240,20 270,15 300,12 330,10 360,8 390,5";

const months = ["All", "Jan", "Feb", "Mar"];
const segments = ["All", "Intraday", "Positional", "Futures", "Options"];

/* ── Animated KPI Cards ── */
function KPICardsRow() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [animated, setAnimated] = useState(false);
  const [values, setValues] = useState(kpiCards.map(() => 0));

  useEffect(() => {
    if (!isInView || animated) return;
    setAnimated(true);
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValues(kpiCards.map((kpi) => eased * kpi.value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, animated]);

  return (
    <div ref={ref} className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
      {kpiCards.map((kpi, idx) => (
        <div
          key={kpi.label}
          className={cn(
            "rounded-xl border border-border/20 hover:border-border/40 bg-card p-2 sm:p-2.5 relative overflow-hidden transition-all hover:scale-[1.02]",
            kpi.accent && "col-span-2 sm:col-span-1"
          )}
          style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}
        >
          {kpi.accent && (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-profit/60 via-profit to-profit/60" />
          )}
          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
            <p className="text-[7px] sm:text-[8px] text-muted-foreground uppercase tracking-wider font-medium">{kpi.label}</p>
            <div className={cn("w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center", kpi.iconBg)}>
              <kpi.icon className={cn("w-3 h-3", kpi.iconColor)} />
            </div>
          </div>
          <p className={cn("text-xs sm:text-sm font-bold font-mono tracking-tight", kpi.colored ? "text-profit" : "text-foreground")}>{kpi.format(values[idx])}</p>
          <p className="text-[6px] sm:text-[7px] font-mono mt-0.5 text-muted-foreground truncate">{kpi.sub}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Floating Trade Ticker ── */
function MockTradeTicker() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border/30 bg-card/60 backdrop-blur-sm mb-3 sm:mb-4">
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
  );
}

export function DashboardTab() {
  return (
    <div className="min-w-0">
      {/* Header row 1: Greeting + Live */}
      <div className="flex items-start justify-between mb-1.5 sm:mb-2">
        <div>
          <h1 className="text-sm sm:text-xl font-bold tracking-tight">
            Good morning, <span className="text-primary">Mr. Chartist</span> 👋
          </h1>
          <div className="hidden sm:flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-muted-foreground">Last login: 2 Mar 2026, 09:15 AM</p>
            <span className="text-muted-foreground/30 text-[10px]">•</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
              <span className="text-[10px] text-muted-foreground">Market Open</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-profit" />
          </span>
          <span className="text-profit font-medium text-[9px] sm:text-[10px]">Live</span>
        </div>
      </div>

      {/* Header row 2: Month + Segment filters */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
        <div className="flex gap-1">
          {months.map((m, i) => (
            <span key={m} className={cn("px-2 py-0.5 text-[7px] sm:text-[8px] font-medium rounded-md border transition-colors", i === 3 ? "bg-primary text-primary-foreground border-primary" : "border-border/40 text-muted-foreground")}>{m}</span>
          ))}
        </div>
        <div className="w-px h-4 bg-border/30 hidden sm:block" />
        <div className="flex gap-1">
          {segments.map((s, i) => (
            <span key={s} className={cn("px-2 sm:px-2.5 py-0.5 text-[7px] sm:text-[8px] font-medium rounded-full border transition-colors", i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border/40 text-muted-foreground")}>{s}</span>
          ))}
        </div>
      </div>

      {/* Floating trade ticker */}
      <MockTradeTicker />

      {/* KPI Cards — 5 columns */}
      <KPICardsRow />

      {/* Chart + Alerts + Equity Curve */}
      <div className="grid sm:grid-cols-5 gap-1.5 sm:gap-2 mb-2">
        {/* Daily P&L Chart */}
        <div className="sm:col-span-3 rounded-xl border border-border/20 bg-card p-2.5 sm:p-3" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
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
          </div>
          <svg viewBox="0 0 400 70" className="w-full h-12 sm:h-14" preserveAspectRatio="none">
            <line x1="0" y1="35" x2="400" y2="35" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
            {chartBars.map((bar, i) => (
              <rect key={i} x={bar.x} y={70 - bar.h} width="22" height={bar.h} rx="5" fill={bar.up ? "hsl(var(--profit))" : "hsl(var(--loss))"} opacity={bar.up ? 0.8 : 0.65} />
            ))}
          </svg>
        </div>

        {/* Alerts panel */}
        <div className="sm:col-span-2 rounded-xl border border-border/20 bg-card p-2.5 sm:p-3" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
          <div className="flex items-center justify-between mb-2 sm:mb-2.5">
            <div className="flex items-center gap-1.5">
              <Bell className="w-3 h-3 text-primary" />
              <p className="text-[9px] sm:text-[10px] font-semibold">Alerts</p>
            </div>
            <span className="text-[8px] sm:text-[9px] text-primary font-medium">Manage →</span>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            {alerts.map((a) => (
              <div key={a.sym} className="flex items-center justify-between py-1 sm:py-1.5 border-b border-border/10 last:border-0">
                <div>
                  <p className="text-[8px] sm:text-[9px] font-semibold">{a.sym}</p>
                  <p className="text-[6px] sm:text-[7px] text-muted-foreground">{a.cond}</p>
                </div>
                <span className="text-[6px] sm:text-[7px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground font-medium">{a.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equity Curve + Streak row */}
      <div className="grid sm:grid-cols-5 gap-1.5 sm:gap-2">
        <div className="sm:col-span-3 rounded-xl border border-border/20 bg-card p-2.5 sm:p-3" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-2.5 h-2.5 text-primary" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-semibold">Equity Curve</p>
              <p className="text-[7px] sm:text-[8px] text-muted-foreground">Cumulative P&L over time</p>
            </div>
          </div>
          <svg viewBox="0 0 400 45" className="w-full h-10 sm:h-12" preserveAspectRatio="none">
            <defs>
              <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,45 ${equityCurvePoints} 390,45`} fill="url(#eq-fill)" />
            <polyline points={equityCurvePoints} fill="none" stroke="hsl(var(--profit))" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Streak & Discipline */}
        <div className="sm:col-span-2 rounded-xl border border-border/20 bg-card p-2.5 sm:p-3" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Flame className="w-3 h-3 text-orange-500" />
            <p className="text-[9px] sm:text-[10px] font-semibold">Streak & Discipline</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-muted-foreground">Win streak</span>
              <span className="text-[10px] font-bold font-mono text-profit">5 days 🔥</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-muted-foreground">Rules followed</span>
              <span className="text-[10px] font-bold font-mono text-foreground">92%</span>
            </div>
            <div className="flex gap-0.5 mt-1">
              {[1,1,1,0,1,1,1].map((v, i) => (
                <div key={i} className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm", v ? "bg-profit/70" : "bg-loss/40")} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
