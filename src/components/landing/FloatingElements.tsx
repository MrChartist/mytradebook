import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, PieChart, Trophy, Brain, Target, TrendingUp,
  Flame, BarChart3, Zap,
} from "lucide-react";

/* ── Node positions (percentage-based, spread around center) ── */
const nodes = [
  // Top-left cluster
  { id: "reliance", x: 8, y: 18, type: "card" as const, delay: 0.2 },
  { id: "streak", x: 22, y: 8, type: "badge" as const, delay: 0.4 },
  { id: "avatar1", x: 5, y: 48, type: "avatar" as const, delay: 0.6, initials: "RP", color: "hsl(var(--tb-accent))" },
  { id: "emoji1", x: 18, y: 62, type: "emoji" as const, delay: 0.3, emoji: "🔥" },

  // Top-right cluster
  { id: "alert", x: 78, y: 12, type: "card" as const, delay: 0.5 },
  { id: "winrate", x: 88, y: 38, type: "badge" as const, delay: 0.7 },
  { id: "avatar2", x: 92, y: 16, type: "avatar" as const, delay: 0.3, initials: "AK", color: "hsl(var(--profit))" },
  { id: "emoji2", x: 82, y: 56, type: "emoji" as const, delay: 0.8, emoji: "📈" },

  // Bottom-left
  { id: "ai", x: 10, y: 72, type: "card" as const, delay: 0.9 },
  { id: "avatar3", x: 24, y: 82, type: "avatar" as const, delay: 0.5, initials: "SM", color: "hsl(210 80% 55%)" },

  // Bottom-right
  { id: "pnl", x: 85, y: 70, type: "badge" as const, delay: 0.6 },
  { id: "avatar4", x: 75, y: 80, type: "avatar" as const, delay: 0.4, initials: "VK", color: "hsl(270 60% 55%)" },
  { id: "emoji3", x: 90, y: 82, type: "emoji" as const, delay: 1.0, emoji: "✅" },

  // Mid scattered dots
  { id: "dot1", x: 30, y: 30, type: "dot" as const, delay: 0.2 },
  { id: "dot2", x: 70, y: 25, type: "dot" as const, delay: 0.4 },
  { id: "dot3", x: 35, y: 72, type: "dot" as const, delay: 0.6 },
  { id: "dot4", x: 68, y: 68, type: "dot" as const, delay: 0.8 },
  { id: "dot5", x: 15, y: 35, type: "dot" as const, delay: 0.3 },
  { id: "dot6", x: 85, y: 50, type: "dot" as const, delay: 0.5 },
];

/* ── Connection lines from dots to nearby elements ── */
const connections = [
  { from: "dot1", to: "reliance" },
  { from: "dot1", to: "streak" },
  { from: "dot2", to: "alert" },
  { from: "dot2", to: "avatar2" },
  { from: "dot3", to: "ai" },
  { from: "dot3", to: "emoji1" },
  { from: "dot4", to: "pnl" },
  { from: "dot4", to: "emoji2" },
  { from: "dot5", to: "avatar1" },
  { from: "dot5", to: "reliance" },
  { from: "dot6", to: "winrate" },
  { from: "dot6", to: "pnl" },
  { from: "dot1", to: "dot5" },
  { from: "dot2", to: "dot6" },
  { from: "dot3", to: "dot4" },
];

function getNodePos(id: string) {
  const n = nodes.find((n) => n.id === id);
  return n ? { x: n.x, y: n.y } : { x: 50, y: 50 };
}

