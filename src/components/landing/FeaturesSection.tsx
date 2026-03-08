import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen, BarChart3, Bell, Brain, List,
  MessageSquare, Calculator, TrendingUp,
  Filter, Shield, Calendar, LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer, MotionSection, SectionBadge } from "./LandingShared";
import { previewMap } from "./FeatureMiniPreviews";

/* ─── Feature Categories ──────────────────────────────── */
type FeatureCategory = "journal" | "analytics" | "automation" | "risk";

const categoryLabels: Record<FeatureCategory, string> = {
  journal: "Journaling",
  analytics: "Analytics",
  automation: "Automation",
  risk: "Risk Management",
};

const categoryColors: Record<FeatureCategory, string> = {
  journal: "bg-primary/8 text-primary",
  analytics: "bg-profit/8 text-profit",
  automation: "bg-[hsl(210_80%_55%/0.08)] text-[hsl(210_80%_55%)]",
  risk: "bg-[hsl(270_65%_58%/0.08)] text-[hsl(270_65%_58%)]",
};

/* ─── Feature Data (12 features) ──────────────────────── */
const features: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  span: "hero" | "large" | "small";
  previewKey: string;
  category: FeatureCategory;
}[] = [
  { icon: BookOpen, title: "Smart Journal", description: "Multi-segment trade logging with charts, tags, notes, and pattern recognition across Equity, F&O, and Commodities.", color: "hsl(24 90% 55%)", span: "hero", previewKey: "journal", category: "journal" },
  { icon: TrendingUp, title: "Stock Screener", description: "Screen 500+ NSE stocks with live fundamentals — P/E, ROE, market cap, technicals. One-tap deep dives.", color: "hsl(152 60% 42%)", span: "large", previewKey: "screener", category: "analytics" },
  { icon: Brain, title: "AI Trade Insights", description: "AI-powered pattern analysis, timing blind-spots, and behavioral suggestions to sharpen your edge.", color: "hsl(270 65% 58%)", span: "large", previewKey: "ai", category: "analytics" },
  { icon: BarChart3, title: "Deep Analytics", description: "Equity curves, drawdown analysis, win-rate heatmaps, and segment breakdowns that reveal your true edge.", color: "hsl(152 60% 42%)", span: "small", previewKey: "analytics", category: "analytics" },
  { icon: Bell, title: "Real-Time Alerts", description: "Price alerts, scanner triggers, and instant Telegram notifications when conditions hit.", color: "hsl(210 80% 55%)", span: "small", previewKey: "alerts", category: "automation" },
  { icon: Shield, title: "Rules Engine", description: "Pre-trade checklists enforce discipline. Tag mistakes, track rule adherence, and build consistency.", color: "hsl(160 55% 42%)", span: "small", previewKey: "rules", category: "risk" },
  { icon: Calendar, title: "Daily Journal & Calendar", description: "Daily mood tracking, pre/post market notes, and a P&L heatmap calendar to visualize your trading rhythm.", color: "hsl(45 85% 50%)", span: "large", previewKey: "calendar", category: "journal" },
  { icon: Filter, title: "Smart Scanner", description: "Pre-built scans for gainers, losers, 52W highs, undervalued gems. Save custom filter combos.", color: "hsl(340 75% 55%)", span: "small", previewKey: "scanner", category: "analytics" },
  { icon: Calculator, title: "Position Sizing", description: "Risk-based lot calculator with capital management, leverage warnings, and max-risk guardrails.", color: "hsl(190 70% 45%)", span: "small", previewKey: "sizing", category: "risk" },
  { icon: List, title: "Watchlist", description: "Multi-watchlist monitoring with live prices, change %, and custom groupings.", color: "hsl(190 75% 45%)", span: "small", previewKey: "watchlist", category: "analytics" },
  { icon: LineChart, title: "Broker Integration", description: "Connect Dhan for live prices, portfolio auto-sync, and one-click execution from your journal.", color: "hsl(24 80% 50%)", span: "small", previewKey: "broker", category: "automation" },
  { icon: MessageSquare, title: "Telegram Bot", description: "Automated trade notifications, EOD reports, and morning briefings straight to your phone.", color: "hsl(200 85% 50%)", span: "small", previewKey: "telegram", category: "automation" },
];

/* ─── Grid Layout Map ─────────────────────────────────── */
function getGridClasses(span: string, index: number): string {
  if (span === "hero") return "md:col-span-12 lg:col-span-7";
  if (span === "large") {
    // Alternate large cards between left (col 1-7) and right (col 6-12)
    const largeIndex = features.slice(0, index + 1).filter(f => f.span === "large").length;
    return largeIndex % 2 === 1 ? "md:col-span-7" : "md:col-span-7 md:col-start-6";
  }
  return "md:col-span-5";
}

/* ─── Features Section ────────────────────────────────── */
export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28" aria-label="Features">
      <MotionSection className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-16 lg:mb-20">
          <SectionBadge>Features</SectionBadge>
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight">
            Everything you need to{" "}
            <span className="accent-script">trade</span>{" "}better
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed">
            Journal, analyze, and automate — tools designed by traders, for traders.
          </p>

          {/* Category pills */}
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            {(Object.keys(categoryLabels) as FeatureCategory[]).map((cat) => (
              <span key={cat} className={cn("px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide", categoryColors[cat])}>
                {categoryLabels[cat]}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Bento Grid */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i * 0.03}
              className={getGridClasses(f.span, i)}
            >
              <motion.div
                className={cn(
                  "group rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm h-full relative overflow-hidden transition-all duration-300",
                  f.span === "hero" ? "p-8 sm:p-10" : "p-6 sm:p-7",
                )}
                style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}
                whileHover={{ y: -4, borderColor: "hsl(var(--border) / 0.5)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Colored top accent line */}
                <div
                  className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: f.color }}
                />

                {/* Subtle hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  {/* Icon + Category */}
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${f.color.replace(")", " / 0.08)")}` }}
                      whileHover={{ scale: 1.08, rotate: 3 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <f.icon className="w-5 h-5" style={{ color: f.color }} />
                    </motion.div>
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider", categoryColors[f.category])}>
                      {categoryLabels[f.category]}
                    </span>
                  </div>

                  <h3 className={cn("font-bold mb-2 tracking-tight", f.span === "hero" ? "text-xl lg:text-2xl" : "text-lg")}>{f.title}</h3>
                  <p className={cn("text-muted-foreground leading-relaxed", f.span === "hero" ? "text-base" : "text-[15px]")}>{f.description}</p>

                  {f.previewKey && previewMap[f.previewKey]}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom stat strip */}
        <motion.div variants={fadeUp} className="mt-14 flex items-center justify-center gap-8 lg:gap-14 flex-wrap">
          {[
            { value: "12", label: "Powerful features" },
            { value: "3", label: "Market segments" },
            { value: "100%", label: "Free in beta" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </MotionSection>
    </section>
  );
}
