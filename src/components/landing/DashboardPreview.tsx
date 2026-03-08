import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  BarChart3, BookOpen, Target, Eye, Layers, Calendar,
  Home, Activity, Settings, FileText, AlertTriangle, LineChart,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scaleIn } from "./LandingShared";
import { TickerBar } from "./TickerBar";
import { DashboardTab } from "./preview-tabs/DashboardTab";
import { TradesTab } from "./preview-tabs/TradesTab";
import { StudiesTab } from "./preview-tabs/StudiesTab";
import { FundamentalsTab } from "./preview-tabs/FundamentalsTab";
import { AnalyticsTab } from "./preview-tabs/AnalyticsTab";

const tabs = [
  { key: "dashboard", label: "Dashboard", Icon: Home },
  { key: "trades", label: "Trades", Icon: Layers },
  { key: "studies", label: "Studies", Icon: BookOpen },
  { key: "fundamentals", label: "Fundamentals", Icon: Activity },
  { key: "analytics", label: "Analytics", Icon: BarChart3 },
] as const;

type TabKey = typeof tabs[number]["key"];

// Mobile shows fewer tabs
const mobileTabs: TabKey[] = ["dashboard", "trades", "analytics"];

const sidebarItems = [
  { label: "MAIN", type: "divider" as const },
  { Icon: Home, name: "dashboard" },
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

const AUTO_CYCLE_MS = 5000;

function TabContent({ tab }: { tab: TabKey }) {
  switch (tab) {
    case "dashboard": return <DashboardTab />;
    case "trades": return <TradesTab />;
    case "studies": return <StudiesTab />;
    case "fundamentals": return <FundamentalsTab />;
    case "analytics": return <AnalyticsTab />;
  }
}

export function DashboardPreview() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });
  const progressRef = useRef<number>(0);

  // Auto-cycle tabs
  useEffect(() => {
    if (!isInView || paused) {
      setProgress(0);
      return;
    }
    progressRef.current = 0;
    setProgress(0);
    const interval = setInterval(() => {
      progressRef.current += 50;
      setProgress(progressRef.current / AUTO_CYCLE_MS);
      if (progressRef.current >= AUTO_CYCLE_MS) {
        setActiveTab((prev) => {
          const idx = tabs.findIndex((t) => t.key === prev);
          return tabs[(idx + 1) % tabs.length].key;
        });
        progressRef.current = 0;
        setProgress(0);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isInView, paused, activeTab]);

  const handleTabClick = (key: TabKey) => {
    setActiveTab(key);
    progressRef.current = 0;
    setProgress(0);
  };

  return (
    <div ref={containerRef} className="relative max-w-6xl mx-auto px-2 sm:px-6 pb-16 sm:pb-24 overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[6rem] sm:text-[8rem] lg:text-[12rem] font-black text-muted-foreground/[0.03] uppercase tracking-widest">
          Preview
        </span>
      </div>

      <motion.div variants={scaleIn} initial="hidden" animate="visible" className="relative">
        {/* Glow */}
        <div className="absolute -inset-8 sm:-inset-16 bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.06)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-x-4 sm:inset-x-8 -bottom-4 h-8 rounded-3xl bg-foreground/[0.03] blur-xl" />
        <div className="absolute inset-x-2 sm:inset-x-4 -bottom-2 h-6 rounded-3xl bg-foreground/[0.04] blur-md" />

        <motion.div
          className="relative rounded-2xl sm:rounded-3xl border border-border/40 bg-card overflow-hidden max-w-full group cursor-pointer"
          style={{
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.08), 0 0 0 1px hsl(var(--border)/0.3), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)",
          }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.4 }}
          onMouseEnter={() => { setHovered(true); setPaused(true); }}
          onMouseLeave={() => { setHovered(false); setPaused(false); }}
          onClick={() => navigate("/login?mode=signup")}
        >
          {/* Hover CTA */}
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            initial={false}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ pointerEvents: hovered ? "auto" : "none" }}
          >
            <motion.div
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--tb-accent))] text-white font-semibold shadow-[0_6px_24px_hsl(var(--tb-accent)/0.4)]"
              initial={{ scale: 0.9 }}
              animate={{ scale: hovered ? 1 : 0.9 }}
            >
              Try it yourself →
            </motion.div>
          </motion.div>

          {/* Window chrome */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/30 bg-gradient-to-b from-muted/20 to-muted/10">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF605C]" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FFBD44]" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#00CA4E]" />
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center border-b border-border/20 bg-muted/10 px-2 sm:px-4 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const isMobileHidden = !mobileTabs.includes(tab.key);
              return (
                <button
                  key={tab.key}
                  onClick={(e) => { e.stopPropagation(); handleTabClick(tab.key); }}
                  className={cn(
                    "relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-medium whitespace-nowrap transition-colors",
                    isMobileHidden && "hidden sm:flex",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.Icon className="w-3 h-3" />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="active-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  {/* Progress bar on active tab */}
                  {isActive && !paused && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px]">
                      <div
                        className="h-full bg-primary/40 rounded-full transition-none"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
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
                const { Icon, name } = item as { Icon: React.ElementType; name: string };
                const isActive = activeTab === name;
                return (
                  <div key={i} className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground/30 hover:text-muted-foreground/50")}>
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

            {/* Main content */}
            <div className="flex-1 p-3 sm:p-5 min-w-0 min-h-[320px] sm:min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <TabContent tab={activeTab} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