function AnimatedWinRate() {
  const [val, setVal] = useState(68.4);
  useEffect(() => {
    const interval = setInterval(() => {
      setVal((v) => {
        const next = v + (Math.random() - 0.45) * 0.8;
        return Math.max(60, Math.min(75, parseFloat(next.toFixed(1))));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return <span className="font-mono font-bold text-profit text-xs">{val.toFixed(1)}%</span>;
}

function AnimatedPnl() {
  const [val, setVal] = useState(24850);
  useEffect(() => {
    const interval = setInterval(() => {
      setVal((v) => {
        const next = v + Math.round((Math.random() - 0.4) * 500);
        return Math.max(18000, Math.min(35000, next));
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  return <span className="font-mono font-bold text-profit text-xs">+₹{val.toLocaleString("en-IN")}</span>;
}

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* SVG connection lines */}
      <svg className="absolute inset-0 w-full h-full hidden lg:block" preserveAspectRatio="none">
        {connections.map((c, i) => {
          const from = getNodePos(c.from);
          const to = getNodePos(c.to);
          return (
            <motion.line
              key={i}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="4 6"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 0.25, pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 + i * 0.08, ease: "easeOut" }}
            />
          );
        })}
      </svg>

      {/* Render each node */}
      {nodes.map((node) => {
        const baseStyle: React.CSSProperties = {
          left: `${node.x}%`,
          top: `${node.y}%`,
        };

        if (node.type === "dot") {
          return (
            <motion.div
              key={node.id}
              className="absolute hidden lg:block"
              style={baseStyle}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{ delay: node.delay, duration: 0.5 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-border"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, delay: node.delay }}
              />
            </motion.div>
          );
        }

        if (node.type === "avatar") {
          return (
            <motion.div
              key={node.id}
              className="absolute hidden lg:block"
              style={baseStyle}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: node.delay, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="w-9 h-9 rounded-full ring-2 ring-background shadow-lg flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: (node as any).color }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {(node as any).initials}
              </motion.div>
            </motion.div>
          );
        }

        if (node.type === "emoji") {
          return (
            <motion.div
              key={node.id}
              className="absolute hidden lg:block"
              style={baseStyle}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: node.delay, type: "spring", stiffness: 180 }}
            >
              <motion.div
                className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/30 shadow-md flex items-center justify-center text-lg"
                animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {(node as any).emoji}
              </motion.div>
            </motion.div>
          );
        }

        if (node.type === "card") {
          return (
            <motion.div
              key={node.id}
              className="absolute hidden lg:block"
              style={baseStyle}
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: node.delay, type: "spring", stiffness: 150 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {node.id === "reliance" && (
                  <div className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-lg p-3 shadow-lg w-40" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.08), 0 10px 20px -5px rgb(0 0 0 / 0.08)" }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1.5 h-4 rounded-full bg-profit" />
                      <div>
                        <p className="text-[10px] font-semibold">RELIANCE</p>
                        <p className="text-[8px] text-muted-foreground">BUY · ₹2,945</p>
                      </div>
                    </div>
                    <p className="text-[11px] font-mono font-bold text-profit">+₹2,450</p>
                  </div>
                )}
                {node.id === "alert" && (
                  <div className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-lg px-3 py-2 shadow-lg flex items-center gap-2" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.08), 0 10px 20px -5px rgb(0 0 0 / 0.08)" }}>
                    <div className="w-7 h-7 rounded-lg bg-[hsl(var(--tb-accent)/0.08)] flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold">Alert Triggered</p>
                      <p className="text-[8px] text-muted-foreground">NIFTY crossed 24,300</p>
                    </div>
                  </div>
                )}
                {node.id === "ai" && (
                  <div className="rounded-2xl border border-[hsl(270_60%_55%/0.15)] bg-card/80 backdrop-blur-lg px-3 py-2 shadow-lg flex items-center gap-2 max-w-[180px]" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.08), 0 8px 16px -4px rgb(0 0 0 / 0.06)" }}>
                    <div className="w-7 h-7 rounded-lg bg-[hsl(270_60%_55%/0.1)] flex items-center justify-center shrink-0">
                      <Brain className="w-3.5 h-3.5 text-[hsl(270_60%_55%)]" />
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">
                      <span className="font-semibold text-foreground/80">AI:</span> Reduce size on Mondays
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        }

        if (node.type === "badge") {
          return (
            <motion.div
              key={node.id}
              className="absolute hidden lg:block"
              style={baseStyle}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: node.delay, type: "spring", stiffness: 160 }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {node.id === "streak" && (
                  <div className="rounded-full border border-[hsl(var(--tb-accent)/0.2)] bg-card/80 backdrop-blur-lg px-3 py-1.5 shadow-md flex items-center gap-1.5" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
                    <Flame className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />
                    <span className="text-[10px] font-semibold">5-Day Streak</span>
                  </div>
                )}
                {node.id === "winrate" && (
                  <div className="rounded-2xl border border-profit/15 bg-card/80 backdrop-blur-lg px-3 py-2 shadow-md" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
                    <div className="flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5 text-profit" />
                      <div>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Win Rate</p>
                        <AnimatedWinRate />
                      </div>
                    </div>
                  </div>
                )}
                {node.id === "pnl" && (
                  <div className="rounded-2xl border border-profit/15 bg-card/80 backdrop-blur-lg px-3 py-2 shadow-md" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-wider">MTD P&L</p>
                    <AnimatedPnl />
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        }

        return null;
      })}
    </div>
  );
}
