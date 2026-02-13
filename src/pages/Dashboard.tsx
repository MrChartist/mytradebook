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
import { Radio } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

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
  const openSymbols = useMemo(() => openTrades.map((t) => t.symbol), [openTrades]);
  const { prices, isPolling, lastUpdated } = useLivePrices(openSymbols, 30000);

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
              {isPolling && openSymbols.length > 0 ? (
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

        {/* KPI Cards */}
        <DashboardKPICards alerts={alerts} />

        {/* Main Chart + Alerts Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <DailySectorChart />
          </div>
          <DashboardAlertsPanel alerts={alerts} />
        </div>

        {/* Open Positions */}
        <DashboardPositionsTable />

        {/* Monthly Metrics */}
        <DashboardMonthlyMetrics />

        <QuickActions />
      </div>
    </DashboardContext.Provider>
  );
}
