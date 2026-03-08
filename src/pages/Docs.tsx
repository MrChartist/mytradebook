import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp, BarChart3, Bell, BookOpen, Target, LineChart, Shield,
  LayoutDashboard, ArrowRight, ChevronRight, Zap, Eye, Activity,
  PieChart, Calendar, Keyboard, Settings, Send, Layers, Clock,
  CandlestickChart, Gauge, Star, Award, Users, Smartphone, Globe,
  Lock, Sparkles, FileText, Download, Upload, Filter, Grid3X3,
  List, Search, Tag, AlertTriangle, CheckCircle2, TrendingDown,
  ArrowUpRight, ArrowDownRight, Play, Pause, RefreshCw, ExternalLink,
  Wallet, Share2, MessageSquare, Command, Hash, Palette,
  PanelLeftClose, PanelLeftOpen, SlidersHorizontal,
  Calculator, ClipboardCheck, Trophy, Info
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import {
  BentoFeatureGrid, OnboardingFlowMockup, DashboardMockup, TradeCardMockup,
  TradeLifecycleFlow, AlertCardMockup, TelegramNotifMockup, WatchlistMockup,
  CalendarHeatmapMockup, KanbanBoardMockup, EquityCurveMockup,
  AnalyticsHeatmapMockup, AnalyticsMetricCards, ShortcutKeyboardMockup,
  DhanFlowDiagram, SettingsPanelMockup, PositionSizingMockup,
  StudyCardMockup, StreakDisciplineMockup, WeeklyReportMockup,
  MistakeTrendMockup, DailyJournalMockup, TelegramChannelsMockup,
  WidgetCustomizerMockup, CsvImportMockup, SegmentPerformanceMockup,
  RiskOfRuinMockup, TradeViewsMockup, AIInsightsMockup,
  MobileAppMockup, CalendarDayDetailMockup,
  TodaysPnlHeroMockup, KPICardsDetailMockup, RiskGaugeDetailMockup,
  EquityCurveWidgetMockup, CalendarHeatmapWidgetMockup, SegmentFilterMockup,
  CreateTradeMockup, TradeStatusLifecycleMockup, TSLDetailMockup,
  MultiLegStrategyDetailMockup, PositionSizingDetailMockup,
  PostTradeReviewMockup, TradeTemplateMockup,
  AlertConditionTypesMockup, RecurrenceCooldownMockup,
  DeliveryChannelsMockup, AlertManagementMockup,
  StudyCategoryWorkflowMockup, PatternTaggingMockup, StudyAdditionalFeaturesMockup,
  WatchlistDetailMockup,
  JournalDashboardTabMockup, JournalCalendarTabMockup, JournalMistakesTabMockup, JournalFiltersSegmentationMockup,
  DailyJournalWorkflowMockup, MistakeAnalysisToolsMockup,
  DhanIntegrationDetailMockup, TelegramIntegrationDetailMockup,
  KeyboardShortcutsDetailMockup,
  SettingsProfileBillingMockup, SettingsPreferencesMockup, SettingsTagManagementMockup,
  SettingsSecurityMockup, SettingsIntegrationsMockup, CapitalManagementMockup,
  AIApiSetupMockup, AIProviderComparisonMockup, AISettingsPreviewMockup, AIInsightSampleMockup,
  ScreenerPresetsMockup, ScreenerTableMockup, StockPopupMockup, CustomFilterBuilderMockup, ScreenerSparklineMockup,
  DocsColorModeProvider, useDocsColorMode
} from "@/components/docs/DocsMockups";
import {
  ProTip, StepByStep, ExpandableDetail,
  InteractiveMockup, PhaseHeader, QuickNav, KeyMetric, SubTopic
} from "@/components/docs/DocsEnhancements";
import {
  ShareCardsMockup, AchievementsMockup, PositionSizingCalcMockup,
  TradingRulesMockup, TradeCoachMockup, StreakShareMockup
} from "@/components/docs/DocsNewMockups";

const SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: Play },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "trade-management", label: "Trade Management", icon: CandlestickChart },
  { id: "csv-import", label: "CSV Import", icon: Upload },
  { id: "trade-templates", label: "Trade Templates", icon: FileText },
  { id: "position-sizing", label: "Position Sizing", icon: Calculator },
  { id: "trading-rules", label: "Trading Rules", icon: ClipboardCheck },
  { id: "alerts", label: "Alerts System", icon: Bell },
  { id: "studies", label: "Studies & Research", icon: BookOpen },
  { id: "watchlists", label: "Watchlists", icon: Eye },
  { id: "journal", label: "Trade Journal", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "calendar", label: "Calendar & Journal", icon: Calendar },
  { id: "mistakes", label: "Mistakes Review", icon: AlertTriangle },
  { id: "fundamentals", label: "Stock Screener", icon: Search },
  { id: "reports", label: "Weekly Reports", icon: PieChart },
  { id: "sharing", label: "Sharing & Social", icon: Share2 },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "trade-coach", label: "AI Trade Coach", icon: Sparkles },
  { id: "integrations", label: "Integrations", icon: Layers },
  { id: "ai-integration", label: "AI Insights Setup", icon: Sparkles },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard },
  { id: "pwa", label: "Mobile & PWA", icon: Smartphone },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "faq", label: "FAQ & Troubleshooting", icon: MessageSquare },
  { id: "changelog", label: "Changelog & Roadmap", icon: RefreshCw },
];

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 mt-4">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[13px] text-muted-foreground leading-relaxed">
          <ChevronRight className="w-3.5 h-3.5 text-primary mt-[2px] shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FeatureCard({ icon: Icon, title, children, badge }: {
  icon: React.ElementType; title: string; children: React.ReactNode; badge?: string;
}) {
  return (
    <div className="group rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm relative overflow-hidden transition-all duration-200 hover:border-border/35">
      {/* Top accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="p-5 lg:p-6 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px] text-primary" />
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-[15px] font-bold leading-tight tracking-tight">{title}</h3>
            {badge && (
              <span className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-primary/8 text-primary">
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 lg:px-6 pb-6 lg:pb-7">
        <div className="[&>p]:text-[13px] [&>p]:leading-[1.7] [&>p]:text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

function VideoPlaceholder({ title, duration }: { title: string; duration: string }) {
  return (
    <div className="my-5 rounded-xl border border-border/20 bg-card/40 overflow-hidden group cursor-pointer hover:border-border/35 transition-all duration-200">
      <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center py-12">
        <div className="relative flex flex-col items-center gap-2.5">
          <div className="w-12 h-12 rounded-full bg-primary/8 border border-primary/15 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Play className="w-5 h-5 text-primary ml-0.5" />
          </div>
          <p className="text-[13px] font-semibold text-foreground">{title}</p>
          <span className="text-[9px] text-muted-foreground/60 bg-muted/30 rounded-full px-2.5 py-0.5 font-medium">{duration} · Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/25 to-transparent" />
      <div className="w-1 h-1 rounded-full bg-primary/15" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/25 to-transparent" />
    </div>
  );
}

function SectionHeader({ id, title, description, icon: Icon }: {
  id: string; title: string; description: string; icon: React.ElementType;
}) {
  const copyLink = useCallback(() => {
    const url = `${window.location.origin}/docs#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      const el = document.getElementById(`copy-${id}`);
      if (el) { el.textContent = "Copied!"; setTimeout(() => { el.textContent = "#"; }, 1500); }
    });
  }, [id]);

  return (
    <div id={id} className="scroll-mt-24 mb-8 relative group">
      {/* Subtle left accent */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-primary/40 origin-top"
      />
      <div className="pl-5">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
            <Icon className="w-[18px] h-[18px] text-primary" />
          </div>
          <h2 className="text-xl lg:text-[1.65rem] font-extrabold tracking-tight leading-tight">{title}</h2>
          <button
            onClick={copyLink}
            className="opacity-0 group-hover:opacity-100 hover:!opacity-100 focus:!opacity-100 ml-0.5 p-1 rounded-md text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-all text-[11px] font-mono"
            aria-label={`Copy link to ${title}`}
            title="Copy section link"
          >
            <span id={`copy-${id}`}>#</span>
          </button>
        </div>
        <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-2xl">{description}</p>
      </div>
    </div>
  );
}

function ShortcutKey({ children }: { children: string }) {
  return (
    <kbd className="px-2 py-1 rounded-md bg-muted border border-border text-xs font-mono font-semibold text-foreground">
      {children}
    </kbd>
  );
}

export default function Docs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("getting-started");

  const isInsideApp = !!user;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const sorted = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSection(sorted[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Sidebar group separators
  const sidebarGroups = [
    { label: "Getting Started", ids: ["getting-started"] },
    { label: "Core Features", ids: ["dashboard", "trade-management", "csv-import", "trade-templates", "position-sizing", "trading-rules", "alerts", "studies", "watchlists", "journal"] },
    { label: "Advanced", ids: ["analytics", "calendar", "mistakes", "fundamentals", "reports"] },
    { label: "Social & AI", ids: ["sharing", "achievements", "trade-coach"] },
    { label: "Settings & Tools", ids: ["integrations", "ai-integration", "shortcuts", "pwa", "settings"] },
    { label: "Help", ids: ["faq", "changelog"] },
  ];

  return (
    <DocsColorModeProvider>
      <SEOHead
        title="Docs"
        description="Complete guide to TradeBook features — dashboard, trade logging, alerts, analytics, journal, and integrations for Indian market traders."
        path="/docs"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "name": "TradeBook Documentation",
          "description": "Complete guide to every TradeBook feature — from trade logging to AI-powered analytics for Indian market traders.",
          "url": "https://mytradebook.lovable.app/docs",
          "author": { "@type": "Organization", "name": "TradeBook" },
          "about": { "@type": "SoftwareApplication", "name": "TradeBook" }
        }}
      />
      <DocsContent
        navigate={navigate}
        isInsideApp={isInsideApp}
        activeSection={activeSection}
        scrollTo={scrollTo}
        sidebarGroups={sidebarGroups}
      />
    </DocsColorModeProvider>
  );
}

