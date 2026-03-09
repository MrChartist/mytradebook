import { useState, useMemo, useCallback, createContext, useContext, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { OnboardingWelcome } from "@/components/dashboard/OnboardingWelcome";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { DashboardKPICards } from "@/components/dashboard/DashboardKPICards";
import { DailySectorChart } from "@/components/dashboard/DailySectorChart";
import { DashboardAlertsPanel } from "@/components/dashboard/DashboardAlertsPanel";
import { DashboardPositionsTable } from "@/components/dashboard/DashboardPositionsTable";
import { DashboardMonthlyMetrics } from "@/components/dashboard/DashboardMonthlyMetrics";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { StreakDiscipline } from "@/components/dashboard/StreakDiscipline";
import { RiskGoalWidget } from "@/components/dashboard/RiskGoalWidget";
import { FloatingTradeTicker } from "@/components/dashboard/FloatingTradeTicker";
import { SortableWidgetItem } from "@/components/dashboard/DashboardWidgetSortable";
import { DailyScorecard } from "@/components/dashboard/DailyScorecard";
import { DisciplineScore } from "@/components/dashboard/DisciplineScore";
import { MorningBriefing } from "@/components/dashboard/MorningBriefing";
import { RiskMeter } from "@/components/dashboard/RiskMeter";
import { MobileDashboardSettings } from "@/components/dashboard/MobileDashboardSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Lazy-loaded heavy widgets
const JournalCalendarView = lazy(() => import("@/components/journal/JournalCalendarView").then(m => ({ default: m.JournalCalendarView })));
const AITradeInsights = lazy(() => import("@/components/analytics/AITradeInsights").then(m => ({ default: m.AITradeInsights })));
const PortfolioHeatMap = lazy(() => import("@/components/dashboard/PortfolioHeatMap").then(m => ({ default: m.PortfolioHeatMap })));
const AchievementsBadgeGrid = lazy(() => import("@/components/dashboard/AchievementsBadgeGrid").then(m => ({ default: m.AchievementsBadgeGrid })));
import { useAchievements } from "@/hooks/useAchievements";
import { useTrades } from "@/hooks/useTrades";
import { useAlerts } from "@/hooks/useAlerts";
import { useLivePrices } from "@/hooks/useLivePrices";
import { useDashboardLayout, type WidgetConfig } from "@/hooks/useDashboardLayout";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { Radio, Settings2, RotateCcw } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TradeStatus } from "@/lib/constants";

type Segment = "All" | "Equity_Intraday" | "Equity_Positional" | "Futures" | "Options" | "Commodities";

const SEGMENT_OPTIONS: { label: string; value: Segment }[] = [
  { label: "All", value: "All" },
  { label: "Intraday", value: "Equity_Intraday" },
  { label: "Positional", value: "Equity_Positional" },
  { label: "Futures", value: "Futures" },
  { label: "Options", value: "Options" },
  { label: "Commodities", value: "Commodities" },
];

export interface DashboardContextValue {
  selectedMonth: Date | null;
  setSelectedMonth: (d: Date | null) => void;
  segment: Segment;
  trades: ReturnType<typeof useTrades>["trades"];
  monthTrades: ReturnType<typeof useTrades>["trades"];
  openTrades: ReturnType<typeof useTrades>["trades"];
  prices: Record<string, { ltp: number }>;
  isPolling: boolean;
  lastUpdated: Date | null;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);
