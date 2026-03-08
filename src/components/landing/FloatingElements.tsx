import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, PieChart, Trophy, Brain,
} from "lucide-react";

const WORDS = ["Edge", "Pattern", "Discipline", "Strategy"];

// Only 4 strong floating cards, with live-updating numbers + staggered entrance + mouse parallax
export function FloatingElements() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [pnl, setPnl] = useState(2450);
  const [winRate, setWinRate] = useState(68.4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax (desktop only)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Live-updating numbers
  useEffect(() => {
    const interval = setInterval(() => {
      setPnl((prev) => {
        const delta = Math.floor(Math.random() * 200) - 80;
        return Math.max(1800, Math.min(3200, prev + delta));
      });
      setWinRate((prev) => {
        const delta = (Math.random() - 0.4) * 1.5;
        return Math.max(62, Math.min(75, +(prev + delta).toFixed(1)));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    // RELIANCE trade card — top left
    {
      key: "reliance",
      className: "absolute top-32 left-[6%] hidden lg:block",
      parallaxFactor: 12,
      delay: 0.2,
      enterFrom: { x: -80, opacity: 0 },
      content: (
        <div className="rounded-2xl border border-border/30 bg-card/70 backdrop-blur-lg p-3.5 shadow-lg shadow-black/[0.04] w-44" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.08), 0 10px 15px -3px rgb(0 0 0 / 0.06)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-5 rounded-full bg-profit" />
            <div>
              <p className="text-[10px] font-semibold">RELIANCE</p>
              <p className="text-[8px] text-muted-foreground">BUY · ₹2,945</p>
            </div>
          </div>
          <p className="text-[11px] font-mono font-bold text-profit transition-all duration-500">
            +₹{pnl.toLocaleString("en-IN")}
          </p>
        </div>
      ),
    },
    // Alert card — top right
    {
      key: "alert",
      className: "absolute top-40 right-[7%] hidden lg:block",
      parallaxFactor: -10,
      delay: 0.5,
      enterFrom: { x: 80, opacity: 0 },
      content: (
        <div className="rounded-2xl border border-border/30 bg-card/70 backdrop-blur-lg px-3.5 py-2.5 shadow-lg shadow-black/[0.04] flex items-center gap-2.5" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.08), 0 10px 15px -3px rgb(0 0 0 / 0.06)" }}>
          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--tb-accent)/0.08)] flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold">Alert Triggered</p>
            <p className="text-[8px] text-muted-foreground">NIFTY crossed 24,300</p>
          </div>
        </div>
      ),
    },
    // Win Rate — bottom right
    {
      key: "winrate",
      className: "absolute bottom-[28%] right-[5%] hidden lg:block",
      parallaxFactor: -8,
      delay: 0.8,
      enterFrom: { x: 60, y: 30, opacity: 0 },
      content: (
        <div className="rounded-2xl border border-profit/15 bg-card/70 backdrop-blur-lg px-4 py-2.5 shadow-lg" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.08), 0 10px 15px -3px rgb(0 0 0 / 0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-profit/10 flex items-center justify-center">
              <PieChart className="w-3.5 h-3.5 text-profit" />
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Win Rate</p>
              <p className="text-sm font-bold font-mono text-profit transition-all duration-500">{winRate}%</p>
            </div>
          </div>
        </div>
      ),
    },
    // AI Insight — bottom left
    {
      key: "ai",
      className: "absolute bottom-[22%] left-[5%] hidden xl:block",
      parallaxFactor: 10,
      delay: 1.1,
      enterFrom: { x: -60, y: 30, opacity: 0 },
      content: (
        <div className="rounded-2xl border border-[hsl(270_60%_55%/0.15)] bg-card/70 backdrop-blur-lg px-3.5 py-2.5 shadow-lg flex items-center gap-2.5 max-w-[200px]" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.08), 0 8px 12px -3px rgb(0 0 0 / 0.06)" }}>
          <div className="w-7 h-7 rounded-lg bg-[hsl(270_60%_55%/0.1)] flex items-center justify-center shrink-0">
            <Brain className="w-3.5 h-3.5 text-[hsl(270_60%_55%)]" />
          </div>
          <p className="text-[9px] text-muted-foreground leading-tight">
            <span className="font-semibold text-foreground/80">AI:</span> Reduce size on Mondays
          </p>
        </div>
      ),
    },
  ];

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {cards.map((card) => (
        <motion.div
          key={card.key}
          className={card.className}
          initial={card.enterFrom}
          animate={{
            x: mousePos.x * card.parallaxFactor,
            y: mousePos.y * (card.parallaxFactor * 0.6),
            opacity: 1,
          }}
          transition={{
            x: { type: "spring", stiffness: 50, damping: 20 },
            y: { type: "spring", stiffness: 50, damping: 20 },
            opacity: { duration: 0.8, delay: card.delay },
          }}
        >
          {/* Subtle bob animation layered on top */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {card.content}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

// Exported for HeroSection to use
export { WORDS };
