// This component contains the dashboard mockup preview from the hero section.
// Kept as a separate file to reduce Landing page size.
// Re-exports the existing inline preview markup.

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Bell, BookOpen, Target, Eye, Layers, Calendar,
  Home, ChevronRight, Activity, TrendingUp, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scaleIn } from "./LandingShared";
import { TickerBar } from "./TickerBar";

export function DashboardPreview() {
  return (
    <div className="relative max-w-6xl mx-auto px-6 pb-24">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[8rem] lg:text-[12rem] font-black text-muted-foreground/[0.03] uppercase tracking-widest">
          Dashboard
        </span>
      </div>

      <motion.div variants={scaleIn} initial="hidden" animate="visible" className="relative">
        <div className="absolute -inset-16 bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.06)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-x-8 -bottom-4 h-8 rounded-3xl bg-foreground/[0.03] blur-xl" />
        <div className="absolute inset-x-4 -bottom-2 h-6 rounded-3xl bg-foreground/[0.04] blur-md" />

        <motion.div
          className="relative rounded-2xl border border-border/40 bg-card overflow-hidden"
          style={{
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.08), 0 0 0 1px hsl(var(--border)/0.3)",
            transform: "perspective(1200px) rotateX(2deg)",
          }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.4 }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-muted/15">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-loss/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-profit/30" />
            </div>
          </div>

          <TickerBar />

          <div className="flex">
            {/* Mini sidebar */}
            <div className="hidden sm:flex flex-col w-14 border-r border-border/15 bg-muted/5 py-3 gap-3 items-center">
              {[BarChart3, BookOpen, Bell, Target, Eye, Layers, Calendar].map((Icon, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    i === 0 ? "bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]" : "text-muted-foreground/30"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 sm:p-5">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-3">
                <Home className="w-3 h-3" />
                <ChevronRight className="w-2.5 h-2.5 opacity-40" />
                <span>Overview</span>
                <ChevronRight className="w-2.5 h-2.5 opacity-40" />
                <span className="text-foreground font-medium">Dashboard</span>
                <div className="ml-auto flex items-center gap-1">
                  <Activity className="w-3 h-3 text-profit animate-pulse" />
                  <span className="text-profit font-medium">Live</span>
                </div>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-base sm:text-xl font-bold tracking-tight">
                    Good morning, <span className="text-primary">Mr. Chartist</span> 👋
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-muted-foreground">Last login: 2 Mar 2026, 09:15 AM</p>
                    <span className="text-muted-foreground/30 text-[10px]">•</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
                      <span className="text-[10px] text-muted-foreground">Market Open</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 bg-muted/40 rounded-full p-0.5">
                  {["Jan", "Feb", "Mar"].map((m, i) => (
                    <span key={m} className={cn(
                      "px-2.5 py-1 text-[9px] font-medium rounded-full",
                      i === 2 ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                    )}>{m}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-1.5 mb-3 flex-wrap">
                {["All", "Intraday", "Positional", "Futures", "Options", "Commodities"].map((s, i) => (
                  <span key={s} className={cn(
                    "px-2.5 py-1 text-[9px] font-medium rounded-full border",
                    i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border/40 text-muted-foreground"
                  )}>{s}</span>
                ))}
              </div>

              {/* Today's P&L Hero */}
              <div className="mb-3 rounded-xl border border-profit/15 bg-gradient-to-r from-profit/5 to-transparent p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Today's P&L</p>
                    <p className="text-xl font-bold font-mono text-profit">+₹12,450</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-profit/10 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-profit" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/10">
                  <div>
                    <p className="text-[8px] text-muted-foreground">Realized</p>
                    <p className="text-xs font-bold font-mono text-profit">+₹8,450</p>
                    <p className="text-[8px] text-muted-foreground">3 closed</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-muted-foreground">Unrealized</p>
                    <p className="text-xs font-bold font-mono text-profit">+₹4,000</p>
                    <p className="text-[8px] text-muted-foreground">2 open</p>
                  </div>
                </div>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {[
                  { label: "MTD P&L", value: "+₹24,850", sub: "Realized +₹18.2K  Unrealized +₹6.6K", icon: BarChart3, iconColor: "text-profit", iconBg: "bg-profit/10", colored: true },
                  { label: "OPEN POSITIONS", value: "3", sub: "₹2.4L at risk (to SL)", icon: Target, iconColor: "text-[hsl(var(--tb-accent))]", iconBg: "bg-[hsl(var(--tb-accent)/0.1)]", colored: false },
                  { label: "WIN RATE", value: "67.5%", sub: "Closed: 12 | W: 8 | L: 4", icon: TrendingUp, iconColor: "text-primary", iconBg: "bg-primary/10", colored: true },
                  { label: "ACTIVE ALERTS", value: "8", sub: "Price: 5 | Technical: 3", icon: Bell, iconColor: "text-[hsl(var(--tb-accent))]", iconBg: "bg-[hsl(var(--tb-accent)/0.1)]", colored: false },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl border border-border/20 bg-card p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", kpi.iconBg)}>
                        <kpi.icon className={cn("w-3 h-3", kpi.iconColor)} />
                      </div>
                    </div>
                    <p className={cn("text-sm font-bold font-mono", kpi.colored ? "text-profit" : "text-foreground")}>{kpi.value}</p>
                    <p className="text-[7px] font-mono mt-0.5 text-muted-foreground">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* Chart + Alerts row */}
              <div className="grid sm:grid-cols-5 gap-2">
                <div className="sm:col-span-3 rounded-xl border border-border/20 bg-card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="w-3 h-3 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold">Daily P&L by Segment</p>
                        <p className="text-[8px] text-muted-foreground">Stacked by market segment</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 bg-muted/40 rounded-full p-0.5">
                      {["1W", "1M", "3M"].map((t, i) => (
                        <span key={t} className={cn(
                          "px-2 py-0.5 text-[8px] font-medium rounded-full",
                          i === 1 ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                        )}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <svg viewBox="0 0 400 70" className="w-full h-12">
                    {[
                      { x: 20, h: 30, color: "hsl(var(--profit))" },
                      { x: 60, h: 15, color: "hsl(var(--loss))" },
                      { x: 100, h: 40, color: "hsl(var(--profit))" },
                      { x: 140, h: 25, color: "hsl(var(--profit))" },
                      { x: 180, h: 10, color: "hsl(var(--loss))" },
                      { x: 220, h: 45, color: "hsl(var(--profit))" },
                      { x: 260, h: 20, color: "hsl(var(--profit))" },
                      { x: 300, h: 35, color: "hsl(var(--profit))" },
                      { x: 340, h: 8, color: "hsl(var(--loss))" },
                      { x: 380, h: 50, color: "hsl(var(--profit))" },
                    ].map((bar, i) => (
                      <rect key={i} x={bar.x} y={70 - bar.h} width="24" height={bar.h} rx="3" fill={bar.color} opacity="0.7" />
                    ))}
                  </svg>
                </div>
                <div className="sm:col-span-2 rounded-xl border border-border/20 bg-card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3 h-3 text-primary" />
                      <div>
                        <p className="text-[10px] font-semibold">Alerts</p>
                        <p className="text-[8px] text-muted-foreground">3 active</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-primary font-medium">Manage →</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { sym: "RELIANCE", cond: "Price > ₹2,950", type: "Price" },
                      { sym: "NIFTY", cond: "RSI < 30", type: "Technical" },
                      { sym: "HDFCBANK", cond: "Price < ₹1,600", type: "Price" },
                    ].map((a) => (
                      <div key={a.sym} className="flex items-center justify-between py-1 border-b border-border/10 last:border-0">
                        <div>
                          <p className="text-[9px] font-semibold">{a.sym}</p>
                          <p className="text-[7px] text-muted-foreground">{a.cond}</p>
                        </div>
                        <span className="text-[7px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{a.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