const DASHBOARD_DEFAULTS: DashboardContextValue = {
  selectedMonth: null,
  setSelectedMonth: () => {},
  segment: "All",
  trades: [],
  monthTrades: [],
  openTrades: [],
  prices: {},
  isPolling: false,
  lastUpdated: null,
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  return ctx ?? DASHBOARD_DEFAULTS;
};

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [segment, setSegment] = useState<Segment>("All");
  const { widgets, toggleWidget, moveWidget, resetLayout, reorderWidgets } = useDashboardLayout();

  const { trades: allTrades, isLoading: tradesLoading } = useTrades();
  const { alerts } = useAlerts({ active: true });

  // Drag-n-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Filter by segment
  const trades = useMemo(() => {
    if (segment === "All") return allTrades;
    return allTrades.filter((t) => t.segment === segment);
  }, [allTrades, segment]);

  // Month-filtered trades
  const monthStart = selectedMonth ? startOfMonth(selectedMonth) : null;
  const monthEnd = selectedMonth ? endOfMonth(selectedMonth) : null;
  const monthTrades = useMemo(() => {
    if (!monthStart || !monthEnd) return trades;
    return trades.filter((t) => {
      const d = new Date(t.entry_time);
      return d >= monthStart && d <= monthEnd;
    });
  }, [trades, monthStart, monthEnd]);

  // Open positions
  const openTrades = useMemo(() => trades.filter((t) => t.status === TradeStatus.OPEN), [trades]);
  const openInstruments = useMemo(() => openTrades.map((t) => ({
    symbol: t.symbol, security_id: t.security_id, exchange_segment: t.exchange_segment,
  })), [openTrades]);
  const { prices, isPolling, lastUpdated } = useLivePrices(openInstruments);

  const navigate = useNavigate();

  const calendarData = useMemo(() => {
    const map = new Map<string, { date: Date; dateStr: string; trades: any[]; tradeCount: number; pnl: number }>();
    trades.forEach((t) => {
      if (t.status === "CLOSED" && t.closed_at) {
        const d = new Date(t.closed_at);
        const key = format(d, "yyyy-MM-dd");
        if (!map.has(key)) map.set(key, { date: d, dateStr: key, trades: [], tradeCount: 0, pnl: 0 });
        const entry = map.get(key)!;
        entry.trades.push({ id: t.id, symbol: t.symbol, trade_type: t.trade_type, pnl: t.pnl });
        entry.tradeCount += 1;
        entry.pnl += t.pnl || 0;
      }
    });
    return Array.from(map.values());
  }, [trades]);

  const handleCalendarDayClick = useCallback((dateStr: string) => {
    navigate(`/calendar?date=${dateStr}`);
  }, [navigate]);

  const alertsVisible = widgets.find((w) => w.id === "alerts")?.visible ?? true;

  const ctx: DashboardContextValue = {
    selectedMonth, setSelectedMonth, segment,
    trades, monthTrades, openTrades,
    prices: prices as Record<string, { ltp: number }>,
    isPolling, lastUpdated,
  };

  const handlePopoverDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = widgets.findIndex((w) => w.id === active.id);
    const newIndex = widgets.findIndex((w) => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    reorderWidgets(oldIndex, newIndex);
  };

  const renderWidget = (w: WidgetConfig) => {
    if (!w.visible) return null;
    switch (w.id) {
      case "kpi":
        return <DashboardKPICards key={w.id} alerts={alerts} />;
      case "riskGoal":
        return <RiskGoalWidget key={w.id} />;
      case "heatMap":
        return <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}><PortfolioHeatMap key={w.id} /></Suspense>;
      case "chart":
        return (
          <div key={w.id} className={cn("grid grid-cols-1 gap-4", alertsVisible ? "lg:grid-cols-3" : "")}>
            <div className={alertsVisible ? "lg:col-span-2" : ""}><DailySectorChart /></div>
            {alertsVisible && <DashboardAlertsPanel alerts={alerts} />}
          </div>
        );
      case "alerts":
        return null;
      case "equityCurve":
        return <EquityCurve key={w.id} />;
      case "positions":
        return <DashboardPositionsTable key={w.id} />;
      case "streakCalendar":
        return (
          <div key={w.id} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-h-[340px]"><StreakDiscipline /></div>
            <div className="min-h-[340px]">
              <Suspense fallback={<Skeleton className="h-[340px] w-full rounded-xl" />}>
                <JournalCalendarView
                  calendarData={calendarData}
                  isLoading={tradesLoading}
                  onTradeClick={() => {}}
                  compact
                  showLink
                  onDayClick={handleCalendarDayClick}
                />
              </Suspense>
            </div>
          </div>
        );
      case "monthly":
        return <DashboardMonthlyMetrics key={w.id} />;
      case "actions":
        return <QuickActions key={w.id} />;
      case "aiInsights":
        return <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}><AITradeInsights key={w.id} compact maxInsights={2} /></Suspense>;
      case "achievements":
        return <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}><AchievementsBadgeGrid key={w.id} /></Suspense>;
      default:
        return null;
    }
  };

  return (
    <DashboardContext.Provider value={ctx}>
      <div className="space-y-4 animate-fade-in">
        <OnboardingWelcome />

        {/* Floating Trade Ticker */}
        <FloatingTradeTicker />

        {/* Row 1: Greeting + Live status + Settings */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <DashboardGreeting />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] bg-muted/30 rounded-md px-2.5 py-1 border border-border/15">
              {isPolling && openInstruments.length > 0 ? (
                <>
                  <Radio className="w-3 h-3 text-profit animate-pulse" />
                  <span className="text-profit font-medium">Live</span>
                  {lastUpdated && <span className="text-muted-foreground/50">• {format(lastUpdated, "h:mm a")}</span>}
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span className="text-muted-foreground/50">Offline</span>
                </>
              )}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Settings2 className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-2.5" align="end">
                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-medium">Dashboard Widgets</p>
                    <Button variant="ghost" size="sm" className="h-6 text-[9px]" onClick={resetLayout}>
                      <RotateCcw className="w-3 h-3 mr-1" /> Reset
                    </Button>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handlePopoverDragEnd}
                  >
                    <SortableContext
                      items={widgets.map((w) => w.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {widgets.map((w) => (
                        <SortableWidgetItem
                          key={w.id}
                          id={w.id}
                          label={w.label}
                          visible={w.visible}
                          onToggle={() => toggleWidget(w.id)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="h-px bg-border/20" />

        {/* Row 2: Month selector + Segment filter */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          <div className="flex gap-0.5 bg-muted/40 rounded-lg p-0.5 border border-border/15">
            {[
              { label: "All", value: "all" },
              ...([subMonths(new Date(), 2), subMonths(new Date(), 1), new Date()].map((m) => ({
                label: format(m, "MMM"),
                value: format(m, "MMM yy"),
                date: m,
              }))),
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  if (m.value === "all") {
                    setSelectedMonth(null as any);
                  } else {
                    setSelectedMonth((m as any).date);
                  }
                }}
                className={cn(
                  "px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-200",
                  (m.value === "all" && selectedMonth === null)
                    || (selectedMonth && m.value === format(selectedMonth, "MMM yy"))
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-border/20 shrink-0" />

          {SEGMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSegment(opt.value)}
              className={cn(
                "px-3 py-1 text-[11px] font-medium rounded-md border transition-all duration-200 shrink-0",
                segment === opt.value
                  ? "border-primary/15 bg-primary/6 text-primary"
                  : "border-border/15 text-muted-foreground/50 hover:text-foreground hover:border-border/30"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Dynamic Widgets */}
        {tradesLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-[130px] rounded-[1.25rem] shimmer-skeleton" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Skeleton className="h-[280px] rounded-[1.25rem] lg:col-span-2 shimmer-skeleton" />
              <Skeleton className="h-[280px] rounded-[1.25rem] shimmer-skeleton" />
            </div>
            <Skeleton className="h-[220px] rounded-[1.25rem] shimmer-skeleton" />
          </div>
        ) : (
          widgets.map((w) => renderWidget(w))
        )}
      </div>
    </DashboardContext.Provider>
  );
}
