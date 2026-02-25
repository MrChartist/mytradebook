import { useState, useMemo, createContext, useContext } from "react";
import { DashboardKPICards } from "@/components/dashboard/DashboardKPICards";
import { DailySectorChart } from "@/components/dashboard/DailySectorChart";
import { DashboardAlertsPanel } from "@/components/dashboard/DashboardAlertsPanel";
import { DashboardPositionsTable } from "@/components/dashboard/DashboardPositionsTable";
import { DashboardMonthlyMetrics } from "@/components/dashboard/DashboardMonthlyMetrics";
import { MorningBriefingWidget } from "@/components/dashboard/MorningBriefingWidget";
import { RiskDashboardWidget } from "@/components/dashboard/RiskDashboardWidget";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useTrades } from "@/hooks/useTrades";
import { useAlerts } from "@/hooks/useAlerts";
import { useLivePrices } from "@/hooks/useLivePrices";
import { useDashboardLayout, type WidgetConfig } from "@/hooks/useDashboardLayout";
import { Radio, Settings2, ChevronUp, ChevronDown, Eye, EyeOff, RotateCcw } from "lucide-react";
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
  selectedMonth: Date;
  setSelectedMonth: (d: Date) => void;
  segment: Segment;
  trades: ReturnType<typeof useTrades>["trades"];
  monthTrades: ReturnType<typeof useTrades>["trades"];
  openTrades: ReturnType<typeof useTrades>["trades"];
  prices: Record<string, { ltp: number }>;
  isPolling: boolean;
  lastUpdated: Date | null;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);
export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    // Return safe defaults so components don't crash outside provider
    return {
      selectedMonth: new Date(),
      setSelectedMonth: () => {},
      segment: "All" as Segment,
      trades: [],
      monthTrades: [],
      openTrades: [],
      prices: {} as Record<string, { ltp: number }>,
      isPolling: false,
      lastUpdated: null,
    } satisfies DashboardContextValue;
  }
  return ctx;
};

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [segment, setSegment] = useState<Segment>("All");
  const { widgets, toggleWidget, moveWidget, resetLayout } = useDashboardLayout();

  const { trades: allTrades, isLoading: tradesLoading } = useTrades();
  const { alerts } = useAlerts({ active: true });

  // Filter by segment
  const trades = useMemo(() => {
    if (segment === "All") return allTrades;
    return allTrades.filter((t) => t.segment === segment);
  }, [allTrades, segment]);

  // Month-filtered trades
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthTrades = useMemo(() => {
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
  const { prices, isPolling, lastUpdated, activeProvider, failoverActive } = useLivePrices(openInstruments);

  const ctx: DashboardContextValue = {
    selectedMonth, setSelectedMonth, segment,
    trades, monthTrades, openTrades,
    prices: prices as Record<string, { ltp: number }>,
    isPolling, lastUpdated,
  };

  return (
    <DashboardContext.Provider value={ctx}>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-primary" />
            <div className="pl-4">
              <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                {format(selectedMonth, "MMMM yyyy")} overview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Month selector */}
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              {[subMonths(new Date(), 2), subMonths(new Date(), 1), new Date()].map((m) => (
                <button
                  key={m.toISOString()}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    format(selectedMonth, "MMM yy") === format(m, "MMM yy")
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {format(m, "MMM")}
                </button>
              ))}
            </div>
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isPolling && openInstruments.length > 0 ? (
                <>
                  <Radio className="w-3 h-3 text-profit animate-pulse" />
                  <span className="text-profit font-medium">Live</span>
                  {failoverActive && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-warning/15 text-warning border border-warning/20">
                      TrueData
                    </span>
                  )}
                  {!failoverActive && activeProvider === "dhan" && (
                    <span className="text-[10px] text-muted-foreground/60">Dhan</span>
                  )}
                  {lastUpdated && <span>• {format(lastUpdated, "h:mm a")}</span>}
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-profit" />
                  <span>Market Open</span>
                </>
              )}
            </div>

            {/* Widget customization */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings2 className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">Dashboard Widgets</p>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={resetLayout}>
                      <RotateCcw className="w-3 h-3 mr-1" /> Reset
                    </Button>
                  </div>
                  {widgets.map((w, i) => (
                    <div key={w.id} className="flex items-center justify-between py-1">
                      <button
                        onClick={() => toggleWidget(w.id)}
                        className={cn("flex items-center gap-2 text-xs", !w.visible && "text-muted-foreground")}
                      >
                        {w.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {w.label}
                      </button>
                      <div className="flex gap-0.5">
                        <button onClick={() => moveWidget(w.id, "up")} disabled={i === 0} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => moveWidget(w.id, "down")} disabled={i === widgets.length - 1} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Segment filter */}
        <div className="flex gap-1.5 flex-wrap">
          {SEGMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSegment(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                segment === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Dynamic Widgets */}
        {widgets.reduce<{ elements: React.ReactNode[]; index: number }>((acc, w) => {
          if (!w.visible) return acc;
          const staggerClass = `animate-slide-up stagger-${acc.index + 1}`;
          let el: React.ReactNode = null;
          switch (w.id) {
            case "briefing":
              el = <div key={w.id} className={staggerClass}><MorningBriefingWidget /></div>;
              break;
            case "kpi":
              el = <div key={w.id} className={staggerClass}><DashboardKPICards alerts={alerts} /></div>;
              break;
            case "chart":
              el = (
                <div key={w.id} className={cn("grid grid-cols-1 lg:grid-cols-3 gap-5", staggerClass)}>
                  <div className="lg:col-span-2"><DailySectorChart /></div>
                  <DashboardAlertsPanel alerts={alerts} />
                </div>
              );
              break;
            case "alerts":
              return acc; // Rendered with chart
            case "positions":
              el = <div key={w.id} className={staggerClass}><DashboardPositionsTable /></div>;
              break;
            case "risk":
              el = <div key={w.id} className={staggerClass}><RiskDashboardWidget /></div>;
              break;
            case "monthly":
              el = <div key={w.id} className={staggerClass}><DashboardMonthlyMetrics /></div>;
              break;
            case "actions":
              el = <div key={w.id} className={staggerClass}><QuickActions /></div>;
              break;
          }
          if (el) {
            acc.elements.push(el);
            acc.index++;
          }
          return acc;
        }, { elements: [], index: 0 }).elements}
      </div>
    </DashboardContext.Provider>
  );
}
