import React, { useState, useEffect, useCallback } from "react";
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
  OnboardingFlowMockup, DashboardMockup, TradeCardMockup,
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
  ProTip, StepByStep, ExpandableDetail, ComparisonTable,
  InteractiveMockup, PhaseHeader, QuickNav, KeyMetric, SubTopic,
  CodeBlock, OutputBlock
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

const SECTION_ANCHORS: Record<string, { label: string; id: string }[]> = {
  "getting-started": [
    { label: "Quick Start", id: "gs-quick-start" },
    { label: "Platform Overview", id: "gs-platform-overview" },
    { label: "System Requirements", id: "gs-system-req" },
  ],
  "dashboard": [
    { label: "Performance Overview", id: "db-performance" },
    { label: "Charts & Visualizations", id: "db-charts" },
    { label: "Customization", id: "db-customization" },
    { label: "Advanced Widgets", id: "db-advanced" },
  ],
  "trade-management": [
    { label: "Creating Trades", id: "tm-creating" },
    { label: "Trade Lifecycle", id: "tm-lifecycle" },
    { label: "Risk Management", id: "tm-risk" },
    { label: "Post-Trade Review", id: "tm-review" },
    { label: "Sharing & Discipline", id: "tm-sharing" },
    { label: "Quick Actions", id: "tm-quick" },
  ],
  "csv-import": [
    { label: "Import Workflow", id: "csv-import-workflow" },
    { label: "Import & Export Details", id: "csv-details" },
    { label: "Format & Troubleshooting", id: "csv-format" },
  ],
  "trade-templates": [
    { label: "Template Setup", id: "tpl-setup" },
    { label: "Smart Suggestions", id: "tpl-smart" },
    { label: "Automation Features", id: "tpl-auto" },
  ],
  "position-sizing": [
    { label: "Calculation Workflow", id: "ps-workflow" },
    { label: "Advanced Sizing", id: "ps-advanced" },
    { label: "Practical Examples", id: "ps-examples" },
  ],
  "trading-rules": [
    { label: "Setup & Usage", id: "tr-setup" },
    { label: "Core vs Optional", id: "tr-core" },
    { label: "Pre-Trade Checklist", id: "tr-checklist" },
  ],
  "alerts": [
    { label: "First Alert", id: "al-first" },
    { label: "Alert Types", id: "al-types" },
    { label: "Delivery Channels", id: "al-delivery" },
    { label: "Management", id: "al-manage" },
  ],
  "studies": [
    { label: "Publishing a Study", id: "st-publish" },
    { label: "Study Workflow", id: "st-workflow" },
    { label: "Pattern Tagging", id: "st-patterns" },
    { label: "Research Tools", id: "st-tools" },
    { label: "Linking to Trades", id: "st-linking" },
  ],
  "watchlists": [
    { label: "First Watchlist", id: "wl-first" },
    { label: "Organization", id: "wl-org" },
    { label: "Live Prices", id: "wl-prices" },
    { label: "Alerts Integration", id: "wl-alerts" },
  ],
  "journal": [
    { label: "Weekly Review", id: "jn-review" },
    { label: "Dashboard Tab", id: "jn-dashboard" },
    { label: "Calendar Tab", id: "jn-calendar" },
    { label: "Mistakes Tab", id: "jn-mistakes" },
    { label: "Filters & Segments", id: "jn-filters" },
  ],
  "analytics": [
    { label: "Getting Started", id: "an-start" },
    { label: "Core Metrics", id: "an-core" },
    { label: "Advanced Tools", id: "an-advanced" },
    { label: "AI Pattern Detection", id: "an-ai" },
  ],
  "calendar": [
    { label: "Calendar View", id: "cal-view" },
    { label: "Daily Review", id: "cal-review" },
    { label: "Journal Integration", id: "cal-journal" },
    { label: "Scheduling", id: "cal-schedule" },
  ],
  "mistakes": [
    { label: "Categorizing", id: "mk-categorize" },
    { label: "Pattern Recognition", id: "mk-patterns" },
    { label: "Improvement Tools", id: "mk-tools" },
    { label: "Analytics Link", id: "mk-analytics" },
  ],
  "fundamentals": [
    { label: "First Screen", id: "sc-first" },
    { label: "Scanner Presets", id: "sc-presets" },
    { label: "Custom Filters", id: "sc-custom" },
    { label: "Stock Details", id: "sc-details" },
    { label: "Sparkline & Trends", id: "sc-sparklines" },
  ],
  "reports": [
    { label: "Generating Reports", id: "rp-generate" },
    { label: "Report Contents", id: "rp-contents" },
    { label: "Delivery & Sharing", id: "rp-delivery" },
    { label: "Customization", id: "rp-customization" },
  ],
  "sharing": [
    { label: "Creating a Card", id: "sh-create" },
    { label: "Card Types", id: "sh-cards" },
    { label: "Social Features", id: "sh-social" },
    { label: "Privacy Controls", id: "sh-privacy" },
  ],
  "achievements": [
    { label: "Progress Tracking", id: "ach-progress" },
    { label: "Badge Categories", id: "ach-categories" },
    { label: "Sharing Badges", id: "ach-sharing" },
    { label: "Milestone Rewards", id: "ach-milestones" },
  ],
  "trade-coach": [
    { label: "Coaching Workflow", id: "tc-workflow" },
    { label: "Analysis Dimensions", id: "tc-analysis" },
    { label: "AI Integration", id: "tc-ai" },
    { label: "Best Practices", id: "tc-best" },
  ],
  "integrations": [
    { label: "Dhan Setup", id: "int-dhan" },
    { label: "Telegram Setup", id: "int-telegram" },
    { label: "Webhook & API", id: "int-webhook" },
    { label: "Data Sync", id: "int-sync" },
  ],
  "ai-integration": [
    { label: "Provider Setup", id: "ai-provider" },
    { label: "How It Works", id: "ai-how" },
    { label: "Credit Usage", id: "ai-credits" },
    { label: "Privacy", id: "ai-privacy" },
  ],
  "shortcuts": [
    { label: "Command Palette", id: "kb-palette" },
    { label: "Quick Actions", id: "kb-actions" },
    { label: "Navigation", id: "kb-nav" },
    { label: "Full Reference", id: "kb-reference" },
  ],
  "pwa": [
    { label: "Install on Phone", id: "pwa-install" },
    { label: "Offline Queue", id: "pwa-offline" },
    { label: "Mobile Navigation", id: "pwa-mobile" },
    { label: "PWA vs Native", id: "pwa-vs-native" },
  ],
  "settings": [
    { label: "Profile & Billing", id: "set-account" },
    { label: "Tags & Preferences", id: "set-tags" },
    { label: "Capital Management", id: "set-capital" },
    { label: "Security & Integrations", id: "set-security" },
  ],
  "faq": [
    { label: "Account & Billing", id: "faq-account" },
    { label: "Data & Privacy", id: "faq-data" },
    { label: "Integrations", id: "faq-integrations" },
    { label: "Features", id: "faq-features" },
  ],
  "changelog": [
    { label: "Latest Updates", id: "cl-updates" },
    { label: "Roadmap", id: "cl-roadmap" },
    { label: "Versioning", id: "cl-versioning" },
  ],
};

const FeatureList = React.forwardRef<HTMLUListElement, { items: string[] }>(({ items }, ref) => (
  <ul ref={ref} className="space-y-3 mt-4">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-3 docs-body leading-relaxed" style={{ color: 'hsl(var(--docs-text-primary))' }}>
        <ChevronRight className="w-3.5 h-3.5 mt-[5px] shrink-0" style={{ color: 'hsl(var(--docs-accent))' }} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
));
FeatureList.displayName = "FeatureList";

const FeatureCard = React.forwardRef<HTMLDivElement, {
  icon: React.ElementType; title: string; children: React.ReactNode; badge?: string;
}>(({ icon: Icon, title, children, badge }, ref) => (
  <div ref={ref} className="docs-feature-card group mt-6 overflow-hidden">
    <div className="px-6 pt-5 pb-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'hsl(var(--docs-accent-soft) / 0.1)' }}>
          <Icon className="w-4 h-4" style={{ color: 'hsl(var(--docs-accent))' }} />
        </div>
        <h4 className="docs-card-title">{title}</h4>
        {badge && (
          <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-md" style={{ background: 'hsl(var(--docs-accent-soft) / 0.1)', color: 'hsl(var(--docs-accent))' }}>
            {badge}
          </span>
        )}
      </div>
    </div>
    <div className="px-6 pb-6">
      <div className="docs-card-content">{children}</div>
    </div>
  </div>
));
FeatureCard.displayName = "FeatureCard";

const VideoPlaceholder = React.forwardRef<HTMLDivElement, { title: string; duration: string }>(
  ({ title, duration }, ref) => (
    <div ref={ref} className="my-6 docs-feature-card overflow-hidden group cursor-pointer">
      <div className="flex items-center gap-4 px-6 py-5">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors" style={{ background: 'hsl(var(--docs-accent-soft) / 0.1)', border: '1px solid hsl(var(--docs-accent-soft) / 0.15)' }}>
          <Play className="w-4 h-4 ml-0.5" style={{ color: 'hsl(var(--docs-accent))' }} />
        </div>
        <div>
          <p className="docs-card-title">{title}</p>
          <span className="docs-caption mt-1 block">{duration} · Coming Soon</span>
        </div>
      </div>
    </div>
  )
);
VideoPlaceholder.displayName = "VideoPlaceholder";

const SectionDivider = React.forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="docs-divider" />
));
SectionDivider.displayName = "SectionDivider";

