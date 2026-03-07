import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
  PanelLeftClose, PanelLeftOpen, SlidersHorizontal
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import docsLogo from "@/assets/logo.png";
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

const SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: Play },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "trade-management", label: "Trade Management", icon: CandlestickChart },
  { id: "csv-import", label: "CSV Import", icon: Upload },
  { id: "trade-templates", label: "Trade Templates", icon: FileText },
  { id: "alerts", label: "Alerts System", icon: Bell },
  { id: "studies", label: "Studies & Research", icon: BookOpen },
  { id: "watchlists", label: "Watchlists", icon: Eye },
  { id: "journal", label: "Trade Journal", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "calendar", label: "Calendar & Journal", icon: Calendar },
  { id: "mistakes", label: "Mistakes Review", icon: AlertTriangle },
  { id: "fundamentals", label: "Stock Screener", icon: Search },
  { id: "reports", label: "Weekly Reports", icon: PieChart },
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
        <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
          <ChevronRight className="w-[18px] h-[18px] text-[hsl(var(--tb-accent))] mt-0.5 shrink-0" />
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
    <div className="premium-card-hover group hover:scale-[1.005] transition-all duration-200 relative overflow-hidden bg-gradient-to-br from-card to-card/80">
      {/* Decorative dot-pattern corner */}
      <div className="absolute top-0 right-0 w-20 h-20 dot-pattern opacity-30 rounded-bl-2xl" />
      {/* Left accent bar on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="pb-3 flex flex-col space-y-1.5 p-7">
        <div className="flex items-center gap-3">
          <div className="inner-panel !p-2.5 !rounded-xl !bg-primary/8 !border-primary/15 shadow-sm">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold leading-none tracking-tight">{title}</h3>
            {badge && (
              <Badge variant="secondary" className="text-[11px] px-2 py-0 bg-primary/10 text-primary border-none">
                {badge}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="p-7 pt-0">
        <div className="[&>p]:text-[14px] [&>p]:leading-relaxed [&>p]:max-w-prose">{children}</div>
      </div>
    </div>
  );
}

function VideoPlaceholder({ title, duration }: { title: string; duration: string }) {
  return (
    <div className="my-6 rounded-2xl border border-border/40 bg-card overflow-hidden group cursor-pointer hover:border-primary/40 transition-all">
      <div className="relative bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center py-16">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-primary ml-1" />
          </div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <span className="text-[10px] text-muted-foreground bg-muted/50 rounded-full px-3 py-1">{duration} · Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

function SectionHeader({ id, title, description, icon: Icon }: {
  id: string; title: string; description: string; icon: React.ElementType;
}) {
  return (
    <div id={id} className="scroll-mt-24 mb-8 dashboard-card relative overflow-hidden">
      {/* Top accent bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 h-[3px] bg-primary origin-left docs-accent-bar"
      />
      <div className="flex items-center gap-3 mb-3 pt-2">
        <div className="icon-badge inner-panel !p-2.5 !rounded-xl !bg-primary/8 !border-primary/15">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl lg:text-[2rem] font-bold tracking-tight leading-tight">{title}</h2>
      </div>
      <p className="text-muted-foreground leading-relaxed max-w-3xl mb-6">{description}</p>
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
    { label: "Core Features", ids: ["dashboard", "trade-management", "csv-import", "trade-templates", "alerts", "studies", "watchlists", "journal"] },
    { label: "Advanced", ids: ["analytics", "calendar", "mistakes", "fundamentals", "reports"] },
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
      {/* Floating island navbar */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-3xl px-4"
        aria-label="Documentation navigation"
      >
        <div className="flex items-center justify-between rounded-full border border-border/40 bg-card/80 backdrop-blur-xl px-4 sm:px-6 h-14" style={{ boxShadow: "0 4px 20px -6px rgba(0,0,0,0.06), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <img src={docsLogo} alt="TradeBook" className="h-8 object-contain" />
          </button>

          {/* Center links */}
          <div className="hidden sm:flex items-center gap-0.5">
            {[{ label: "Features", href: "/#features" }, { label: "Pricing", href: "/#pricing" }, { label: "FAQ", href: "/#faq" }].map((item) => (
              <Button key={item.label} variant="ghost" size="sm" className="text-muted-foreground rounded-full text-[13px] font-medium relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[hsl(var(--tb-accent))] after:opacity-0 hover:after:opacity-100 after:transition-opacity" onClick={() => navigate(item.href)}>{item.label}</Button>
            ))}
            <Button variant="ghost" size="sm" className="text-foreground font-semibold rounded-full text-[13px] relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[hsl(var(--tb-accent))] after:opacity-100" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Docs</Button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isInsideApp ? (
              <Button size="sm" onClick={() => navigate("/dashboard")} className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-4 text-[13px] h-9 shadow-[0_6px_16px_hsl(var(--tb-accent)/0.35)]">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-muted-foreground rounded-full text-[13px] hidden sm:inline-flex">
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/login?mode=signup")}
                  className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-4 text-[13px] h-9 shadow-[0_6px_16px_hsl(var(--tb-accent)/0.35)]"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero — extra top padding for fixed navbar */}
      <div className={cn("pt-20 border-b border-border/20 bg-gradient-to-b from-[hsl(var(--tb-accent)/0.04)] to-transparent", isInsideApp && "border-none")}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
          <div className="flex items-center gap-3 mb-5">
            <Badge variant="secondary" className="bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))] border-none">
              Documentation
            </Badge>
            {/* B&W Toggle */}
            <button
              onClick={toggle}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all border",
                mode === "bw"
                  ? "bg-foreground text-background border-foreground"
                  : "bg-muted/50 text-muted-foreground border-border/40 hover:border-foreground/30"
              )}
            >
              <Palette className="w-3.5 h-3.5" />
              {mode === "bw" ? "B&W" : "Color"}
            </button>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Everything you need to know about{" "}
            <span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', cursive" }}>
              TradeBook
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            A comprehensive guide to every feature, capability, and workflow in the platform — from your first trade log to advanced analytics.
          </p>
          {/* Hero stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-wrap gap-3 mt-6"
          >
            {[
              { label: "17 Sections", icon: FileText },
              { label: "50+ Mockups", icon: Eye },
              { label: "Every Feature", icon: Zap },
              { label: "Free & Pro", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="inner-panel flex items-center gap-2 !px-4 !py-2">
                <stat.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">{stat.label}</span>
              </div>
            ))}
          </motion.div>
          <BentoFeatureGrid />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        <div className="flex gap-10">
          {/* Sidebar — desktop */}
          <TooltipProvider delayDuration={200}>
            <aside className={cn(
              "hidden lg:block shrink-0 transition-all duration-300",
              sidebarCollapsed ? "w-14" : "w-64"
            )}>
              <div className="sticky top-24">
                {/* Scroll progress bar */}
                <div className="h-0.5 bg-muted rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-primary transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
                </div>
                {/* Header with collapse toggle */}
                <div className={cn("flex items-center mb-3", sidebarCollapsed ? "justify-center" : "justify-between px-3")}>
                  {!sidebarCollapsed && (
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Table of Contents</p>
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
                  <div className="px-3 mb-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                      <input
                        type="text"
                        value={sidebarSearch}
                        onChange={(e) => setSidebarSearch(e.target.value)}
                        placeholder="Filter sections…"
                        className="w-full h-8 pl-8 pr-3 rounded-lg bg-muted/40 border border-border/30 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
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
                        {gi > 0 && !sidebarCollapsed && <Separator className="my-2 mx-3" />}
                        {gi > 0 && sidebarCollapsed && <Separator className="my-2" />}
                        {!sidebarCollapsed && (
                          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/50 px-3 py-1.5">{group.label}</p>
                        )}
                        {groupSections.map((s) => {
                          const btn = (
                            <button
                              key={s.id}
                              onClick={() => { scrollTo(s.id); setSidebarSearch(""); }}
                              className={cn(
                                "w-full flex items-center rounded-lg text-sm transition-all duration-200 text-left relative hover:translate-x-0.5",
                                sidebarCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5",
                                activeSection === s.id
                                  ? "bg-primary/8 text-primary font-semibold"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )}
                            >
                              {activeSection === s.id && (
                                <motion.div
                                  layoutId="docs-active-pill"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary"
                                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                              )}
                              <s.icon className="w-4 h-4 shrink-0" />
                              {!sidebarCollapsed && s.label}
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
          <nav className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border/20 shadow-sm" aria-label="Section navigation">
            <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 no-scrollbar">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    "shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                    activeSection === s.id
                      ? "bg-[hsl(var(--tb-accent))] text-white ring-1 ring-[hsl(var(--tb-accent)/0.3)]"
                      : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Main content */}
          <main className={cn("flex-1 min-w-0 space-y-24 lg:pt-0 pt-14 transition-all duration-300", sidebarCollapsed ? "max-w-5xl" : "max-w-4xl")}>

            {/* ── 1. Getting Started ─────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="getting-started"
                title="Getting Started"
                description="TradeBook is a professional trading journal built specifically for Indian markets — NSE, BSE, and MCX. Whether you trade equities, futures, options, or commodities, it gives you the tools to log, analyze, and improve your trading."
                icon={Play}
              />
              <OnboardingFlowMockup />
              <MobileAppMockup />
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
            </motion.section>

            <SectionDivider />

            {/* ── 2. Dashboard ───────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, delay: 0.05 }}>
              <SectionHeader
                id="dashboard"
                title="Dashboard"
                description="Your trading cockpit. A single screen that shows your P&L, risk exposure, open positions, and trading discipline — all updated in real-time during market hours."
                icon={LayoutDashboard}
              />
              <DashboardMockup />

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

              <FeatureCard icon={Settings} title="Widget Customization">
                <p className="text-sm text-muted-foreground mb-3">Personalize your dashboard by showing/hiding widgets and reordering them:</p>
                <FeatureList items={[
                  "Toggle visibility of any widget (P&L, KPIs, equity curve, etc.)",
                  "Reorder widgets by moving them up or down",
                  "Reset to default layout anytime",
                  "Layout persists across sessions",
                ]} />
                <div className="mt-4"><WidgetCustomizerMockup /></div>
              </FeatureCard>

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
            </motion.section>

            <SectionDivider />

            {/* ── 3. Trade Management ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="trade-management"
                title="Trade Management"
                description="The core of TradeBook. Log every trade with detailed metadata — entry, exit, stop loss, targets, tags, chart images, and post-trade reviews. Manage your entire trading book from one screen."
                icon={CandlestickChart}
              />

              <FeatureCard icon={Search} title="Creating a Trade">
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
                ]} />
                <div className="mt-4"><MultiLegStrategyDetailMockup /></div>
              </FeatureCard>

              <FeatureCard icon={Gauge} title="Position Sizing Calculator">
                <p className="text-sm text-muted-foreground">
                  Built into the trade creation form. Enter your risk per trade (as % of capital or fixed amount), and the calculator tells you the optimal quantity based on your entry price and stop loss distance. Shows position value and max loss in rupees.
                </p>
                <div className="mt-4"><PositionSizingDetailMockup /></div>
              </FeatureCard>

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

            {/* ── 3b. CSV Import ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="csv-import"
                title="CSV Import & Export"
                description="Bulk import trades from CSV files with intelligent column mapping, or export your entire trade history for backup and external analysis."
                icon={Upload}
              />
              <VideoPlaceholder title="How to Import Trades from CSV" duration="3 min" />
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

            {/* ── 3c. Trade Templates ─────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="trade-templates"
                title="Trade Templates & Smart Suggestions"
                description="Save your frequently-used trade setups as reusable templates. Plus, get AI-suggested setups based on your trading patterns."
                icon={FileText}
              />
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
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
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
            </motion.section>

            <SectionDivider />

            {/* ── 5. Studies & Research ───────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="studies"
                title="Studies & Research"
                description="Document your trade ideas, chart analyses, and research findings. Tag with patterns, track status through a workflow, and link studies to actual trades."
                icon={BookOpen}
              />
              <StudyCardMockup />

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

            {/* ── 6. Watchlists ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="watchlists"
                title="Watchlists"
                description="Create multiple named watchlists to track instruments you're interested in. See live prices, quick-sort by performance, and act directly from the watchlist."
                icon={Eye}
              />
              <WatchlistMockup />
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

            {/* ── 7. Trade Journal ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="journal"
                title="Trade Journal"
                description="A multi-view journal that combines summary analytics, equity curves, performance tables, pattern analysis, and a Kanban board for reviewing mistakes."
                icon={FileText}
              />
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <CalendarHeatmapMockup />
                <KanbanBoardMockup />
              </div>
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

            {/* ── 8. Analytics (Pro) ─────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="analytics"
                title="Analytics"
                description="Deep performance analytics powered by your trade data. Understand your edge with heatmaps, breakdowns, and statistical measures. Available on the Pro plan."
                icon={BarChart3}
              />
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
                <FeatureCard icon={Clock} title="Time-Based Heatmaps" badge="Pro">
                  <FeatureList items={[
                    "Time of Day heatmap — which hours are most profitable",
                    "Day of Week heatmap — which days you perform best",
                    "Color intensity shows P&L magnitude",
                    "Helps optimize your trading schedule",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Activity} title="Advanced Analytics" badge="Pro">
                  <FeatureList items={[
                    "Streak Tracker — winning/losing streak analysis",
                    "Setup/Tag Performance Matrix — P&L by setup tag",
                    "Risk-Reward Analytics — actual R:R vs planned R:R",
                    "Risk of Ruin Calculator — statistical probability of account blowup",
                  ]} />
                </FeatureCard>
              </div>
            </motion.section>

            <SectionDivider />

            {/* ── 9. Calendar & Daily Journal ────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="calendar"
                title="Calendar & Daily Journal"
                description="A monthly calendar view with daily journal entries. Write pre-market plans, post-market reviews, and track your mood and lessons for each trading day."
                icon={Calendar}
              />
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <DailyJournalMockup />
                <CalendarDayDetailMockup />
              </div>
              <FeatureCard icon={Calendar} title="Daily Journal Workflow">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Calendar View</h4>
                    <FeatureList items={[
                      "Monthly grid with color-coded P&L per day",
                      "Green shades for profitable days, red for losses",
                      "Intensity reflects magnitude of P&L",
                      "Click any date to open the journal editor",
                    ]} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Journal Editor</h4>
                    <FeatureList items={[
                      "Pre-market plan — write your plan before market opens",
                      "Post-market review — reflect on the day's trades",
                      "Market outlook notes",
                      "Mood tracking (feeling confident, anxious, etc.)",
                      "Lessons learned section",
                      "View all trades closed on that date",
                    ]} />
                  </div>
                </div>
                <div className="mt-4"><DailyJournalWorkflowMockup /></div>
              </FeatureCard>
            </motion.section>

            <SectionDivider />

            {/* ── 10. Mistakes Review ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="mistakes"
                title="Mistakes Review"
                description="Dedicated page for analyzing your trading mistakes. Identify repeat patterns, track loss severity, and monitor improvement trends over time."
                icon={AlertTriangle}
              />
              <MistakeTrendMockup />
              <FeatureCard icon={AlertTriangle} title="Mistake Analysis Tools">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Pattern Recognition</h4>
                    <FeatureList items={[
                      "Repeat pattern analysis with occurrence counts",
                      "Total loss attributed to each mistake type",
                      "6-month mistake trend chart showing improvement",
                      "Most common vs most costly mistakes comparison",
                    ]} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Severity Breakdown</h4>
                    <FeatureList items={[
                      "Low severity: losses under ₹500",
                      "Medium severity: losses between ₹500 – ₹2,000",
                      "High severity: losses above ₹2,000",
                      "Manage mistake tags via Settings → Tag Management",
                    ]} />
                  </div>
                </div>
                <div className="mt-4"><MistakeAnalysisToolsMockup /></div>
              </FeatureCard>
            </motion.section>

            <SectionDivider />

            {/* ── 10b. Stock Screener (Fundamentals) ─────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="fundamentals"
                title="Stock Screener"
                description="A professional-grade NSE stock scanner with 47 built-in presets across 5 categories — Market Cap, Price Action, Volume, Fundamental, and Technical. Includes custom filter builder, saved presets, and deep-dive stock insight cards."
                icon={Search}
              />

              {/* Scanner presets visual */}
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

              {/* Screener table visual */}
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

            {/* ── 11. Weekly Reports ─────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="reports"
                title="Weekly Reports"
                description="Auto-generated weekly performance reports with segment-by-segment breakdowns. Review your week, download as PDF, or send to Telegram."
                icon={PieChart}
              />
              <WeeklyReportMockup />
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

            {/* ── 12. Integrations ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
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

            {/* ── 12b. AI Insights Setup ─────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
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

            {/* ── 13. Keyboard Shortcuts ─────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="shortcuts"
                title="Keyboard Shortcuts"
                description="Power-user keyboard shortcuts to navigate and take actions without touching the mouse. Plus a Command Palette for instant search."
                icon={Keyboard}
              />
              <ShortcutKeyboardMockup />
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
                ]} />
              </FeatureCard>
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

            {/* ── 14b. Mobile & PWA ──────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="pwa"
                title="Mobile & PWA"
                description="TradeBook is a fully installable Progressive Web App. Add it to your home screen for a native-like experience with offline capabilities."
                icon={Smartphone}
              />
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
                <FeatureCard icon={LayoutDashboard} title="Mobile Navigation">
                  <FeatureList items={[
                    "Bottom navigation bar with key pages: Dashboard, Trades, Alerts, Journal",
                    "Touch-optimized with safe-area insets for modern devices",
                    "Responsive layouts across all pages",
                    "Floating Quick Actions button for fast trade/alert/review creation",
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

            {/* ── 15. Settings ───────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="settings"
                title="Settings"
                description="Configure your account, preferences, integrations, and subscription. Manage your tags, capital, and security settings."
                icon={Settings}
              />
              <SettingsPanelMockup />
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

            {/* ── FAQ & Troubleshooting ──────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="faq"
                title="FAQ & Troubleshooting"
                description="Answers to frequently asked questions and solutions to common issues."
                icon={MessageSquare}
              />
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

            {/* ── Changelog & Roadmap ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}>
              <SectionHeader
                id="changelog"
                title="Changelog & Roadmap"
                description="Recent updates and upcoming features. We ship improvements every week."
                icon={RefreshCw}
              />
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent updates */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-profit" /> Recent Updates
                  </h3>
                  <div className="space-y-3">
                    {[
                      { version: "v2.8", date: "Mar 2026", items: ["Stock Screener with 47 presets", "Custom filter builder", "Stock insight cards"] },
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
                      { label: "P&L Sharing Cards", desc: "Generate beautiful P&L summary cards for social media sharing", status: "Planned" },
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
