import React from "react";
import { motion } from "framer-motion";
import {
  Bell, PieChart, Trophy, Brain, Target, Activity,
  CandlestickChart, Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-32 left-[6%] hidden lg:block"
        animate={{ y: [0, -10, 0], rotate: [-2, 0, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-md p-3.5 shadow-lg shadow-black/[0.04] w-44">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-5 rounded-full bg-profit" />
            <div>
              <p className="text-[10px] font-semibold">RELIANCE</p>
              <p className="text-[8px] text-muted-foreground">BUY · ₹2,945</p>
            </div>
          </div>
          <p className="text-[11px] font-mono font-bold text-profit">+₹2,450</p>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-40 right-[7%] hidden lg:block"
        animate={{ y: [0, -8, 0], rotate: [1, 3, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <div className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-md px-3.5 py-2.5 shadow-lg shadow-black/[0.04] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--tb-accent)/0.08)] flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold">Alert Triggered</p>
            <p className="text-[8px] text-muted-foreground">NIFTY crossed 24,300</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[58%] left-[4%] hidden xl:block"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div className="rounded-2xl border border-profit/15 bg-card/80 backdrop-blur-md px-4 py-2.5 shadow-lg shadow-black/[0.04]">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">MTD P&L</p>
          <p className="text-sm font-bold font-mono text-profit">+₹24,850</p>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[28%] right-[5%] hidden lg:block"
        animate={{ y: [0, -10, 0], rotate: [1, -1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <div className="rounded-2xl border border-profit/15 bg-card/80 backdrop-blur-md px-4 py-2.5 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-profit/10 flex items-center justify-center">
              <PieChart className="w-3.5 h-3.5 text-profit" />
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Win Rate</p>
              <p className="text-sm font-bold font-mono text-profit">68.4%</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[52%] right-[6%] hidden xl:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      >
        <div className="rounded-2xl border border-[hsl(var(--tb-accent)/0.2)] bg-card/80 backdrop-blur-md px-3.5 py-2 shadow-lg flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
          <div>
            <p className="text-[10px] font-semibold">5-Day Streak</p>
            <p className="text-[8px] text-muted-foreground">All targets hit</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[22%] left-[5%] hidden xl:block"
        animate={{ y: [0, -9, 0], rotate: [0, 1, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      >
        <div className="rounded-2xl border border-[hsl(270_60%_55%/0.15)] bg-card/80 backdrop-blur-md px-3.5 py-2.5 shadow-lg flex items-center gap-2.5 max-w-[200px]">
          <div className="w-7 h-7 rounded-lg bg-[hsl(270_60%_55%/0.1)] flex items-center justify-center shrink-0">
            <Brain className="w-3.5 h-3.5 text-[hsl(270_60%_55%)]" />
          </div>
          <p className="text-[9px] text-muted-foreground leading-tight">
            <span className="font-semibold text-foreground/80">AI:</span> Reduce size on Mondays
          </p>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-24 left-[22%] hidden xl:block"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
      >
        <div className="rounded-full border border-border/30 bg-card/70 backdrop-blur-md px-3 py-1.5 shadow-sm flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-[9px] font-medium text-muted-foreground">47 trades this week</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-28 right-[20%] hidden xl:block"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
      >
        <div className="rounded-full border border-border/30 bg-card/70 backdrop-blur-md px-3 py-1.5 shadow-sm flex items-center gap-1.5">
          <Target className="w-3 h-3 text-[hsl(var(--tb-accent)/0.6)]" />
          <span className="text-[9px] font-mono font-semibold text-muted-foreground">R:R 1:2.4</span>
        </div>
      </motion.div>

      {[
        { Icon: CandlestickChart, top: "20%", left: "14%", delay: 0.5, size: "w-9 h-9" },
        { Icon: Gauge, top: "72%", right: "9%", delay: 1.5, size: "w-8 h-8" },
        { Icon: Activity, top: "28%", right: "15%", delay: 2, size: "w-7 h-7" },
        { Icon: Target, top: "68%", left: "11%", delay: 0.8, size: "w-8 h-8" },
      ].map(({ Icon, delay, size, ...pos }, i) => (
        <motion.div
          key={i}
          className={cn("absolute hidden lg:flex items-center justify-center rounded-2xl border border-border/20 bg-card/50 backdrop-blur-sm shadow-sm", size)}
          style={pos as React.CSSProperties}
          animate={{ y: [0, -6, 0], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <Icon className="w-3.5 h-3.5 text-muted-foreground/40" />
        </motion.div>
      ))}
    </div>
  );
}
