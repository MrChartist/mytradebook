import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  BarChart3, Bell, Target, TrendingUp, ArrowUpRight,
  Home, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const kpiCards = [
  { label: "MTD P&L", value: 24850, format: (n: number) => `+₹${Math.round(n).toLocaleString("en-IN")}`, sub: "Realized +₹18.2K  Unrealized +₹6.6K", icon: BarChart3, iconColor: "text-profit", iconBg: "bg-profit/10", colored: true },
  { label: "OPEN POSITIONS", value: 3, format: (n: number) => String(Math.round(n)), sub: "₹2.4L at risk (to SL)", icon: Target, iconColor: "text-primary", iconBg: "bg-primary/10", colored: false },
  { label: "WIN RATE", value: 67.5, format: (n: number) => `${n.toFixed(1)}%`, sub: "Closed: 12 | W: 8 | L: 4", icon: TrendingUp, iconColor: "text-primary", iconBg: "bg-primary/10", colored: true },
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

const todayPnlValues = [12450, 13200, 11800];

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
    <div ref={ref} className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
      {kpiCards.map((kpi, idx) => (
        <div key={kpi.label} className="rounded-xl border border-border/20 hover:border-border/40 bg-card p-2 sm:p-2.5 relative overflow-hidden transition-all hover:scale-[1.02]" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
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

export function DashboardTab() {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % todayPnlValues.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentPnl = todayPnlValues[tickerIndex];

  return (
    <div className="min-w-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground mb-2 sm:mb-3">
        <Home className="w-3 h-3" />
        <ChevronRight className="w-2.5 h-2.5 opacity-40" />
        <span className="text-foreground font-medium">Dashboard</span>
        <div className="ml-auto flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-profit" />
          </span>
          <span className="text-profit font-medium text-[9px] sm:text-[10px]">Live</span>
        </div>
      </div>

      {/* Greeting */}
      <div className="flex items-start justify-between mb-2 sm:mb-3">
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
      </div>

      {/* Segment pills */}
      <div className="flex gap-1 sm:gap-1.5 mb-3 sm:mb-4 flex-wrap">
        {["All", "Intraday", "Positional", "Futures", "Options"].map((s, i) => (
          <span key={s} className={cn("px-2 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-medium rounded-full border transition-colors", i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border/40 text-muted-foreground")}>{s}</span>
        ))}
      </div>

      {/* Today's P&L Hero */}
      <div className="mb-3 sm:mb-4 rounded-xl border border-profit/15 bg-gradient-to-r from-profit/[0.04] via-transparent to-transparent p-2.5 sm:p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--profit)/0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="flex items-center justify-between mb-1.5 sm:mb-2 relative">
          <div>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5 sm:mb-1">Today's P&L</p>
            <p className="text-lg sm:text-2xl font-bold font-mono text-profit tracking-tight">+₹{currentPnl.toLocaleString("en-IN")}</p>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-profit/10 flex items-center justify-center">
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-profit" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1.5 sm:pt-2 border-t border-border/10 relative">
          <div>
            <p className="text-[7px] sm:text-[8px] text-muted-foreground uppercase tracking-wide">Realized</p>
            <p className="text-xs sm:text-sm font-bold font-mono text-profit">+₹8,450</p>
          </div>
          <div>
            <p className="text-[7px] sm:text-[8px] text-muted-foreground uppercase tracking-wide">Unrealized</p>
            <p className="text-xs sm:text-sm font-bold font-mono text-profit">+₹4,000</p>
          </div>
        </div>
      </div>

      <KPICardsRow />

      {/* Chart + Alerts */}
      <div className="grid sm:grid-cols-5 gap-1.5 sm:gap-2">
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
    </div>
  );
}
