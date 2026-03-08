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
  Calculator, ClipboardCheck, Trophy
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
              <OnboardingFlowMockup />
              <MobileAppMockup />
              <SubTopic title="Platform Overview" description="Understand the key areas of TradeBook." id="gs-platform-overview" />
              <div className="grid md:grid-cols-2 gap-5">
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
              <DashboardMockup />
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
                { label: "Risk Management", id: "tm-risk" },
                { label: "Post-Trade Review", id: "tm-review" },
                { label: "Sharing & Discipline", id: "tm-sharing" },
                { label: "Quick Actions", id: "tm-quick" },
              ]} />
              <SubTopic title="Creating & Managing Trades" description="Log trades with detailed metadata and smart defaults." id="tm-creating" />
                <p className="text-sm text-muted-foreground mb-3">Step-by-step trade creation with smart defaults:</p>
                <FeatureList items={[
                  "Unified instrument search across NSE, BSE, MCX (equity, futures, options)",
                  "Auto-detect segment based on instrument type",
                  "Set entry price, stop loss, and up to 5 target levels",
                  "Choose trade type: BUY or SELL",
                  "Add confidence score (1-5) and rating (1-10)",
                  "Attach setup tags, pattern tags, and notes",
                  "Upload up to 5 chart images per trade",
                ]} />
                <div className="mt-4"><CreateTradeMockup /></div>
              </FeatureCard>

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

              <SubTopic title="Risk Management Tools" description="Automated stop loss, position sizing, and multi-leg strategies." />
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

              <SubTopic title="Post-Trade Review & Reflection" description="Structured review process after closing every trade." />
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

              <SubTopic title="Sharing, Gamification & Discipline" description="Social cards, badges, trading rules, and AI coaching." />
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

              <SubTopic title="Quick Actions & Data Tools" description="Fast trade closing, CSV import/export, and templates." />
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
              <SubTopic title="Import Workflow" description="Step-by-step process to bring your existing trades into TradeBook." />
              <StepByStep title="How to Import" steps={[
                { title: "Export from your broker", description: "Download your trade history as CSV from your broker's platform." },
                { title: "Upload to TradeBook", description: "Go to Trades → Import CSV and select your file." },
                { title: "Map columns", description: "Match your CSV column headers to TradeBook fields. Common names are auto-detected." },
                { title: "Preview & confirm", description: "Review mapped data, fix any validation errors, then confirm the import." },
              ]} />
              <VideoPlaceholder title="How to Import Trades from CSV" duration="3 min" />
              <SubTopic title="Import & Export Details" description="Detailed capabilities for importing and exporting trade data." />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Upload} title="Importing Trades">
                  <p className="text-sm text-muted-foreground mb-3">Step-by-step CSV import with validation:</p>
                  <FeatureList items={[
                    "Upload any CSV file — supports most broker export formats",
                    "Interactive column mapping — match your CSV headers to TradeBook fields",
                    "Auto-detect common column names (Symbol, Entry Price, Qty, etc.)",
                    "Preview mapped data before importing",
                    "Validation checks: missing required fields, invalid dates, duplicate trades",
                    "Batch import — process hundreds of trades at once",
                  ]} />
                  <div className="mt-4"><CsvImportMockup /></div>
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
              <ProTip>
                <p>Create a template for each of your top 3 setups. When you see a setup forming, use the template to log the trade in under 10 seconds — no more missed opportunities.</p>
              </ProTip>
              <SubTopic title="Template Setup" description="Create and manage reusable trade templates." />
              <VideoPlaceholder title="Setting Up Trade Templates" duration="2 min" />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Zap} title="Creating Templates">
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
                <FeatureCard icon={Sparkles} title="Smart Suggestions" badge="AI">
                  <p className="text-sm text-muted-foreground mb-3">AI analyzes your closed trades to surface patterns:</p>
                  <FeatureList items={[
                    "Identifies your most frequent trade setups automatically",
                    "Shows top 3 combos (e.g., 'Options BUY 5min — used 23 times')",
                    "One-click pre-fill from any suggestion",
                    "Updates as you add more trades",
                    "Helps standardize your approach over time",
                  ]} />
                </FeatureCard>
              </div>
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
              <PositionSizingCalcMockup />
              <SubTopic title="Calculation Workflow" description="How the calculator determines your optimal position size." />
              <StepByStep title="How It Works" steps={[
                { title: "Set your capital & risk %", description: "Define your total capital and the max % you're willing to risk per trade (e.g., 1.5%)." },
                { title: "Enter entry & stop loss prices", description: "The calculator computes the risk per share (entry − SL)." },
                { title: "Get recommended quantity", description: "Max shares = (Capital × Risk%) ÷ Risk per share. Automatically rounds down." },
                { title: "Review max loss", description: "See the maximum loss in rupees before you commit to the trade." },
              ]} />
              <SubTopic title="Advanced Sizing" description="Expert-level position sizing with the Kelly Criterion." />
              <ExpandableDetail title="Advanced: Kelly Criterion" icon={Target}>
                <p>For experienced traders, the Position Sizing Calculator can suggest position sizes based on the Kelly Criterion — factoring in your historical win rate and average win/loss ratio to optimize long-term capital growth.</p>
              </ExpandableDetail>
              <ProTip variant="warning">
                <p>Never risk more than 2% of your capital on a single trade. The calculator will flag oversized positions with a red warning if you exceed this threshold.</p>
              </ProTip>
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
              <TradingRulesMockup />
              <SubTopic title="Setup & Usage" description="How to create and enforce your personal trading rules." />
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
                <p>Start with 3-5 rules maximum. The best rules are specific and actionable: "Confirm volume is above 20-day average" is better than "Check volume."</p>
              </ProTip>
              <SubTopic title="Rule Examples" description="Pre-built rule sets for different trading styles." />
              <ExpandableDetail title="Example Rules for Different Styles" icon={BookOpen} defaultOpen>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-[12px] font-semibold text-foreground mb-2">Intraday Trader</p>
                    <ul className="space-y-1 text-[12px] text-muted-foreground">
                      <li>✓ Check pre-market gap direction</li>
                      <li>✓ Volume above VWAP</li>
                      <li>✓ No trades in first 5 minutes</li>
                      <li>✓ Risk under 1% of capital</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground mb-2">Swing Trader</p>
                    <ul className="space-y-1 text-[12px] text-muted-foreground">
                      <li>✓ Higher timeframe trend aligns</li>
                      <li>✓ No earnings in next 5 days</li>
                      <li>✓ Sector is not overbought</li>
                      <li>✓ R:R is at least 1:3</li>
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
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <AlertCardMockup />
                <TelegramNotifMockup />
              </div>
              <SubTopic title="Alert Types" description="Seven condition types to monitor any price action." />
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

              <SubTopic title="Trigger Logic & Delivery" description="Control when and how alerts fire and reach you." />
              <FeatureCard icon={RefreshCw} title="Recurrence & Cooldowns">
                <FeatureList items={[
                  "Once — fires once and auto-deactivates",
                  "Daily — resets every trading day, fires once per day",
                  "Continuous — fires every time the condition is met",
                  "Cooldown periods: 5 min, 15 min, 30 min, 1 hour, 1 day",
                  "Market hours only toggle (9:15 AM – 3:30 PM IST)",
                  "Set expiry dates for time-limited alerts",
                ]} />
                <div className="mt-4"><RecurrenceCooldownMockup /></div>
              </FeatureCard>

              <FeatureCard icon={Send} title="Delivery Channels">
                <p className="text-sm text-muted-foreground mb-3">Choose how you receive alert notifications:</p>
                <FeatureList items={[
                  "In-app notification badge and dashboard panel",
                  "Telegram instant message with alert details",
                  "Live LTP tracking shows distance-to-target for each alert",
                  "Snooze alerts for 1 hour or rest of the day",
                  "Bulk pause/resume all alerts at once",
                ]} />
                <div className="mt-4"><DeliveryChannelsMockup /></div>
              </FeatureCard>

              <SubTopic title="Alert Management" description="Organize, filter, and monitor all your alerts." />
              <FeatureCard icon={Eye} title="Alert Management">
                <p className="text-sm text-muted-foreground mb-3">Organize and monitor your alerts:</p>
                <FeatureList items={[
                  "Grid view with status cards or compact list view",
                  "Sort by symbol, creation date, last triggered, or status",
                  "Search and filter by symbol or condition type",
                  "Link alerts to studies or watchlist items",
                  "Trigger count tracking per alert",
                ]} />
                <div className="mt-4"><AlertManagementMockup /></div>
              </FeatureCard>

              <SubTopic title="AI-Powered Suggestions" description="Let AI recommend alerts based on your trading patterns." />
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
              <StudyCardMockup />
              <SubTopic title="Study Workflow" description="Organize studies by category and track their lifecycle." />
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

              <SubTopic title="Pattern Tagging" description="Rich multi-category tagging for chart pattern recognition." />
              <FeatureCard icon={Tag} title="Pattern Tagging System">
                <p className="text-sm text-muted-foreground mb-3">Rich tagging for pattern recognition:</p>
                <FeatureList items={[
                  "Classic Patterns: Double Top/Bottom, Head & Shoulders, Cup & Handle, Triangles, Wedges, Channels",
                  "Candlestick Patterns: Engulfing, Pin Bar, Doji, Morning/Evening Star, Hammer, Shooting Star",
                  "Setup Tags: Breakout, Retest, Gap Up/Down, Pullback, Reversal",
                  "Custom tags for your own classifications",
                  "Tag-based filtering with occurrence counts",
                ]} />
                <div className="mt-4"><PatternTaggingMockup /></div>
              </FeatureCard>

              <SubTopic title="Research Tools" description="Live prices, duration tracking, and linking studies to trades." />
              <FeatureCard icon={Clock} title="Additional Features">
                <FeatureList items={[
                  "Live prices displayed for active/draft studies",
                  "Duration tracking: < 6 months, 6M–2Y, 2–5Y, > 5Y",
                  "Attach links and reference materials",
                  "Free-form notes with rich context",
                  "Link studies to alerts for automatic monitoring",
                ]} />
                <div className="mt-4"><StudyAdditionalFeaturesMockup /></div>
              </FeatureCard>
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
              <WatchlistMockup />
              <SubTopic title="Organization & Live Data" description="Create lists, track prices, and act on opportunities." />
              <FeatureCard icon={Eye} title="Watchlist Capabilities">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Organization</h4>
                    <FeatureList items={[
                      "Create multiple named watchlists",
                      "Assign colors for visual distinction",
                      "Add instruments via unified symbol search",
                      "Drag to reorder instruments within a list",
                    ]} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Live Data & Actions</h4>
                    <FeatureList items={[
                      "Live prices: LTP, change %, volume, day high/low",
                      "Sort by % change, volume, LTP, or alphabetically",
                      "Quick action: create alert directly from any item",
                      "Quick action: create trade directly from any item",
                      "Market closed detection with last-known prices",
                    ]} />
                  </div>
                </div>
                <div className="mt-4"><WatchlistDetailMockup /></div>
              </FeatureCard>
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
              <ProTip variant="best-practice">
                <p>Review your journal every Sunday evening. Look at your Patterns & Mistakes tab — the patterns that made you money last month should inform your trading plan for next week.</p>
              </ProTip>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <CalendarHeatmapMockup />
                <KanbanBoardMockup />
              </div>
              <SubTopic title="Journal Views" description="Four specialized tabs for different aspects of your journal." />
              <div className="grid md:grid-cols-2 gap-5">
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
                <FeatureCard icon={Calendar} title="Calendar Tab">
                  <p className="text-sm text-muted-foreground">
                    A visual P&L heatmap calendar. Each day is colored by total P&L — deep green for big wins, deep red for big losses, neutral for flat days. Click any day to see the trades closed on that date and open the daily journal editor.
                  </p>
                  <div className="mt-4"><JournalCalendarTabMockup /></div>
                </FeatureCard>
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
                <FeatureCard icon={Filter} title="Filters & Segmentation">
                  <FeatureList items={[
                    "Filter by segment: All, Intraday, Positional, Futures, Options, Commodities",
                    "Date range presets: 30 days, 60 days, 90 days",
                    "Custom date range picker",
                    "All tabs and analytics update based on selected filters",
                  ]} />
                  <div className="mt-4"><JournalFiltersSegmentationMockup /></div>
                </FeatureCard>
              </div>
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
              <ProTip variant="info">
                <p>Analytics require at least 20 closed trades to generate meaningful insights. The more trades you log, the more statistically significant your analytics become.</p>
              </ProTip>
              <AnalyticsMetricCards />
              <AIInsightsMockup />
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <EquityCurveMockup />
                <AnalyticsHeatmapMockup />
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <SegmentPerformanceMockup />
                <RiskOfRuinMockup />
              </div>
              <SubTopic title="Core Metrics & AI Insights" description="Fundamental performance statistics and AI-powered analysis." />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={BarChart3} title="Core Metrics" badge="Pro">
                  <FeatureList items={[
                    "Win Rate — overall and by segment",
                    "Total P&L — cumulative profit/loss",
                    "Average Win / Average Loss",
                    "Expectancy — expected value per trade",
                    "Profit Factor — gross profit ÷ gross loss",
                    "Best Trade and Worst Trade",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Sparkles} title="AI Trade Insights" badge="Pro">
                  <p className="text-sm text-muted-foreground">
                    AI-powered analysis of your trading patterns. Identifies your most profitable setups, optimal trading times, common mistakes, and suggests actionable improvements. Insights update as you add more trades.
                  </p>
                </FeatureCard>
                <FeatureCard icon={TrendingDown} title="Equity Curve & Drawdown" badge="Pro">
                  <p className="text-sm text-muted-foreground">
                    Full equity curve showing cumulative P&L over time with drawdown overlay. Identifies maximum drawdown periods, recovery times, and helps you understand your capital curve's behavior under different market conditions.
                  </p>
                </FeatureCard>
                <FeatureCard icon={PieChart} title="Segment Performance" badge="Pro">
                  <p className="text-sm text-muted-foreground mb-3">Performance breakdown per market segment:</p>
                  <FeatureList items={[
                    "Win rate per segment",
                    "Sharpe ratio calculations",
                    "Average holding period",
                    "Best and worst setups per segment",
                    "P&L distribution charts",
                  ]} />
                </FeatureCard>
              </div>
              <SubTopic title="Time & Streak Analysis" description="Discover your best trading times and track momentum." />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Clock} title="Time-Based Heatmaps" badge="Pro">
                  <FeatureList items={[
                    "Time of Day heatmap — which hours are most profitable",
                    "Day of Week heatmap — which days you perform best",
                    "Color intensity shows P&L magnitude",
                    "Helps optimize your trading schedule",
                  ]} />
                </FeatureCard>
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
                <FeatureCard icon={TrendingDown} title="Drawdown Recovery" badge="Pro">
                  <p className="text-sm text-muted-foreground mb-3">Understand your capital curve's resilience:</p>
                  <FeatureList items={[
                    "Maximum drawdown % and duration in days",
                    "Drawdown overlay on equity curve chart",
                    "Recovery time analysis — how long to recover from each drawdown",
                    "Underwater chart showing time spent below peak equity",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Clock} title="Day & Time of Day Analysis" badge="Pro">
                  <p className="text-sm text-muted-foreground mb-3">Discover your optimal trading windows:</p>
                  <FeatureList items={[
                    "Day of Week heatmap — win rate and P&L by weekday",
                    "Time of Day heatmap — performance by hour (9 AM – 3 PM)",
                    "Color-coded cells: green for profitable, red for losing periods",
                    "Trade count overlay to show statistical significance",
                    "Helps you avoid trading during your historically weak periods",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Activity} title="Additional Advanced Analytics" badge="Pro">
                  <FeatureList items={[
                    "Setup/Tag Performance Matrix — P&L by setup tag",
                    "Risk of Ruin Calculator — statistical probability of account blowup",
                  ]} />
                </FeatureCard>
              </div>
              <SubTopic title="AI-Powered Behavioral Analytics" description="Machine learning insights into your trading psychology." />
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard icon={Sparkles} title="AI Pattern Detection" badge="New">
                  <p className="text-sm text-muted-foreground mb-3">
                    AI analyzes your entire trade history to surface hidden behavioral patterns — things you'd never spot manually. Powered by Gemini, it examines time-of-day performance, day-of-week tendencies, streak effects, and segment biases.
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
                    A 6-month heatmap grid showing how your trading allocation and P&L shifts across market segments over time. Spot trends in where you're focusing your capital.
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
                    A cross-tabulation of Segment × Timeframe showing win rates and trade counts. Instantly see which combinations of segment and timeframe give you the best edge.
                  </p>
                  <FeatureList items={[
                    "Matrix grid: segments as rows, timeframes as columns",
                    "Each cell shows win rate % and trade count",
                    "Color-coded: green ≥ 60%, yellow 40-60%, red < 40%",
                    "Identifies your best-performing segment/timeframe combos",
                    "Highlights cells with statistical significance (5+ trades)",
                    "Requires trades with timeframe and segment populated",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Activity} title="Emotional P&L Correlation" badge="New">
                  <p className="text-sm text-muted-foreground mb-3">
                    A bar chart correlating your emotion tags (FOMO, Calm, Anxious, Confident, etc.) with trading outcomes. See which emotional states lead to profits vs losses.
                  </p>
                  <FeatureList items={[
                    "Average P&L per emotion tag — bars colored by profit/loss",
                    "Win rate percentage displayed for each emotion",
                    "Trade count per emotion for statistical context",
                    "Uses the emotion_tag field on your trades",
                    "Helps identify which emotional states to cultivate or avoid",
                    "Empty state guide if no emotion tags are used yet",
                  ]} />
                </FeatureCard>
              </div>
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
                { label: "Calendar View", id: "calendar" },
                { label: "Journal Editor", id: "calendar" },
                { label: "Daily Workflow", id: "calendar" },
              ]} />
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <DailyJournalMockup />
                <CalendarDayDetailMockup />
              </div>
              <SubTopic title="Calendar View" description="A monthly heatmap grid showing your P&L performance at a glance." />
              <FeatureCard icon={Calendar} title="P&L Heatmap Calendar">
                <FeatureList items={[
                  "Monthly grid with color-coded P&L per day",
                  "Green shades for profitable days, red for losses",
                  "Intensity reflects magnitude of P&L",
                  "Click any date to open the journal editor",
                ]} />
              </FeatureCard>
              <SubTopic title="Journal Editor" description="Write structured daily reflections to track your trading mindset." />
              <FeatureCard icon={FileText} title="Daily Journal Entry">
                <FeatureList items={[
                  "Pre-market plan — write your plan before market opens",
                  "Post-market review — reflect on the day's trades",
                  "Market outlook notes",
                  "Mood tracking (feeling confident, anxious, etc.)",
                  "Lessons learned section",
                  "View all trades closed on that date",
                ]} />
                <div className="mt-4"><DailyJournalWorkflowMockup /></div>
              </FeatureCard>
              <ProTip variant="best-practice">
                <p>Write your pre-market plan before 9:00 AM. Traders who plan their day before market open show 23% higher win rates in our data.</p>
              </ProTip>
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
              <ProTip variant="warning">
                <p>Your most costly mistake is usually not your most frequent one. Check the "Most Costly" column — a single mistake type might account for 40% of your total losses.</p>
              </ProTip>
              <MistakeTrendMockup />
              <SubTopic title="Pattern Recognition" description="Identify repeat mistakes and track their frequency over time." />
              <FeatureCard icon={Search} title="Mistake Pattern Analysis">
                <FeatureList items={[
                  "Repeat pattern analysis with occurrence counts",
                  "Total loss attributed to each mistake type",
                  "6-month mistake trend chart showing improvement",
                  "Most common vs most costly mistakes comparison",
                ]} />
              </FeatureCard>
              <SubTopic title="Severity Classification" description="Categorize mistakes by financial impact to prioritize fixes." />
              <FeatureCard icon={AlertTriangle} title="Severity Breakdown">
                <FeatureList items={[
                  "Low severity: losses under ₹500",
                  "Medium severity: losses between ₹500 – ₹2,000",
                  "High severity: losses above ₹2,000",
                  "Manage mistake tags via Settings → Tag Management",
                ]} />
                <div className="mt-4"><MistakeAnalysisToolsMockup /></div>
              </FeatureCard>
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
                { label: "Scanner Presets", id: "fundamentals" },
                { label: "Custom Filters", id: "fundamentals" },
                { label: "Stock Insights", id: "fundamentals" },
                { label: "Results Table", id: "fundamentals" },
              ]} />

              <SubTopic title="Scanner Presets" description="47 built-in presets across 5 categories for instant stock screening." />
              <ScreenerPresetsMockup />

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

              <SubTopic title="Custom Filters & Stock Insights" description="Build multi-condition screens and explore detailed stock data." />
              <ScreenerTableMockup />

              <div className="grid md:grid-cols-2 gap-5 mt-6">
                <FeatureCard icon={SlidersHorizontal} title="Custom Filter Builder">
                  <p className="text-sm text-muted-foreground mb-3">Build and save your own multi-condition screens:</p>
                  <FeatureList items={[
                    "14 screening metrics: P/E, P/B, ROE, Net Margin, Dividend Yield, D/E, Current Ratio, Market Cap, RSI, Change%, Volume, Rel. Volume, EPS, Beta",
                    "AND logic — combine up to 8 conditions",
                    "Save named presets to database for instant reuse",
                    "Load/delete saved presets from My Presets section",
                    "Presets persist across sessions and devices",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Eye} title="Stock Insight Card">
                  <p className="text-sm text-muted-foreground mb-3">Click any stock to open a rich detail popup:</p>
                  <FeatureList items={[
                    "Hero header with ticker, sector, LTP and day change",
                    "Summary strip — P/E, Volume, Dividend Yield at a glance",
                    "4 deep-dive tabs: Overview, Valuation (attractiveness badges), Financials (benchmarked bars), Technicals (RSI gauge + SMA signals)",
                    "Quick action footer — Trade, Alert, Watchlist, Study",
                    "Fully responsive with mobile-optimized layout",
                  ]} />
                </FeatureCard>
              </div>

              {/* Stock popup visual */}
              <div className="grid md:grid-cols-2 gap-5 mt-2">
                <StockPopupMockup />
                <CustomFilterBuilderMockup />
              </div>

              <SubTopic title="Data-Rich Results" description="Sort, filter, and explore screening results with sparklines and inline search." />
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

              {/* Sparkline visual */}
              <ScreenerSparklineMockup />
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
              <SubTopic title="Report Generation & Contents" description="Auto-generated weekly summaries with segment breakdowns and action items." />
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
              <SubTopic title="Card Types" description="Three types of share cards for different occasions." />
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
              <SubTopic title="Streak Celebrations" description="Visual streak cards to share your winning momentum." />
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
              <SubTopic title="Badge Categories" description="Five achievement groups covering milestones, streaks, discipline, analytics, and social." />
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
              <SubTopic title="Progress Tracking" description="How badges are earned and tracked automatically." />
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
              <SubTopic title="Coaching Workflow" description="Automatic 4-step analysis triggered after every closed trade." />
              <StepByStep title="How the AI Trade Coach Works" steps={[
                { title: "Close a trade", description: "When you close or exit a trade, the AI Coach is automatically triggered." },
                { title: "AI analyzes your trade", description: "The coach examines entry timing, stop loss placement, exit strategy, and risk management." },
                { title: "Get structured feedback", description: "Receive 'What Went Well', 'Room for Improvement', and an overall rating (1-5 stars)." },
                { title: "Feedback is saved", description: "All coaching feedback is stored on the trade record for future reference and pattern tracking." },
              ]} />
              <SubTopic title="Analysis Dimensions" description="Six areas the AI evaluates on every trade." />
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
              <SubTopic title="Broker Connection" description="Connect Dhan for live prices, portfolio sync, and one-click execution." />
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
              <SubTopic title="Command Palette" description="Global search and action launcher accessible from anywhere." />
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
              <SubTopic title="Shortcut Reference" description="Complete keyboard shortcut reference for quick actions and navigation." />
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
              <SubTopic title="Installation & Offline" description="Install as a native-like app with offline trade queuing." />
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
              <SubTopic title="Mobile Navigation & Onboarding" description="Touch-optimized navigation with guided onboarding for new users." />
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
              <SubTopic title="Account & Preferences" description="Profile, billing, theme, and capital configuration." />
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
              <SubTopic title="Common Questions" description="Quick answers to the most frequently asked questions." />
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
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent updates */}
                <SubTopic title="Recent Updates" description="Features shipped in recent releases." />
                <div>
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
