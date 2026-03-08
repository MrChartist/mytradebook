import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const rotateX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [2.5, 0, 0, -1.5]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.98, 1, 1, 0.99]);

  return (
    <div ref={containerRef} className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20 overflow-hidden" style={{ perspective: "1200px" }}>
      <motion.div variants={scaleIn} initial="hidden" animate={isInView ? "visible" : "hidden"} className="relative" style={{ y, rotateX, scale, transformStyle: "preserve-3d" }}>
        {/* Soft shadow layers */}
        <div className="absolute inset-x-6 sm:inset-x-10 -bottom-3 h-6 rounded-3xl bg-foreground/[0.03] blur-xl" />
        <div className="absolute inset-x-4 sm:inset-x-6 -bottom-1.5 h-4 rounded-3xl bg-foreground/[0.04] blur-md" />

        <motion.div
          className="relative rounded-xl sm:rounded-2xl border border-border/30 bg-card overflow-hidden"
          style={{
            boxShadow: "0 20px 50px -15px rgba(0,0,0,0.06), 0 0 0 1px hsl(var(--border)/0.2), inset 0 1px 0 0 hsl(0 0% 100% / 0.05)",
          }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-border/20 bg-muted/10">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF605C]" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FFBD44]" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#00CA4E]" />
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/30 border border-border/15">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              <span className="text-[8px] sm:text-[9px] font-medium text-muted-foreground/50 tracking-wide">Preview</span>
            </div>
          </div>

          {/* Ticker bar — hidden on mobile */}
          <div className="hidden sm:block">
            <TickerBar />
          </div>

          <div className="flex min-h-0">
            {/* Mini sidebar */}
            <div className="hidden sm:flex flex-col w-14 border-r border-border/10 bg-muted/[0.03] py-2 gap-0.5 items-center shrink-0">
              {sidebarItems.map((item, i) => {
                if ("type" in item && item.type === "divider") {
                  return (
                    <p key={i} className={cn("text-[5px] uppercase tracking-[0.12em] text-muted-foreground/30 font-semibold w-full text-center", i > 0 ? "mt-2 pt-2 border-t border-border/8" : "mb-0.5")}>
                      {item.label}
                    </p>
                  );
                }
                const { Icon, name } = item as { Icon: React.ElementType; name: string; active?: boolean };
                const isActive = (item as any).active;
                return (
                  <div key={i} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors relative", isActive ? "bg-primary/8 text-primary" : "text-muted-foreground/25")}>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-3.5 rounded-r-full bg-primary" />}
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                );
              })}
              <div className="mt-auto flex flex-col gap-0.5 items-center pt-2 border-t border-border/8">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/25">
                  <Settings className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-3 sm:p-5 min-w-0">
              <DashboardTab />
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-36 bg-gradient-to-t from-card via-card/95 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-4 sm:bottom-5 left-0 right-0 z-20 flex justify-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs sm:text-[13px] font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.03] transition-all duration-200"
            >
              Start Trading Smarter
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