function DocsContent({ navigate, isInsideApp, activeSection, scrollTo, sidebarGroups }: {
  navigate: (path: string) => void;
  isInsideApp: boolean;
  activeSection: string;
  scrollTo: (id: string) => void;
  sidebarGroups: { label: string; ids: string[] }[];
}) {
  const { mode, toggle } = useDocsColorMode();
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("docs-sidebar-collapsed") === "true";
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      localStorage.setItem("docs-sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
      setShowBackToTop(scrollTop > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredSections = sidebarSearch
    ? SECTIONS.filter((s) => s.label.toLowerCase().includes(sidebarSearch.toLowerCase()))
    : SECTIONS;

  return (
    <div className={cn("min-h-screen bg-background text-foreground", isInsideApp && "pb-6", mode === "bw" && "docs-bw")} role="document">
      {/* Shared navbar */}
      <LandingNavbar activePage="docs" isInsideApp={isInsideApp} />

      {/* Hero */}
      <div className={cn("pt-20 border-b border-border/15 bg-gradient-to-b from-primary/[0.02] to-transparent", isInsideApp && "border-none")}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[10px] font-bold tracking-wide">
              Documentation
            </span>
            <button
              onClick={toggle}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all border",
                mode === "bw"
                  ? "bg-foreground text-background border-foreground"
                  : "bg-muted/30 text-muted-foreground/60 border-border/20 hover:border-border/40"
              )}
            >
              <Palette className="w-3 h-3" />
              {mode === "bw" ? "B&W" : "Color"}
            </button>
          </div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight mb-5 leading-[1.08] max-w-2xl">
            Everything you need to know about{" "}
            <span className="accent-script text-primary">TradeBook</span>
          </h1>
          <p className="text-[15px] lg:text-base text-muted-foreground/80 max-w-xl leading-[1.75]">
            A comprehensive guide to every feature, capability, and workflow — from your first trade log to advanced analytics.
          </p>
          <div className="flex items-center gap-2.5 mt-4 text-[11px] text-muted-foreground/50">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~35 min read</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            <span>Last updated: March 2026</span>
          </div>
          {/* Hero stat chips */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="flex flex-wrap gap-2 mt-6"
          >
            {[
              { label: "26 Sections", icon: FileText },
              { label: "80+ Mockups", icon: Eye },
              { label: "Every Feature", icon: Zap },
              { label: "Free vs Pro", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/15 bg-card/40 text-[11px] font-semibold text-foreground/80">
                <stat.icon className="w-3 h-3 text-primary" />
                {stat.label}
              </div>
            ))}
          </motion.div>
          <div className="mt-8">
            <BentoFeatureGrid />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-14">
        <div className="flex gap-12">
          {/* Sidebar — desktop */}
          <TooltipProvider delayDuration={200}>
            <aside className={cn(
              "hidden lg:block shrink-0 transition-all duration-300",
              sidebarCollapsed ? "w-14" : "w-64"
            )}>
              <div className="sticky top-24">
                {/* Scroll progress bar */}
                <div className="h-0.5 bg-muted/60 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-primary/80 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
                </div>
                {/* Header with collapse toggle */}
                <div className={cn("flex items-center mb-4", sidebarCollapsed ? "justify-center" : "justify-between px-3")}>
                  {!sidebarCollapsed && (
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">Contents</p>
                  )}
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                  </button>
                </div>
                {/* Search filter */}
                {!sidebarCollapsed && (
                  <div className="px-2 mb-2.5">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40" />
                      <input
                        type="text"
                        value={sidebarSearch}
                        onChange={(e) => setSidebarSearch(e.target.value)}
                        placeholder="Filter sections…"
                        className="w-full h-7 pl-7 pr-2.5 rounded-md bg-muted/30 border border-border/20 text-[11px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                )}
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <nav className={cn(!sidebarCollapsed && "pr-4")}>
                    {sidebarGroups.map((group, gi) => {
                      const groupSections = filteredSections.filter((s) => group.ids.includes(s.id));
                      if (groupSections.length === 0) return null;
                      return (
                      <div key={group.label}>
                         {gi > 0 && !sidebarCollapsed && <Separator className="my-2.5 mx-2" />}
                         {gi > 0 && sidebarCollapsed && <Separator className="my-2" />}
                         {!sidebarCollapsed && (
                           <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground/45 px-2.5 pt-1.5 pb-1">{group.label}</p>
                        )}
                        {groupSections.map((s) => {
                          const btn = (
                             <button
                               key={s.id}
                               onClick={() => { scrollTo(s.id); setSidebarSearch(""); }}
                               className={cn(
                                 "w-full flex items-center rounded-md text-[12px] transition-all duration-200 text-left relative",
                                 sidebarCollapsed ? "justify-center p-2" : "gap-2 px-2.5 py-[6px]",
                                 activeSection === s.id
                                   ? "bg-primary/8 text-primary font-semibold"
                                   : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/30"
                               )}
                             >
                               {activeSection === s.id && (
                                 <motion.div
                                   layoutId="docs-active-pill"
                                   className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full bg-primary"
                                   transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                 />
                               )}
                               <s.icon className="w-3.5 h-3.5 shrink-0" />
                               {!sidebarCollapsed && <span className="truncate">{s.label}</span>}
                             </button>
                          );

                          if (sidebarCollapsed) {
                            return (
                              <Tooltip key={s.id}>
                                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                                <TooltipContent side="right" className="text-xs">{s.label}</TooltipContent>
                              </Tooltip>
                            );
                          }
                          return btn;
                        })}
                      </div>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </div>
            </aside>
          </TooltipProvider>

          {/* Mobile tabs */}
          <nav className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/15" aria-label="Section navigation">
            <div className="flex gap-1 overflow-x-auto px-3 py-2 no-scrollbar">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap",
                    activeSection === s.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground/60"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Main content */}
          <main className={cn("flex-1 min-w-0 space-y-24 lg:pt-0 pt-14 transition-all duration-300", sidebarCollapsed ? "max-w-5xl" : "max-w-4xl")}>

            {/* ── Phase 1. Getting Started ─────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={1} total={26} />
              <SectionHeader
                id="getting-started"
                title="Getting Started"
                description="TradeBook is a professional trading journal built specifically for Indian markets — NSE, BSE, and MCX. Whether you trade equities, futures, options, or commodities, it gives you the tools to log, analyze, and improve your trading."
                icon={Play}
              />
              <QuickNav items={[
                { label: "Quick Start", id: "gs-quick-start" },
                { label: "Platform Overview", id: "gs-platform-overview" },
                { label: "System Requirements", id: "gs-system-req" },
              ]} />
              <VideoPlaceholder title="Getting Started with TradeBook — Full Walkthrough" duration="5 min" />

              <SubTopic title="Quick Start" description="Get up and running in under 5 minutes." id="gs-quick-start" />
              <StepByStep title="Your First 5 Minutes" steps={[
                { title: "Sign up with email", description: "Create your account with email and password. Verify via the confirmation email.", detail: "No credit card required — you get 14 days of Pro features free." },
                { title: "Set your starting capital", description: "Enter your trading capital amount during onboarding. This is used for risk calculations.", detail: "You can update this anytime in Settings → Preferences." },
                { title: "Choose your theme", description: "Pick light or dark mode. The interface adapts instantly.", detail: "Tip: Dark mode reduces eye strain during long market hours." },
                { title: "Log your first trade", description: "Click '+ New Trade' or press N on keyboard. Fill in symbol, entry price, and quantity.", detail: "Try the Command Palette (⌘K) for even faster trade entry." },
                { title: "Explore the dashboard", description: "Your trading cockpit shows P&L, risk gauge, equity curve, and all key metrics.", detail: "Drag-and-drop widgets to customize your layout." },
              ]} />

              <ProTip variant="best-practice">
                <p>Set your starting capital accurately before logging your first trade. This number drives all risk-per-trade calculations, position sizing suggestions, and portfolio % metrics. You can update it later in <strong>Settings → Capital Management</strong>, but getting it right from day one ensures your analytics are meaningful from the start.</p>
              </ProTip>

              <InteractiveMockup label="Onboarding Flow">
                <OnboardingFlowMockup />
              </InteractiveMockup>
              <MobileAppMockup />

              <SubTopic title="Platform Overview" description="Understand the key areas of TradeBook." id="gs-platform-overview" />
              <div className="grid md:grid-cols-2 gap-5 mt-2">
                <FeatureCard icon={Users} title="Create Your Account">
                  <p className="text-sm text-muted-foreground mb-3">Sign up with email and verify your account. You'll get a 14-day Pro trial with full access to every feature — no credit card required.</p>
                  <FeatureList items={[
                    "Email-based signup with secure authentication",
                    "14-day Pro trial on every new account",
                    "Set your starting capital during onboarding",
                    "Choose light or dark theme preference",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={LayoutDashboard} title="Navigate the Platform">
                  <p className="text-sm text-muted-foreground mb-3">The sidebar gives you quick access to every section. On mobile, a bottom navigation bar keeps everything within thumb reach.</p>
                  <FeatureList items={[
                    "Dashboard — your trading cockpit with KPIs and widgets",
                    "Trades — manage all your positions in list or grid view",
                    "Alerts — set price triggers with Telegram delivery",
                    "Studies — research ideas with pattern tagging",
                    "Watchlist — track instruments with live prices",
                    "Analytics — deep performance breakdowns (Pro)",
                  ]} />
                </FeatureCard>
              </div>

              <ProTip variant="info">
                <p>Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[11px] font-mono font-semibold">⌘K</kbd> anywhere to open the Command Palette — search trades, create alerts, and navigate instantly without touching the mouse.</p>
              </ProTip>

              <SubTopic title="System Requirements & Browser Support" id="gs-system-req" />
              <ExpandableDetail title="Supported Browsers & Devices" icon={Shield} defaultOpen={false}>
                <p>TradeBook is a modern web application optimized for the latest browsers. For the best experience:</p>
                <FeatureList items={[
                  "Chrome 90+ (recommended) — best performance and PWA support",
                  "Firefox 88+ — fully supported",
                  "Safari 15+ — fully supported on macOS and iOS",
                  "Edge 90+ — fully supported (Chromium-based)",
                  "Mobile — responsive design with PWA install for Android & iOS",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">Internet Explorer is not supported. For real-time price updates, a stable broadband connection is recommended.</p>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── 2. Dashboard ───────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, delay: 0.05 }}>
              <PhaseHeader phase={2} total={26} />
              <SectionHeader
                id="dashboard"
                title="Dashboard"
                description="Your trading cockpit. A single screen that shows your P&L, risk exposure, open positions, and trading discipline — all updated in real-time during market hours."
                icon={LayoutDashboard}
              />
              <QuickNav items={[
                { label: "Performance Overview", id: "db-performance" },
                { label: "Charts & Visualizations", id: "db-charts" },
                { label: "Customization", id: "db-customization" },
                { label: "Advanced Widgets", id: "db-advanced" },
              ]} />
              <InteractiveMockup label="Dashboard Overview">
                <DashboardMockup />
              </InteractiveMockup>

              <SubTopic title="Performance Overview" description="Real-time P&L and key trading metrics at a glance." id="db-performance" />
              <FeatureCard icon={Activity} title="Today's P&L Hero Card">
                <p className="text-sm text-muted-foreground">
                  The top hero card shows your total P&L for the day with a large, color-coded number. Green for profit, red for loss. Breaks down realized vs unrealized gains and shows win/loss count. Updates in real-time if you have live prices enabled via Dhan integration.
                </p>
                <div className="mt-4"><TodaysPnlHeroMockup /></div>
              </FeatureCard>

              <FeatureCard icon={BarChart3} title="KPI Cards">
                <p className="text-sm text-muted-foreground mb-3">Four key metrics at a glance, each clickable to navigate to the relevant page:</p>
                <FeatureList items={[
                  "MTD P&L — month-to-date profit/loss with realized/unrealized split → Reports",
                  "Open Positions — count of active trades with capital at risk → Trades",
                  "Win Rate — percentage with expectancy per trade → Analytics",
                  "Active Alerts — triggered today count with price/technical split → Alerts",
                ]} />
                <div className="mt-4"><KPICardsDetailMockup /></div>
              </FeatureCard>

              <FeatureCard icon={Gauge} title="Risk Gauge & Goal Tracker">
                <p className="text-sm text-muted-foreground">
                  Visualize your daily risk as a percentage of capital with a color-coded gauge (green under 1%, yellow up to 1.5%, red above). The goal tracker shows progress bars for daily (1%) and monthly (5%) profit targets, both calculated from your starting capital.
                </p>
                <div className="mt-4"><RiskGaugeDetailMockup /></div>
              </FeatureCard>

              <ExpandableDetail title="Understanding the Risk Gauge Colors" icon={Gauge} badge="Deep Dive">
                <p>The risk gauge uses a three-zone color system based on your total capital at risk across all open positions:</p>
                <FeatureList items={[
                  "Green (0–1%) — healthy risk. You're within conservative limits for most trading styles.",
                  "Yellow (1–1.5%) — moderate risk. Acceptable for aggressive strategies, but be cautious adding new positions.",
                  "Red (1.5%+) — elevated risk. Consider reducing exposure or tightening stop losses on open trades.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">Risk % is calculated as: (Total capital at risk across open positions ÷ Starting capital) × 100. Capital at risk per trade = quantity × |entry price − stop loss|. Trades without a stop loss use a default 2% assumed risk.</p>
              </ExpandableDetail>

              <SubTopic title="Charts & Visualizations" description="Visual tools to track your equity, streaks, and daily performance." id="db-charts" />
              <FeatureCard icon={TrendingUp} title="Equity Curve Widget">
                <p className="text-sm text-muted-foreground">
                  A compact equity curve chart showing your cumulative P&L over the selected month with gradient fill. Shows peak equity, max drawdown, and date labels. Hover over data points to see exact values. The curve updates automatically as you close trades.
                </p>
                <div className="mt-4"><EquityCurveWidgetMockup /></div>
              </FeatureCard>

              <FeatureCard icon={Award} title="Streak & Discipline Tracker">
                <p className="text-sm text-muted-foreground">
                  Tracks your consecutive profitable days (winning streak) and consecutive losing days. Flags "oversize trades" — any trade that risks more than 10% of your capital — as discipline warnings. Helps maintain consistent position sizing habits.
                </p>
                <div className="mt-4"><StreakDisciplineMockup /></div>
              </FeatureCard>

              <FeatureCard icon={Calendar} title="Calendar Heatmap">
                <p className="text-sm text-muted-foreground">
                  A compact monthly calendar where each day is color-coded by P&L — green shades for profitable days, red shades for losses. Shows P&L amounts in each cell. Click any day to jump to the full calendar view with daily journal and trade details.
                </p>
                <div className="mt-4"><CalendarHeatmapWidgetMockup /></div>
              </FeatureCard>

              <SubTopic title="Customization & Layout" description="Tailor your dashboard to your workflow." id="db-customization" />
              <FeatureCard icon={Settings} title="Widget Customization" badge="Enhanced">
                <p className="text-sm text-muted-foreground mb-3">Personalize your dashboard by showing/hiding widgets and drag-to-reorder them:</p>
                <FeatureList items={[
                  "Toggle visibility of any widget (P&L, KPIs, equity curve, etc.)",
                  "Drag-and-drop reordering with smooth animations (@dnd-kit)",
                  "Reset to default layout anytime",
                  "Layout persists across sessions",
                ]} />
                <div className="mt-4"><WidgetCustomizerMockup /></div>
              </FeatureCard>

              <ProTip variant="warning">
                <p>Resist the urge to show every widget at once. A cluttered dashboard splits your attention — start with P&L, KPIs, and the equity curve, then add widgets only when you find yourself needing them regularly. You can always reset to default layout if things get noisy.</p>
              </ProTip>

              <FeatureCard icon={Activity} title="Floating Trade Ticker" badge="New">
                <p className="text-sm text-muted-foreground mb-3">
                  A scrolling marquee at the top of the dashboard showing your open positions with real-time P&L. Gives you a quick glance at all active trades without scrolling.
                </p>
                <FeatureList items={[
                  "Auto-scrolling ticker showing all open positions",
                  "Displays symbol, quantity, entry price, current price, and P&L",
                  "Color-coded: green for profit, red for loss",
                  "Pauses on hover to read details",
                  "Dismissible — hides when no open positions",
                  "Updates with live price data when available",
                ]} />
              </FeatureCard>

              <FeatureCard icon={Zap} title="Animated KPI Numbers" badge="New">
                <p className="text-sm text-muted-foreground">
                  All key metrics on the dashboard use smooth "tick-up" number animations when values change. P&L figures, win rates, and trade counts animate from their previous value to the new one using requestAnimationFrame for 60fps smoothness. Profit cards pulse with a green glow, and all cards have a subtle 3D lift on hover.
                </p>
              </FeatureCard>

              <SubTopic title="Advanced Widgets" description="Power-user widgets for portfolio visualization and daily reviews." id="db-advanced" />
              <FeatureCard icon={Grid3X3} title="Portfolio Heat Map" badge="New">
                <p className="text-sm text-muted-foreground mb-3">
                  A treemap-style visualization of your open positions. Each tile represents a position, sized by its value and color-coded by unrealized P&L — deep green for profits, deep red for losses.
                </p>
                <FeatureList items={[
                  "Tile size proportional to position value (quantity × LTP)",
                  "Color gradient from red (-5%+) through neutral to green (+5%+)",
                  "Hover to see full details: symbol, qty, entry, LTP, P&L",
                  "Auto-updates with live price data",
                  "Falls back to empty state when no open positions",
                ]} />
              </FeatureCard>

              <FeatureCard icon={Star} title="Daily Review Wizard" badge="New">
                <p className="text-sm text-muted-foreground mb-3">
                  A guided end-of-day review flow accessible from the floating Quick Actions button. Walk through a structured 4-step reflection process after market close.
                </p>
                <FeatureList items={[
                  "Step 1: Set your mood (Great → Terrible) and rate discipline (1-5 stars)",
                  "Step 2: Review today's closed trades and tag your best/worst trade",
                  "Step 3: Write reflections — what worked, what to improve, lessons learned",
                  "Step 4: Review summary and save to your daily journal",
                  "Auto-saves to your Calendar journal entry for the day",
                ]} />
              </FeatureCard>

              <InteractiveMockup label="Segment & Month Filters">
                <FeatureCard icon={Filter} title="Segment & Month Filters">
                  <p className="text-sm text-muted-foreground mb-3">Filter the entire dashboard by market segment and time period:</p>
                  <FeatureList items={[
                    "Segments: All, Intraday, Positional, Futures, Options, Commodities",
                    "Quick month selector for the last 3 months",
                    "Live indicator shows streaming status and last update time",
                    "All KPIs, charts, and widgets update based on filters",
                  ]} />
                  <div className="mt-4"><SegmentFilterMockup /></div>
                </FeatureCard>
              </InteractiveMockup>

              <ProTip variant="best-practice">
                <p>Check your dashboard every morning before market opens. The segment filter lets you focus on today's active market — switch to "All" only during your weekly review.</p>
              </ProTip>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 3. Trade Management ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={3} total={26} />
              <SectionHeader
                id="trade-management"
                title="Trade Management"
                description="The core of TradeBook. Log every trade with detailed metadata — entry, exit, stop loss, targets, tags, chart images, and post-trade reviews. Manage your entire trading book from one screen."
                icon={CandlestickChart}
              />
              <ProTip>
                <p>Always set your stop loss before submitting a trade. TradeBook calculates your risk-to-reward ratio automatically — trades with R:R below 1:2 are flagged in your analytics.</p>
              </ProTip>
              <QuickNav items={[
                { label: "Creating Trades", id: "tm-creating" },
                { label: "Trade Lifecycle", id: "tm-lifecycle" },
                { label: "Risk Management", id: "tm-risk" },
                { label: "Post-Trade Review", id: "tm-review" },
                { label: "Sharing & Discipline", id: "tm-sharing" },
                { label: "Quick Actions", id: "tm-quick" },
              ]} />

              <SubTopic title="Creating & Managing Trades" description="Log trades with detailed metadata and smart defaults." id="tm-creating" />

              <StepByStep title="Creating Your First Trade" steps={[
                { title: "Open the trade form", description: "Click '+ New Trade' in the sidebar or press N on your keyboard. The Command Palette (⌘K) also works.", detail: "On mobile, tap the floating '+' button at the bottom right." },
                { title: "Search for an instrument", description: "Type the stock name or symbol. The unified search covers NSE, BSE, and MCX — equities, futures, and options.", detail: "The segment (Intraday, Positional, F&O, etc.) is auto-detected from the instrument type." },
                { title: "Set entry details", description: "Enter your entry price, quantity, and trade type (BUY or SELL). Add a stop loss and up to 5 target levels.", detail: "The position sizing calculator shows your optimal quantity based on risk %." },
                { title: "Add context & submit", description: "Attach setup tags, chart links, confidence score, and notes. Check off your trading rules, then submit.", detail: "Templates can pre-fill most of these fields for your common setups." },
              ]} />

              <FeatureCard icon={Search} title="Trade Creation Form">
                <p className="text-sm text-muted-foreground mb-3">Full trade creation with smart defaults and rich metadata:</p>
                <FeatureList items={[
                  "Unified instrument search across NSE, BSE, MCX (equity, futures, options)",
                  "Auto-detect segment based on instrument type",
                  "Set entry price, stop loss, and up to 5 target levels",
                  "Choose trade type: BUY or SELL",
                  "Add confidence score (1-5) and rating (1-10)",
                  "Attach setup tags, pattern tags, and notes",
                  "Link up to 5 chart images per trade (TradingView or direct URLs)",
                ]} />
                <div className="mt-4"><CreateTradeMockup /></div>
              </FeatureCard>

              <ProTip variant="best-practice">
                <p>Always attach chart screenshots or TradingView links to your trades. When you review them weeks later, the chart context is invaluable — it shows what you <em>saw</em> at entry time, not what the chart looks like in hindsight. You can attach up to 5 links per trade.</p>
              </ProTip>

              <SubTopic title="Trade Statuses & Lifecycle" description="Every trade flows through a clear lifecycle with distinct statuses." id="tm-lifecycle" />
              <FeatureCard icon={Layers} title="Trade Statuses & Lifecycle">
                <p className="text-sm text-muted-foreground mb-3">Every trade flows through a clear lifecycle:</p>
                <FeatureList items={[
                  "Planned — trade idea logged but not yet executed",
                  "Open — active position in the market",
                  "Closed — position exited, P&L calculated",
                  "Cancelled — trade idea abandoned before entry",
                ]} />
                <div className="mt-4"><TradeStatusLifecycleMockup /></div>
              </FeatureCard>

              <ExpandableDetail title="Understanding Trade Statuses" icon={Layers} badge="Deep Dive">
                <p>Each status has specific rules and triggers:</p>
                <FeatureList items={[
                  "Planned → Open: When you confirm entry. The entry time and price are locked.",
                  "Open → Closed: When you close the position. P&L is calculated from entry and exit prices, factoring in quantity and trade type.",
                  "Planned → Cancelled: When you decide not to take the trade. No P&L impact.",
                  "Open trades show live unrealized P&L when connected to Dhan for live prices.",
                  "Closed trades trigger the Post-Trade Review modal and AI Coach analysis.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">You can also backfill historical trades using the custom date-time picker — useful when migrating from another journal or logging trades after market hours.</p>
              </ExpandableDetail>

              <SubTopic title="Risk Management Tools" description="Automated stop loss, position sizing, and multi-leg strategies." id="tm-risk" />
              <FeatureCard icon={Target} title="Trailing Stop Loss (TSL)">
                <p className="text-sm text-muted-foreground mb-3">Automated stop loss management for open positions:</p>
                <FeatureList items={[
                  "Configure TSL by percentage, fixed points, or trigger price",
                  "TSL activates only after price moves in your favor (Activation %)",
                  "Configurable step size, gap, and cooldown between updates",
                  "Per-segment TSL profiles (different settings for intraday vs positional)",
                  "Telegram notifications when TSL updates or gets hit",
                ]} />
                <div className="mt-4"><TSLDetailMockup /></div>
              </FeatureCard>

              <FeatureCard icon={Grid3X3} title="Multi-Leg Strategies">
                <p className="text-sm text-muted-foreground mb-3">Group related trades under a single strategy:</p>
                <FeatureList items={[
                  "10+ strategy templates (Bull Call Spread, Iron Condor, Straddle, etc.)",
                  "Add up to 4 individual trade legs under the parent",
                  "Combined P&L and net premium calculated automatically",
                  "Strategy-level notes and status tracking",
                  "Option Chain Selector — dynamic strike selection with 50/25/10 increments based on underlying price, supports 185+ F&O underlyings",
                ]} />
                <div className="mt-4"><MultiLegStrategyDetailMockup /></div>
              </FeatureCard>

              <FeatureCard icon={Gauge} title="Position Sizing Calculator">
                <p className="text-sm text-muted-foreground">
                  Built into the trade creation form. Enter your risk per trade (as % of capital or fixed amount), and the calculator tells you the optimal quantity based on your entry price and stop loss distance. Shows position value and max loss in rupees.
                </p>
                <div className="mt-4"><PositionSizingDetailMockup /></div>
              </FeatureCard>

              <SubTopic title="Post-Trade Review & Reflection" description="Structured review process after closing every trade." id="tm-review" />
              <FeatureCard icon={Star} title="Post-Trade Review">
                <p className="text-sm text-muted-foreground mb-3">When you close a trade, a review modal prompts you to reflect:</p>
                <FeatureList items={[
                  "Rate execution quality (1-5 bar scale)",
                  "Did you follow your trading rules? (Yes/No toggle)",
                  "What worked well? (free text reflection)",
                  "What failed or could improve? (free text reflection)",
                  "Overall trade rating (1-10 stars)",
                  "Review data feeds into journal analytics",
                ]} />
                <div className="mt-4"><PostTradeReviewMockup /></div>
              </FeatureCard>

              <SubTopic title="Sharing, Gamification & Discipline" description="Social cards, badges, trading rules, and AI coaching." id="tm-sharing" />
              <FeatureCard icon={Share2} title="P&L & Trade Share Cards" badge="New">
                <p className="text-sm text-muted-foreground mb-3">
                  Generate beautiful, branded share cards for social media. Share your daily P&L summary, individual trade results, or winning streaks with customizable templates.
                </p>
                <FeatureList items={[
                  "P&L Share Card — daily/weekly/monthly P&L summary with equity curve",
                  "Trade Share Card — individual trade with entry, exit, P&L, and chart",
                  "Streak Share Card — consecutive win/loss streak visualization",
                  "Multiple templates: Dark Minimal, Gradient Pro, Neon, and more",
                  "One-click download as PNG image",
                  "Watermark with your username for attribution",
                  "Accessible from trade detail modal and dashboard quick actions",
                ]} />
              </FeatureCard>

              <FeatureCard icon={Award} title="Achievements & Badges" badge="New">
                <p className="text-sm text-muted-foreground mb-3">
                  Gamified milestones that celebrate your trading journey. Unlock badges as you hit key milestones.
                </p>
                <FeatureList items={[
                  "First Trade, First Win, First 10 Trades milestones",
                  "Streak badges: 3-day, 7-day, 14-day winning streaks",
                  "Journal discipline badges for consistent daily journaling",
                  "Analytics engagement badges",
                  "Progress tracking with percentage completion",
                  "Badge grid displayed on the dashboard",
                ]} />
              </FeatureCard>

              <FeatureCard icon={Shield} title="Trading Rules Checklist">
                <p className="text-sm text-muted-foreground mb-3">
                  Enforce personal discipline before every trade entry. Create your own rules and check them off before submitting a trade.
                </p>
                <FeatureList items={[
                  "Custom rules — add, edit, reorder, or delete your own trading rules",
                  "Pre-trade enforcement — checklist appears in the trade creation flow",
                  "Visual \"All Clear\" indicator when every rule is checked",
                  "Active/inactive toggle per rule — temporarily disable rules without deleting",
                  "Rules persist across sessions — always available when you need them",
                ]} />
                <p className="text-xs text-muted-foreground mt-3 italic">See also: <button onClick={() => document.getElementById("settings")?.scrollIntoView({ behavior: "smooth" })} className="text-primary hover:underline">Settings → Tag Management</button></p>
              </FeatureCard>

              <FeatureCard icon={Sparkles} title="AI Trade Coach" badge="AI">
                <p className="text-sm text-muted-foreground mb-3">
                  Get instant AI-generated feedback on your closed trades. The coach analyzes your entry, exit, timing, and outcome to provide actionable coaching.
                </p>
                <FeatureList items={[
                  "Auto-triggers on freshly closed trades — no manual action needed",
                  "Markdown-formatted coaching feedback with structured analysis",
                  "Evaluates: entry timing, exit quality, risk management, emotional discipline",
                  "Refresh button to regenerate feedback with latest context",
                  "Coaching feedback cached in the database — revisit anytime",
                  "Accessible from the Trade Detail modal",
                ]} />
                <p className="text-xs text-muted-foreground mt-3 italic">See also: <button onClick={() => document.getElementById("ai-integration")?.scrollIntoView({ behavior: "smooth" })} className="text-primary hover:underline">AI Insights Setup</button></p>
              </FeatureCard>

              <SubTopic title="Quick Actions & Data Tools" description="Fast trade closing, CSV import/export, and templates." id="tm-quick" />
              <FeatureCard icon={Zap} title="Quick Close Popover">
                <p className="text-sm text-muted-foreground mb-3">
                  Close open trades without leaving the trades list. A compact popover lets you enter the exit price and close instantly.
                </p>
                <FeatureList items={[
                  "One-click access from the trade row actions menu",
                  "Inline exit price input with auto-calculated P&L preview",
                  "Triggers the Post-Trade Review modal after closing",
                  "Works on both desktop and mobile layouts",
                ]} />
              </FeatureCard>

              <FeatureCard icon={Download} title="CSV Import & Export">
                <p className="text-sm text-muted-foreground">
                  Import trades from CSV files with column mapping. Export your entire trade history to CSV for backup or external analysis. The export includes all trade fields, tags, and review data.
                </p>
                <div className="mt-4"><TradeViewsMockup /></div>
                <div className="mt-4"><CsvImportMockup /></div>
              </FeatureCard>

              <FeatureCard icon={Zap} title="Trade Templates & Smart Suggestions">
                <p className="text-sm text-muted-foreground mb-3">Save frequently-used trade setups as templates, plus get AI-suggested setups based on your trading history:</p>
                <FeatureList items={[
                  "Pre-fill segment, trade type, default SL %, tags",
                  "Optional notes template and timeframe",
                  "Enable/disable auto-tracking and Telegram posting per template",
                  "One-click 'Use' button when creating new trades",
                  "Smart Suggestions — analyzes your closed trades to surface your most common setups",
                  "Shows top 3 frequent combos (e.g., 'Options BUY 5min — used 23 times')",
                  "One-click pre-fill from any suggestion",
                ]} />
                <div className="mt-4"><TradeTemplateMockup /></div>
              </FeatureCard>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 4. CSV Import ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={4} total={26} />
              <SectionHeader
                id="csv-import"
                title="CSV Import & Export"
                description="Bulk import trades from CSV files with intelligent column mapping, or export your entire trade history for backup and external analysis."
                icon={Upload}
              />
              <QuickNav items={[
                { label: "Import Workflow", id: "csv-import-workflow" },
                { label: "Import & Export Details", id: "csv-details" },
                { label: "Supported Formats", id: "csv-formats" },
              ]} />

              <SubTopic title="Import Workflow" description="Step-by-step process to bring your existing trades into TradeBook." id="csv-import-workflow" />
              <StepByStep title="How to Import" steps={[
                { title: "Export from your broker", description: "Download your trade history as CSV from your broker's platform.", detail: "Most brokers offer a 'Download' or 'Export' button in the trade history or contract notes section." },
                { title: "Upload to TradeBook", description: "Go to Trades → Import CSV and select your file.", detail: "Drag-and-drop is supported. Files up to 5MB with hundreds of rows work smoothly." },
                { title: "Map columns", description: "Match your CSV column headers to TradeBook fields. Common names are auto-detected.", detail: "Headers like 'ticker', 'qty', 'entry_price' are recognized automatically — you only need to fix unmatched ones." },
                { title: "Preview & confirm", description: "Review mapped data, fix any validation errors, then confirm the import.", detail: "Validation highlights missing required fields, invalid dates, and potential duplicates before you commit." },
              ]} />

              <ProTip variant="warning">
                <p>Date format mismatches are the most common import issue. Ensure your CSV dates are in <strong>YYYY-MM-DD</strong> or <strong>DD/MM/YYYY</strong> format. US-style MM/DD/YYYY can cause silent errors where day and month get swapped — always double-check a few rows in the preview step before confirming.</p>
              </ProTip>

              <VideoPlaceholder title="How to Import Trades from CSV" duration="3 min" />

              <SubTopic title="Import & Export Details" description="Detailed capabilities for importing and exporting trade data." id="csv-details" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Upload} title="Importing Trades">
                  <p className="text-sm text-muted-foreground mb-3">Full-featured CSV import with validation:</p>
                  <FeatureList items={[
                    "Upload any CSV file — supports most broker export formats",
                    "Interactive column mapping — match your CSV headers to TradeBook fields",
                    "Auto-detect common column names (Symbol, Entry Price, Qty, etc.)",
                    "Preview mapped data before importing",
                    "Validation checks: missing required fields, invalid dates, duplicate trades",
                    "Batch import — process hundreds of trades at once",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Download} title="Exporting Data">
                  <p className="text-sm text-muted-foreground mb-3">Full data export for backup or external tools:</p>
                  <FeatureList items={[
                    "Export all trades to CSV with every field included",
                    "Includes tags, review data, P&L, and timestamps",
                    "Filter by date range or segment before exporting",
                    "Compatible with Excel, Google Sheets, and other tools",
                    "One-click download from the Trades page header",
                  ]} />
                </FeatureCard>
              </div>

              <InteractiveMockup label="CSV Import Preview">
                <CsvImportMockup />
              </InteractiveMockup>

              <SubTopic title="Supported Broker Formats" description="Pre-tested CSV formats from popular Indian brokers." id="csv-formats" />
              <ExpandableDetail title="Supported Broker Formats" icon={FileText} badge="Reference">
                <p>TradeBook's column auto-detection works with exports from most Indian brokers. Tested formats include:</p>
                <FeatureList items={[
                  "Zerodha (Kite) — contract notes and tradebook CSV exports",
                  "Dhan — trade history downloads from the Dhan web dashboard",
                  "Groww — stock and F&O trade history exports",
                  "Angel One — trade book and order book CSV downloads",
                  "Upstox — trade history exports from the Upstox Pro dashboard",
                  "ICICI Direct — trade confirmation CSV reports",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">If your broker's format isn't auto-detected, you can still import — just manually map the columns in Step 3. Any CSV with symbol, date, price, and quantity columns will work.</p>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 5. Trade Templates ─────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={5} total={26} />
              <SectionHeader
                id="trade-templates"
                title="Trade Templates & Smart Suggestions"
                description="Save your frequently-used trade setups as reusable templates. Plus, get AI-suggested setups based on your trading patterns."
                icon={FileText}
              />
              <QuickNav items={[
                { label: "Template Setup", id: "tpl-setup" },
                { label: "Smart Suggestions", id: "tpl-smart" },
              ]} />

              <SubTopic title="Template Setup" description="Create and manage reusable trade templates for faster logging." id="tpl-setup" />

              <StepByStep title="Creating Your First Template" steps={[
                { title: "Go to Settings → Trade Templates", description: "Open the template manager from your settings page.", detail: "You can also create templates directly from the trade creation modal." },
                { title: "Define your setup", description: "Choose the segment (Intraday, Options, etc.), trade type (BUY/SELL), and default stop loss %.", detail: "Add your preferred tags and timeframe to auto-fill them on every use." },
                { title: "Add optional defaults", description: "Set a notes template for pre-written checklists, and toggle auto-tracking or Telegram posting.", detail: "Notes templates are great for embedding your setup criteria as a reminder." },
                { title: "Save and use", description: "Hit save. Next time you create a trade, click 'Use Template' to pre-fill everything in one click.", detail: "You can edit or delete templates anytime from the settings page." },
              ]} />

              <FeatureCard icon={Zap} title="Template Configuration">
                <p className="text-sm text-muted-foreground mb-3">Build templates for your most common trade setups:</p>
                <FeatureList items={[
                  "Pre-fill segment, trade type, default SL %, and tags",
                  "Optional notes template and preferred timeframe",
                  "Enable/disable auto-tracking per template",
                  "Toggle Telegram posting per template",
                  "One-click 'Use' button when creating new trades",
                ]} />
                <div className="mt-4"><TradeTemplateMockup /></div>
              </FeatureCard>

              <ProTip variant="info">
                <p>A template-based trade takes about <strong>5–10 seconds</strong> to log — compared to 45–60 seconds filling every field manually. Over 20 trades a week, that's 15+ minutes saved, and more importantly, zero missed fields or forgotten stop losses.</p>
              </ProTip>

              <ProTip>
                <p>Create a template for each of your top 3 setups. When you see a setup forming, use the template to log the trade in under 10 seconds — no more missed opportunities.</p>
              </ProTip>

              <SubTopic title="Smart Suggestions" description="AI-powered setup recommendations based on your actual trading history." id="tpl-smart" />
              <FeatureCard icon={Sparkles} title="Smart Suggestions" badge="AI">
                <p className="text-sm text-muted-foreground mb-3">AI analyzes your closed trades to surface recurring patterns:</p>
                <FeatureList items={[
                  "Identifies your most frequent trade setups automatically",
                  "Shows top 3 combos (e.g., 'Options BUY 5min — used 23 times')",
                  "One-click pre-fill from any suggestion",
                  "Updates as you add more trades",
                  "Helps standardize your approach over time",
                ]} />
              </FeatureCard>

              <ExpandableDetail title="How Smart Suggestions Learn From Your Trades" icon={Sparkles} badge="Deep Dive">
                <p>Smart Suggestions analyze your closed trade history to find recurring combinations of segment, trade type, and timeframe. Here's how the learning works:</p>
                <FeatureList items={[
                  "After you close 10+ trades, the system starts identifying patterns in your entries.",
                  "It groups trades by (segment + trade type + timeframe) — e.g., 'Options BUY 5min'.",
                  "The top 3 most-used combinations are surfaced as quick-fill chips in the Create Trade modal.",
                  "Suggestions update dynamically — as your trading style evolves, so do the recommendations.",
                  "Each suggestion shows the exact count of times you've used that setup, building confidence in your process.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">Smart Suggestions are purely frequency-based — they reflect what you actually trade, not what performed best. For performance-based insights, see the Analytics section.</p>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 6. Position Sizing ────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={6} total={26} />
              <SectionHeader
                id="position-sizing"
                title="Position Sizing Calculator"
                description="Built-in risk calculator that tells you exactly how many shares to buy based on your capital, risk tolerance, and stop loss distance."
                icon={Calculator}
              />
              <QuickNav items={[
                { label: "Calculation Workflow", id: "ps-workflow" },
                { label: "Advanced Sizing", id: "ps-advanced" },
                { label: "Risk Guidelines", id: "ps-guidelines" },
              ]} />

              <InteractiveMockup label="Position Sizing Calculator">
                <PositionSizingCalcMockup />
              </InteractiveMockup>

              <SubTopic title="Calculation Workflow" description="How the calculator determines your optimal position size." id="ps-workflow" />
              <StepByStep title="How It Works" steps={[
                { title: "Set your capital & risk %", description: "Define your total capital and the max % you're willing to risk per trade (e.g., 1.5%).", detail: "Your starting capital is pulled from Settings automatically — no need to re-enter it each time." },
                { title: "Enter entry & stop loss prices", description: "The calculator computes the risk per share (entry − SL).", detail: "For short trades, risk per share = SL − entry price." },
                { title: "Get recommended quantity", description: "Max shares = (Capital × Risk%) ÷ Risk per share. Automatically rounds down.", detail: "The calculator also shows total position value so you can check margin requirements." },
                { title: "Review max loss", description: "See the maximum loss in rupees before you commit to the trade.", detail: "If the max loss exceeds 2% of capital, a red warning is displayed." },
              ]} />

              <SubTopic title="Advanced Sizing" description="Expert-level position sizing with the Kelly Criterion." id="ps-advanced" />
              <ExpandableDetail title="Advanced: Kelly Criterion" icon={Target}>
                <p>For experienced traders, the Position Sizing Calculator can suggest position sizes based on the Kelly Criterion — factoring in your historical win rate and average win/loss ratio to optimize long-term capital growth.</p>
              </ExpandableDetail>

              <ProTip variant="warning">
                <p>Never risk more than 2% of your capital on a single trade. The calculator will flag oversized positions with a red warning if you exceed this threshold.</p>
              </ProTip>

              <SubTopic title="Risk Per Trade Guidelines" description="Recommended risk levels based on trading experience." id="ps-guidelines" />
              <ExpandableDetail title="Risk Per Trade Guidelines by Experience Level" icon={Shield} badge="Reference">
                <p>Position sizing is the single biggest factor in long-term survival. Here are recommended risk-per-trade limits:</p>
                <FeatureList items={[
                  "Beginner (0–6 months) — Risk 0.5% per trade. Focus on process, not profits. Smaller sizes reduce emotional pressure.",
                  "Intermediate (6–18 months) — Risk 1% per trade. You have a tested edge and consistent journaling habit.",
                  "Advanced (18+ months) — Risk 1–2% per trade. You have a proven win rate and understand drawdown recovery math.",
                  "Aggressive/Scalping — Risk up to 2–3% only with very tight stop losses and high-frequency setups.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">Remember: a 50% drawdown requires a 100% gain to recover. Conservative sizing protects your capital during inevitable losing streaks.</p>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 7. Trading Rules ──────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={7} total={26} />
              <SectionHeader
                id="trading-rules"
                title="Trading Rules Checklist"
                description="Define your personal pre-trade rules and enforce discipline. Every rule must be checked before a trade can be submitted."
                icon={ClipboardCheck}
              />
              <QuickNav items={[
                { label: "Setup & Usage", id: "tr-setup" },
                { label: "Core vs Optional", id: "tr-core" },
                { label: "Rule Examples", id: "tr-examples" },
              ]} />

              <InteractiveMockup label="Trading Rules Checklist">
                <TradingRulesMockup />
              </InteractiveMockup>

              <SubTopic title="Setup & Usage" description="How to create and enforce your personal trading rules." id="tr-setup" />
              <FeatureCard icon={ClipboardCheck} title="How Trading Rules Work">
                <p className="text-sm text-muted-foreground mb-3">Create a custom checklist that appears in the trade creation modal:</p>
                <FeatureList items={[
                  "Add unlimited custom rules in Settings → Trading Rules",
                  "Drag-to-reorder rules by priority",
                  "All rules must be checked to submit a new trade",
                  "Rules can be temporarily toggled active/inactive",
                  "Enforces consistent pre-trade analysis every time",
                ]} />
              </FeatureCard>

              <ProTip variant="best-practice">
                <p>Start with 3–5 rules maximum. The best rules are specific and actionable: <em>"Confirm volume is above 20-day average"</em> is better than <em>"Check volume."</em></p>
              </ProTip>

              <SubTopic title="Core vs Optional Rules" description="Distinguish between must-follow rules and situational guidelines." id="tr-core" />
              <ExpandableDetail title="Structuring Your Rules: Core vs Optional" icon={Shield}>
                <p>Not every rule applies to every trade. Organize yours into two tiers:</p>
                <FeatureList items={[
                  "Core rules (always active) — non-negotiable checks like 'Stop loss is set' or 'Risk under 2% of capital'. These should never be skipped.",
                  "Optional rules (toggle on/off) — situational checks like 'No trades during news events' or 'Sector rotation confirms'. Toggle these inactive when they don't apply.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">Use the active/inactive toggle to disable optional rules without deleting them. This keeps your checklist lean during fast-moving markets while preserving your full rule set.</p>
              </ExpandableDetail>

              <ProTip variant="info">
                <p>Review your trading rules every weekend. Remove rules you never check, tighten vague ones, and add new rules based on mistakes from the past week. Your rules should evolve as your trading matures.</p>
              </ProTip>

              <SubTopic title="Rule Examples by Trading Style" description="Pre-built rule sets to get you started based on your approach." id="tr-examples" />
              <ExpandableDetail title="Example Rule Sets for Different Trading Styles" icon={BookOpen} defaultOpen>
                <div className="grid md:grid-cols-3 gap-5 mt-2">
                  <div>
                    <p className="text-[12px] font-semibold text-foreground mb-2">Scalper / Intraday</p>
                    <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                      <li>✓ Check pre-market gap direction</li>
                      <li>✓ Volume above VWAP</li>
                      <li>✓ No trades in first 5 minutes</li>
                      <li>✓ Risk under 1% of capital</li>
                      <li>✓ Max 3 open trades at a time</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground mb-2">Swing Trader</p>
                    <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                      <li>✓ Higher timeframe trend aligns</li>
                      <li>✓ No earnings in next 5 days</li>
                      <li>✓ Sector is not overbought</li>
                      <li>✓ R:R is at least 1:3</li>
                      <li>✓ Chart pattern confirmed on daily</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground mb-2">Positional Trader</p>
                    <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                      <li>✓ Weekly trend is bullish</li>
                      <li>✓ Fundamentals support the thesis</li>
                      <li>✓ No major resistance within 5%</li>
                      <li>✓ Position size under 10% of portfolio</li>
                      <li>✓ Stop loss set below key support</li>
                    </ul>
                  </div>
                </div>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 8. Alerts ─────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={8} total={26} />
              <SectionHeader
                id="alerts"
                title="Alerts System"
                description="Set price alerts, percentage change triggers, volume spike detectors, and custom conditions. Get notified instantly via in-app notifications or Telegram."
                icon={Bell}
              />
              <QuickNav items={[
                { label: "First Alert", id: "al-first" },
                { label: "Alert Types", id: "al-types" },
                { label: "Trigger & Cooldown", id: "al-trigger" },
                { label: "Telegram Delivery", id: "al-delivery" },
                { label: "Management", id: "al-management" },
                { label: "AI Suggestions", id: "al-ai" },
              ]} />

              <InteractiveMockup label="Alert Card & Telegram Notification">
                <div className="grid md:grid-cols-2 gap-6">
                  <AlertCardMockup />
                  <TelegramNotifMockup />
                </div>
              </InteractiveMockup>

              <SubTopic title="Setting Up Your First Alert" description="Get started with price monitoring in under a minute." id="al-first" />
              <StepByStep title="Setting Up Your First Alert" steps={[
                { title: "Go to Alerts page", description: "Navigate to Alerts from the sidebar, or press ⌘K and type 'New Alert'.", detail: "You can also create alerts directly from a watchlist item or study." },
                { title: "Search for a symbol", description: "Type the stock name or symbol. Works across NSE, BSE, and MCX.", detail: "The search auto-detects the exchange and segment." },
                { title: "Choose a condition", description: "Select from 7 condition types: Price Above, Price Below, Crosses Above/Below, % Change, Volume Spike, or Custom.", detail: "For your first alert, 'Price Above' or 'Price Below' is the simplest starting point." },
                { title: "Set threshold & delivery", description: "Enter the trigger price, choose recurrence (once/daily/continuous), and enable Telegram if connected.", detail: "You can also set a cooldown period to avoid repeated notifications." },
                { title: "Save and monitor", description: "The alert goes live immediately. You'll see live LTP and distance-to-target on the alerts dashboard.", detail: "Alerts with live prices show '1.1% away' indicators that update in real time." },
              ]} />

              <SubTopic title="Alert Condition Types" description="Seven condition types to monitor any price action." id="al-types" />
              <FeatureCard icon={Bell} title="Alert Condition Types">
                <FeatureList items={[
                  "Price Above — triggers when LTP exceeds your threshold",
                  "Price Below — triggers when LTP drops below threshold",
                  "Crosses Above — triggers only on the crossover (not already above)",
                  "Crosses Below — triggers only on the crossover (not already below)",
                  "% Change — triggers on percentage move from previous close",
                  "Volume Spike — triggers when volume exceeds normal levels",
                  "Custom — define your own condition logic",
                ]} />
                <div className="mt-4"><AlertConditionTypesMockup /></div>
              </FeatureCard>

              <ExpandableDetail title="Alert Condition Types Explained" icon={Info} badge="Deep Dive">
                <p>Understanding the difference between threshold alerts and cross-detection alerts is key to avoiding false triggers:</p>
                <FeatureList items={[
                  "Price Above/Below — state-based. Fires whenever the current price IS above/below your threshold. If the stock opens above your level, it fires immediately.",
                  "Crosses Above/Below — event-based. Fires only when the price MOVES through your level. It tracks the previous LTP and detects the crossover moment. This avoids false triggers on gap-up/down opens.",
                  "% Change — relative to previous close. A '5% change' alert fires when the stock moves 5% from yesterday's close in either direction.",
                  "Volume Spike — compares current volume to the stock's average volume. Useful for breakout confirmation.",
                  "Custom — combine multiple conditions. Power-user feature for complex screening logic.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">Cross-detection alerts are generally more useful than simple price alerts because they avoid firing on stocks that already opened above/below your level.</p>
              </ExpandableDetail>

              <SubTopic title="Trigger Logic & Cooldown" description="Control when and how often alerts fire." id="al-trigger" />
              <FeatureCard icon={RefreshCw} title="Recurrence & Cooldowns">
                <FeatureList items={[
                  "Once — fires once and auto-deactivates",
                  "Daily — resets every trading day, fires once per day",
                  "Continuous — fires every time the condition is met",
                  "Cooldown periods: 5 min, 15 min, 30 min, 1 hour, 1 day",
                  "Check intervals: 5 min to 1 hour (configurable per alert)",
                  "Market hours only toggle (9:15 AM – 3:30 PM IST)",
                  "Set expiry dates for time-limited alerts",
                ]} />
                <div className="mt-4"><RecurrenceCooldownMockup /></div>
              </FeatureCard>

              <ProTip variant="warning">
                <p>Set a cooldown of at least <strong>15 minutes</strong> on continuous alerts to avoid notification spam. Without a cooldown, a stock hovering near your threshold can trigger dozens of alerts in rapid succession. For volatile F&O instruments, consider a 30-minute or 1-hour cooldown.</p>
              </ProTip>

              <SubTopic title="Telegram Delivery" description="Instant notifications with alert details and check frequency." id="al-delivery" />
              <FeatureCard icon={Send} title="Delivery Channels">
                <p className="text-sm text-muted-foreground mb-3">Choose how you receive alert notifications:</p>
                <FeatureList items={[
                  "In-app notification badge and dashboard panel",
                  "Telegram instant message with alert details and check interval (e.g., 'Checked every 15m')",
                  "Route alerts to personal chat, groups, or channels",
                  "Live LTP tracking shows distance-to-target for each alert",
                  "Snooze alerts for 1 hour or rest of the day",
                  "Bulk pause/resume all alerts at once",
                ]} />
                <div className="mt-4"><DeliveryChannelsMockup /></div>
              </FeatureCard>

              <SubTopic title="Alert Management" description="Organize, filter, and monitor all your alerts." id="al-management" />
              <FeatureCard icon={Eye} title="Alert Management">
                <p className="text-sm text-muted-foreground mb-3">Organize and monitor your alerts:</p>
                <FeatureList items={[
                  "Grid view with status cards or compact list view",
                  "Sort by symbol, creation date, last triggered, or status",
                  "Search and filter by symbol or condition type",
                  "Link alerts to studies or watchlist items",
                  "Trigger count tracking per alert",
                  "Alert chains — triggering one alert can auto-create child alerts",
                ]} />
                <div className="mt-4"><AlertManagementMockup /></div>
              </FeatureCard>

              <SubTopic title="Smart Alert Suggestions" description="Let AI recommend alerts based on your trading patterns." id="al-ai" />
              <FeatureCard icon={Sparkles} title="Smart Alert Suggestions" badge="AI">
                <p className="text-sm text-muted-foreground mb-3">
                  AI analyzes your frequently traded symbols and suggests relevant price alerts with reasoning.
                </p>
                <FeatureList items={[
                  "Scans your trade history to identify top traded symbols",
                  "Suggests price-above or price-below alerts with AI-generated reasoning",
                  "One-click create — instantly convert a suggestion into an active alert",
                  "Refresh to regenerate suggestions with updated data",
                  "Empty state guide when not enough trade data exists",
                ]} />
                <p className="text-xs text-muted-foreground mt-3 italic">See also: <button onClick={() => document.getElementById("ai-integration")?.scrollIntoView({ behavior: "smooth" })} className="text-primary hover:underline">AI Insights Setup</button></p>
              </FeatureCard>

              <ExpandableDetail title="Smart Alert Suggestions Deep Dive" icon={Sparkles} badge="AI">
                <p>The Smart Alert engine works by analyzing your closed trade history through the <code className="px-1 py-0.5 rounded bg-muted text-[11px] font-mono">suggest-alerts</code> backend function:</p>
                <FeatureList items={[
                  "Identifies your top 5 most-traded symbols by frequency.",
                  "For each symbol, it analyzes your average entry/exit prices, win rate, and recent price action.",
                  "Generates contextual suggestions — e.g., 'Set alert at ₹2,450 (your average entry for RELIANCE, currently 3.2% below)'.",
                  "Each suggestion includes AI-generated reasoning explaining why this alert level matters for your trading style.",
                  "One-click creation converts the suggestion into a fully configured alert with sensible defaults.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">You need at least 10 closed trades before suggestions appear. The more trades you log, the more personalized the recommendations become.</p>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 9. Studies & Research ───────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={9} total={26} />
              <SectionHeader
                id="studies"
                title="Studies & Research"
                description="Document your trade ideas, chart analyses, and research findings. Tag with patterns, track status through a workflow, and link studies to actual trades."
                icon={BookOpen}
              />
              <ProTip>
                <p>Link your studies to trades when you execute them. This builds a powerful feedback loop — you can see which of your research ideas actually led to profitable trades.</p>
              </ProTip>
              <QuickNav items={[
                { label: "Publishing a Study", id: "st-publish" },
                { label: "Study Workflow", id: "st-workflow" },
                { label: "Pattern Tagging", id: "st-patterns" },
                { label: "Research Tools", id: "st-tools" },
                { label: "Linking to Trades", id: "st-linking" },
              ]} />

              <InteractiveMockup label="Study Card">
                <StudyCardMockup />
              </InteractiveMockup>

              <SubTopic title="Publishing a Study" description="Create and publish research ideas in a structured format." id="st-publish" />
              <StepByStep title="Publishing a Study" steps={[
                { title: "Create a new study", description: "Click '+ New Study' from the Studies page. Enter a title and select the symbol you're analyzing.", detail: "The symbol search works across NSE, BSE, and MCX — same as trade creation." },
                { title: "Choose category & duration", description: "Select a category (Technical, Fundamental, News, Sentiment) and the expected pattern duration.", detail: "Duration options: < 6 months, 6M–2Y, 2–5Y, > 5Y. This helps you filter studies by time horizon later." },
                { title: "Tag patterns & add notes", description: "Apply pattern tags (Classic, Candlestick, Setup) and write detailed analysis notes.", detail: "Attach chart images and external reference links for complete documentation." },
                { title: "Set status & save", description: "Save as Draft if still developing, or set to Active when your thesis is confirmed.", detail: "Active studies show live LTP and day-change tracking so you can monitor your thesis in real time." },
              ]} />

              <SubTopic title="Study Workflow" description="Organize studies by category and track their lifecycle." id="st-workflow" />
              <FeatureCard icon={Layers} title="Categories & Status Workflow">
                <p className="text-sm text-muted-foreground mb-3">Organize studies by type and track their lifecycle:</p>
                <FeatureList items={[
                  "Categories: Technical, Fundamental, News, Sentiment, Other",
                  "Status flow: Draft → Active → Triggered / Invalidated → Archived",
                  "Each status change is tracked with timestamps",
                  "Filter and sort by category or status",
                ]} />
                <div className="mt-4"><StudyCategoryWorkflowMockup /></div>
              </FeatureCard>

              <SubTopic title="Pattern Tagging" description="Rich multi-category tagging for chart pattern recognition." id="st-patterns" />
              <FeatureCard icon={Tag} title="Pattern Tagging System">
                <p className="text-sm text-muted-foreground mb-3">Rich tagging for pattern recognition:</p>
                <FeatureList items={[
                  "Classic Patterns: Double Top/Bottom, Head & Shoulders, Cup & Handle, Triangles, Wedges, Channels",
                  "Candlestick Patterns: Engulfing, Pin Bar, Doji, Morning/Evening Star, Hammer, Shooting Star",
                  "Setup Tags: Breakout, Retest, Gap Up/Down, Pullback, Reversal",
                  "Custom tags for your own classifications",
                  "Tag-based filtering with dynamic occurrence counts (OR-logic)",
                ]} />
                <div className="mt-4"><PatternTaggingMockup /></div>
              </FeatureCard>

              <SubTopic title="Research Tools" description="Live prices, duration tracking, and linking studies to trades." id="st-tools" />
              <FeatureCard icon={Clock} title="Live Tracking & Attachments">
                <FeatureList items={[
                  "Live LTP and day-change displayed for active/draft studies",
                  "Duration tracking: < 6 months, 6M–2Y, 2–5Y, > 5Y",
                  "Attach chart images and external reference links",
                  "Free-form notes with rich context",
                  "Link studies to alerts for automatic price monitoring",
                ]} />
                <div className="mt-4"><StudyAdditionalFeaturesMockup /></div>
              </FeatureCard>

              <ProTip variant="info">
                <p>Use duration tracking to schedule study reviews. Set a calendar reminder to revisit <strong>short-duration (&lt;6M)</strong> studies monthly and <strong>long-duration (2Y+)</strong> studies quarterly. This prevents stale research from cluttering your active list.</p>
              </ProTip>

              <SubTopic title="Linking Studies to Trades" description="Close the loop between research and execution." id="st-linking" />
              <ExpandableDetail title="Linking Studies to Trades for Feedback Loops" icon={Target} badge="Deep Dive">
                <p>The real power of the Studies module emerges when you connect research to execution:</p>
                <FeatureList items={[
                  "When creating a trade, you can link it to an existing study via the 'Link Study' field.",
                  "Linked trades appear on the study record, showing whether your research thesis played out profitably.",
                  "After closing the trade, compare your study's predicted direction with the actual P&L outcome.",
                  "Over time, you can filter studies by 'had linked trades' to see your research-to-execution hit rate.",
                  "Studies linked to alerts auto-monitor your thesis — when the alert triggers, you know it's time to review and potentially execute.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">This feedback loop is one of the most powerful features for improving your edge. Traders who link studies to trades can objectively measure which types of research lead to profitable outcomes.</p>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 10. Watchlists ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={10} total={26} />
              <SectionHeader
                id="watchlists"
                title="Watchlists"
                description="Create multiple named watchlists to track instruments you're interested in. See live prices, quick-sort by performance, and act directly from the watchlist."
                icon={Eye}
              />
              <QuickNav items={[
                { label: "First Watchlist", id: "wl-first" },
                { label: "Organization", id: "wl-org" },
                { label: "Live Data & Actions", id: "wl-actions" },
                { label: "Live Price Requirements", id: "wl-prices" },
              ]} />

              <InteractiveMockup label="Watchlist Overview">
                <WatchlistMockup />
              </InteractiveMockup>

              <SubTopic title="Building Your First Watchlist" description="Get started tracking instruments in under a minute." id="wl-first" />
              <StepByStep title="Building Your First Watchlist" steps={[
                { title: "Create a new watchlist", description: "Go to Watchlists and click '+ New Watchlist'. Give it a name and optionally assign a color.", detail: "Use descriptive names like 'Nifty 50 Breakouts' or 'F&O Weekly Expiry' for quick identification." },
                { title: "Add instruments", description: "Use the symbol search to find stocks, futures, or options. Click to add them to the list.", detail: "The search covers NSE, BSE, and MCX — same unified search used across the platform." },
                { title: "Organize & reorder", description: "Drag instruments to reorder by priority. Your most-watched symbols stay at the top.", detail: "You can move instruments between watchlists or add the same symbol to multiple lists." },
                { title: "Monitor & act", description: "View live prices during market hours. Click any instrument to create an alert or log a trade directly.", detail: "Sort by % change to spot the day's biggest movers at a glance." },
              ]} />

              <ProTip variant="best-practice">
                <p>Organize watchlists by purpose, not just by name. Create separate lists for <strong>active setups</strong> (stocks you're about to trade), <strong>sector tracking</strong> (banking, IT, pharma), and <strong>post-trade monitoring</strong> (recently closed positions). This keeps each list focused and actionable.</p>
              </ProTip>

              <SubTopic title="Organization" description="Create and manage multiple watchlists with visual distinction." id="wl-org" />
              <FeatureCard icon={List} title="Watchlist Organization">
                <p className="text-sm text-muted-foreground mb-3">Flexible tools to keep your watchlists clean and useful:</p>
                <FeatureList items={[
                  "Create unlimited named watchlists",
                  "Assign colors for instant visual distinction between lists",
                  "Add instruments via unified symbol search (NSE, BSE, MCX)",
                  "Drag-to-reorder instruments within any list",
                  "Add notes per instrument for quick context",
                  "Delete or move instruments between lists",
                ]} />
              </FeatureCard>

              <SubTopic title="Live Data & Quick Actions" description="Real-time prices and one-click actions from any watchlist item." id="wl-actions" />
              <FeatureCard icon={Zap} title="Live Data & Quick Actions">
                <p className="text-sm text-muted-foreground mb-3">Act on opportunities without leaving the watchlist:</p>
                <FeatureList items={[
                  "Live prices: LTP, change %, volume, day high/low",
                  "Sort by % change, volume, LTP, or alphabetically",
                  "Quick action: create alert directly from any instrument",
                  "Quick action: create trade directly from any instrument",
                  "Market closed detection with last-known prices displayed",
                  "Sparkline price charts for at-a-glance trend direction",
                ]} />
                <div className="mt-4"><WatchlistDetailMockup /></div>
              </FeatureCard>

              <SubTopic title="Live Price Data Requirements" description="What's needed for real-time price streaming." id="wl-prices" />
              <ExpandableDetail title="Live Price Data Requirements" icon={Activity} badge="Reference">
                <p>Live prices in watchlists depend on your broker integration status:</p>
                <FeatureList items={[
                  "With Dhan connected — real-time LTP, volume, day high/low, and % change stream directly into your watchlists during market hours (9:15 AM – 3:30 PM IST).",
                  "Without Dhan — watchlists still work for organization and quick actions, but prices won't update live. You'll see the last-known price from your most recent session.",
                  "Market closed hours — regardless of integration, prices show the last traded values with a 'Market Closed' indicator.",
                  "Price refresh — with Dhan connected, prices update every few seconds. The live indicator in the header shows streaming status.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">To connect your broker for live prices, go to Settings → Integrations → Dhan. See the Integrations section for full setup instructions.</p>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 11. Trade Journal ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={11} total={26} />
              <SectionHeader
                id="journal"
                title="Trade Journal"
                description="A multi-view journal that combines summary analytics, equity curves, performance tables, pattern analysis, and a Kanban board for reviewing mistakes."
                icon={FileText}
              />
              <QuickNav items={[
                { label: "Weekly Review", id: "jn-review" },
                { label: "Dashboard Tab", id: "jn-dashboard" },
                { label: "Calendar Tab", id: "jn-calendar" },
                { label: "Mistakes Board", id: "jn-mistakes" },
                { label: "Filters", id: "jn-filters" },
              ]} />

              <ProTip variant="best-practice">
                <p>Review your journal every Sunday evening. Look at your Patterns & Mistakes tab — the patterns that made you money last month should inform your trading plan for next week.</p>
              </ProTip>

              <InteractiveMockup label="Journal Views">
                <div className="grid md:grid-cols-2 gap-6">
                  <CalendarHeatmapMockup />
                  <KanbanBoardMockup />
                </div>
              </InteractiveMockup>

              <SubTopic title="Weekly Journal Review Routine" description="A structured weekly habit that compounds your trading improvement." id="jn-review" />
              <StepByStep title="Your Weekly Journal Review Routine" steps={[
                { title: "Open the Dashboard tab", description: "Start with the big picture — check your weekly P&L, win rate, and equity curve trend.", detail: "Look for the overall direction: are you improving week over week?" },
                { title: "Review the Calendar tab", description: "Scan the heatmap for red clusters. Multiple losing days in a row signal emotional or process problems.", detail: "Click individual days to re-read your daily journal entries and see what you were thinking." },
                { title: "Analyze Patterns & Mistakes", description: "Check which patterns made money and which mistakes cost you the most this week.", detail: "Your top 3 mistakes should become next week's focus areas for improvement." },
                { title: "Drag-review on the Kanban board", description: "Re-assess mistake severity. Drag cards between Low/Medium/High as your understanding deepens.", detail: "A 'Low' mistake that keeps recurring should be promoted to 'High' — it's a habit, not a one-off." },
                { title: "Write your plan for next week", description: "Open the daily journal for Monday and write your pre-market plan based on this review.", detail: "Include: which setups to focus on, which mistakes to avoid, and your max risk budget." },
              ]} />

              <ProTip variant="info">
                <p>Journal consistency matters more than journal depth. Writing <strong>3 sentences daily</strong> for 30 days straight builds more insight than a detailed 2-page entry once a month. The journal tracks your streak — aim for at least 5 consecutive trading days of entries to build the habit.</p>
              </ProTip>

              <SubTopic title="Journal Views" description="Four specialized tabs for different aspects of your journal." id="jn-dashboard" />

              <FeatureCard icon={PieChart} title="Dashboard Tab">
                <p className="text-sm text-muted-foreground mb-3">High-level summary of your trading performance:</p>
                <FeatureList items={[
                  "Summary cards: Total P&L, Win Rate, Avg Holding Time, Best Pattern, Top Mistake",
                  "Equity curve visualization with date range selector",
                  "Performance tables broken down by Rating (1-10) and Confidence (1-5)",
                  "Patterns & Mistakes analysis showing which setups make/lose money",
                ]} />
                <div className="mt-4"><JournalDashboardTabMockup /></div>
              </FeatureCard>

              <SubTopic title="Calendar Tab" description="A visual P&L heatmap for spotting winning and losing streaks." id="jn-calendar" />
              <FeatureCard icon={Calendar} title="Calendar Tab">
                <p className="text-sm text-muted-foreground">
                  A visual P&L heatmap calendar. Each day is colored by total P&L — deep green for big wins, deep red for big losses, neutral for flat days. Click any day to see the trades closed on that date and open the daily journal editor.
                </p>
                <div className="mt-4"><JournalCalendarTabMockup /></div>
              </FeatureCard>

              <SubTopic title="Mistakes Review Board" description="Kanban-style board for categorizing trading mistakes by severity." id="jn-mistakes" />
              <FeatureCard icon={AlertTriangle} title="Mistakes Review Tab">
                <p className="text-sm text-muted-foreground mb-3">Kanban-style board for categorizing and reviewing trading mistakes:</p>
                <FeatureList items={[
                  "Columns grouped by severity: Low, Medium, High",
                  "Each card shows the mistake tag, trade details, and loss amount",
                  "Drag cards between severity columns as you reassess",
                  "Helps identify recurring behavioral patterns",
                ]} />
                <div className="mt-4"><JournalMistakesTabMockup /></div>
              </FeatureCard>

              <ExpandableDetail title="How the Kanban Board Categorizes Mistakes" icon={AlertTriangle} badge="Deep Dive">
                <p>The Kanban board maps your tagged mistakes into three severity columns, helping you prioritize which habits to fix first:</p>
                <FeatureList items={[
                  "Low — minor process deviations that didn't significantly impact P&L. Examples: entering slightly early, not waiting for confirmation candle.",
                  "Medium — mistakes that cost noticeable money but aren't habitual yet. Examples: oversizing a position, ignoring a stop loss once.",
                  "High — recurring mistakes with significant financial impact. Examples: revenge trading after a loss, consistently moving stop losses further away.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">As you review weekly, drag cards between columns based on updated severity. A 'Low' mistake that appears 5+ times should be escalated to 'High' — frequency turns minor errors into major leaks. The goal is to empty the 'High' column over time.</p>
              </ExpandableDetail>

              <SubTopic title="Filters & Segmentation" description="Slice your journal data by segment and time period." id="jn-filters" />
              <FeatureCard icon={Filter} title="Filters & Segmentation">
                <FeatureList items={[
                  "Filter by segment: All, Intraday, Positional, Futures, Options, Commodities",
                  "Date range presets: 30 days, 60 days, 90 days",
                  "Custom date range picker",
                  "All tabs and analytics update based on selected filters",
                ]} />
                <div className="mt-4"><JournalFiltersSegmentationMockup /></div>
              </FeatureCard>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 12. Analytics (Pro) ─────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={12} total={26} />
              <SectionHeader
                id="analytics"
                description="Deep performance analytics powered by your trade data. Understand your edge with heatmaps, breakdowns, and statistical measures. Available on the Pro plan."
                title="Analytics"
                icon={BarChart3}
              />
              <QuickNav items={[
                { label: "Getting Started", id: "an-start" },
                { label: "Core Metrics", id: "an-core" },
                { label: "Equity & Drawdown", id: "an-equity" },
                { label: "Time Analysis", id: "an-time" },
                { label: "Streaks & R:R", id: "an-streaks" },
                { label: "AI Behavioral", id: "an-ai" },
                { label: "Statistical Depth", id: "an-stats" },
              ]} />

              <ProTip variant="best-practice">
                <p>Don't try to track everything at once. Start with just <strong>3 metrics</strong>: Win Rate, Expectancy, and Profit Factor. These three alone tell you whether you have an edge. Add more metrics only after you've consistently tracked these for 30+ trades.</p>
              </ProTip>

              <InteractiveMockup label="Analytics Overview">
                <AnalyticsMetricCards />
                <AIInsightsMockup />
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <EquityCurveMockup />
                  <AnalyticsHeatmapMockup />
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <SegmentPerformanceMockup />
                  <RiskOfRuinMockup />
                </div>
              </InteractiveMockup>

              <SubTopic title="Reading Your First Report" description="A guided walkthrough for making sense of your analytics dashboard." id="an-start" />
              <StepByStep title="Reading Your First Analytics Report" steps={[
                { title: "Check the KPI cards at the top", description: "Start with Win Rate, Total P&L, and Profit Factor. These are your headline numbers — they tell you at a glance whether you're profitable.", detail: "Win Rate above 50% is good, but only meaningful alongside Profit Factor above 1.0. A 40% win rate with a 2.5 profit factor is better than 60% with 0.8." },
                { title: "Scan the Equity Curve", description: "Look at the overall shape: is it trending up, down, or sideways? Sharp drops indicate drawdown periods worth investigating.", detail: "Click on drawdown periods to see which trades caused them. Often it's a cluster of 2-3 bad trades, not a systemic issue." },
                { title: "Review the Time Heatmaps", description: "Check which hours and days are most profitable. Many traders discover they lose money during the first 15 minutes or on Mondays.", detail: "If a time slot is consistently red across 30+ trades, consider avoiding it entirely. This single change can significantly improve your P&L." },
                { title: "Read the AI Insights", description: "The AI pattern detection surfaces behavioral patterns you'd never spot manually — like overtrading after wins or freezing after losses.", detail: "Focus on 'Critical' and 'Warning' severity insights first. 'Info' level insights are interesting but not urgent." },
                { title: "Pick 1-2 areas to improve", description: "Don't try to fix everything. Pick your single biggest leak (worst time slot, worst segment, or most expensive mistake) and focus on that for the next 2 weeks.", detail: "After fixing one leak, revisit analytics to measure the impact before moving to the next improvement area." },
              ]} />

              <ProTip variant="info">
                <p>Analytics require at least <strong>20 closed trades</strong> to generate meaningful insights. The more trades you log, the more statistically significant your analytics become. Most AI behavioral patterns need 50+ trades to detect reliably.</p>
              </ProTip>

              <SubTopic title="Core Metrics & AI Insights" description="Fundamental performance statistics that define your trading edge." id="an-core" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={BarChart3} title="Core Metrics" badge="Pro">
                  <p className="text-sm text-muted-foreground mb-3">The essential numbers that tell you whether you have an edge:</p>
                  <FeatureList items={[
                    "Win Rate — overall and by segment (what % of trades are profitable)",
                    "Total P&L — cumulative profit/loss across all closed trades",
                    "Average Win / Average Loss — the size ratio of your winners vs losers",
                    "Expectancy — expected value per trade (positive = you have an edge)",
                    "Profit Factor — gross profit ÷ gross loss (above 1.5 is strong)",
                    "Best Trade and Worst Trade — your extremes for context",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Sparkles} title="AI Trade Insights" badge="Pro">
                  <p className="text-sm text-muted-foreground mb-3">
                    AI-powered analysis of your trading patterns. Identifies your most profitable setups, optimal trading times, common mistakes, and suggests actionable improvements.
                  </p>
                  <FeatureList items={[
                    "Insights update automatically as you add more trades",
                    "Powered by Gemini for nuanced behavioral analysis",
                    "Actionable suggestions — not just observations",
                  ]} />
                </FeatureCard>
              </div>

              <SubTopic title="Equity Curve & Drawdown Analysis" description="Visualize your capital curve and understand recovery patterns." id="an-equity" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={TrendingDown} title="Equity Curve & Drawdown" badge="Pro">
                  <p className="text-sm text-muted-foreground mb-3">
                    Full equity curve showing cumulative P&L over time with drawdown overlay:
                  </p>
                  <FeatureList items={[
                    "Cumulative P&L line chart with date range selector",
                    "Drawdown overlay showing peak-to-trough declines",
                    "Maximum drawdown % and duration in days",
                    "Recovery time analysis — how long to recover from each drawdown",
                    "Underwater chart showing time spent below peak equity",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={PieChart} title="Segment Performance" badge="Pro">
                  <p className="text-sm text-muted-foreground mb-3">Performance breakdown per market segment:</p>
                  <FeatureList items={[
                    "Win rate per segment (Intraday, Positional, F&O, Commodities)",
                    "Sharpe ratio calculations per segment",
                    "Average holding period comparison",
                    "Best and worst setups per segment",
                    "P&L distribution charts for each segment",
                  ]} />
                </FeatureCard>
              </div>

              <SubTopic title="Time-Based Analysis" description="Discover your most and least profitable trading windows." id="an-time" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Clock} title="Time-Based Heatmaps" badge="Pro">
                  <p className="text-sm text-muted-foreground mb-3">Two heatmaps that reveal your optimal trading schedule:</p>
                  <FeatureList items={[
                    "Time of Day heatmap — which hours (9 AM – 3:30 PM) are most profitable",
                    "Day of Week heatmap — which days you perform best on",
                    "Color intensity shows P&L magnitude (green = profit, red = loss)",
                    "Trade count overlay for statistical significance",
                    "Helps you avoid trading during your historically weak periods",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Clock} title="Day & Time Cross-Analysis" badge="Pro">
                  <p className="text-sm text-muted-foreground mb-3">Combined Day × Time grid for granular insights:</p>
                  <FeatureList items={[
                    "5×5 grid: weekdays as rows, time slots as columns",
                    "Each cell shows win rate and trade count",
                    "Identify specific windows like 'Tuesday 10-12 AM' as your best slot",
                    "Color-coded cells: green ≥ 60% win rate, red < 40%",
                  ]} />
                </FeatureCard>
              </div>

              <SubTopic title="Streaks & Risk-Reward" description="Track momentum and analyze your planned vs actual risk-reward ratios." id="an-streaks" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Activity} title="Streak Tracker" badge="Pro">
                  <p className="text-sm text-muted-foreground mb-3">Track and visualize winning and losing streaks:</p>
                  <FeatureList items={[
                    "Current streak indicator — win/loss count with visual badge",
                    "Longest winning and losing streaks in your history",
                    "Streak calendar — day-by-day win/loss visualization",
                    "Streak share card — share your streaks on social media",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Target} title="Risk-Reward Analytics" badge="Pro">
                  <p className="text-sm text-muted-foreground mb-3">Analyze planned vs actual risk-reward ratios:</p>
                  <FeatureList items={[
                    "Planned R:R — calculated from entry, stop loss, and targets",
                    "Actual R:R — based on realized P&L vs risk taken",
                    "R:R distribution chart — how often you achieve 1R, 2R, 3R+",
                    "Average R:R by segment and timeframe",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Activity} title="Additional Advanced Metrics" badge="Pro">
                  <FeatureList items={[
                    "Setup/Tag Performance Matrix — P&L breakdown by setup tag",
                    "Risk of Ruin Calculator — statistical probability of account blowup based on your actual stats",
                  ]} />
                </FeatureCard>
              </div>

              <SubTopic title="AI-Powered Behavioral Analytics" description="Machine learning insights into your trading psychology and hidden patterns." id="an-ai" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Sparkles} title="AI Pattern Detection" badge="New">
                  <p className="text-sm text-muted-foreground mb-3">
                    AI analyzes your entire trade history to surface hidden behavioral patterns — things you'd never spot manually:
                  </p>
                  <FeatureList items={[
                    "\"You lose 70% of trades taken after 2 PM\" — automatic time-of-day patterns",
                    "Day-of-week performance analysis (e.g. Mondays are your worst day)",
                    "Streak effects — do you overtrade after wins or freeze after losses?",
                    "Segment bias detection — are you ignoring profitable segments?",
                    "Severity levels: critical, warning, info — with actionable suggestions",
                    "One-click refresh to re-run analysis with latest data",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Grid3X3} title="Sector Rotation Heatmap" badge="New">
                  <p className="text-sm text-muted-foreground mb-3">
                    A 6-month heatmap grid showing how your trading allocation shifts across segments over time:
                  </p>
                  <FeatureList items={[
                    "Rows: Market segments (Options, Futures, Equity Intraday, etc.)",
                    "Columns: Last 6 months of trading data",
                    "Cell intensity based on trade volume — darker = more active",
                    "Color coding: green cells for net profit, red for net loss",
                    "Shows trade count and total P&L per cell on hover",
                    "Helps identify segment rotation patterns and concentration risk",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Target} title="Setup Win-Rate Matrix" badge="New">
                  <p className="text-sm text-muted-foreground mb-3">
                    Cross-tabulation of Segment × Timeframe showing win rates and trade counts:
                  </p>
                  <FeatureList items={[
                    "Matrix grid: segments as rows, timeframes as columns",
                    "Each cell shows win rate % and trade count",
                    "Color-coded: green ≥ 60%, yellow 40-60%, red < 40%",
                    "Identifies your best-performing segment/timeframe combos",
                    "Highlights cells with statistical significance (5+ trades)",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Activity} title="Emotional P&L Correlation" badge="New">
                  <p className="text-sm text-muted-foreground mb-3">
                    Bar chart correlating your emotion tags with trading outcomes:
                  </p>
                  <FeatureList items={[
                    "Average P&L per emotion tag (FOMO, Calm, Anxious, Confident, etc.)",
                    "Win rate percentage displayed for each emotion",
                    "Trade count per emotion for statistical context",
                    "Helps identify which emotional states to cultivate or avoid",
                  ]} />
                </FeatureCard>
              </div>

              <SubTopic title="Statistical Significance" description="Understanding when your analytics become statistically meaningful." id="an-stats" />
              <ExpandableDetail title="Minimum Trade Count for Statistical Significance" icon={BarChart3} badge="Important">
                <p>Not all analytics are equally reliable with small sample sizes. Here's a guide to when each metric becomes meaningful:</p>
                <FeatureList items={[
                  "Win Rate — needs 30+ trades to stabilize. Below 30 trades, a few lucky/unlucky outcomes can swing it by 15-20%.",
                  "Profit Factor — reliable after 50+ trades. Sensitive to outlier trades (one huge win can distort it).",
                  "Time-of-Day Heatmap — needs 5+ trades per time slot to show real patterns. With 50+ total trades, most slots have enough data.",
                  "AI Pattern Detection — requires 50+ trades for basic patterns, 100+ for nuanced behavioral insights.",
                  "Emotional Correlation — needs 10+ trades per emotion tag. Sparse tags produce unreliable correlations.",
                  "Setup Win-Rate Matrix — cells with fewer than 5 trades are dimmed to indicate low confidence.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">As a rule of thumb: if a metric is based on fewer than 20 data points, treat it as directional rather than definitive. The analytics page dims or hides metrics that don't meet minimum thresholds.</p>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 13. Calendar & Daily Journal ────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={13} total={26} />
              <SectionHeader
                id="calendar"
                title="Calendar & Daily Journal"
                description="A monthly calendar view with daily journal entries. Write pre-market plans, post-market reviews, and track your mood and lessons for each trading day."
                icon={Calendar}
              />
              <QuickNav items={[
                { label: "Calendar View", id: "cal-view" },
                { label: "Daily Review", id: "cal-review" },
                { label: "Journal Editor", id: "cal-editor" },
                { label: "Color Legend", id: "cal-colors" },
                { label: "Performance Strip", id: "cal-strip" },
              ]} />

              <ProTip variant="best-practice">
                <p>Consistency beats detail. Writing <strong>2-3 sentences</strong> every trading day builds far more insight over time than a detailed 2-page entry once a week. Aim for daily habit, not daily perfection.</p>
              </ProTip>

              <InteractiveMockup label="Calendar & Day Detail">
                <div className="grid md:grid-cols-2 gap-6">
                  <DailyJournalMockup />
                  <CalendarDayDetailMockup />
                </div>
              </InteractiveMockup>

              <SubTopic title="Calendar View" description="A monthly heatmap grid showing your P&L performance at a glance." id="cal-view" />
              <FeatureCard icon={Calendar} title="P&L Heatmap Calendar">
                <p className="text-sm text-muted-foreground mb-3">A 2-column desktop layout with the calendar grid on the left and a stacked trade list / journal editor panel on the right:</p>
                <FeatureList items={[
                  "Monthly grid with color-coded P&L per day — intensity reflects magnitude",
                  "Green shades for profitable days, red for losses, neutral for flat or no-trade days",
                  "Dot indicators on days that have journal entries written",
                  "Orange dashed border highlights for 'Today' and 'Selected Date'",
                  "Click any date to open the journal editor and see trades closed that day",
                ]} />
              </FeatureCard>

              <SubTopic title="Monthly Performance Strip" description="A quick-glance summary bar above the calendar." id="cal-strip" />
              <FeatureCard icon={BarChart3} title="Monthly Performance Strip">
                <p className="text-sm text-muted-foreground mb-3">Displayed above the calendar grid, this strip gives you instant context for the month:</p>
                <FeatureList items={[
                  "Total P&L for the selected month",
                  "Win Days / Loss Days count",
                  "Best Day and Worst Day with amounts",
                  "Updates automatically as you navigate between months",
                ]} />
              </FeatureCard>

              <SubTopic title="Your Daily End-of-Day Review" description="A structured routine for capturing lessons while they're fresh." id="cal-review" />
              <StepByStep title="Your Daily End-of-Day Review" steps={[
                { title: "Open the calendar and click today's date", description: "Navigate to the Calendar page. Today's date is highlighted with an orange dashed border. Click it to open the day detail panel.", detail: "You can also access this via the Daily Review Wizard in Dashboard Quick Actions for a guided 4-step flow." },
                { title: "Record your mood", description: "Select your emotional state for the day — Confident, Calm, Anxious, FOMO, Frustrated, etc. This feeds into the Emotional P&L Correlation analytics.", detail: "Be honest. The value comes from correlating your mood with actual trading outcomes over time." },
                { title: "Write your post-market review", description: "In 2-3 sentences, capture what happened today. Did you follow your plan? What surprised you? What would you do differently?", detail: "Focus on process, not outcome. A profitable day where you broke rules is still worth noting as a concern." },
                { title: "Tag your best and worst trades", description: "Identify which trade was your best execution and which was your worst. This builds a feedback loop with your trade ratings.", detail: "Over time, patterns emerge — you'll see which setups consistently produce your best and worst trades." },
                { title: "Document one lesson learned", description: "Write a single, specific takeaway. 'Don't trade BANKNIFTY in the first 5 minutes' is better than 'Be more patient'.", detail: "Specific, actionable lessons compound. After 30 days, you'll have a personalized trading rulebook." },
              ]} />

              <SubTopic title="Journal Editor" description="Write structured daily reflections to track your trading mindset." id="cal-editor" />
              <FeatureCard icon={FileText} title="Daily Journal Entry">
                <p className="text-sm text-muted-foreground mb-3">Each day has a structured journal entry with dedicated sections:</p>
                <FeatureList items={[
                  "Pre-market plan — write your plan before market opens (key levels, setups to watch, risk budget)",
                  "Post-market review — reflect on the day's trades and execution quality",
                  "Market outlook notes — broader market context and sector observations",
                  "Mood tracking — select from predefined emotional states",
                  "Lessons learned — specific, actionable takeaways from the day",
                  "Trade list — all trades closed on that date displayed inline for reference",
                ]} />
                <div className="mt-4"><DailyJournalWorkflowMockup /></div>
              </FeatureCard>

              <ProTip>
                <p>Write your pre-market plan before 9:00 AM. Traders who plan their day before market open show 23% higher win rates in our data. The journal editor auto-saves, so you can jot quick notes and come back later.</p>
              </ProTip>

              <SubTopic title="Calendar Color Legend" description="Understanding what each color and indicator means." id="cal-colors" />
              <ExpandableDetail title="Calendar Color Legend Explained" icon={Calendar} badge="Reference">
                <p>The calendar uses an intensity-based color system to give you instant visual feedback on each trading day:</p>
                <FeatureList items={[
                  "Deep Green — highly profitable day (top 20% of your daily P&L range)",
                  "Light Green — moderately profitable day",
                  "Neutral / Gray — flat day or no trades taken",
                  "Light Red — small loss day",
                  "Deep Red — significant loss day (bottom 20% of your daily P&L range)",
                  "Small dot indicator — journal entry exists for that date",
                  "Orange dashed border — marks 'Today' and the currently selected date",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">Color intensity is relative to your own trading history, not absolute amounts. A ₹5,000 profit day will be deep green for a ₹1L account but barely colored for a ₹50L account. This keeps the heatmap meaningful regardless of account size.</p>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 14. Mistakes Review ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={14} total={26} />
              <SectionHeader
                id="mistakes"
                title="Mistakes Review"
                description="Dedicated page for analyzing your trading mistakes. Identify repeat patterns, track loss severity, and monitor improvement trends over time."
                icon={AlertTriangle}
              />
              <QuickNav items={[
                { label: "Categorizing", id: "mk-categorize" },
                { label: "Pattern Recognition", id: "mk-patterns" },
                { label: "Severity", id: "mk-severity" },
                { label: "Common Mistakes", id: "mk-common" },
              ]} />

              <ProTip variant="warning">
                <p>Mistakes analysis is about <strong>patterns, not punishment</strong>. Every trader makes mistakes — the goal isn't zero errors, it's recognizing which errors are recurring and costing you real money. A single bad trade is noise; the same mistake 10 times is a habit worth fixing.</p>
              </ProTip>

              <InteractiveMockup label="Mistake Trends & Analysis">
                <MistakeTrendMockup />
              </InteractiveMockup>

              <SubTopic title="Categorizing a Mistake" description="A step-by-step process for tagging and learning from trading errors." id="mk-categorize" />
              <StepByStep title="Categorizing a Mistake" steps={[
                { title: "Identify the error during trade review", description: "When closing a trade or during your daily review, ask: 'Did I deviate from my plan?' If yes, that's a mistake worth tagging.", detail: "Not every losing trade is a mistake. A well-planned trade that hit your stop loss is just part of the game. Only tag genuine process deviations." },
                { title: "Select or create a mistake tag", description: "Choose from your existing mistake tags (e.g., 'Entered too early', 'No stop-loss', 'Oversized position') or create a new one in Settings → Tag Management.", detail: "Keep tags specific and actionable. 'Bad trade' is too vague — 'Moved SL further away' is specific enough to track and fix." },
                { title: "Assign severity level", description: "Rate the mistake as Low, Medium, or High based on its financial impact and how preventable it was.", detail: "Severity should reflect both the loss amount and whether this is a known weakness. A first-time error might be 'Low' but should be escalated if it recurs." },
                { title: "Review the pattern monthly", description: "Check the Mistakes page monthly. Look for tags that appear 3+ times — those are your habits, not one-offs, and deserve focused improvement effort.", detail: "Use the 6-month trend chart to verify improvement. If a mistake's frequency is dropping, your awareness is working." },
              ]} />

              <SubTopic title="Pattern Recognition" description="Identify repeat mistakes and track their frequency over time." id="mk-patterns" />
              <FeatureCard icon={Search} title="Mistake Pattern Analysis">
                <p className="text-sm text-muted-foreground mb-3">The Mistakes page surfaces behavioral patterns by analyzing your tagged mistakes across all closed trades:</p>
                <FeatureList items={[
                  "Repeat pattern analysis — frequency count for each mistake type",
                  "Total loss attributed to each mistake type (your most expensive habits)",
                  "6-month mistake trend chart showing improvement or deterioration over time",
                  "Most common vs most costly mistakes comparison — these are often different",
                ]} />
              </FeatureCard>

              <ProTip variant="info">
                <p>Your most costly mistake is usually not your most frequent one. Check the "Most Costly" column — a single mistake type might account for 40% of your total losses even if it only happens occasionally.</p>
              </ProTip>

              <SubTopic title="Severity Classification" description="Categorize mistakes by financial impact to prioritize what to fix first." id="mk-severity" />
              <FeatureCard icon={AlertTriangle} title="Severity Breakdown">
                <p className="text-sm text-muted-foreground mb-3">Three severity tiers help you prioritize which habits to address first:</p>
                <FeatureList items={[
                  "Low severity — minor process deviations with small financial impact (e.g., entering slightly early)",
                  "Medium severity — noticeable losses from avoidable errors (e.g., oversizing a position once)",
                  "High severity — significant losses from recurring behavioral issues (e.g., consistently moving stop losses)",
                  "Manage and customize mistake tags via Settings → Tag Management",
                ]} />
                <div className="mt-4"><MistakeAnalysisToolsMockup /></div>
              </FeatureCard>

              <SubTopic title="Common Mistakes Reference" description="A reference guide for the most common trading mistakes and concrete fixes." id="mk-common" />
              <ExpandableDetail title="Common Mistake Categories and How to Fix Them" icon={AlertTriangle} badge="Reference">
                <p>Based on common trading behavioral patterns, here are the most frequent mistake categories and actionable fixes:</p>
                <FeatureList items={[
                  "Entered Too Early — Fix: Wait for confirmation candle to close. Add a rule: 'No entry until candle closes above/below level.'",
                  "No Stop-Loss Set — Fix: Make SL mandatory in your trading rules checklist. TradeBook flags trades without SL in analytics.",
                  "Oversized Position — Fix: Use the Position Sizing Calculator before every trade. Set a max risk-per-trade rule (e.g., 1-2% of capital).",
                  "Revenge Trading — Fix: Add a daily loss limit rule. After 2 consecutive losses, take a 30-minute break before the next trade.",
                  "Moved Stop-Loss Further — Fix: Once SL is set, treat it as final. Use trailing SL instead if you want to give trades more room.",
                  "FOMO Entry — Fix: If you missed the entry, skip the trade. There's always another setup. Tag emotion as 'FOMO' to track frequency.",
                  "Ignored Trading Plan — Fix: Use the Pre-Trade Rules Checklist. If any rule isn't met, don't take the trade.",
                  "Held Too Long — Fix: Set time-based exit rules for intraday trades. Use the holding period analytics to find your optimal exit timing.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">Focus on fixing one mistake category at a time. Trying to eliminate all mistakes simultaneously leads to analysis paralysis. Pick your most costly mistake, work on it for 2-4 weeks, then move to the next one.</p>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 15. Stock Screener (Fundamentals) ─────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={15} total={26} />
              <SectionHeader
                id="fundamentals"
                title="Stock Screener"
                description="A professional-grade NSE stock scanner with 47 built-in presets across 5 categories — Market Cap, Price Action, Volume, Fundamental, and Technical. Includes custom filter builder, saved presets, and deep-dive stock insight cards."
                icon={Search}
              />
              <QuickNav items={[
                { label: "First Screen", id: "sc-first" },
                { label: "Scanner Presets", id: "sc-presets" },
                { label: "Custom Filters", id: "sc-filters" },
                { label: "Stock Insights", id: "sc-insights" },
                { label: "Results Table", id: "sc-results" },
                { label: "Technical Indicators", id: "sc-indicators" },
              ]} />

              <SubTopic title="Running Your First Screen" description="A quick walkthrough to get results in under 30 seconds." id="sc-first" />
              <StepByStep title="Running Your First Screen" steps={[
                { title: "Open the Stock Screener page", description: "Navigate to the Screener from the sidebar. You'll see a category bar at the top with 5 preset groups: Market Cap, Price Action, Volume, Fundamental, and Technical.", detail: "On mobile, these appear as a horizontal pill-style bar you can swipe through." },
                { title: "Pick a preset to start", description: "Click any preset — for example, 'Top Gainers' under Price Action. Results load instantly from the NSE data feed via TradingView.", detail: "Each preset is pre-configured with the right filters and sort order. You don't need to set anything up." },
                { title: "Sort and explore the results", description: "Click any column header (Market Cap, P/E, RSI, Volume) to sort. Use the inline search bar to filter by symbol or company name.", detail: "The LTP column uses bold integers with muted decimals for quick scanning. Change% and RSI are color-coded." },
                { title: "Click a stock for deep-dive", description: "Click any row to open the Stock Insight Card — a rich popup with Valuation, Financials, and Technicals tabs.", detail: "From the insight card, you can directly create a Trade, set an Alert, add to a Watchlist, or start a Study." },
                { title: "Save a custom filter for next time", description: "Switch to the Custom Filter tab, build your conditions, name the preset, and save. It appears in 'My Presets' for instant reuse.", detail: "Saved presets persist across sessions and devices — build once, use forever." },
              ]} />

              <ProTip variant="best-practice">
                <p>Save custom presets for your recurring workflows. If you screen for "P/E &lt; 15 AND ROE &gt; 15% AND RSI &lt; 40" every week, save it as <strong>"Value + Oversold"</strong> — one click replaces 3 minutes of manual filter setup every time.</p>
              </ProTip>

              <SubTopic title="Scanner Presets" description="47 built-in presets across 5 categories for instant stock screening." id="sc-presets" />
              <InteractiveMockup label="Scanner Presets">
                <ScreenerPresetsMockup />
              </InteractiveMockup>

              <div className="grid md:grid-cols-2 gap-5 mt-6">
                <FeatureCard icon={Filter} title="47 Built-in Scanner Presets" badge="Expanded">
                  <p className="text-sm text-muted-foreground mb-3">Five category groups with comprehensive coverage:</p>
                  <FeatureList items={[
                    "Market Cap — All, Large, Mid, Small, Micro Cap filters",
                    "Price Action — Top Gainers/Losers, 52W High/Low, ATH/ATL zone, Near Day High/Low, Penny Stocks, Blue Chip",
                    "Volume — Volume Gainers, Volume Spike (3×), Breakout, Sell Pressure, Low Volume, High Avg Volume",
                    "Fundamental — Undervalued, High Growth, Dividend Stars, Low Debt, Quality, High Margin, Cash Rich, Value Picks, High EPS",
                    "Technical — Momentum, Strong Rally, Oversold/Overbought RSI, Above SMA 50, Low/High Beta, High Volatility",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Target} title="Cross-Field Comparisons" badge="Smart">
                  <p className="text-sm text-muted-foreground mb-3">Advanced presets use real price-vs-reference comparisons, not proxies:</p>
                  <FeatureList items={[
                    "52W High — stocks within 3% of their 52-week high price",
                    "52W Low — stocks within 3% of their 52-week low price",
                    "ATH Zone — within 5% of all-time high",
                    "ATL Zone — within 10% of all-time low",
                    "Near Day High/Low — within 1% of intraday extremes",
                    "Above SMA 50 — direct price > 50-day moving average",
                  ]} />
                </FeatureCard>
              </div>

              <SubTopic title="Custom Filters" description="Build multi-condition screens with AND logic and save them as reusable presets." id="sc-filters" />
              <InteractiveMockup label="Custom Filter Builder & Results">
                <div className="grid md:grid-cols-2 gap-6">
                  <CustomFilterBuilderMockup />
                  <ScreenerTableMockup />
                </div>
              </InteractiveMockup>

              <div className="grid md:grid-cols-2 gap-5 mt-6">
                <FeatureCard icon={SlidersHorizontal} title="Custom Filter Builder">
                  <p className="text-sm text-muted-foreground mb-3">Build and save your own multi-condition screens:</p>
                  <FeatureList items={[
                    "14 screening metrics: P/E, P/B, ROE, Net Margin, Dividend Yield, D/E, Current Ratio, Market Cap, RSI, Change%, Volume, Rel. Volume, EPS, Beta",
                    "AND logic — combine up to 8 conditions simultaneously",
                    "Save named presets to database for instant reuse",
                    "Load/delete saved presets from My Presets section",
                    "Presets persist across sessions and devices",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Eye} title="Stock Insight Card">
                  <p className="text-sm text-muted-foreground mb-3" id="sc-insights">Click any stock to open a rich detail popup:</p>
                  <FeatureList items={[
                    "Hero header with ticker, sector, LTP and day change",
                    "Summary strip — P/E, Volume, Dividend Yield at a glance",
                    "4 deep-dive tabs: Overview, Valuation (attractiveness badges), Financials (benchmarked bars), Technicals (RSI gauge + SMA signals)",
                    "Quick action footer — Trade, Alert, Watchlist, Study",
                    "Fully responsive with mobile-optimized layout",
                  ]} />
                </FeatureCard>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mt-2">
                <StockPopupMockup />
              </div>

              <SubTopic title="Data-Rich Results" description="Sort, filter, and explore screening results with sparklines and inline search." id="sc-results" />
              <div className="grid md:grid-cols-2 gap-5 mt-6">
                <FeatureCard icon={BarChart3} title="Data-Rich Results Table">
                  <FeatureList items={[
                    "Sort by any column — market cap, P/E, ROE, price, volume, RSI",
                    "Paginated results — 25, 50, 100, or 200 per page",
                    "Synthetic trend sparklines from price anchors (ATL → SMAs → LTP)",
                    "Split LTP display — bold integer + muted decimals",
                    "Color-coded RSI badges and change percentages",
                    "Inline search to filter by symbol or company name",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Zap} title="Performance & Architecture">
                  <FeatureList items={[
                    "Server-side filtering via TradingView India scanner API",
                    "5-minute edge-cached responses for speed",
                    "500-stock scan limit per request with pagination",
                    "rawFilters engine for native cross-field comparisons",
                    "Mobile-responsive: shortened labels and horizontal scroll",
                    "Real-time data from NSE via TradingView data feed",
                  ]} />
                </FeatureCard>
              </div>

              <ScreenerSparklineMockup />

              <SubTopic title="Technical Indicators Reference" description="Understanding the technical metrics used in screener filters and stock cards." id="sc-indicators" />
              <ExpandableDetail title="Understanding Technical Indicators in the Screener" icon={Activity} badge="Reference">
                <p>The screener uses several technical indicators for filtering and display. Here's what each one means and how to use it:</p>
                <FeatureList items={[
                  "RSI (Relative Strength Index) — Momentum oscillator ranging 0-100. Below 30 = oversold (potential bounce), above 70 = overbought (potential pullback). The screener shows RSI as a segmented gauge in Stock Insight Cards.",
                  "SMA 50 (Simple Moving Average) — Average closing price over 50 days. Price above SMA 50 suggests an uptrend; below suggests a downtrend. The 'Above SMA 50' preset filters for stocks in technical uptrends.",
                  "Beta — Measures a stock's volatility relative to the market (Nifty 50). Beta > 1 = more volatile than market, Beta < 1 = less volatile. 'High Beta' preset finds volatile stocks; 'Low Beta' finds stable ones.",
                  "Relative Volume — Today's volume compared to the average volume over recent sessions. A relative volume of 3× means the stock is trading at 3 times its normal volume — often signals institutional interest or news.",
                  "Change % — Percentage price change for the current session. Used by Top Gainers (highest positive) and Top Losers (most negative) presets.",
                  "EPS (Earnings Per Share) — Company's profit divided by outstanding shares. Higher EPS generally indicates stronger profitability. The 'High EPS' preset filters for companies with strong earnings.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">These indicators are computed server-side from live NSE data. In the Custom Filter Builder, you can combine technical indicators with fundamental metrics (e.g., RSI &lt; 30 AND P/E &lt; 20) for powerful cross-domain screening.</p>
              </ExpandableDetail>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 16. Weekly Reports ─────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={16} total={26} />
              <SectionHeader
                id="reports"
                title="Weekly Reports"
                description="Auto-generated weekly performance reports with segment-by-segment breakdowns. Review your week, download as PDF, or send to Telegram."
                icon={PieChart}
              />
              <WeeklyReportMockup />
              <SubTopic title="Report Generation & Contents" description="Auto-generated weekly summaries with segment breakdowns and action items." id="rp-contents" />
              <FeatureCard icon={FileText} title="Report Features" badge="Pro">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Generation</h4>
                    <FeatureList items={[
                      "Auto-generated every Monday at 6:00 AM IST",
                      "Manual generation available anytime",
                      "Covers the previous Monday–Friday trading week",
                    ]} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Report Contents</h4>
                    <FeatureList items={[
                      "Segment-by-segment P&L breakdown",
                      "Win rate and total trades per segment",
                      "Top performing setups of the week",
                      "Most common mistakes of the week",
                      "Download as PDF or send to Telegram",
                    ]} />
                  </div>
                </div>
              </FeatureCard>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 17. Sharing & Social Cards ────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={17} total={26} />
              <SectionHeader
                id="sharing"
                title="Sharing & Social Cards"
                description="Generate beautiful share cards for your P&L, individual trades, and streaks. Share your trading wins on social media with branded, professional-looking graphics."
                icon={Share2}
              />
              <ShareCardsMockup />
              <SubTopic title="Card Types" description="Three types of share cards for different occasions." id="sh-cards" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Share2} title="P&L Share Cards">
                  <p className="text-sm text-muted-foreground mb-3">Generate visual P&L summaries to share on social media:</p>
                  <FeatureList items={[
                    "Daily, weekly, or monthly P&L snapshots",
                    "Includes win rate, trade count, and streak data",
                    "Multiple card templates with different styles",
                    "Download as PNG image for sharing",
                    "Watermarked with your TradeBook branding",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={TrendingUp} title="Trade Share Cards">
                  <p className="text-sm text-muted-foreground mb-3">Share individual trade results with detailed metrics:</p>
                  <FeatureList items={[
                    "Entry/exit prices, P&L, and return %",
                    "Setup tags and timeframe shown on card",
                    "Multiple visual templates to choose from",
                    "One-click download from trade detail modal",
                    "Privacy-safe — no account details shared",
                  ]} />
                </FeatureCard>
              </div>
              <SubTopic title="Streak Celebrations" description="Visual streak cards to share your winning momentum." id="sh-streaks" />
              <StreakShareMockup />
              <FeatureCard icon={Award} title="Streak Share Cards" badge="New">
                <p className="text-sm text-muted-foreground mb-3">Celebrate your winning streaks with visual share cards:</p>
                <FeatureList items={[
                  "Consecutive winning day counter with fire emoji",
                  "Day-by-day breakdown of the streak period",
                  "Share directly from the Dashboard streak widget",
                  "Branded card with TradeBook watermark",
                ]} />
              </FeatureCard>
              <ProTip>
                <p>Sharing your wins publicly creates accountability. Traders who share their journal consistently show 15% higher discipline scores in our data.</p>
              </ProTip>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 18. Achievements & Gamification ──────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={18} total={26} />
              <SectionHeader
                id="achievements"
                title="Achievements & Gamification"
                description="Earn badges as you hit trading milestones. From your first trade to 100-day streaks, achievements make your trading journey rewarding and motivating."
                icon={Trophy}
              />
              <AchievementsMockup />
              <SubTopic title="Badge Categories" description="Five achievement groups covering milestones, streaks, discipline, analytics, and social." id="ach-categories" />
              <FeatureCard icon={Trophy} title="Badge Categories">
                <p className="text-sm text-muted-foreground mb-3">Achievements are grouped into categories:</p>
                <FeatureList items={[
                  "Milestones — trade count targets (1, 10, 50, 100, 500 trades)",
                  "Streaks — consecutive profitable days (3, 5, 7, 14, 30 days)",
                  "Discipline — following rules, setting SL, using templates",
                  "Analytics — reviewing your data, using AI insights, generating reports",
                  "Social — sharing trades, inviting friends, writing journal entries",
                ]} />
              </FeatureCard>
              <SubTopic title="Progress Tracking" description="How badges are earned and tracked automatically." id="ach-progress" />
              <ExpandableDetail title="How Achievements Are Tracked" icon={Target} defaultOpen>
                <p className="text-[13px] text-muted-foreground mb-2">Achievements are tracked automatically as you use TradeBook. Each badge has a threshold (e.g., "Log 50 trades") and your progress is updated in real-time. When you reach the threshold, the badge unlocks with a celebration animation.</p>
                <p className="text-[13px] text-muted-foreground">View your progress in the Dashboard achievements widget or Settings → Profile. Unlocked badges show a timestamp of when they were earned.</p>
              </ExpandableDetail>
              <ProTip variant="info">
                <p>Check the Achievements grid on your Dashboard to see which badges you're closest to earning. Some badges unlock hidden features or special share card templates!</p>
              </ProTip>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 19. AI Trade Coach ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={19} total={26} />
              <SectionHeader
                id="trade-coach"
                title="AI Trade Coach"
                description="Get instant AI-powered feedback on every closed trade. The coach analyzes your entry, exit, timing, and risk management — then gives actionable advice."
                icon={Sparkles}
              />
              <TradeCoachMockup />
              <SubTopic title="Coaching Workflow" description="Automatic 4-step analysis triggered after every closed trade." id="tc-workflow" />
              <StepByStep title="How the AI Trade Coach Works" steps={[
                { title: "Close a trade", description: "When you close or exit a trade, the AI Coach is automatically triggered." },
                { title: "AI analyzes your trade", description: "The coach examines entry timing, stop loss placement, exit strategy, and risk management." },
                { title: "Get structured feedback", description: "Receive 'What Went Well', 'Room for Improvement', and an overall rating (1-5 stars)." },
                { title: "Feedback is saved", description: "All coaching feedback is stored on the trade record for future reference and pattern tracking." },
              ]} />
              <SubTopic title="Analysis Dimensions" description="Six areas the AI evaluates on every trade." id="tc-analysis" />
              <FeatureCard icon={Zap} title="What the Coach Analyzes" badge="Pro">
                <FeatureList items={[
                  "Entry timing — was the entry at an optimal price level?",
                  "Stop loss placement — was the SL too tight or too wide?",
                  "Exit strategy — did you take profits too early or hold too long?",
                  "Risk management — was the position size appropriate for the setup?",
                  "Pattern recognition — was the trade consistent with your best setups?",
                  "Emotional assessment — signs of FOMO, revenge trading, or overconfidence",
                ]} />
              </FeatureCard>
              <ProTip variant="best-practice">
                <p>Read your AI Coach feedback before taking the next trade. If the coach flagged "exited too early" on 3 consecutive trades, it's a signal to work on your trailing stop strategy.</p>
              </ProTip>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 20. Integrations ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={20} total={26} />
              <SectionHeader
                id="integrations"
                title="Integrations"
                description="Connect your broker and messaging apps to automate data flow, get live prices, and receive instant notifications."
                icon={Layers}
              />
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <DhanFlowDiagram />
                <TelegramChannelsMockup />
              </div>
              <SubTopic title="Broker Connection" description="Connect Dhan for live prices, portfolio sync, and one-click execution." id="int-broker" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={LineChart} title="Dhan Broker Integration">
                  <p className="text-sm text-muted-foreground mb-3">Connect your Dhan trading account for seamless data sync:</p>
                  <FeatureList items={[
                    "OAuth-based secure authentication",
                    "Auto-sync portfolio positions",
                    "Live LTP (Last Traded Price) for open positions",
                    "One-click trade execution from TradeBook",
                    "Real-time P&L tracking with live prices",
                    "Instrument master data sync for accurate symbol search",
                  ]} />
                  <div className="mt-4"><DhanIntegrationDetailMockup /></div>
                </FeatureCard>
                <FeatureCard icon={Send} title="Telegram Integration">
                  <p className="text-sm text-muted-foreground mb-3">Get instant notifications on your phone via Telegram:</p>
                  <FeatureList items={[
                    "Alert triggers — instant notification when price conditions are met",
                    "EOD (End of Day) reports — daily P&L summary after market close",
                    "Morning briefings — pre-market overview of your open positions",
                    "Weekly reports — full performance summary every Monday",
                    "TSL updates — trailing stop loss movement notifications",
                    "Multiple chat channels with segment-level routing",
                  ]} />
                  <div className="mt-4"><TelegramIntegrationDetailMockup /></div>
                </FeatureCard>
              </div>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 24. AI Insights Setup ─────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={24} total={26} />
              <SectionHeader
                id="ai-integration"
                title="AI Trade Insights"
                description="Get AI-powered analysis of your trading patterns, timing, and risk management. Uses a Bring Your Own Key (BYOK) model — your key, your cost, zero cost to us. We strongly recommend Google Gemini as it offers a generous free tier."
                icon={Sparkles}
              />
              <AIApiSetupMockup />
              <AIProviderComparisonMockup />

              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Star} title="Google Gemini (Recommended)" badge="Free">
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-semibold text-profit">Completely free</span> — Gemini's free tier is more than enough for daily trade analysis. No credit card required.
                  </p>
                  <h4 className="text-sm font-semibold mb-2">How to get your free API key:</h4>
                  <FeatureList items={[
                    "Go to aistudio.google.com/app/apikey",
                    "Sign in with your Google account",
                    "Click \"Create API Key\" — it's instant",
                    "Copy the key and paste it in Settings → Integrations → AI Trade Insights",
                    "That's it! You get 15 requests/minute and 1 million tokens/day for free",
                  ]} />
                  <div className="mt-4 p-3 rounded-xl bg-profit/5 border border-profit/20 text-[11px] text-profit font-medium">
                    💡 Most users will never exceed the free tier. One trade analysis uses ~2,000 tokens — that's 500 analyses per day for free.
                  </div>
                </FeatureCard>

                <FeatureCard icon={Zap} title="OpenAI (Alternative)">
                  <p className="text-sm text-muted-foreground mb-3">
                    For users who prefer OpenAI's GPT-4o Mini. Note: OpenAI requires paid credits from day one — there is no free API tier.
                  </p>
                  <h4 className="text-sm font-semibold mb-2">Setup steps:</h4>
                  <FeatureList items={[
                    "Go to platform.openai.com/api-keys",
                    "Create an account and add billing credits",
                    "Generate a new API key",
                    "Paste it in Settings → Integrations → AI Trade Insights",
                    "Cost: approximately ₹1–2 per analysis",
                  ]} />
                  <div className="mt-4 p-3 rounded-xl bg-[hsl(var(--warning)/0.05)] border border-[hsl(var(--warning)/0.2)] text-[11px] text-[hsl(var(--warning))] font-medium">
                    ⚠️ OpenAI charges per token used. No free tier available for API access.
                  </div>
                </FeatureCard>
              </div>

              <div className="mt-5">
                <FeatureCard icon={Shield} title="How It Works & Privacy">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">What AI Analyzes</h4>
                      <FeatureList items={[
                        "Aggregated win/loss statistics (not raw trade data)",
                        "Timing patterns — best entry hours and days",
                        "Risk management trends — SL hit rate, R:R ratios",
                        "Behavioral patterns — early exits, overtrading",
                        "Mistake frequency and recurring patterns",
                      ]} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Privacy & Security</h4>
                      <FeatureList items={[
                        "Your API key is stored securely in the database",
                        "Keys are only used server-side — never exposed to the browser",
                        "We never see or log your API key",
                        "Your key, your cost — TradeBook incurs zero AI cost",
                        "You can disconnect anytime in Settings",
                      ]} />
                    </div>
                  </div>
                  <div className="mt-4"><AIInsightSampleMockup /></div>
                </FeatureCard>
              </div>

              <div className="mt-5">
                <AISettingsPreviewMockup />
              </div>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 21. Keyboard Shortcuts ─────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={21} total={26} />
              <SectionHeader
                id="shortcuts"
                title="Keyboard Shortcuts"
                description="Power-user keyboard shortcuts to navigate and take actions without touching the mouse. Plus a Command Palette for instant search."
                icon={Keyboard}
              />
              <ShortcutKeyboardMockup />
              <SubTopic title="Command Palette" description="Global search and action launcher accessible from anywhere." id="kb-palette" />
              <FeatureCard icon={Command} title="Command Palette (⌘K)" badge="Enhanced">
                <p className="text-sm text-muted-foreground mb-3">
                  A global search that goes beyond navigation. Press <ShortcutKey>⌘K</ShortcutKey> or <ShortcutKey>/</ShortcutKey> to open and search across everything:
                </p>
                <FeatureList items={[
                  "Navigate to any page instantly",
                  "Quick actions: New Trade, New Alert, New Study",
                  "Search your trades by symbol — shows P&L badge and status",
                  "Search alerts by symbol — shows condition type and threshold",
                  "Search journal entries — matches text in plans, reviews, and lessons",
                  "Dynamic results appear after typing 2+ characters",
                  "Quick Trade Entry — keyboard-only trade logging (Symbol → Type → Price → Qty → Confirm)",
                ]} />
              </FeatureCard>
              <SubTopic title="Shortcut Reference" description="Complete keyboard shortcut reference for quick actions and navigation." id="kb-shortcuts" />
              <FeatureCard icon={Command} title="All Shortcuts">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                      {[
                        { key: "N", desc: "Create new trade" },
                        { key: "A", desc: "Create new alert" },
                        { key: "S", desc: "Create new study" },
                        { key: "/", desc: "Open search / Command Palette" },
                      ].map((s) => (
                        <div key={s.key} className="flex items-center gap-3">
                          <ShortcutKey>{s.key}</ShortcutKey>
                          <span className="text-sm text-muted-foreground">{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-4">Navigation</h4>
                    <div className="space-y-3">
                      {[
                        { key: "1", desc: "Go to Dashboard" },
                        { key: "2", desc: "Go to Trades" },
                        { key: "3", desc: "Go to Alerts" },
                        { key: "4", desc: "Go to Studies" },
                        { key: "5", desc: "Go to Watchlist" },
                        { key: "6", desc: "Go to Analytics" },
                      ].map((s) => (
                        <div key={s.key} className="flex items-center gap-3">
                          <ShortcutKey>{s.key}</ShortcutKey>
                          <span className="text-sm text-muted-foreground">{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Command Palette:</span> Press <ShortcutKey>/</ShortcutKey> to open the command palette. Type to search for any action, page, or trade — jump anywhere instantly.
                  </p>
                </div>
                <div className="mt-4"><KeyboardShortcutsDetailMockup /></div>
              </FeatureCard>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 22. Mobile & PWA ──────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={22} total={26} />
              <SectionHeader
                id="pwa"
                title="Mobile & PWA"
                description="TradeBook is a fully installable Progressive Web App. Add it to your home screen for a native-like experience with offline capabilities."
                icon={Smartphone}
              />
              <SubTopic title="Installation & Offline" description="Install as a native-like app with offline trade queuing." id="pwa-install" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Smartphone} title="Install as App">
                  <p className="text-sm text-muted-foreground mb-3">
                    TradeBook works as a PWA — install it on your phone or desktop for instant access without the browser chrome.
                  </p>
                  <FeatureList items={[
                    "Add to Home Screen on iOS and Android",
                    "Full-screen app experience — no browser UI",
                    "Maskable icon for clean home screen appearance",
                    "Auto-updates when new versions are deployed",
                    "Refresh prompt when a new version is available",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Activity} title="Offline Trade Queue" badge="New">
                  <p className="text-sm text-muted-foreground mb-3">
                    Log trades even when you're offline. Trades are queued locally and automatically synced when connectivity is restored.
                  </p>
                  <FeatureList items={[
                    "Detects online/offline status automatically",
                    "Offline banner appears in the app header",
                    "Trades are saved to local storage when offline",
                    "Auto-syncs queued trades when back online",
                    "Toast notifications confirm each synced trade",
                    "Shows count of queued trades in the offline banner",
                  ]} />
                </FeatureCard>
              </div>
              <SubTopic title="Mobile Navigation & Onboarding" description="Touch-optimized navigation with guided onboarding for new users." id="pwa-mobile" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={LayoutDashboard} title="Mobile Navigation">
                  <FeatureList items={[
                    "Bottom navigation bar with key pages: Dashboard, Trades, Alerts, Journal",
                    "Touch-optimized with safe-area insets for modern devices",
                    "Responsive layouts across all pages",
                    "Floating Quick Actions button for fast trade/alert/review creation",
                    "Swipe-to-act on trade rows — swipe left to reveal View/Close actions",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Play} title="Onboarding Checklist" badge="Enhanced">
                  <p className="text-sm text-muted-foreground mb-3">
                    A guided 6-step onboarding flow on the dashboard for new users:
                  </p>
                  <FeatureList items={[
                    "Log your first trade — auto-detected when you have any trades",
                    "Create a watchlist — detected when you have watchlists",
                    "Set a price alert — detected when you have alerts",
                    "Connect your broker — detected via Dhan verification",
                    "Write a journal entry — detected from daily journal entries",
                    "Review analytics — detected when you have closed trades",
                    "Progress bar and auto-dismiss when all steps complete",
                  ]} />
                </FeatureCard>
              </div>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 23. Settings ───────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={23} total={26} />
              <SectionHeader
                id="settings"
                title="Settings"
                description="Configure your account, preferences, integrations, and subscription. Manage your tags, capital, and security settings."
                icon={Settings}
              />
              <SettingsPanelMockup />
              <SubTopic title="Account & Preferences" description="Profile, billing, theme, and capital configuration." id="set-account" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Users} title="Profile & Billing">
                  <FeatureList items={[
                    "Update your name, email, and phone number",
                    "View current subscription plan and status",
                    "Upgrade/downgrade between Free, Pro, and Team plans",
                    "14-day Pro trial for new accounts",
                    "Manage billing and payment methods",
                  ]} />
                  <div className="mt-4"><SettingsProfileBillingMockup /></div>
                </FeatureCard>
                <FeatureCard icon={Settings} title="Preferences">
                  <FeatureList items={[
                    "Toggle between light and dark theme",
                    "Set your starting capital amount",
                    "Configure default stop loss percentage",
                    "Set preferred timezone",
                    "Alert check frequency (how often alerts are evaluated)",
                  ]} />
                  <div className="mt-4"><SettingsPreferencesMockup /></div>
                </FeatureCard>
                <FeatureCard icon={Tag} title="Tag Management">
                  <p className="text-sm text-muted-foreground mb-3">Create and manage your custom tags:</p>
                  <FeatureList items={[
                    "Setup tags — your trading setups (Breakout, Retest, Gap, etc.)",
                    "Mistake tags — common mistakes with severity levels",
                    "Pattern tags — chart patterns you trade",
                    "Tags are used across trades, studies, and analytics",
                  ]} />
                  <div className="mt-4"><SettingsTagManagementMockup /></div>
                </FeatureCard>
                <FeatureCard icon={Wallet} title="Capital Management">
                  <FeatureList items={[
                    "Track deposits and withdrawals from your trading capital",
                    "View capital transaction history",
                    "Adjusted capital used for risk calculations",
                    "Separate from P&L — tracks actual money in/out",
                  ]} />
                  <div className="mt-4"><CapitalManagementMockup /></div>
                </FeatureCard>
                <FeatureCard icon={Lock} title="Security">
                  <FeatureList items={[
                    "Change your password",
                    "Email-based password reset",
                    "Secure session management",
                    "All data encrypted at rest and in transit",
                  ]} />
                  <div className="mt-4"><SettingsSecurityMockup /></div>
                </FeatureCard>
                <FeatureCard icon={Layers} title="Integration Settings">
                  <FeatureList items={[
                    "Dhan broker: connect/disconnect, view sync status",
                    "Telegram: link bot, verify connection, manage channels",
                    "Configure notification types per Telegram channel",
                    "Segment-level routing for Telegram messages",
                  ]} />
                  <div className="mt-4"><SettingsIntegrationsMockup /></div>
                </FeatureCard>
              </div>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 25. FAQ & Troubleshooting ──────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={25} total={26} />
              <SectionHeader
                id="faq"
                title="FAQ & Troubleshooting"
                description="Answers to frequently asked questions and solutions to common issues."
                icon={MessageSquare}
              />
              <SubTopic title="Common Questions" description="Quick answers to the most frequently asked questions." id="faq-common" />
              <div className="space-y-4">
                {[
                  { q: "Is TradeBook free to use?", a: "Yes! The Free plan includes trade logging, watchlists, alerts, and basic analytics. The Pro plan unlocks advanced analytics, AI insights, weekly reports, and more." },
                  { q: "Do I need a Dhan account to use TradeBook?", a: "No. Dhan integration is optional — it enables live prices, auto-sync, and one-click execution. You can use TradeBook fully without any broker connection." },
                  { q: "Is my data secure?", a: "Absolutely. All data is encrypted at rest and in transit. Your API keys are stored securely server-side and never exposed to the browser. We use industry-standard authentication." },
                  { q: "Can I import trades from my existing broker?", a: "Yes. Use the CSV Import feature to bulk import trades from any broker. Column mapping supports most common export formats." },
                  { q: "Why are my live prices not updating?", a: "Check that your Dhan integration is connected and verified in Settings → Integrations. Prices only stream during market hours (9:15 AM – 3:30 PM IST)." },
                  { q: "How do I fix Telegram notifications not sending?", a: "Verify your bot token and chat ID in Settings → Integrations → Telegram. Use the 'Send Test' button to confirm delivery. Check the Delivery Log for error details." },
                  { q: "My dashboard shows no data — what's wrong?", a: "Ensure you have trades logged. Check the segment filter and month selector — they may be filtering out your data. Try selecting 'All Segments' and expanding the date range." },
                  { q: "Can I use TradeBook on mobile?", a: "Yes! TradeBook is a Progressive Web App (PWA). Add it to your home screen for a native-like experience with offline trade queuing." },
                  { q: "What is the AI Trade Coach?", a: "The AI Trade Coach provides instant feedback on your closed trades — analyzing entry, exit, timing, and risk management. It auto-triggers when you close a trade and the feedback is saved for future reference." },
                  { q: "How do Trading Rules work?", a: "Trading Rules are a customizable checklist that appears before you submit a new trade. Add your personal rules (e.g., 'Check trend on higher timeframe'), and the system enforces checking them all before entry." },
                  { q: "Can I get AI-suggested alerts?", a: "Yes! Smart Alert Suggestions analyzes your frequently traded symbols and recommends price alerts with AI-generated reasoning. One-click to create any suggestion as an active alert." },
                  { q: "How does the Command Palette work?", a: "Press ⌘K or / to open the Command Palette. It searches across pages, trades, alerts, and journal entries. You can also create new trades, alerts, and studies directly from it." },
                ].map((faq) => (
                  <div key={faq.q} className="premium-card-hover p-5 group">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                      {faq.q}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            <SectionDivider />

            {/* ── Phase 26. Changelog & Roadmap ────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <PhaseHeader phase={26} total={26} />
              <SectionHeader
                id="changelog"
                title="Changelog & Roadmap"
                description="Recent updates and upcoming features. We ship improvements every week."
                icon={RefreshCw}
              />
              <QuickNav items={[
                { label: "Recent Updates", id: "cl-updates" },
                { label: "Roadmap", id: "cl-roadmap" },
              ]} />
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent updates */}
                <div>
                  <SubTopic title="Recent Updates" description="Features shipped in recent releases." id="cl-updates" />
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-profit" /> Latest Releases
                  </h3>
                  <div className="space-y-3">
                    {[
                      { version: "v3.1", date: "Mar 2026", items: ["Trading Rules Checklist", "AI Trade Coach", "Smart Alert Suggestions", "Quick Close Popover", "Day/Time of Day Analysis", "Streak Tracker expansion", "Docs deep-links & reading time"] },
                      { version: "v3.0", date: "Mar 2026", items: ["AI Pattern Detection — behavioral insights", "Sector Rotation Heatmap", "Setup Win-Rate Matrix", "Emotional P&L Correlation"] },
                      { version: "v2.9", date: "Mar 2026", items: ["Dashboard drag-and-drop reordering", "Floating Trade Ticker", "Animated KPI numbers", "Mobile swipe-to-act on trades", "Quick Trade Entry via Command Palette", "P&L & Trade Share Cards"] },
                      { version: "v2.8", date: "Feb 2026", items: ["Stock Screener with 47 presets", "Custom filter builder", "Stock insight cards"] },
                      { version: "v2.7", date: "Feb 2026", items: ["Portfolio Heat Map widget", "Daily Review Wizard", "Enhanced onboarding"] },
                      { version: "v2.6", date: "Jan 2026", items: ["Multi-leg strategy support", "TSL profiles per segment", "AI Trade Insights"] },
                      { version: "v2.5", date: "Dec 2025", items: ["Trade Templates & Smart Suggestions", "CSV Import improvements", "Offline trade queue"] },
                    ].map((release) => (
                      <div key={release.version} className="premium-card-hover p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">{release.version}</Badge>
                          <span className="text-[10px] text-muted-foreground">{release.date}</span>
                        </div>
                        <ul className="space-y-1">
                          {release.items.map((item) => (
                            <li key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-profit shrink-0" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roadmap */}
                <div>
                  <SubTopic title="Upcoming Roadmap" description="Features we're building next." id="cl-roadmap" />
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[hsl(var(--tb-accent))]" /> Upcoming Roadmap
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Social Trading", desc: "Share your trade journal publicly with a custom RA-compliant profile", status: "In Progress" },
                      { label: "Option Chain Analyzer", desc: "Visual option chain with Greeks, IV surface, and strategy payoff diagrams", status: "Planned" },
                      { label: "Advanced Backtesting", desc: "Test your strategies against historical data with simulated P&L", status: "Planned" },
                      { label: "Zerodha Integration", desc: "Connect your Zerodha Kite account for live prices and auto-sync", status: "Exploring" },
                      { label: "Trade Similarity Engine", desc: "AI finds similar past trades and shows your historical win rate for that pattern", status: "Planned" },
                      { label: "Multi-Currency Support", desc: "Support for USD, EUR and other currencies for NRI traders", status: "Exploring" },
                    ].map((item) => (
                      <div key={item.label} className="premium-card-hover p-4 flex items-start gap-3">
                        <div className="mt-0.5">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            item.status === "In Progress" ? "bg-[hsl(var(--tb-accent))] animate-pulse" :
                            item.status === "Planned" ? "bg-primary/40" : "bg-muted-foreground/30"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">{item.label}</span>
                            <span className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded-full font-semibold",
                              item.status === "In Progress" ? "bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]" :
                              item.status === "Planned" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}>{item.status}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* CTA at bottom */}
            {!isInsideApp && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center py-16 rounded-2xl bg-gradient-to-b from-primary/[0.04] to-transparent relative overflow-hidden"
              >
                <div className="absolute inset-0 dot-pattern opacity-20" />
                <div className="relative">
                  <h2 className="text-3xl font-bold mb-4">Ready to improve your trading?</h2>
                  <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                    Start logging trades today with a 14-day free Pro trial. No credit card required.
                  </p>
                  <Button
                    size="lg"
                    onClick={() => navigate("/login?mode=signup")}
                    className="shimmer-cta bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 h-12 text-base gap-2"
                  >
                    Start Free — No Credit Card <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </motion.section>
            )}
          </main>
        </div>
      </div>

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-card/80 backdrop-blur-xl border border-border/40 shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-all"
            aria-label="Back to top"
            style={{ boxShadow: "0 4px 20px -6px rgba(0,0,0,0.1), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}
          >
            <ArrowUpRight className="w-4 h-4 -rotate-45" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer — only on standalone */}
      {!isInsideApp && (
        <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm dot-pattern py-16" role="contentinfo" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid md:grid-cols-4 gap-10 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img src="/favicon-32x32.png" alt="TradeBook" className="h-7 object-contain" loading="lazy" />
                  <span className="text-sm font-bold text-foreground">TradeBook</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">The trading journal built for Indian markets.</p>
                <Button size="sm" onClick={() => navigate("/login?mode=signup")} className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-4 text-[12px] h-8 shadow-[0_6px_16px_hsl(var(--tb-accent)/0.35)]">
                  Get Started <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
              {[
                { title: "Product", links: [{ label: "Features", href: "/#features" }, { label: "Pricing", href: "/#pricing" }, { label: "Documentation", href: "/docs" }] },
                { title: "Resources", links: [{ label: "Changelog", href: "#changelog" }, { label: "FAQ", href: "#faq" }, { label: "Blog", href: "#" }] },
                { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }, { label: "Contact", href: "mailto:founder@mrchartist.com" }] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-xs uppercase tracking-[0.1em] font-bold text-muted-foreground/60 mb-4 border-l-2 border-[hsl(var(--tb-accent))] pl-2">{col.title}</h4>
                  <ul className="space-y-1.5">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <button onClick={() => l.href.startsWith("mailto") ? window.open(l.href) : l.href.startsWith("#") ? document.getElementById(l.href.slice(1))?.scrollIntoView({ behavior: "smooth" }) : navigate(l.href)} className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all duration-200 inline-block">
                          {l.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--tb-accent)/0.25)] to-transparent mb-6" />
            <div className="bg-muted/20 rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
                © {new Date().getFullYear()} TradeBook. All rights reserved.
                <span className="inline-flex items-center gap-1">Made with ❤️ in <span className="inline-flex gap-[2px]"><span className="w-2 h-2 rounded-full bg-[#FF9933]" /><span className="w-2 h-2 rounded-full bg-white border border-border/40" /><span className="w-2 h-2 rounded-full bg-[#138808]" /></span> India</span>
              </p>
              <span className="text-[10px] text-muted-foreground/60 bg-muted/30 border border-border/30 rounded-full px-3 py-1">Not SEBI registered · For educational purposes only</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
