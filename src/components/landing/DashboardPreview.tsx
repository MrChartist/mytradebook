import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  Home, BookOpen, Layers, Target, Eye, Calendar,
  BarChart3, LineChart, FileText, AlertTriangle, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scaleIn } from "./LandingShared";
import { TickerBar } from "./TickerBar";
import { DashboardTab } from "./preview-tabs/DashboardTab";

const sidebarItems = [
  { label: "MAIN", type: "divider" as const },
  { Icon: Home, name: "dashboard", active: true },
  { Icon: BookOpen, name: "studies" },
  { Icon: Layers, name: "trades" },
  { Icon: Target, name: "alerts" },
  { Icon: Eye, name: "watchlist" },
  { Icon: Calendar, name: "calendar" },
  { label: "ANALYTICS", type: "divider" as const },
  { Icon: BarChart3, name: "analytics" },
  { Icon: LineChart, name: "reports" },
  { Icon: FileText, name: "fundamentals" },
  { Icon: AlertTriangle, name: "mistakes" },
];

export function DashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const rotateX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [3, 0, 0, -2]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.97, 1, 1, 0.98]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.02, 0.08, 0.02]);

  return (
    <div ref={containerRef} className="relative max-w-7xl mx-auto px-2 sm:px-6 pb-16 sm:pb-24 overflow-hidden" style={{ perspective: "1200px" }}>
      {/* Background watermark */}
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [20, -20]) }} className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[6rem] sm:text-[8rem] lg:text-[12rem] font-black text-muted-foreground/[0.03] uppercase tracking-widest">
          Preview
        </span>
      </motion.div>

      <motion.div variants={scaleIn} initial="hidden" animate={isInView ? "visible" : "hidden"} className="relative" style={{ y, rotateX, scale, transformStyle: "preserve-3d" }}>
        {/* Glow */}
        <motion.div style={{ opacity: glowOpacity }} className="absolute -inset-8 sm:-inset-16 bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent))_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-x-4 sm:inset-x-8 -bottom-4 h-8 rounded-3xl bg-foreground/[0.03] blur-xl" />
        <div className="absolute inset-x-2 sm:inset-x-4 -bottom-2 h-6 rounded-3xl bg-foreground/[0.04] blur-md" />

        <motion.div
          className="relative rounded-2xl sm:rounded-3xl border border-border/40 bg-card overflow-hidden max-w-full"
          style={{
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.08), 0 0 0 1px hsl(var(--border)/0.3), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)",
          }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.4 }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/30 bg-gradient-to-b from-muted/20 to-muted/10">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF605C]" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FFBD44]" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#00CA4E]" />
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/40 border border-border/20">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              <span className="text-[8px] sm:text-[9px] font-medium text-muted-foreground tracking-wide">View Only</span>
            </div>
          </div>

          {/* Ticker bar — hidden on mobile */}
          <div className="hidden sm:block">
            <TickerBar />
          </div>

          <div className="flex min-h-0">
            {/* Mini sidebar */}
            <div className="hidden sm:flex flex-col w-16 border-r border-border/15 bg-muted/5 py-2.5 gap-0.5 items-center shrink-0">
              {sidebarItems.map((item, i) => {
                if ("type" in item && item.type === "divider") {
                  return (
                    <p key={i} className={cn("text-[5px] uppercase tracking-[0.12em] text-muted-foreground/40 font-semibold w-full text-center", i > 0 ? "mt-2 pt-2 border-t border-border/10" : "mb-0.5")}>
                      {item.label}
                    </p>
                  );
                }
                const { Icon, name } = item as { Icon: React.ElementType; name: string; active?: boolean };
                const isActive = (item as any).active;
                return (
                  <div key={i} className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground/30")}>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary" />}
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                );
              })}
              <div className="mt-auto flex flex-col gap-0.5 items-center pt-2 border-t border-border/10">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground/30">
                  <Settings className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Main content — Dashboard only */}
            <div className="flex-1 p-4 sm:p-6 min-w-0">
              <DashboardTab />
            </div>
          </div>

          {/* Bottom fade teaser overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-44 bg-gradient-to-t from-card via-card/90 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 flex justify-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
            >
              Start Trading Smarter
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