const SectionHeader = React.forwardRef<HTMLDivElement, {
  id: string; title: string; description: string; icon: React.ElementType;
}>(({ id, title, description, icon: Icon }, ref) => {
  const copyLink = useCallback(() => {
    const url = `${window.location.origin}/docs#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      const el = document.getElementById(`copy-${id}`);
      if (el) { el.textContent = "Copied!"; setTimeout(() => { el.textContent = "#"; }, 1500); }
    });
  }, [id]);

  return (
    <div ref={ref} id={id} className="scroll-mt-24 mb-10 group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'hsl(var(--docs-accent-soft) / 0.1)' }}>
          <Icon className="w-5 h-5" style={{ color: 'hsl(var(--docs-accent))' }} />
        </div>
        <h2 className="docs-section-title">{title}</h2>
        <button
          onClick={copyLink}
          className="opacity-0 group-hover:opacity-100 hover:!opacity-100 focus:!opacity-100 p-1 rounded transition-all text-[13px] font-mono"
          style={{ color: 'hsl(var(--docs-text-muted))' }}
          aria-label={`Copy link to ${title}`}
          title="Copy section link"
        >
          <span id={`copy-${id}`}>#</span>
        </button>
      </div>
      <p className="docs-body-lg max-w-2xl lg:pl-[52px]" style={{ color: 'hsl(var(--docs-text-secondary))' }}>{description}</p>
    </div>
  );
});
SectionHeader.displayName = "SectionHeader";

const ShortcutKey = React.forwardRef<HTMLElement, { children: string }>(({ children }, ref) => (
  <kbd ref={ref} className="px-2.5 py-1 rounded-md text-[12px] font-mono font-semibold" style={{ background: 'hsl(var(--docs-elevated))', border: '1px solid hsl(var(--docs-border-subtle))', color: 'hsl(var(--docs-text-strong))' }}>
    {children}
  </kbd>
));
ShortcutKey.displayName = "ShortcutKey";

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

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredSections = sidebarSearch
    ? SECTIONS.filter((s) => s.label.toLowerCase().includes(sidebarSearch.toLowerCase()))
    : SECTIONS;

  return (
    <div className={cn("docs-page min-h-screen", isInsideApp && "pb-6", mode === "bw" && "docs-bw")} role="document">
      {/* Shared navbar */}
      <LandingNavbar activePage="docs" isInsideApp={isInsideApp} />

      {/* Docs Header */}
      <div className="pt-20" style={{ borderBottom: '1px solid hsl(var(--docs-border-subtle))' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex items-center gap-2 mb-2">
            <p className="docs-caption uppercase tracking-[0.1em]">TradeBook</p>
            <ChevronRight className="w-3 h-3" style={{ color: 'hsl(var(--docs-text-muted))' }} />
            <p className="docs-caption uppercase tracking-[0.1em]" style={{ color: 'hsl(var(--docs-text-secondary))' }}>Documentation</p>
          </div>
          <div className="flex items-center gap-4 mt-4 mb-4">
            <h1 className="docs-title">Documentation</h1>
            <button
              onClick={toggle}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                mode === "bw"
                  ? "text-background"
                  : ""
              )}
              style={{
                background: mode === "bw" ? 'hsl(var(--docs-text-strong))' : 'hsl(var(--docs-elevated))',
                border: `1px solid ${mode === "bw" ? 'hsl(var(--docs-text-strong))' : 'hsl(var(--docs-border-subtle))'}`,
                color: mode === "bw" ? 'hsl(var(--docs-bg))' : 'hsl(var(--docs-text-muted))',
              }}
            >
              <Palette className="w-3 h-3" />
              {mode === "bw" ? "B&W" : "Color"}
            </button>
          </div>
          <p className="docs-body-lg max-w-xl" style={{ color: 'hsl(var(--docs-text-secondary))' }}>
            Complete guide to every TradeBook feature — from trade logging to advanced analytics for Indian market traders.
          </p>
          <div className="flex items-center gap-3 mt-5 docs-caption flex-wrap">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> ~35 min read</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'hsl(var(--docs-text-muted) / 0.4)' }} />
            <span>Last updated: March 8, 2026</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'hsl(var(--docs-text-muted) / 0.4)' }} />
            <span>26 sections · 20+ interactive mockups</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto">
        <div className="flex">
          {/* Left Sidebar — desktop */}
          <TooltipProvider delayDuration={200}>
            <aside className={cn(
              "hidden lg:block shrink-0 transition-all duration-300",
              sidebarCollapsed ? "w-14" : "w-[250px]"
            )} style={{ borderRight: '1px solid hsl(var(--docs-border-subtle))' }}>
              <div className="sticky top-20 py-6 pr-5 pl-5">
                {/* Header with collapse toggle */}
                <div className={cn("flex items-center mb-5", sidebarCollapsed ? "justify-center" : "justify-between")}>
                  {!sidebarCollapsed && (
                    <p className="docs-caption uppercase tracking-[0.12em]">Navigation</p>
                  )}
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-md transition-colors"
                    style={{ color: 'hsl(var(--docs-text-muted))' }}
                    aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    {sidebarCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {/* Search filter */}
                {!sidebarCollapsed && (
                  <div className="mb-5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'hsl(var(--docs-text-muted))' }} />
                      <input
                        type="text"
                        value={sidebarSearch}
                        onChange={(e) => setSidebarSearch(e.target.value)}
                        placeholder="Search docs…"
                        className="w-full h-9 pl-9 pr-3 rounded-lg docs-sidebar-item focus:outline-none transition-all"
                        style={{
                          background: 'hsl(var(--docs-elevated))',
                          border: '1px solid hsl(var(--docs-border-subtle))',
                          color: 'hsl(var(--docs-text-primary))',
                        }}
                      />
                    </div>
                  </div>
                )}
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <nav>
                    {sidebarGroups.map((group, gi) => {
                      const groupSections = filteredSections.filter((s) => group.ids.includes(s.id));
                      if (groupSections.length === 0) return null;
                      return (
                      <div key={group.label}>
                         {gi > 0 && <div className="h-px my-3" style={{ background: 'hsl(var(--docs-border-subtle))' }} />}
                         {!sidebarCollapsed && (
                           <p className="text-[10px] font-bold uppercase tracking-[0.12em] px-3 pt-2 pb-2" style={{ color: 'hsl(var(--docs-text-muted))' }}>{group.label}</p>
                        )}
                        {groupSections.map((s) => {
                          const isActive = activeSection === s.id;
                          const btn = (
                             <button
                               key={s.id}
                               onClick={() => { scrollTo(s.id); setSidebarSearch(""); }}
                               className={cn(
                                 "docs-sidebar-link w-full flex items-center text-left relative docs-sidebar-item",
                                  sidebarCollapsed ? "justify-center p-2" : "gap-3 px-3 py-[8px]",
                                  isActive && "active"
                               )}
                             >
                               {isActive && !sidebarCollapsed && (
                                 <motion.div
                                   layoutId="docs-active-pill"
                                   className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                                   style={{ background: 'hsl(var(--docs-accent))' }}
                                   transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                 />
                               )}
                               <s.icon className={cn("w-4 h-4 shrink-0")} style={{ color: isActive ? 'hsl(var(--docs-accent))' : 'hsl(var(--docs-text-muted))' }} />
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
          <nav className="lg:hidden fixed top-14 left-0 right-0 z-40 backdrop-blur-xl" style={{ background: 'hsl(var(--docs-bg) / 0.95)', borderBottom: '1px solid hsl(var(--docs-border-subtle))' }} aria-label="Section navigation">
            <div className="relative">
              {/* Fade edges */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10" style={{ background: 'linear-gradient(to right, hsl(var(--docs-bg) / 0.95), transparent)' }} />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10" style={{ background: 'linear-gradient(to left, hsl(var(--docs-bg) / 0.95), transparent)' }} />
              <div
                className="flex gap-1 overflow-x-auto overscroll-x-contain px-4 py-2.5 no-scrollbar"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {SECTIONS.map((s) => {
                  const isActive = activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={cn(
                        "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-[12px]",
                        isActive ? "font-semibold" : ""
                      )}
                      style={{
                        background: isActive ? 'hsl(var(--docs-accent-soft) / 0.14)' : 'transparent',
                        color: isActive ? 'hsl(0 0% 100%)' : 'hsl(var(--docs-text-muted))',
                      }}
                    >
                      <s.icon className="w-3 h-3 shrink-0" />
                      {s.label}
                    </button>
                  );
                })}
                {/* Spacer so last item isn't clipped by fade */}
                <div className="shrink-0 w-4" aria-hidden="true" />
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 min-w-0 max-w-[760px] px-4 sm:px-6 lg:px-14 py-8 lg:py-14 space-y-16 pt-[7.5rem] lg:pt-12">

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
              <div className="space-y-5 mt-2">
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
                <p>Press <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border text-[12px] font-mono font-semibold">⌘K</kbd> anywhere to open the Command Palette — search trades, create alerts, and navigate instantly without touching the mouse.</p>
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
              <QuickNav items={[
                { label: "Creating Trades", id: "tm-creating" },
                { label: "Trade Lifecycle", id: "tm-lifecycle" },
                { label: "Risk Management", id: "tm-risk" },
                { label: "Post-Trade Review", id: "tm-review" },
                { label: "Sharing & Discipline", id: "tm-sharing" },
                { label: "Quick Actions", id: "tm-quick" },
              ]} />
              <ProTip>
                <p>Always set your stop loss before submitting a trade. TradeBook calculates your risk-to-reward ratio automatically — trades with R:R below 1:2 are flagged in your analytics.</p>
              </ProTip>

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
              <div className="space-y-5">
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
                <p>The Smart Alert engine works by analyzing your closed trade history through the <code>suggest-alerts</code> backend function:</p>
                <FeatureList items={[
                  "Identifies your top 5 most-traded symbols by frequency.",
                  "For each symbol, it analyzes your average entry/exit prices, win rate, and recent price action.",
                  "Generates contextual suggestions — e.g., 'Set alert at ₹2,450 (your average entry for RELIANCE, currently 3.2% below)'.",
                  "Each suggestion includes AI-generated reasoning explaining why this alert level matters for your trading style.",
                  "One-click creation converts the suggestion into a fully configured alert with sensible defaults.",
                ]} />
                <CodeBlock tabs={[{
                  label: "Example Response",
                  language: "JSON",
                  code: `{
  "suggestions": [
    {
      "symbol": "RELIANCE",
      "price": 2450.00,
      "condition": "crosses_above",
      "reasoning": "Your avg entry is ₹2,448. Price is 3.2% below — good re-entry zone.",
      "confidence": 0.85
    }
  ]
}`
                }]} title="suggest-alerts" />
                <p className="text-[12px] text-muted-foreground/55 mt-3">You need at least 10 closed trades before suggestions appear. The more trades you log, the more personalized the recommendations become.</p>
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
              <QuickNav items={[
                { label: "Publishing a Study", id: "st-publish" },
                { label: "Study Workflow", id: "st-workflow" },
                { label: "Pattern Tagging", id: "st-patterns" },
                { label: "Research Tools", id: "st-tools" },
                { label: "Linking to Trades", id: "st-linking" },
              ]} />
              <ProTip>
                <p>Link your studies to trades when you execute them. This builds a powerful feedback loop — you can see which of your research ideas actually led to profitable trades.</p>
              </ProTip>

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
              <div className="space-y-5">
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
              <div className="space-y-5">
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
              <div className="space-y-5">
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
              <div className="space-y-5">
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
              <div className="space-y-5">
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

              <div className="space-y-5 mt-6">
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

              <div className="space-y-5 mt-6">
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

              <div className="mt-5">
                <StockPopupMockup />
              </div>

              <SubTopic title="Data-Rich Results" description="Sort, filter, and explore screening results with sparklines and inline search." id="sc-results" />
              <div className="space-y-5 mt-6">
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
              <QuickNav items={[
                { label: "Generating Reports", id: "rp-generate" },
                { label: "Report Contents", id: "rp-contents" },
                { label: "Insights & Actions", id: "rp-insights" },
                { label: "Delivery Options", id: "rp-delivery" },
              ]} />

              <ProTip variant="best-practice">
                <p>Read your weekly report <strong>before Monday's first trade</strong>. Knowing last week's best setups, worst mistakes, and segment performance gives you a focused plan instead of trading blindly into the new week.</p>
              </ProTip>

              <InteractiveMockup label="Weekly Report Preview">
                <WeeklyReportMockup />
              </InteractiveMockup>

              <SubTopic title="Generating and Reviewing Your Weekly Report" description="A step-by-step guide to getting the most from your weekly summary." id="rp-generate" />
              <StepByStep title="Generating and Reviewing Your Weekly Report" steps={[
                { title: "Reports generate automatically every Monday", description: "At 6:00 AM IST every Monday, a new report is generated covering the previous Monday–Friday trading week. No action needed — it's waiting for you.", detail: "You can also manually generate a report anytime from the Reports page if you want a mid-week check-in." },
                { title: "Review segment-by-segment P&L", description: "Start with the segment breakdown — Equity Intraday, Positional, Futures, Options, Commodities. See which segments made money and which didn't.", detail: "If one segment is consistently negative, consider reducing position sizes there or pausing it until you fix the underlying issue." },
                { title: "Check your best and worst trades", description: "The report highlights your single best and worst trades of the week. These extremes often reveal important lessons about position sizing and setup quality.", detail: "Ask yourself: was the best trade skill or luck? Was the worst trade avoidable or just a normal stop-out?" },
                { title: "Review top setups and common mistakes", description: "See which setup tags produced the most profit and which mistake tags cost you the most. This is your actionable feedback loop.", detail: "Your top 2 setups should get more of your capital allocation next week. Your top 2 mistakes should become focus areas." },
                { title: "Set 1-2 goals for the coming week", description: "Based on the report insights, pick one setup to focus on and one mistake to avoid. Write these in Monday's pre-market journal entry.", detail: "Specific goals like 'Only take Breakout setups in first hour' outperform vague goals like 'Trade better'." },
              ]} />

              <SubTopic title="Report Contents" description="What's included in every weekly report." id="rp-contents" />
              <FeatureCard icon={FileText} title="Report Structure" badge="Pro">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Performance Metrics</h4>
                    <FeatureList items={[
                      "Total P&L for the week — realized across all segments",
                      "Win rate and total trade count per segment",
                      "Average gain on winning trades vs average loss on losers",
                      "Best trade P&L and worst trade P&L with symbols",
                    ]} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Segment Breakdown</h4>
                    <FeatureList items={[
                      "Equity Intraday — day trades closed same session",
                      "Equity Positional — swing trades held overnight",
                      "Futures — index and stock futures",
                      "Options — all options strategies",
                      "Commodities — MCX trades if applicable",
                    ]} />
                  </div>
                </div>
              </FeatureCard>

              <SubTopic title="Insights & Action Items" description="Actionable takeaways extracted from your weekly data." id="rp-insights" />
              <FeatureCard icon={Sparkles} title="Report Insights & Action Items" badge="Pro">
                <p className="text-sm text-muted-foreground mb-3">Each report surfaces actionable insights beyond raw numbers:</p>
                <FeatureList items={[
                  "Top performing setups — which pattern/setup tags generated the most profit this week",
                  "Most common mistakes — recurring mistake tags with loss attribution",
                  "Win rate trend — comparison with your 4-week rolling average",
                  "Segment concentration — warnings if you're over-allocated to one segment",
                  "Improvement suggestions — based on week-over-week metric changes",
                ]} />
              </FeatureCard>

              <SubTopic title="Delivery Options" description="How and where your reports are delivered." id="rp-delivery" />
              <ExpandableDetail title="Customizing Report Delivery" icon={Bell} badge="Setup Guide">
                <p>Weekly reports can be delivered through multiple channels so you never miss your weekly review:</p>
                <FeatureList items={[
                  "In-App — Reports are always available on the Reports page. Navigate there anytime to see current and past weekly reports.",
                  "Telegram — If you've configured Telegram integration (Settings → Telegram), reports are automatically sent to your linked Telegram chat or channel every Monday at 6 AM IST. Great for reviewing on mobile before market opens.",
                  "PDF Download — Click the download button on any report to save it as a PDF. Useful for maintaining offline records or sharing with a mentor.",
                  "Manual Generation — Don't want to wait until Monday? Generate a report for any completed week from the Reports page. Useful for mid-week check-ins during volatile markets.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">Telegram delivery requires a verified Telegram bot connection. See the Integrations section for setup instructions. Reports cover Monday–Friday of the selected week and require at least 1 closed trade to generate.</p>
              </ExpandableDetail>
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
              <QuickNav items={[
                { label: "Creating a Card", id: "sh-create" },
                { label: "Card Types", id: "sh-cards" },
                { label: "Formats & Sizes", id: "sh-formats" },
                { label: "Streaks", id: "sh-streaks" },
                { label: "Templates", id: "sh-templates" },
              ]} />

              <InteractiveMockup label="Share Card Examples">
                <ShareCardsMockup />
              </InteractiveMockup>

              <SubTopic title="Creating Your First Card" description="A quick walkthrough from trade to shareable image." id="sh-create" />
              <StepByStep title="Creating and Sharing Your First P&L Card" steps={[
                { title: "Open the Share modal", description: "From the Dashboard, click the Share P&L button. You can also share from the Journal, Reports page, or any Trade Detail modal.", detail: "P&L cards summarize your performance over a period. Trade cards share a single trade's result." },
                { title: "Choose your card type", description: "Select P&L Summary, Individual Trade, or Streak card depending on what you want to share.", detail: "P&L cards show aggregate stats (win rate, trade count, total P&L). Trade cards show entry/exit details, R:R ratio, and holding duration." },
                { title: "Pick a template and format", description: "Choose from Dark Premium, Light Clean, or Gradient template. Then select your size: Square (1080×1080), Story (1080×1920), or Twitter (1200×675).", detail: "The live preview updates instantly as you switch templates and sizes so you can see exactly what you'll share." },
                { title: "Add your custom branding", description: "Upload your own logo to replace the default TradeBook watermark. Logos are saved to localStorage for future use.", detail: "This is great for traders who run public channels or communities — your cards carry your brand." },
                { title: "Download and share", description: "Click Download to save as a high-resolution PNG. Share it on Twitter, Instagram, Telegram, or wherever your trading community lives.", detail: "Cards are rendered using html-to-image for pixel-perfect output at the exact resolution of your chosen format." },
              ]} />

              <SubTopic title="Card Types" description="Three types of share cards for different occasions." id="sh-cards" />
              <div className="space-y-5">
                <FeatureCard icon={Share2} title="P&L Share Cards">
                  <p className="text-sm text-muted-foreground mb-3">Generate visual P&L summaries to share on social media:</p>
                  <FeatureList items={[
                    "Daily, weekly, or monthly P&L snapshots",
                    "Includes win rate, trade count, and streak data",
                    "Multiple card templates with different styles",
                    "Download as high-resolution PNG image",
                    "Custom logo upload for personal branding",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={TrendingUp} title="Trade Share Cards">
                  <p className="text-sm text-muted-foreground mb-3">Share individual closed trade results with high-density details:</p>
                  <FeatureList items={[
                    "Entry/exit prices, P&L, and return %",
                    "Timeline, holding duration, and R:R ratio",
                    "Targets hit and setup tags displayed on card",
                    "Qualitative review notes included if available",
                    "Privacy-safe — no account details shared",
                  ]} />
                </FeatureCard>
              </div>

              <SubTopic title="Formats & Sizes" description="Three output sizes optimized for different platforms." id="sh-formats" />
              <FeatureCard icon={Grid3X3} title="Output Formats">
                <p className="text-sm text-muted-foreground mb-3">Each card can be generated in three sizes with live preview scaling:</p>
                <FeatureList items={[
                  "Square (1080×1080) — ideal for Instagram posts and general social media",
                  "Story (1080×1920) — optimized for Instagram Stories, WhatsApp Status, and Telegram",
                  "Twitter (1200×675) — matches Twitter's recommended image dimensions for maximum display",
                ]} />
              </FeatureCard>

              <SubTopic title="Streak Celebrations" description="Visual streak cards to share your winning momentum." id="sh-streaks" />
              <InteractiveMockup label="Streak Share Card">
                <StreakShareMockup />
              </InteractiveMockup>
              <FeatureCard icon={Award} title="Streak Share Cards" badge="New">
                <p className="text-sm text-muted-foreground mb-3">Celebrate your winning streaks (2+ consecutive wins) with visual share cards:</p>
                <FeatureList items={[
                  "Consecutive winning day counter with fire emoji",
                  "Day-by-day breakdown of the streak period",
                  "Share directly from the Dashboard streak widget",
                  "Branded card with custom logo or TradeBook watermark",
                ]} />
              </FeatureCard>

              <SubTopic title="Template Gallery" description="Choosing the right visual style for your audience." id="sh-templates" />
              <ExpandableDetail title="Template Gallery — Which Template for What" icon={Share2} badge="Style Guide">
                <p>Three templates are available, each designed for a different context and audience:</p>
                <FeatureList items={[
                  "Dark Premium — Rich dark background with subtle gradients. Best for: Twitter/X posts, trading communities, and professional channels. Looks sharp on dark-mode feeds and conveys a serious, institutional aesthetic.",
                  "Light Clean — Minimal white background with clean typography. Best for: LinkedIn, WhatsApp shares, and printing. High contrast makes numbers easy to read even on small screens or when forwarded.",
                  "Gradient — Bold color gradients with modern styling. Best for: Instagram posts and stories, Telegram channels. Eye-catching in busy social feeds and works well with the Story (1080×1920) format.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">All three templates support custom logo uploads. Your logo replaces the default TradeBook watermark in the card footer. Upload once and it's saved for all future cards. For best results, use a transparent PNG logo under 500KB.</p>
              </ExpandableDetail>

              <ProTip>
                <p>Sharing your wins publicly creates accountability. Traders who share their journal consistently show 15% higher discipline scores in our data. The share triggers are placed on Dashboard, Journal, Reports, and Trade Detail modals — so you're always one click away.</p>
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
              <QuickNav items={[
                { label: "Progress Tracking", id: "ach-progress" },
                { label: "Badge Categories", id: "ach-categories" },
                { label: "Full Catalog", id: "ach-catalog" },
              ]} />

              <InteractiveMockup label="Achievement Badges Grid">
                <AchievementsMockup />
              </InteractiveMockup>

              <SubTopic title="Tracking Your Progress" description="How to monitor your journey toward unlocking badges." id="ach-progress" />
              <StepByStep title="Tracking Your Progress Toward Badges" steps={[
                { title: "Check your Dashboard badges widget", description: "The Achievements grid on your Dashboard shows all badges with progress bars. Badges closest to unlocking are highlighted.", detail: "Each badge displays a percentage — e.g., '35/50 trades' for the 50-trade milestone badge." },
                { title: "Keep trading and journaling consistently", description: "Most badges track activity you're already doing — logging trades, setting stop losses, writing journal entries. No extra effort needed.", detail: "Streak badges require consecutive days, so consistency matters more than volume. Missing one day resets the counter." },
                { title: "Watch for unlock notifications", description: "When you hit a threshold, a real-time toast notification celebrates the unlock with an animation. The badge timestamp is recorded permanently.", detail: "Unlocked badges are visible on your profile and can be shared via social cards." },
                { title: "Review progress periodically", description: "Check which badges you're close to earning and set mini-goals. 'Just 5 more trades for the 100-trade milestone' keeps you motivated.", detail: "Some badges unlock at surprising times — the discipline badges reward process adherence, not just trading volume." },
              ]} />

              <SubTopic title="Badge Categories" description="Four achievement groups covering milestones, streaks, profit, and discipline." id="ach-categories" />
              <div className="space-y-5">
                <FeatureCard icon={Trophy} title="Milestones & Streaks">
                  <p className="text-sm text-muted-foreground mb-3">Track your trading volume and consistency:</p>
                  <FeatureList items={[
                    "Milestones — trade count targets (1, 10, 50, 100, 500 trades)",
                    "Streaks — consecutive profitable days (3, 5, 7, 14, 30 days)",
                    "Progress bars update in real-time as you log trades",
                  ]} />
                </FeatureCard>
                <FeatureCard icon={Award} title="Profit & Discipline">
                  <p className="text-sm text-muted-foreground mb-3">Reward good habits and consistent execution:</p>
                  <FeatureList items={[
                    "Profit — cumulative P&L targets and win rate milestones",
                    "Discipline — following rules, setting SL, using templates, journaling",
                    "Process badges reward how you trade, not just outcomes",
                  ]} />
                </FeatureCard>
              </div>

              <ExpandableDetail title="How Achievements Are Tracked" icon={Target} defaultOpen>
                <p className="text-[13px] text-muted-foreground mb-2">Achievements are tracked automatically as you use TradeBook. Each badge has a threshold (e.g., "Log 50 trades") and your progress is updated in real-time. When you reach the threshold, the badge unlocks with a celebration animation and a toast notification.</p>
                <p className="text-[13px] text-muted-foreground">View your progress in the Dashboard achievements widget. Unlocked badges show a timestamp of when they were earned.</p>
              </ExpandableDetail>

              <SubTopic title="Full Badge Catalog" description="Every available badge and what it takes to unlock it." id="ach-catalog" />
              <ExpandableDetail title="Full Badge Catalog — All 16 Badges" icon={Trophy} badge="Reference">
                <p>Here's every badge available in TradeBook, organized by category:</p>
                <h4 className="text-xs font-semibold mt-4 mb-1.5 text-foreground/80">Milestones</h4>
                <FeatureList items={[
                  "First Trade — Log your very first trade. Welcome to the journey.",
                  "10 Trades — Complete 10 closed trades. You're building a habit.",
                  "50 Trades — 50 closed trades logged. Serious commitment showing.",
                  "Century — 100 closed trades. You now have statistically meaningful data.",
                  "500 Club — 500 closed trades. Veteran trader status unlocked.",
                ]} />
                <h4 className="text-xs font-semibold mt-4 mb-1.5 text-foreground/80">Streaks</h4>
                <FeatureList items={[
                  "Hot Streak (3 Days) — 3 consecutive profitable trading days.",
                  "On Fire (7 Days) — 7 consecutive profitable trading days.",
                  "Unstoppable (14 Days) — 14 consecutive profitable days. Elite consistency.",
                  "Iron Discipline (30 Days) — 30 consecutive profitable days. Legendary.",
                ]} />
                <h4 className="text-xs font-semibold mt-4 mb-1.5 text-foreground/80">Profit</h4>
                <FeatureList items={[
                  "First Green — Your first profitable trade. The seed is planted.",
                  "5-Figure Club — Cumulative P&L crosses ₹10,000.",
                  "Consistent Winner — Maintain a 60%+ win rate over 50+ trades.",
                ]} />
                <h4 className="text-xs font-semibold mt-4 mb-1.5 text-foreground/80">Discipline</h4>
                <FeatureList items={[
                  "Rule Follower — Use the trading rules checklist on 10 trades.",
                  "Journal Keeper — Write daily journal entries for 7 consecutive trading days.",
                  "Risk Manager — Set stop-loss on 20 consecutive trades.",
                  "Analyst — Generate and review 4 weekly reports.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">Badge thresholds are designed to be achievable with consistent effort over weeks, not days. The system rewards sustained good habits rather than one-time heroics.</p>
              </ExpandableDetail>

              <ProTip variant="info">
                <p>Check the Achievements grid on your Dashboard to see which badges you're closest to earning. Focus on discipline badges first — they reinforce good trading habits that compound over time.</p>
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
              <QuickNav items={[
                { label: "Coaching Workflow", id: "tc-workflow" },
                { label: "Analysis Dimensions", id: "tc-analysis" },
                { label: "How It Evaluates", id: "tc-model" },
              ]} />

              <InteractiveMockup label="AI Trade Coach Feedback">
                <TradeCoachMockup />
              </InteractiveMockup>

              <SubTopic title="Coaching Workflow" description="Automatic 4-step analysis triggered after every closed trade." id="tc-workflow" />
              <StepByStep title="How the AI Trade Coach Works" steps={[
                { title: "Close a trade", description: "When you close or exit a trade, the AI Coach is automatically triggered. You can also enable auto-review in trade settings so every close gets analyzed.", detail: "Manual triggering is also available from the Trade Detail modal — useful for re-reviewing older trades." },
                { title: "AI analyzes your trade", description: "The coach examines entry timing, stop loss placement, exit strategy, risk management, and emotional context using the Gemini model.", detail: "The more data your trade has (notes, targets, stop loss, emotion tag), the more specific the feedback will be." },
                { title: "Get structured feedback", description: "Receive markdown-formatted feedback organized into 'What Went Well', 'Room for Improvement', and an overall rating (1-5 stars).", detail: "Feedback is actionable — not just 'good trade' but specific observations like 'SL was 3% away, consider tightening to 1.5% for this setup type.'" },
                { title: "Feedback is saved on the trade", description: "All coaching feedback is cached on the trade record in the database. Review it anytime from the Trade Detail modal.", detail: "Feedback persists permanently. Over time, you build a library of AI-reviewed trades you can search and learn from." },
              ]} />

              <SubTopic title="Analysis Dimensions" description="Six areas the AI evaluates on every trade." id="tc-analysis" />
              <FeatureCard icon={Zap} title="What the Coach Analyzes" badge="Pro">
                <p className="text-sm text-muted-foreground mb-3">The AI coach evaluates each trade across six dimensions:</p>
                <FeatureList items={[
                  "Entry timing — was the entry at an optimal price level given the setup?",
                  "Stop loss placement — was the SL too tight (stopped out prematurely) or too wide (excessive risk)?",
                  "Exit strategy — did you take profits too early or hold too long past optimal exit?",
                  "Risk management — was the position size appropriate relative to your capital and the setup's risk?",
                  "Pattern recognition — was the trade consistent with your historically best-performing setups?",
                  "Emotional assessment — signs of FOMO, revenge trading, or overconfidence based on trade context and emotion tags",
                ]} />
              </FeatureCard>

              <ProTip variant="info">
                <p>The coach's feedback quality improves with more trade context. If you add <strong>notes, screenshots, or update your emotion tag</strong> after the initial review, click <strong>Regenerate Feedback</strong> in the Trade Detail modal to get a richer, more specific analysis.</p>
              </ProTip>

              <SubTopic title="How the AI Model Evaluates" description="Transparency into what the AI considers and how it forms its assessment." id="tc-model" />
              <ExpandableDetail title="How the AI Model Evaluates Your Trade" icon={Sparkles} badge="Deep Dive">
                <p>The AI Trade Coach uses Google's Gemini model via a dedicated backend function. Here's exactly what it considers and how it forms its assessment:</p>
                <FeatureList items={[
                  "Trade data — entry price, exit price, quantity, P&L, P&L%, segment, timeframe, and holding duration are all sent to the model as structured context.",
                  "Risk parameters — stop loss level, targets (and which were hit), trailing SL settings, and the calculated risk-to-reward ratio.",
                  "Qualitative context — your trade notes, emotion tag (if set), and any review notes you've written are included as free-text context.",
                  "Historical patterns — the model doesn't access your full trade history, but it evaluates the current trade against general best practices for the segment and timeframe.",
                  "Output format — the model returns structured markdown with specific sections: strengths, improvement areas, and an overall 1-5 rating. This is rendered directly in the Trade Detail modal.",
                  "Caching — feedback is stored in the trade record's coaching_feedback field. It's generated once and cached permanently unless you explicitly regenerate it.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">The AI coach is a behavioral tool, not financial advice. It evaluates your execution against your own parameters (your SL, your targets, your plan) rather than making market predictions. Think of it as a structured self-review assistant that catches things you might overlook in the moment.</p>
              </ExpandableDetail>

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
              <QuickNav items={[
                { label: "Dhan Setup", id: "int-dhan" },
                { label: "Telegram Setup", id: "int-telegram" },
                { label: "Troubleshooting", id: "int-troubleshoot" },
              ]} />

              <ProTip variant="warning">
                <p>Never share your API keys or access tokens publicly. TradeBook stores all credentials securely server-side — they are <strong>never exposed to the browser</strong> and cannot be read back from the client. Treat your Dhan API key and Telegram bot token like passwords.</p>
              </ProTip>

              <InteractiveMockup label="Integration Overview">
                <div className="grid md:grid-cols-2 gap-6">
                  <DhanFlowDiagram />
                  <TelegramChannelsMockup />
                </div>
              </InteractiveMockup>

              <SubTopic title="Connecting Your Dhan Account" description="Link your Dhan broker for live prices, portfolio sync, and execution." id="int-dhan" />
              <StepByStep title="Connecting Your Dhan Account" steps={[
                { title: "Get your Dhan API credentials", description: "Log in to your Dhan dashboard and navigate to the API section. You'll need your API Key and API Secret for the OAuth flow.", detail: "Dhan offers two auth methods: a manual 24-hour Access Token (quick but expires daily) and a 12-month API Key + Secret OAuth flow (recommended for long-term use)." },
                { title: "Enter credentials in TradeBook", description: "Go to Settings → Integrations → Dhan. Paste your API Key and Secret, then click Connect. TradeBook initiates the OAuth handshake.", detail: "The OAuth process opens a Dhan authorization window. Approve the connection and you'll be redirected back to TradeBook automatically." },
                { title: "Activate Data API plan on Dhan", description: "Important: live prices require an active 'Data API' plan on Dhan's dashboard. Without it, you'll see API Error 806 (Data APIs not Subscribed).", detail: "This is a separate step from API Key creation. Go to Dhan Dashboard → API → Data API and activate the plan. It may be free or paid depending on your Dhan account type." },
                { title: "Verify the connection", description: "Once connected, TradeBook shows a green 'Verified' status with the verification timestamp. Portfolio sync begins automatically.", detail: "Positions sync every 5 minutes during market hours (Mon–Fri, 9:15 AM – 3:30 PM IST). Live prices update for all open positions." },
                { title: "Enable auto-sync (optional)", description: "Toggle 'Auto Sync Portfolio' in Dhan settings to automatically import executed orders and calculate P&L for closed positions.", detail: "Multiple API keys are supported with priority-based failover. If one key expires, the system falls back to the next active key." },
              ]} />

              <FeatureCard icon={LineChart} title="Dhan Broker Integration">
                <p className="text-sm text-muted-foreground mb-3">Full-featured broker connection for seamless trading:</p>
                <FeatureList items={[
                  "OAuth-based secure authentication with 12-month token validity",
                  "Auto-sync portfolio positions every 5 minutes during market hours",
                  "Live LTP (Last Traded Price) for all open positions and watchlist items",
                  "One-click trade execution from TradeBook",
                  "Real-time P&L tracking with live prices",
                  "Instrument master data sync for accurate symbol search",
                  "Multiple API keys with priority-based failover",
                ]} />
                <div className="mt-4"><DhanIntegrationDetailMockup /></div>
              </FeatureCard>

              <SubTopic title="Setting Up Telegram Notifications" description="Get instant trade alerts, reports, and updates on your phone." id="int-telegram" />
              <StepByStep title="Setting Up Telegram Notifications" steps={[
                { title: "Create a Telegram bot via @BotFather", description: "Open Telegram, search for @BotFather, and send /newbot. Follow the prompts to name your bot and get your bot token.", detail: "The bot token looks like '123456789:ABCdefGHIjklMNOpqrsTUVwxyz'. Keep it private — anyone with this token can control your bot." },
                { title: "Enter the bot token in TradeBook", description: "Go to Settings → Integrations → Telegram. Paste your bot token. TradeBook validates it via the Telegram getMe API and auto-populates the bot username.", detail: "If validation fails, double-check the token for extra spaces or missing characters." },
                { title: "Add a chat destination", description: "Click 'Add Chat' and enter your Telegram chat ID. This can be your personal chat, a group, or a channel. Chat type is auto-detected from the ID prefix.", detail: "Personal chats have positive IDs. Groups and channels start with '-100'. You must /start the bot in the chat before it can send messages." },
                { title: "Configure routing rules", description: "For each chat destination, select which segments (Equity, Options, Futures, etc.) and notification types (Trades, Alerts, Studies, Daily Reports) should be routed there.", detail: "Example: Route Options alerts to a dedicated 'F&O Alerts' channel, and send daily P&L reports to your personal chat." },
                { title: "Test and verify", description: "Click 'Send Test Message' to verify delivery. The chat shows a green health indicator when verified. All deliveries are logged for troubleshooting.", detail: "If the test fails with 'chat not found', ensure you've sent /start to the bot in that specific chat or channel." },
              ]} />

              <FeatureCard icon={Send} title="Telegram Integration">
                <p className="text-sm text-muted-foreground mb-3">Rich notification system with granular routing:</p>
                <FeatureList items={[
                  "Alert triggers — instant notification when price conditions are met",
                  "EOD (End of Day) reports — daily P&L summary after market close",
                  "Morning briefings — pre-market overview of your open positions",
                  "Weekly reports — full performance summary every Monday",
                  "TSL updates — trailing stop loss movement notifications",
                  "Multiple chat destinations with segment-level and type-level routing",
                  "Manual sends from Trade Detail modal — Full Card, P&L Snapshot, or Custom Notes",
                ]} />
                <div className="mt-4"><TelegramIntegrationDetailMockup /></div>
              </FeatureCard>

              <CodeBlock tabs={[
                { label: "Bot Token", language: "Text", code: "123456789:ABCdefGHIjklMNOpqrsTUVwxyz" },
                { label: "Chat IDs", language: "Text", code: "Personal chat:  123456789\nGroup chat:    -1001234567890\nChannel:       -1001234567890" },
              ]} title="Telegram Credentials Format" />

              <SubTopic title="Troubleshooting" description="Common connection issues and how to resolve them." id="int-troubleshoot" />
              <ExpandableDetail title="Troubleshooting Dhan Connection Issues" icon={AlertTriangle} badge="Help">
                <p>Common issues when connecting or using the Dhan integration, and how to fix them:</p>
                <FeatureList items={[
                  "API Error 806 (Data APIs not Subscribed) — You need to activate the 'Data API' plan on Dhan's dashboard separately. This is not the same as creating an API key. Go to Dhan Dashboard → API → Data API.",
                  "Token Expired — Manual access tokens expire every 24 hours. Switch to the API Key + Secret OAuth flow for 12-month validity. TradeBook shows expiry warnings in advance.",
                  "Prices showing ₹0 or not updating — The system only updates prices when valid data (> 0) is returned. Check that your Data API plan is active and market hours apply (Mon–Fri, 9:15 AM – 3:30 PM IST).",
                  "OAuth callback not completing — The OAuth flow uses a popup window. Ensure your browser isn't blocking popups from TradeBook. Try disabling ad blockers temporarily.",
                  "Portfolio not syncing — Auto-sync only runs during market hours. Outside market hours, positions reflect the last known state. You can manually trigger a sync from Settings.",
                  "Multiple key failover — If your primary key fails, TradeBook automatically falls back to the next active key by priority. Check Settings → Dhan to see which key is currently active.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">If issues persist after checking the above, try disconnecting and reconnecting your Dhan account. This refreshes the OAuth tokens and re-validates all credentials.</p>
              </ExpandableDetail>
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

              <QuickNav items={[
                { label: "Provider Setup", id: "ai-provider" },
                { label: "How It Works", id: "ai-how" },
                { label: "Credit Usage", id: "ai-credits" },
                { label: "Privacy", id: "ai-privacy" },
              ]} />

              <AIApiSetupMockup />

              <SubTopic title="Choose & Configure Your AI Provider" description="Pick a provider, generate an API key, and connect it to TradeBook in under 2 minutes." id="ai-provider" />

              <StepByStep title="Configuring Your AI Provider" steps={[
                { title: "Open Settings → Integrations → AI Trade Insights", description: "Navigate to the AI configuration panel inside your Settings page." },
                { title: "Select your provider", description: "Choose between Google Gemini (recommended, free) or OpenAI. Both deliver high-quality trade analysis.", detail: "Gemini is strongly recommended — it offers a generous free tier that covers most traders' usage." },
                { title: "Generate your API key", description: "For Gemini: visit aistudio.google.com/app/apikey and click 'Create API Key'. For OpenAI: visit platform.openai.com/api-keys.", detail: "Gemini keys are instant and free. OpenAI requires adding billing credits first." },
                { title: "Paste the key and save", description: "Copy the API key and paste it into the field in TradeBook. Click Save — the key is encrypted and stored securely server-side." },
                { title: "Test the connection", description: "Close a trade or navigate to the AI Insights panel. If the key is valid, you'll see AI-generated analysis within seconds.", detail: "If something goes wrong, check the key is correct and hasn't expired." },
              ]} />

              <ProTip variant="tip">
                <p><strong>Which provider should you choose?</strong> For most traders, <strong>Google Gemini</strong> is the best option — it's completely free (15 req/min, 1M tokens/day) and delivers excellent trade analysis. Choose <strong>OpenAI</strong> if you already have an OpenAI account with credits and prefer GPT-style responses. Both providers analyse the same aggregated trade data, so the quality difference is minimal.</p>
              </ProTip>

              <AIProviderComparisonMockup />

              <div className="space-y-5 mt-6">
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

              <SubTopic title="How AI Analysis Works" description="What data is sent, how it's processed, and what you get back." id="ai-how" />

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
                    <div id="ai-privacy">
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

              <ExpandableDetail title="Understanding AI Credit Usage" icon={Sparkles} badge="BYOK">
                <p>TradeBook uses a <strong>Bring Your Own Key (BYOK)</strong> model. You provide your own API key from Google or OpenAI, and all AI costs are billed directly to your provider account — TradeBook never charges for AI usage.</p>
                <p className="mt-3"><strong>How token usage works:</strong></p>
                <ul className="mt-2 space-y-1.5 text-[13px] text-muted-foreground/80">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Each trade analysis uses approximately <strong>2,000 tokens</strong> (input + output combined)</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Google Gemini free tier: <strong>1,000,000 tokens/day</strong> — enough for ~500 analyses daily</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> OpenAI GPT-4o Mini: approximately <strong>₹1–2 per analysis</strong> (varies by response length)</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Only aggregated statistics are sent — not your full trade history or personal data</li>
                </ul>
                <p className="mt-3 text-[12px] text-muted-foreground/60 italic">Tip: If you're on Gemini's free tier and hit the 15 requests/minute limit, just wait a minute. For most traders, this limit is never reached during normal usage.</p>

                <CodeBlock tabs={[
                  { label: "Gemini", language: "Shell", code: "# Get your free API key from:\n# https://aistudio.google.com/app/apikey\n\nAPI_KEY=AIzaSy...your-key-here\n\n# Free tier limits:\n#   15 requests / minute\n#   1,000,000 tokens / day\n#   ~500 trade analyses / day" },
                  { label: "OpenAI", language: "Shell", code: "# Get your API key from:\n# https://platform.openai.com/api-keys\n\nAPI_KEY=sk-...your-key-here\n\n# Pricing (GPT-4o Mini):\n#   ~₹1-2 per trade analysis\n#   Requires billing credits" },
                ]} title="API Key Reference" />

                <OutputBlock label="Example AI Coach Response">{"## Trade Analysis: RELIANCE (Long)\n\n### ✅ What Went Well\n- Entry at ₹2,450 aligned with your historical avg entry\n- Stop loss at ₹2,410 (1.6%) — well-placed below support\n\n### ⚠️ Room for Improvement\n- Exit at ₹2,498 captured only 40% of the move\n- Consider trailing SL to lock in more upside\n\n### Rating: ★★★★☆ (4/5)"}</OutputBlock>
              </ExpandableDetail>

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
              <QuickNav items={[
                { label: "Command Palette", id: "kb-palette" },
                { label: "Quick Actions", id: "kb-actions" },
                { label: "Navigation", id: "kb-nav" },
                { label: "Full Reference", id: "kb-reference" },
              ]} />

              <ProTip variant="best-practice">
                <p>Don't try to memorize everything at once. Learn <strong>3 shortcuts per week</strong>: start with <ShortcutKey>⌘K</ShortcutKey> (Command Palette), <ShortcutKey>N</ShortcutKey> (New Trade), and <ShortcutKey>1</ShortcutKey> (Dashboard). After a week, add 3 more. Within a month you'll navigate entirely by keyboard.</p>
              </ProTip>

              <InteractiveMockup label="Keyboard Shortcuts & Command Palette">
                <ShortcutKeyboardMockup />
              </InteractiveMockup>

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
                  "Recent section — tracks your last 5 visited pages for quick re-access",
                ]} />
              </FeatureCard>

              <SubTopic title="Quick Actions" description="Create trades, alerts, and studies without touching the mouse." id="kb-actions" />
              <FeatureCard icon={Zap} title="Quick Action Shortcuts">
                <div className="space-y-3">
                  {[
                    { key: "N", desc: "Create new trade — opens the trade creation modal" },
                    { key: "A", desc: "Create new alert — opens the alert creation modal" },
                    { key: "S", desc: "Create new study — opens the study creation modal" },
                    { key: "/", desc: "Open Command Palette — search anything, take any action" },
                    { key: "⌘K", desc: "Open Command Palette (alternative shortcut)" },
                  ].map((s) => (
                    <div key={s.key} className="flex items-center gap-3">
                      <ShortcutKey>{s.key}</ShortcutKey>
                      <span className="text-sm text-muted-foreground">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </FeatureCard>

              <SubTopic title="Navigation Shortcuts" description="Jump to any page with a single keypress." id="kb-nav" />
              <FeatureCard icon={Command} title="Page Navigation">
                <p className="text-sm text-muted-foreground mb-3">Press a number key to jump directly to any main page:</p>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    { key: "1", desc: "Dashboard" },
                    { key: "2", desc: "Trades" },
                    { key: "3", desc: "Alerts" },
                    { key: "4", desc: "Studies" },
                    { key: "5", desc: "Watchlist" },
                    { key: "6", desc: "Analytics" },
                  ].map((s) => (
                    <div key={s.key} className="flex items-center gap-3">
                      <ShortcutKey>{s.key}</ShortcutKey>
                      <span className="text-sm text-muted-foreground">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </FeatureCard>

              <SubTopic title="Full Shortcut Reference" description="Complete reference table for all available keyboard shortcuts." id="kb-reference" />
              <ExpandableDetail title="Full Shortcut Reference Table" icon={Keyboard} badge="Reference">
                <p>Every keyboard shortcut available in TradeBook, organized by category:</p>
                <h4 className="text-xs font-semibold mt-4 mb-1.5 text-foreground/80">Creation Shortcuts</h4>
                <FeatureList items={[
                  "N — Open new trade modal. Works from any page.",
                  "A — Open new alert modal. Pre-fills symbol if you're on a trade detail.",
                  "S — Open new study modal. Pre-fills symbol context when available.",
                ]} />
                <h4 className="text-xs font-semibold mt-4 mb-1.5 text-foreground/80">Search & Command</h4>
                <FeatureList items={[
                  "/ or ⌘K (Ctrl+K) — Open the Command Palette. Type to search trades, alerts, journal entries, or navigate to any page.",
                  "Esc — Close the Command Palette, any open modal, or cancel the current action.",
                ]} />
                <h4 className="text-xs font-semibold mt-4 mb-1.5 text-foreground/80">Navigation</h4>
                <FeatureList items={[
                  "1 through 6 — Jump to Dashboard, Trades, Alerts, Studies, Watchlist, or Analytics respectively.",
                ]} />
                <h4 className="text-xs font-semibold mt-4 mb-1.5 text-foreground/80">Quick Trade Entry (via Command Palette)</h4>
                <FeatureList items={[
                  "Open ⌘K → type symbol → select 'Quick Trade' → follow the guided flow: Symbol → Trade Type → Entry Price → Quantity → Confirm.",
                  "Entire flow is keyboard-only — no mouse needed. Tab between fields, Enter to confirm each step.",
                ]} />
                <p className="text-[12px] text-muted-foreground/60 mt-3">Shortcuts are disabled when you're typing in an input field, textarea, or modal form to prevent accidental triggers. They activate only when no input element is focused.</p>
              </ExpandableDetail>

              <div className="mt-4"><KeyboardShortcutsDetailMockup /></div>
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

              <QuickNav items={[
                { label: "Install on Phone", id: "pwa-install" },
                { label: "Offline Queue", id: "pwa-offline" },
                { label: "Mobile Navigation", id: "pwa-mobile" },
                { label: "PWA vs Native", id: "pwa-vs-native" },
              ]} />

              <SubTopic title="Installing TradeBook" description="Get the full app experience on any device — no app store required." id="pwa-install" />

              <StepByStep title="Installing TradeBook on Your Phone" steps={[
                { title: "Open TradeBook in your mobile browser", description: "Navigate to the app URL in Chrome (Android) or Safari (iOS).", detail: "Make sure you're using the default browser — PWA install is not supported in in-app browsers." },
                { title: "Tap the browser menu", description: "On Android, tap the three-dot menu. On iOS, tap the Share icon at the bottom.", detail: "Look for 'Add to Home Screen' or 'Install App' option." },
                { title: "Select 'Add to Home Screen'", description: "Confirm the name and tap Add. The app icon appears on your home screen instantly." },
                { title: "Launch from your home screen", description: "Open TradeBook like any native app — it runs full-screen without browser chrome.", detail: "Auto-updates happen seamlessly. You'll see a refresh prompt when a new version is available." },
              ]} />

              <div className="space-y-5 mt-6">
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

              <SubTopic title="Offline Behaviour" description="How TradeBook handles connectivity loss gracefully." id="pwa-offline" />

              <ProTip variant="info">
                When you're offline, TradeBook saves new trades to your device's local storage. Once you're back online, they sync automatically — you'll see a confirmation toast for each trade synced. If any fail, they stay queued and retry on the next reconnection. The offline banner in the header shows how many trades are waiting.
              </ProTip>

              <SubTopic title="Mobile Navigation & Onboarding" description="Touch-optimized navigation with guided onboarding for new users." id="pwa-mobile" />
              <div className="space-y-5">
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

              <ExpandableDetail title="PWA vs Native App — What's the Difference?" icon={Smartphone}>
                <p>TradeBook is built as a <strong>Progressive Web App (PWA)</strong>, which means it installs directly from your browser — no app store needed. Here's how it compares to traditional native apps:</p>
                <div className="mt-4">
                  <ComparisonTable title="PWA vs Native Comparison" rows={[
                    { feature: "Install from browser", free: true, pro: true },
                    { feature: "App store submission required", free: false, pro: true },
                    { feature: "Full-screen experience", free: true, pro: true },
                    { feature: "Offline support", free: true, pro: true },
                    { feature: "Auto-updates (no manual download)", free: true, pro: false },
                    { feature: "Push notifications", free: "Android", pro: true },
                    { feature: "Home screen icon", free: true, pro: true },
                  ]} />
                  <p className="text-[12px] text-muted-foreground/60 mt-3 italic">Free column = PWA (TradeBook). Pro column = Native App. TradeBook's PWA delivers a near-native experience without the overhead of app store distribution.</p>
                </div>
              </ExpandableDetail>
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

              <QuickNav items={[
                { label: "Profile & Billing", id: "set-account" },
                { label: "Tags & Preferences", id: "set-tags" },
                { label: "Capital Management", id: "set-capital" },
                { label: "Security & Integrations", id: "set-security" },
              ]} />

              <SettingsPanelMockup />

              <StepByStep title="Initial Settings Configuration Checklist" steps={[
                { title: "Complete your profile", description: "Add your name, email, and phone number so your account is identifiable and recoverable.", detail: "Navigate to Settings → Profile to update these details." },
                { title: "Set your starting capital", description: "Enter the total capital you've allocated for trading. This is used for risk calculations and return percentages.", detail: "Go to Settings → Preferences → Starting Capital." },
                { title: "Configure default stop loss", description: "Set a default SL percentage that pre-fills when creating new trades — saves time and enforces discipline." },
                { title: "Create your custom tags", description: "Add Setup, Mistake, Pattern, and Candlestick tags that match your trading style. These appear across trade entry and analytics.", detail: "Settings → Tags tab. Start with 5–10 tags you use most often." },
                { title: "Connect integrations", description: "Link your Dhan broker account for live prices and auto-sync. Set up Telegram for trade notifications.", detail: "Settings → Integrations tab." },
                { title: "Review security settings", description: "Ensure your password is strong and consider reviewing your session activity periodically." },
              ]} />

              <SubTopic title="Profile & Billing" description="Manage your identity, subscription, and payment." id="set-account" />
              <div className="space-y-5">
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
              </div>

              <SubTopic title="Tags & Customisation" description="Personalise your trading taxonomy with custom tags." id="set-tags" />
              <div className="space-y-5">
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
              </div>

              <ProTip variant="best-practice">
                Review your tags and settings once a month. Remove tags you never use, add new ones for evolving setups, and verify your starting capital is accurate after deposits or withdrawals. Clean settings lead to cleaner analytics.
              </ProTip>

              <SubTopic title="Capital Management" description="Track deposits, withdrawals, and net deployed capital." id="set-capital" />
              <div className="space-y-5">
                <FeatureCard icon={Wallet} title="Capital Management">
                  <FeatureList items={[
                    "Track deposits and withdrawals from your trading capital",
                    "View capital transaction history",
                    "Adjusted capital used for risk calculations",
                    "Separate from P&L — tracks actual money in/out",
                  ]} />
                  <div className="mt-4"><CapitalManagementMockup /></div>
                </FeatureCard>
              </div>

              <ExpandableDetail title="Capital Management — Deposits vs P&L" icon={Wallet}>
                <p>TradeBook separates <strong>capital flows</strong> (deposits and withdrawals) from <strong>trading P&L</strong> to give you accurate performance metrics.</p>
                <p className="mt-3">When you deposit ₹1,00,000 into your trading account, that's a capital event — not a profit. Similarly, withdrawing ₹50,000 is not a loss. TradeBook's equity curve merges these transactions chronologically with your closed trade data, ensuring:</p>
                <ul className="mt-2 space-y-1.5 text-[13px] text-muted-foreground/80">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Return % is calculated on actual deployed capital, not inflated by deposits</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Withdrawals don't appear as drawdowns in your performance</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Net Capital Deployed reflects your true risk exposure at any point</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> The equity curve stays clean and accurately represents trading skill</li>
                </ul>
              </ExpandableDetail>

              <SubTopic title="Security & Integrations" description="Password management and third-party connections." id="set-security" />
              <div className="space-y-5">
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
                description="Answers to frequently asked questions and solutions to common issues, organized by category."
                icon={MessageSquare}
              />

              <QuickNav items={[
                { label: "Account & Billing", id: "faq-account" },
                { label: "Data & Privacy", id: "faq-data" },
                { label: "Integrations", id: "faq-integrations" },
                { label: "Features", id: "faq-features" },
              ]} />

              <SubTopic title="Account & Billing" id="faq-account" />
              <ExpandableDetail title="Account & Billing Questions" icon={Users} defaultOpen>
                {[
                  { q: "Is TradeBook free to use?", a: "Yes! The Free plan includes trade logging, watchlists, alerts, and basic analytics. The Pro plan unlocks advanced analytics, AI insights, weekly reports, and more." },
                  { q: "How does the 14-day Pro trial work?", a: "New accounts automatically get a 14-day Pro trial with full access to all features. No credit card required. After the trial, you can continue on the Free plan or upgrade to Pro." },
                  { q: "Can I import trades from my existing broker?", a: "Yes. Use the CSV Import feature to bulk import trades from any broker. Column mapping supports most common export formats." },
                ].map((faq) => (
                  <div key={faq.q} className="premium-card-hover p-5 group my-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                      {faq.q}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
                  </div>
                ))}
              </ExpandableDetail>

              <SubTopic title="Data & Privacy" id="faq-data" />
              <ExpandableDetail title="Data & Privacy Questions" icon={Shield} defaultOpen>
                {[
                  { q: "Is my data secure?", a: "Absolutely. All data is encrypted at rest and in transit. Your API keys are stored securely server-side and never exposed to the browser. We use industry-standard authentication." },
                  { q: "My dashboard shows no data — what's wrong?", a: "Ensure you have trades logged. Check the segment filter and month selector — they may be filtering out your data. Try selecting 'All Segments' and expanding the date range." },
                  { q: "Can I use TradeBook on mobile?", a: "Yes! TradeBook is a Progressive Web App (PWA). Add it to your home screen for a native-like experience with offline trade queuing." },
                ].map((faq) => (
                  <div key={faq.q} className="premium-card-hover p-5 group my-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                      {faq.q}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
                  </div>
                ))}
              </ExpandableDetail>

              <SubTopic title="Integrations" id="faq-integrations" />
              <ExpandableDetail title="Integration & Connection Questions" icon={Layers} defaultOpen>
                {[
                  { q: "Do I need a Dhan account to use TradeBook?", a: "No. Dhan integration is optional — it enables live prices, auto-sync, and one-click execution. You can use TradeBook fully without any broker connection." },
                  { q: "Why are my live prices not updating?", a: "Check that your Dhan integration is connected and verified in Settings → Integrations. Prices only stream during market hours (9:15 AM – 3:30 PM IST)." },
                  { q: "How do I fix Telegram notifications not sending?", a: "Verify your bot token and chat ID in Settings → Integrations → Telegram. Use the 'Send Test' button to confirm delivery. Check the Delivery Log for error details." },
                  { q: "How do I set up AI Trade Insights?", a: "Go to Settings → Integrations → AI Trade Insights. Choose Google Gemini (free) or OpenAI, generate an API key from the provider, paste it in, and save. Analysis starts automatically on your next closed trade." },
                ].map((faq) => (
                  <div key={faq.q} className="premium-card-hover p-5 group my-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                      {faq.q}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
                  </div>
                ))}
              </ExpandableDetail>

              <SubTopic title="Features" id="faq-features" />
              <ExpandableDetail title="Feature & Usage Questions" icon={Sparkles} defaultOpen>
                {[
                  { q: "What is the AI Trade Coach?", a: "The AI Trade Coach provides instant feedback on your closed trades — analyzing entry, exit, timing, and risk management. It auto-triggers when you close a trade and the feedback is saved for future reference." },
                  { q: "How do Trading Rules work?", a: "Trading Rules are a customizable checklist that appears before you submit a new trade. Add your personal rules (e.g., 'Check trend on higher timeframe'), and the system enforces checking them all before entry." },
                  { q: "Can I get AI-suggested alerts?", a: "Yes! Smart Alert Suggestions analyzes your frequently traded symbols and recommends price alerts with AI-generated reasoning. One-click to create any suggestion as an active alert." },
                  { q: "How does the Command Palette work?", a: "Press ⌘K or / to open the Command Palette. It searches across pages, trades, alerts, and journal entries. You can also create new trades, alerts, and studies directly from it." },
                  { q: "How do Achievements work?", a: "Achievements are earned automatically as you hit milestones — like logging your first trade, reaching a win streak, or completing a week of journaling. Check your badge grid on the Dashboard to track progress." },
                  { q: "What is the Position Sizing Calculator?", a: "It calculates your ideal position size based on your capital, risk percentage, and stop loss distance. Available inside the trade creation modal to help you size positions consistently." },
                  { q: "Where can I find documentation for a specific feature?", a: "Use the sidebar search on this Docs page to filter sections by keyword. You can also use the QuickNav links at the top of each section to jump to specific topics." },
                  { q: "How do Quiet Hours and DND work?", a: "Quiet Hours automatically mute notifications outside market hours (e.g., after 3:30 PM). DND mode pauses all notifications for a set duration. Both are configurable in Settings → Preferences." },
                  { q: "What is the Notification Digest?", a: "When enabled, similar notifications are batched and delivered as a single summary instead of individual messages. This reduces notification fatigue during volatile trading sessions." },
                  { q: "How are weekly reports different from daily journals?", a: "Daily journals capture your thoughts and plans for each trading day. Weekly reports are auto-generated performance summaries with segment breakdowns, top setups, and actionable insights — delivered every Monday." },
                ].map((faq) => (
                  <div key={faq.q} className="premium-card-hover p-5 group my-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                      {faq.q}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
                  </div>
                ))}
              </ExpandableDetail>

              <ProTip variant="info">
                <p>Can't find what you're looking for? If you're experiencing a bug, data issue, or something that isn't covered here, reach out to support. Include your browser, device type, and a screenshot if possible — it helps us resolve things much faster.</p>
              </ProTip>
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
                { label: "Versioning", id: "cl-versioning" },
              ]} />

              <ProTip variant="best-practice">
                <p>Check the changelog weekly to stay on top of new features. Many improvements — like new analytics widgets or shortcut enhancements — ship silently and can significantly improve your workflow if you know about them.</p>
              </ProTip>

              <SubTopic title="Recent Updates" description="Features shipped in recent releases." id="cl-updates" />

              {/* Timeline changelog */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-px hidden sm:block" style={{ background: 'linear-gradient(180deg, hsl(var(--docs-accent) / 0.3) 0%, hsl(var(--docs-border-subtle)) 30%, hsl(var(--docs-border-subtle)) 100%)' }} />

                <div className="space-y-6 sm:space-y-8">
                  {([
                    {
                      version: "v3.3", date: "March 8, 2026", summary: "Notification system overhaul with smarter delivery, quiet hours, and refreshed Telegram templates.",
                      features: ["Notification Center upgrade — date grouping, type filters, click-to-navigate", "Quiet Hours & DND mode for notification control", "Enhanced Telegram templates with emoji headers and ━━━ separators"],
                      improvements: ["Alert evaluation engine — staggered checks, priority-based scheduling", "EOD Report & Morning Briefing template overhaul", "In-app notification sound toggle and importance levels"],
                      fixes: ["Fixed duplicate notification delivery on alert cooldown reset", "Resolved Telegram delivery log timezone offset"],
                      docs: ["Notification Preferences section added", "Telegram integration docs expanded"],
                    },
                    {
                      version: "v3.2", date: "March 5, 2026", summary: "Documentation 2.0 — interactive guides, expandable deep-dives, and categorized FAQ.",
                      features: ["StepByStep guides and ExpandableDetail components across all 26 doc sections", "Category-grouped FAQ with 20+ questions", "PWA install walkthrough with platform-specific instructions"],
                      improvements: ["Settings configuration checklist for faster onboarding", "Capital Management section with deposit/withdrawal tracking guide", "AI Insights credit usage and provider comparison table"],
                      fixes: ["Fixed docs sidebar scroll position not persisting on navigation", "Corrected broken anchor links in Analytics section"],
                    },
                    {
                      version: "v3.1", date: "March 2, 2026", summary: "Trading discipline tools — rules checklist, AI coach, and smart alert suggestions.",
                      features: ["Trading Rules Checklist — enforced before trade entry", "AI Trade Coach — instant post-trade feedback", "Smart Alert Suggestions — AI-recommended price alerts", "Quick Close Popover for faster position exits"],
                      improvements: ["Day & Time of Day Analysis charts in Analytics", "Streak Tracker expanded with best/current/loss streaks", "Docs deep-links and estimated reading time"],
                      fixes: ["Fixed trailing SL calculation rounding on sub-₹10 stocks"],
                    },
                    {
                      version: "v3.0", date: "February 28, 2026", summary: "AI-powered analytics — pattern detection, sector heatmaps, and emotional P&L correlation.",
                      features: ["AI Pattern Detection — behavioral and setup pattern insights", "Sector Rotation Heatmap — visual sector performance tracking", "Setup Win-Rate Matrix — cross-reference setups vs outcomes", "Emotional P&L Correlation — mood-to-performance analysis"],
                      improvements: ["Analytics page redesigned with tabbed navigation", "Improved chart rendering performance for large datasets"],
                    },
                    {
                      version: "v2.9", date: "February 24, 2026", summary: "Dashboard customization, mobile UX leap, and social sharing.",
                      features: ["Dashboard drag-and-drop widget reordering", "Floating Trade Ticker with live P&L", "P&L Share Cards and Trade Share Cards", "Quick Trade Entry via Command Palette (⌘K)"],
                      improvements: ["Animated KPI number transitions", "Mobile swipe-to-act on trade rows", "Improved mobile bottom navigation with active indicators"],
                      fixes: ["Fixed widget state not persisting after page refresh", "Resolved share card image generation on Safari"],
                    },
                    {
                      version: "v2.8", date: "February 18, 2026", summary: "Stock Screener launch with 47 built-in presets and custom filter builder.",
                      features: ["Stock Screener with 47 curated presets", "Custom filter builder with AND/OR logic", "Stock popup insight cards with key metrics"],
                      improvements: ["Improved instrument search with fuzzy matching"],
                    },
                    {
                      version: "v2.7", date: "February 12, 2026", summary: "Portfolio visualization, daily review wizard, and onboarding improvements.",
                      features: ["Portfolio Heat Map widget", "Daily Review Wizard — guided EOD reflection", "Enhanced onboarding welcome flow"],
                      improvements: ["Dashboard loading skeleton shimmer refinements"],
                    },
                    {
                      version: "v2.6", date: "January 28, 2026", summary: "Multi-leg strategies, TSL profiles, and AI Trade Insights.",
                      features: ["Multi-leg strategy support for options", "TSL profiles per market segment", "AI Trade Insights — automated trade analysis"],
                      improvements: ["Trade detail modal redesigned with timeline view"],
                    },
                    {
                      version: "v2.5", date: "December 15, 2025", summary: "Trade Templates, CSV import overhaul, and offline resilience.",
                      features: ["Trade Templates with Smart Suggestions", "Revamped CSV Import with column mapping", "Offline trade queue with auto-sync"],
                      fixes: ["Fixed CSV date parsing for DD/MM/YYYY format", "Resolved offline queue duplicate submission"],
                    },
                  ] as const).map((release, i) => (
                    <div key={release.version} className="relative sm:pl-10">
                      {/* Timeline dot */}
                      <div className="absolute left-[10px] top-1 w-[11px] h-[11px] rounded-full border-2 hidden sm:block" style={{
                        borderColor: i === 0 ? 'hsl(var(--docs-accent))' : 'hsl(var(--docs-border-subtle))',
                        background: i === 0 ? 'hsl(var(--docs-accent))' : 'hsl(var(--docs-bg))',
                      }} />

                      <div className="premium-card-hover p-5 sm:p-6 group">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-[13px] font-bold font-mono tracking-tight px-2.5 py-1 rounded-lg" style={{
                            background: i === 0 ? 'hsl(var(--docs-accent) / 0.1)' : 'hsl(var(--docs-elevated))',
                            color: i === 0 ? 'hsl(var(--docs-accent))' : 'hsl(var(--docs-text-primary))',
                            border: `1px solid ${i === 0 ? 'hsl(var(--docs-accent) / 0.2)' : 'hsl(var(--docs-border-subtle))'}`,
                          }}>{release.version}</span>
                          <span className="text-[11px] font-medium" style={{ color: 'hsl(var(--docs-text-muted))' }}>{release.date}</span>
                          {i === 0 && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-profit/10 text-profit flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" /> Latest
                            </span>
                          )}
                        </div>

                        {/* Summary */}
                        <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'hsl(var(--docs-text-secondary))' }}>{release.summary}</p>

                        {/* Categorized items */}
                        <div className="space-y-3">
                          {release.features && release.features.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Sparkles className="w-3 h-3 text-[hsl(var(--tb-accent))]" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--tb-accent))]">New</span>
                              </div>
                              <ul className="space-y-1 pl-5">
                                {release.features.map((f) => (
                                  <li key={f} className="text-[12px] leading-relaxed flex items-start gap-1.5" style={{ color: 'hsl(var(--docs-text-secondary))' }}>
                                    <span className="text-[hsl(var(--tb-accent))] mt-1 shrink-0">+</span> {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {release.improvements && release.improvements.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <TrendingUp className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Improved</span>
                              </div>
                              <ul className="space-y-1 pl-5">
                                {release.improvements.map((imp) => (
                                  <li key={imp} className="text-[12px] leading-relaxed flex items-start gap-1.5" style={{ color: 'hsl(var(--docs-text-muted))' }}>
                                    <span className="text-primary mt-1 shrink-0">↑</span> {imp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {"fixes" in release && release.fixes && release.fixes.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <CheckCircle2 className="w-3 h-3 text-profit" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-profit">Fixed</span>
                              </div>
                              <ul className="space-y-1 pl-5">
                                {release.fixes.map((fix) => (
                                  <li key={fix} className="text-[12px] leading-relaxed flex items-start gap-1.5" style={{ color: 'hsl(var(--docs-text-muted))' }}>
                                    <span className="text-profit mt-1 shrink-0">✓</span> {fix}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {"docs" in release && release.docs && release.docs.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <FileText className="w-3 h-3" style={{ color: 'hsl(var(--docs-text-muted))' }} />
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--docs-text-muted))' }}>Docs</span>
                              </div>
                              <ul className="space-y-1 pl-5">
                                {release.docs.map((doc) => (
                                  <li key={doc} className="text-[11px] leading-relaxed" style={{ color: 'hsl(var(--docs-text-muted) / 0.7)' }}>
                                    📄 {doc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <ExpandableDetail title="Version Numbering Explained" icon={RefreshCw}>
                <p>TradeBook follows a <strong>semantic-style versioning</strong> scheme to communicate the scope of each release:</p>
                <ul className="mt-3 space-y-1.5 text-[13px] text-muted-foreground/80">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> <strong>Major (vX.0)</strong> — Significant new feature areas or architectural changes (e.g., AI Pattern Detection, Sector Heatmap)</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> <strong>Minor (vX.Y)</strong> — New features, enhancements, and meaningful improvements to existing capabilities</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> <strong>Patches</strong> — Bug fixes and small refinements are shipped continuously and don't always bump the version number</li>
                </ul>
                <p className="mt-3 text-[12px] text-muted-foreground/60 italic">We ship improvements weekly. Version numbers help you track what's new, but many quality-of-life improvements land between numbered releases.</p>
              </ExpandableDetail>

              <SubTopic title="Upcoming Roadmap" description="What we're building next — grouped by development stage." id="cl-roadmap" />

              {/* Roadmap grouped by status */}
              {([
                {
                  status: "Coming Soon",
                  color: "hsl(142 71% 45%)",
                  bgColor: "hsl(142 71% 45% / 0.08)",
                  dotClass: "bg-[hsl(142_71%_45%)] animate-pulse",
                  badgeClass: "bg-[hsl(142_71%_45%/0.1)] text-[hsl(142_71%_45%)]",
                  items: [
                    { label: "Alert Chains & Workflows", desc: "Multi-step alert automation — e.g. 'If NIFTY crosses 22000, auto-create BANKNIFTY alert at 48000'. Chain alerts together with auto-snooze and auto-trade-template actions.", value: "Automate complex trading workflows without manual intervention." },
                    { label: "Enhanced P&L Share Cards", desc: "New share card templates with weekly/monthly summaries, custom watermarks, and branded RA disclaimers for social sharing.", value: "Build credibility and attract followers with professional performance cards." },
                    { label: "Quiet Hours & Notification Digest", desc: "Auto-mute notifications outside market hours. Batch similar alerts into a single digest instead of individual pings.", value: "Reduce notification fatigue without missing critical signals." },
                  ],
                },
                {
                  status: "In Progress",
                  color: "hsl(var(--tb-accent))",
                  bgColor: "hsl(var(--tb-accent) / 0.06)",
                  dotClass: "bg-[hsl(var(--tb-accent))] animate-pulse",
                  badgeClass: "bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]",
                  items: [
                    { label: "Social Trading Profile", desc: "Share your trade journal publicly with an RA-compliant profile page. Includes monthly stats, equity curve, disclaimer, and follower view.", value: "Showcase your track record transparently while staying SEBI-compliant." },
                    { label: "Advanced Mistake Heatmap", desc: "Visual heatmap of mistake frequency by day-of-week, time-of-day, and market segment. Spot behavioral patterns that cost you money.", value: "Turn mistake data into actionable self-improvement insights." },
                    { label: "Scanner Custom Filter Builder", desc: "Build fully custom screening filters with AND/OR logic, save as presets, and set alerts when scanner conditions match.", value: "Find trading opportunities faster with personalized screening criteria." },
                  ],
                },
                {
                  status: "Planned",
                  color: "hsl(var(--primary))",
                  bgColor: "hsl(var(--primary) / 0.04)",
                  dotClass: "bg-primary/50",
                  badgeClass: "bg-primary/10 text-primary",
                  items: [
                    { label: "Trade Similarity Engine", desc: "AI compares your current trade setup against your historical trades. Shows win rate, avg P&L, and common mistakes for similar setups.", value: "Make data-driven entry decisions based on your own trading history." },
                    { label: "Option Chain Analyzer", desc: "Visual option chain with Greeks display, IV surface heatmap, and multi-leg strategy payoff diagrams integrated with your trade log.", value: "Options traders get institutional-grade analysis without switching apps." },
                    { label: "Notification & Alert Analytics", desc: "Dashboard showing delivery success rates, alert trigger frequency, most-triggered symbols, and Telegram bot health metrics.", value: "Understand your alert system's effectiveness and optimize your setup." },
                    { label: "Custom Dashboard Layouts", desc: "Drag-and-drop dashboard builder with resizable widgets. Save multiple layout presets for different trading sessions (morning scan, intraday, EOD review).", value: "Tailor your workspace to match your exact trading workflow." },
                    { label: "Advanced Journal Templates", desc: "Pre-built journal templates for different trading styles — scalping, swing, positional. Auto-populate relevant fields based on trade type.", value: "Faster, more structured journaling tailored to your strategy." },
                    { label: "Broker CSV Auto-Mapping", desc: "Intelligent CSV parser that auto-detects broker format (Zerodha, Angel One, ICICI Direct, Groww) and maps columns automatically.", value: "Import months of trade history in seconds, from any Indian broker." },
                    { label: "Watchlist Price Alerts", desc: "Set price alerts directly from watchlist items. Auto-suggest alert levels based on recent support/resistance from your trade history.", value: "Seamless alert creation from the instruments you're already watching." },
                  ],
                },
                {
                  status: "Exploring",
                  color: "hsl(var(--muted-foreground))",
                  bgColor: "hsl(var(--muted-foreground) / 0.03)",
                  dotClass: "bg-muted-foreground/30",
                  badgeClass: "bg-muted text-muted-foreground",
                  items: [
                    { label: "Zerodha Kite Integration", desc: "Connect your Zerodha Kite account for live prices, auto-sync positions, and one-click trade import from order book.", value: "India's most popular broker, natively integrated." },
                    { label: "Advanced Backtesting Engine", desc: "Test your strategies against historical OHLC data with simulated entries, exits, and P&L. Compare strategy variants side-by-side.", value: "Validate your edge before risking real capital." },
                    { label: "AI Weekly Coach Summary", desc: "End-of-week AI analysis of your trading patterns, emotional triggers, and missed opportunities. Personalized improvement plan for next week.", value: "A personal trading coach that learns from your actual behavior." },
                    { label: "Multi-Currency & International Markets", desc: "Support for USD, EUR, and other currencies. Track US stocks, crypto, and forex alongside Indian market positions.", value: "One journal for all your trading, regardless of market or currency." },
                    { label: "Community Leaderboard", desc: "Opt-in anonymized leaderboard comparing win rates, streaks, and consistency scores. Monthly challenges and achievement unlocks.", value: "Gamified motivation with privacy-first community competition." },
                    { label: "Mobile Native App (iOS & Android)", desc: "Dedicated native mobile app with push notifications, biometric login, offline trade logging, and quick-capture trade entry.", value: "Full TradeBook power in your pocket, optimized for on-the-go trading." },
                    { label: "Collaborative Trade Reviews", desc: "Invite a mentor or trading buddy to review and comment on your trades. Shared journal view with annotation tools.", value: "Learn faster with structured feedback from experienced traders." },
                  ],
                },
              ] as const).map((group) => (
                <div key={group.status} className="mb-8">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={cn("w-2.5 h-2.5 rounded-full", group.dotClass)} />
                    <h3 className="text-sm font-bold text-foreground">{group.status}</h3>
                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-semibold", group.badgeClass)}>{group.items.length} items</span>
                    <div className="flex-1 h-px" style={{ background: 'hsl(var(--docs-border-subtle))' }} />
                  </div>
                  <div className="space-y-2.5">
                    {group.items.map((item) => (
                      <div key={item.label} className="premium-card-hover p-4 flex items-start gap-3 group">
                        <div className="mt-1.5 shrink-0">
                          <div className={cn("w-1.5 h-1.5 rounded-full", group.dotClass.replace(" animate-pulse", ""))} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[13px] font-semibold text-foreground">{item.label}</span>
                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0", group.badgeClass)}>{group.status}</span>
                          </div>
                          <p className="text-[12px] text-muted-foreground leading-relaxed mb-1.5">{item.desc}</p>
                          <p className="text-[11px] italic flex items-start gap-1.5" style={{ color: 'hsl(var(--docs-text-muted) / 0.7)' }}>
                            <Zap className="w-3 h-3 shrink-0 mt-0.5" style={{ color: String(group.color) }} />
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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

          {/* Right sidebar — On this page */}
          <aside className="hidden xl:block w-[200px] shrink-0" style={{ borderLeft: '1px solid hsl(var(--docs-border-subtle))' }}>
            <div className="sticky top-20 py-8 pl-6 pr-4">
              <p className="docs-caption uppercase tracking-[0.12em] mb-5">On this page</p>
              <nav className="space-y-0.5">
                {(SECTION_ANCHORS[activeSection] || []).map((anchor) => (
                  <button
                    key={anchor.id}
                    onClick={() => document.getElementById(anchor.id)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                    className="docs-anchor-link block w-full text-left docs-sidebar-item py-2 transition-colors duration-150 leading-snug"
                  >
                    {anchor.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-all"
            style={{ background: 'hsl(var(--docs-elevated))', border: '1px solid hsl(var(--docs-border))', color: 'hsl(var(--docs-text-secondary))' }}
            aria-label="Back to top"
          >
            <ArrowUpRight className="w-4 h-4 -rotate-45" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer — only on standalone */}
      {!isInsideApp && (
        <footer style={{ borderTop: '1px solid hsl(var(--docs-border-subtle))' }} className="py-14" role="contentinfo">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <img src="/favicon-32x32.png" alt="TradeBook" className="h-6 object-contain" loading="lazy" />
                  <span className="docs-card-title" style={{ fontSize: '0.9375rem' }}>TradeBook</span>
                </div>
                <p className="docs-helper leading-relaxed mb-4">The trading journal built for Indian markets.</p>
                <Button size="sm" onClick={() => navigate("/login?mode=signup")} className="rounded-lg px-4 text-[12px] h-8">
                  Get Started <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
              {[
                { title: "Product", links: [{ label: "Features", href: "/#features" }, { label: "Pricing", href: "/#pricing" }, { label: "Documentation", href: "/docs" }] },
                { title: "Resources", links: [{ label: "Changelog", href: "#changelog" }, { label: "FAQ", href: "#faq" }, { label: "Blog", href: "#" }] },
                { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }, { label: "Contact", href: "mailto:founder@mrchartist.com" }] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="docs-caption uppercase tracking-[0.12em] mb-4">{col.title}</h4>
                  <ul className="space-y-2">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <button onClick={() => l.href.startsWith("mailto") ? window.open(l.href) : l.href.startsWith("#") ? document.getElementById(l.href.slice(1))?.scrollIntoView({ behavior: "smooth" }) : navigate(l.href)} className="docs-sidebar-item transition-colors" style={{ color: 'hsl(var(--docs-text-secondary))' }}>
                          {l.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="h-px mb-5" style={{ background: 'hsl(var(--docs-border-subtle))' }} />
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <p className="docs-caption">
                © {new Date().getFullYear()} TradeBook. All rights reserved.
              </p>
              <span className="docs-caption" style={{ color: 'hsl(var(--docs-text-muted) / 0.6)' }}>Not SEBI registered · For educational purposes only</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
