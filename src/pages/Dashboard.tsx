import { useState, useMemo, createContext, useContext } from "react";
import { DashboardKPICards } from "@/components/dashboard/DashboardKPICards";
import { DailySectorChart } from "@/components/dashboard/DailySectorChart";
import { DashboardAlertsPanel } from "@/components/dashboard/DashboardAlertsPanel";
import { DashboardPositionsTable } from "@/components/dashboard/DashboardPositionsTable";
import { DashboardMonthlyMetrics } from "@/components/dashboard/DashboardMonthlyMetrics";
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
export const useDashboard = () => useContext(DashboardContext)!;

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
  const openTrades = useMemo(() => trades.filter((t) => t.status === "OPEN"), [trades]);
  const openInstruments = useMemo(() => openTrades.map((t) => ({
    symbol: t.symbol, security_id: t.security_id, exchange_segment: t.exchange_segment,
  })), [openTrades]);
  const { prices, isPolling, lastUpdated } = useLivePrices(openInstruments, 30000);

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
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              {format(selectedMonth, "MMMM yyyy")} overview
            </p>
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
        {widgets.map((w) => {
          if (!w.visible) return null;
          switch (w.id) {
            case "kpi":
              return <DashboardKPICards key={w.id} alerts={alerts} />;
            case "chart":
              return (
                <div key={w.id} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2"><DailySectorChart /></div>
                  <DashboardAlertsPanel alerts={alerts} />
                </div>
              );
            case "alerts":
              return null; // Rendered with chart
            case "positions":
              return <DashboardPositionsTable key={w.id} />;
            case "monthly":
              return <DashboardMonthlyMetrics key={w.id} />;
            case "actions":
              return <QuickActions key={w.id} />;
            default:
              return null;
          }
        })}
      </div>
    </DashboardContext.Provider>
  );
}
