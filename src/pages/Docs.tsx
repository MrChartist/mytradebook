import { useState, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Wallet, Share2, MessageSquare, Command, Hash, Palette
} from "lucide-react";
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
  DocsColorModeProvider, useDocsColorMode
} from "@/components/docs/DocsMockups";

const SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: Play },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "trade-management", label: "Trade Management", icon: CandlestickChart },
  { id: "alerts", label: "Alerts System", icon: Bell },
  { id: "studies", label: "Studies & Research", icon: BookOpen },
  { id: "watchlists", label: "Watchlists", icon: Eye },
  { id: "journal", label: "Trade Journal", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "calendar", label: "Calendar & Journal", icon: Calendar },
  { id: "mistakes", label: "Mistakes Review", icon: AlertTriangle },
  { id: "reports", label: "Weekly Reports", icon: PieChart },
  { id: "integrations", label: "Integrations", icon: Layers },
  { id: "ai-integration", label: "AI Insights Setup", icon: Sparkles },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard },
  { id: "settings", label: "Settings", icon: Settings },
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
    <Card className="border-border/40 bg-card/80 hover:border-[hsl(var(--tb-accent)/0.3)] hover:shadow-md hover:scale-[1.003] transition-all duration-200 relative group overflow-hidden">
      {/* Left accent bar on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-[hsl(var(--tb-accent))] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--tb-accent)/0.08)] flex items-center justify-center ring-1 ring-border/20">
            <Icon className="w-5 h-5 text-[hsl(var(--tb-accent))]" />
          </div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
            {badge && (
              <Badge variant="secondary" className="text-[11px] px-2 py-0 bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))] border-none">
                {badge}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SectionHeader({ id, title, description, icon: Icon }: {
  id: string; title: string; description: string; icon: React.ElementType;
}) {
  return (
    <div id={id} className="scroll-mt-24 mb-8 border-b border-border/10 pb-6">
      {/* Top accent line */}
      <div className="w-10 h-[3px] rounded-full bg-[hsl(var(--tb-accent))] docs-accent-bar mb-4" />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center">
          <Icon className="w-5.5 h-5.5 text-[hsl(var(--tb-accent))]" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h2>
      </div>
      <p className="text-foreground/60 leading-relaxed max-w-3xl">{description}</p>
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
    { label: "Core Features", ids: ["dashboard", "trade-management", "alerts", "studies", "watchlists", "journal"] },
    { label: "Advanced", ids: ["analytics", "calendar", "mistakes", "reports"] },
    { label: "Settings & Tools", ids: ["integrations", "ai-integration", "shortcuts", "settings"] },
  ];

  return (
    <DocsColorModeProvider>
      <SEOHead
        title="Documentation"
        description="Complete guide to TradeBook features — dashboard, trade logging, alerts, analytics, journal, and integrations for Indian market traders."
        path="/docs"
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

  return (
    <div className={cn("min-h-screen bg-background text-foreground", isInsideApp && "pb-6", mode === "bw" && "docs-bw")}>
      {/* Top accent bar */}
      <div className="h-[3px] w-full bg-gradient-primary docs-accent-bar" />
      {/* Navbar — only show on standalone page */}
      {!isInsideApp && (
        <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-16">
            <button onClick={() => navigate("/landing")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-xl bg-[hsl(var(--tb-accent))] flex items-center justify-center shadow-[0_0_20px_hsl(var(--tb-accent)/0.25)]">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-logo font-bold tracking-tight">TradeBook</span>
            </button>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/landing")} className="text-muted-foreground">
                Home
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/login")}
                className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-5"
              >
                Get Started
              </Button>
            </div>
          </div>
        </nav>
      )}

      {/* Hero */}
      <div className={cn("border-b border-border/20 bg-gradient-to-b from-[hsl(var(--tb-accent)/0.04)] to-transparent", isInsideApp && "border-none")}>
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
          <p className="text-lg text-foreground/70 max-w-2xl leading-relaxed">
            A comprehensive guide to every feature, capability, and workflow in the platform — from your first trade log to advanced analytics.
          </p>
          <BentoFeatureGrid />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex gap-10">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <nav className="pr-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3 px-3">On this page</p>
                  {sidebarGroups.map((group, gi) => (
                    <div key={group.label}>
                      {gi > 0 && <Separator className="my-2 mx-3" />}
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/50 px-3 py-1.5">{group.label}</p>
                      {SECTIONS.filter((s) => group.ids.includes(s.id)).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => scrollTo(s.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-left relative",
                            activeSection === s.id
                              ? "bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))] font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          {activeSection === s.id && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[hsl(var(--tb-accent))]" />
                          )}
                          <s.icon className="w-4 h-4 shrink-0" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </aside>

          {/* Mobile tabs */}
          <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border/20 shadow-sm">
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
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-20 lg:pt-0 pt-14">

            {/* ── 1. Getting Started ─────────────────────── */}
            <section>
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
            </section>

            {/* ── 2. Dashboard ───────────────────────────── */}
            <section>
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
            </section>

            {/* ── 3. Trade Management ────────────────────── */}
            <section>
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

              <FeatureCard icon={Zap} title="Trade Templates">
                <p className="text-sm text-muted-foreground mb-3">Save frequently-used trade setups as templates for quick entry:</p>
                <FeatureList items={[
                  "Pre-fill segment, trade type, default SL %, tags",
                  "Optional notes template and timeframe",
                  "Enable/disable auto-tracking and Telegram posting per template",
                  "One-click 'Use' button when creating new trades",
                ]} />
                <div className="mt-4"><TradeTemplateMockup /></div>
              </FeatureCard>
            </section>

            {/* ── 4. Alerts System ───────────────────────── */}
            <section>
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
            </section>

            {/* ── 5. Studies & Research ───────────────────── */}
            <section>
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
            </section>

            {/* ── 6. Watchlists ──────────────────────────── */}
            <section>
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
            </section>

            {/* ── 7. Trade Journal ───────────────────────── */}
            <section>
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
            </section>

            {/* ── 8. Analytics (Pro) ─────────────────────── */}
            <section>
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
            </section>

            {/* ── 9. Calendar & Daily Journal ────────────── */}
            <section>
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
            </section>

            {/* ── 10. Mistakes Review ────────────────────── */}
            <section>
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
            </section>

            {/* ── 11. Weekly Reports ─────────────────────── */}
            <section>
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
            </section>

            {/* ── 12. Integrations ───────────────────────── */}
            <section>
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
            </section>

            {/* ── 12b. AI Insights Setup ─────────────────── */}
            <section>
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
            </section>

            {/* ── 13. Keyboard Shortcuts ─────────────────── */}
            <section>
              <SectionHeader
                id="shortcuts"
                title="Keyboard Shortcuts"
                description="Power-user keyboard shortcuts to navigate and take actions without touching the mouse. Plus a Command Palette for instant search."
                icon={Keyboard}
              />
              <ShortcutKeyboardMockup />
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
            </section>

            {/* ── 14. Settings ───────────────────────────── */}
            <section>
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
            </section>

            {/* CTA at bottom */}
            {!isInsideApp && (
              <section className="text-center py-16 border-t border-border/20">
                <h2 className="text-3xl font-bold mb-4">Ready to improve your trading?</h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Start logging trades today with a 14-day free Pro trial. No credit card required.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-10 h-12 text-base gap-2"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Footer — only on standalone */}
      {!isInsideApp && (
        <footer className="border-t border-border/20 bg-card/30 py-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground/50">© {new Date().getFullYear()} TradeBook. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="/landing" className="hover:text-foreground transition-colors">Home</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
