import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  Bell, PieChart, Brain, Flame, Target,
} from "lucide-react";

/* ── Floating nodes scattered around center, connected by thin lines ── */
interface FloatingNode {
  id: string;
  x: number; // % from left
  y: number; // % from top
  type: "card" | "badge" | "avatar" | "emoji" | "dot";
  delay: number;
  initials?: string;
  color?: string;
  emoji?: string;
}

const nodes: FloatingNode[] = [
  // Cards — positioned at edges
  { id: "reliance", x: 4, y: 22, type: "card", delay: 0.3 },
  { id: "alert", x: 80, y: 15, type: "card", delay: 0.5 },
  { id: "ai", x: 3, y: 68, type: "card", delay: 0.8 },

  // Badges
  { id: "streak", x: 20, y: 6, type: "badge", delay: 0.4 },
  { id: "winrate", x: 88, y: 45, type: "badge", delay: 0.6 },
  { id: "pnl", x: 82, y: 72, type: "badge", delay: 0.7 },

  // Avatars — small circles with initials
  { id: "a1", x: 12, y: 42, type: "avatar", delay: 0.2, initials: "RP", color: "hsl(var(--tb-accent))" },
  { id: "a2", x: 92, y: 22, type: "avatar", delay: 0.35, initials: "AK", color: "hsl(var(--profit))" },
  { id: "a3", x: 22, y: 80, type: "avatar", delay: 0.55, initials: "SM", color: "hsl(210 80% 55%)" },
  { id: "a4", x: 76, y: 82, type: "avatar", delay: 0.45, initials: "VK", color: "hsl(270 60% 55%)" },
  { id: "a5", x: 38, y: 10, type: "avatar", delay: 0.65, initials: "PT", color: "hsl(340 70% 55%)" },

  // Emojis
  { id: "e1", x: 16, y: 58, type: "emoji", delay: 0.3, emoji: "🔥" },
  { id: "e2", x: 85, y: 60, type: "emoji", delay: 0.7, emoji: "📈" },
  { id: "e3", x: 70, y: 8, type: "emoji", delay: 0.9, emoji: "✅" },
  { id: "e4", x: 28, y: 90, type: "emoji", delay: 0.5, emoji: "💡" },

  // Connection dots (small)
  { id: "d1", x: 28, y: 28, type: "dot", delay: 0.15 },
  { id: "d2", x: 72, y: 30, type: "dot", delay: 0.25 },
  { id: "d3", x: 30, y: 68, type: "dot", delay: 0.35 },
  { id: "d4", x: 70, y: 65, type: "dot", delay: 0.45 },
  { id: "d5", x: 50, y: 12, type: "dot", delay: 0.2 },
  { id: "d6", x: 50, y: 85, type: "dot", delay: 0.55 },
  { id: "d7", x: 10, y: 90, type: "dot", delay: 0.6 },
  { id: "d8", x: 93, y: 88, type: "dot", delay: 0.4 },
];

const connections: [string, string][] = [
  ["reliance", "d1"], ["d1", "streak"], ["d1", "a1"],
  ["alert", "d2"], ["d2", "e3"], ["d2", "a2"],
  ["ai", "d3"], ["d3", "e1"], ["d3", "a3"],
  ["winrate", "d4"], ["d4", "e2"], ["d4", "pnl"],
  ["streak", "d5"], ["d5", "a5"], ["d5", "e3"],
  ["a3", "d6"], ["d6", "e4"], ["d6", "a4"],
  ["d1", "d3"], ["d2", "d4"],
  ["a1", "reliance"], ["a4", "pnl"],
  ["d7", "a3"], ["d7", "ai"],
  ["d8", "pnl"], ["d8", "a4"],
];

function getPos(id: string) {
  const n = nodes.find((n) => n.id === id);
  return n ? { x: n.x, y: n.y } : { x: 50, y: 50 };
}

function AnimatedPnl() {
  const [val, setVal] = useState(24850);
  useEffect(() => {
    const iv = setInterval(() => {
      setVal((v) => Math.max(18000, Math.min(35000, v + Math.round((Math.random() - 0.4) * 500))));
    }, 2500);
    return () => clearInterval(iv);
  }, []);
  return <span className="font-mono font-bold text-profit text-[11px]">+₹{val.toLocaleString("en-IN")}</span>;
}

function AnimatedWinRate() {
  const [val, setVal] = useState(68.4);
  useEffect(() => {
    const iv = setInterval(() => {
      setVal((v) => Math.max(60, Math.min(75, parseFloat((v + (Math.random() - 0.45) * 0.8).toFixed(1)))));
    }, 3000);
    return () => clearInterval(iv);
  }, []);
  return <span className="font-mono font-bold text-profit text-[11px]">{val.toFixed(1)}%</span>;
}

/* ── Parallax wrapper: moves slightly on mouse ── */
function useMouseParallax(factor = 0.02) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 50, damping: 20 });
  const springY = useSpring(y, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      x.set((e.clientX - cx) * factor);
      y.set((e.clientY - cy) * factor);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [factor, x, y]);

  return { x: springX, y: springY };
}

export function FloatingElements() {
  const parallax = useMouseParallax(0.015);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ x: parallax.x, y: parallax.y }}
    >
      {/* SVG connection lines */}
      <svg className="absolute inset-0 w-full h-full hidden lg:block">
        {connections.map(([fromId, toId], i) => {
          const from = getPos(fromId);
          const to = getPos(toId);
          return (
            <motion.line
              key={i}
              x1={`${from.x}%`} y1={`${from.y}%`}
              x2={`${to.x}%`} y2={`${to.y}%`}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const style: React.CSSProperties = { left: `${node.x}%`, top: `${node.y}%` };

        /* ── Dots ── */
        if (node.type === "dot") {
          return (
            <motion.div
              key={node.id} className="absolute hidden lg:block" style={style}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: node.delay, duration: 0.4 }}
            >
              <motion.div
                className="w-[6px] h-[6px] rounded-full bg-muted-foreground/20"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: node.delay * 2 }}
              />
            </motion.div>
          );
        }

        /* ── Avatars ── */
        if (node.type === "avatar") {
          return (
            <motion.div
              key={node.id} className="absolute hidden lg:block" style={style}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: node.delay, type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.div
                className="w-8 h-8 rounded-full ring-[2.5px] ring-background shadow-lg flex items-center justify-center text-[9px] font-bold text-white"
                style={{ backgroundColor: node.color }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {node.initials}
              </motion.div>
            </motion.div>
          );
        }

        /* ── Emojis ── */
        if (node.type === "emoji") {
          return (
            <motion.div
              key={node.id} className="absolute hidden lg:block" style={style}
              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: node.delay, type: "spring", stiffness: 180 }}
            >
              <motion.div
                className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/30 shadow-md flex items-center justify-center text-base select-none"
                animate={{ y: [0, -5, 0], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 6 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {node.emoji}
              </motion.div>
            </motion.div>
          );
        }

        /* ── Cards ── */
        if (node.type === "card") {
          return (
            <motion.div
              key={node.id} className="absolute hidden lg:block z-10" style={style}
              initial={{ scale: 0, y: 15 }} animate={{ scale: 1, y: 0 }}
              transition={{ delay: node.delay, type: "spring", stiffness: 140, damping: 14 }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 7 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {node.id === "reliance" && (
                  <div className="rounded-2xl border border-border/30 bg-card/85 backdrop-blur-xl p-3 shadow-lg w-[150px]" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100%/0.08), 0 8px 24px -6px rgb(0 0 0/0.1)" }}>
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
                  <div className="rounded-2xl border border-border/30 bg-card/85 backdrop-blur-xl px-3 py-2.5 shadow-lg flex items-center gap-2.5" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100%/0.08), 0 8px 24px -6px rgb(0 0 0/0.1)" }}>
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
                  <div className="rounded-2xl border border-[hsl(270_60%_55%/0.15)] bg-card/85 backdrop-blur-xl px-3 py-2.5 shadow-lg flex items-center gap-2.5 max-w-[175px]" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100%/0.08), 0 8px 20px -5px rgb(0 0 0/0.08)" }}>
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

        /* ── Badges ── */
        if (node.type === "badge") {
          return (
            <motion.div
              key={node.id} className="absolute hidden lg:block z-10" style={style}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: node.delay, type: "spring", stiffness: 160 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 6 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {node.id === "streak" && (
                  <div className="rounded-full border border-[hsl(var(--tb-accent)/0.2)] bg-card/85 backdrop-blur-xl px-3 py-1.5 shadow-md flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />
                    <span className="text-[10px] font-semibold">5-Day Streak</span>
                  </div>
                )}
                {node.id === "winrate" && (
                  <div className="rounded-2xl border border-profit/15 bg-card/85 backdrop-blur-xl px-3 py-2 shadow-md">
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
                  <div className="rounded-2xl border border-profit/15 bg-card/85 backdrop-blur-xl px-3 py-2 shadow-md">
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
    </motion.div>
  );
}
