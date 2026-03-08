import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SwipeableTradeRow } from "@/components/trade/SwipeableTradeRow";
import { useSearchParams } from "react-router-dom";
import {
  TrendingUp,
  Plus,
  Search,
  Eye,
  Loader2,
  RefreshCw,
  Radio,
  Layers,
  CheckSquare,
  X,
  Bookmark,
  Trash2,
  XCircle,
  Upload,
  Download,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useTrades, type TradeFilters } from "@/hooks/useTrades";
import { useTradeTemplates } from "@/hooks/useTradeTemplates";
import { CreateTradeModal } from "@/components/modals/CreateTradeModal";
import { TradeDetailModal } from "@/components/modals/TradeDetailModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { useDhanIntegration } from "@/hooks/useDhanIntegration";
import { useLivePrices } from "@/hooks/useLivePrices";
import { MultiLegStrategyModal } from "@/components/trade/MultiLegStrategyModal";
import { TradeStatus } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { Trade } from "@/hooks/useTrades";
import { InsightCard, type InsightCardAction } from "@/components/ui/insight-card";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { SortSelect, type SortOption } from "@/components/ui/sort-select";
import { EmptyState } from "@/components/ui/empty-state";
import { CsvImportModal } from "@/components/trade/CsvImportModal";
import { tradesToCSV, downloadCSV } from "@/lib/csv-export";
import { Sparkline } from "@/components/ui/sparkline";
import { subDays, startOfDay, format } from "date-fns";

const segmentLabels: Record<string, string> = {
  Equity_Intraday: "Intraday",
  Equity_Positional: "Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "MCX",
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  PENDING: { label: "Planned", color: "text-warning bg-warning/10", dot: "bg-warning" },
  OPEN: { label: "Open", color: "text-profit bg-profit/10", dot: "bg-profit" },
  CLOSED: { label: "Closed", color: "text-muted-foreground bg-muted", dot: "bg-muted-foreground" },
  CANCELLED: { label: "Cancelled", color: "text-destructive bg-destructive/10", dot: "bg-destructive" },
};

type StatusFilter = "ALL" | "PENDING" | "OPEN" | "CLOSED" | "CANCELLED";

const sortOptions: SortOption[] = [
  { value: "latest", label: "Latest First" },
  { value: "pnl_high", label: "Highest P&L" },
  { value: "pnl_low", label: "Lowest P&L" },
  { value: "symbol", label: "Symbol A–Z" },
];

export default function Trades() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus && ["PENDING", "OPEN", "CLOSED", "CANCELLED"].includes(urlStatus)) {
      return urlStatus as StatusFilter;
    }
    return "ALL";
  });
  const [segmentFilter, setSegmentFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState("latest");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [duplicateData, setDuplicateData] = useState<Partial<Trade> | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const TRADES_PER_PAGE = 25;

  const filters: TradeFilters = {
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(segmentFilter !== "ALL" && { segment: segmentFilter as TradeFilters["segment"] }),
    ...(searchQuery && { symbol: searchQuery }),
  };

  const { trades, isLoading, summary, closeTrade, updateTrade, deleteTrade } = useTrades(filters);
  const { syncPortfolio, monitorTrades, isSyncing } = useDhanIntegration();
  const { templates } = useTradeTemplates();

  const { trades: allTrades } = useTrades();
  const statusCounts = useMemo(() => ({
    ALL: allTrades.length,
    PENDING: allTrades.filter(t => t.status === "PENDING").length,
    OPEN: allTrades.filter(t => t.status === "OPEN").length,
    CLOSED: allTrades.filter(t => t.status === "CLOSED").length,
    CANCELLED: allTrades.filter(t => t.status === "CANCELLED").length,
  }), [allTrades]);

  // Compute last 7 days sparkline data for P&L and Win Rate
  const { pnlSparkline, winRateSparkline } = useMemo(() => {
    const closedAll = allTrades.filter(t => t.status === "CLOSED");
    const days = 7;
    const pnlData: number[] = [];
    const wrData: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = startOfDay(subDays(new Date(), i));
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      const dayTrades = closedAll.filter(t => {
        const d = new Date(t.closed_at || t.entry_time);
        return d >= dayStart && d <= dayEnd;
      });
      pnlData.push(dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
      const wins = dayTrades.filter(t => (t.pnl || 0) > 0).length;
      wrData.push(dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0);
    }
    // Make P&L cumulative for a more meaningful sparkline
    const cumPnl = pnlData.reduce<number[]>((acc, v) => {
      acc.push((acc.length ? acc[acc.length - 1] : 0) + v);
      return acc;
    }, []);
    return { pnlSparkline: cumPnl, winRateSparkline: wrData };
  }, [allTrades]);

  const sortedTrades = useMemo(() => {
    let list = [...trades];
    switch (sortBy) {
      case "pnl_high": list.sort((a, b) => (b.pnl || 0) - (a.pnl || 0)); break;
      case "pnl_low": list.sort((a, b) => (a.pnl || 0) - (b.pnl || 0)); break;
      case "symbol": list.sort((a, b) => a.symbol.localeCompare(b.symbol)); break;
      default: list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
    return list;
  }, [trades, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedTrades.length / TRADES_PER_PAGE));
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * TRADES_PER_PAGE;
    return sortedTrades.slice(start, start + TRADES_PER_PAGE);
  }, [sortedTrades, currentPage, TRADES_PER_PAGE]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [statusFilter, segmentFilter, searchQuery, sortBy]);

  const openTradeInstruments = useMemo(() => trades.filter(t => t.status === TradeStatus.OPEN).map(t => ({
    symbol: t.symbol,
    security_id: t.security_id,
    exchange_segment: t.exchange_segment,
  })), [trades]);
  const { prices, isPolling, lastUpdated } = useLivePrices(openTradeInstruments);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === trades.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(trades.map((t) => t.id)));
    }
  };

  const bulkCancel = async () => {
    for (const id of selectedIds) {
      await updateTrade.mutateAsync({ id, status: "CANCELLED" });
    }
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} trades cancelled`);
  };

  const bulkClose = async () => {
    let closed = 0;
    for (const id of selectedIds) {
      const trade = trades.find((t) => t.id === id);
      if (!trade || trade.status !== "OPEN") continue;
      const exitPrice = prices[trade.symbol]?.ltp || trade.current_price || trade.entry_price || 0;
      if (exitPrice > 0) {
        await closeTrade.mutateAsync({ id, exitPrice, closureReason: "Bulk close" });
        closed++;
      }
    }
    setSelectedIds(new Set());
    toast.success(`${closed} trades closed at market price`);
  };

  return (
    <div className="space-y-4 animate-fade-in" role="region" aria-label="Trade management">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">Trades</h1>
          <p className="text-[13px] text-muted-foreground/70 leading-relaxed">Track and manage your positions</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { syncPortfolio.mutate(); monitorTrades.mutate(); }}
            disabled={isSyncing}
          >
            {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync
          </Button>
          {templates.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Bookmark className="w-4 h-4 mr-1.5" />
                  Templates
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {templates.map((t) => (
                  <DropdownMenuItem key={t.id} onClick={() => setCreateModalOpen(true)}>
                    <Bookmark className="w-3.5 h-3.5 mr-2 text-primary" />
                    {t.name}
                    <span className="ml-auto text-[10px] text-muted-foreground">{t.segment}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" size="sm" onClick={() => setCsvImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csv = tradesToCSV(sortedTrades);
              downloadCSV(csv, `trades-${new Date().toISOString().slice(0, 10)}.csv`);
              toast.success(`Exported ${sortedTrades.length} trades`);
            }}
            disabled={sortedTrades.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Trade
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={bulkCancel}>
              <X className="w-3 h-3 mr-1" /> Cancel Selected
            </Button>
            <Button size="sm" className="h-7 text-xs bg-loss hover:bg-loss/90 text-loss-foreground" onClick={bulkClose}>
              Close at Market
            </Button>
          </div>
        </div>
      )}

      {/* Active filter chip */}
      {activeStatFilter && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs gap-1 border-primary/30 text-primary"
            onClick={() => {
              setActiveStatFilter(null);
              setStatusFilter("ALL");
              setSortBy("latest");
            }}
          >
            {activeStatFilter}
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Stats — collapsible on mobile */}
      <div>
        {isMobile && (
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2 w-full"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {showStats ? "Hide Stats" : "Show Stats"}
            {showStats ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
          </button>
        )}
        {(showStats || !isMobile) && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5" aria-live="polite" aria-label="Trade statistics">
            <div
              role="button"
              tabIndex={0}
              className="premium-card-hover !p-5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => { setSortBy("pnl_high"); setStatusFilter("ALL"); setActiveStatFilter("Total P&L"); }}
              onKeyDown={(e) => { if (e.key === "Enter") { setSortBy("pnl_high"); setStatusFilter("ALL"); setActiveStatFilter("Total P&L"); } }}
              aria-label="Sort by Total P&L"
            >
              <div className="absolute -top-3 -right-3 w-14 h-14 dot-pattern opacity-30 rounded-bl-2xl" />
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total P&L</p>
                  {isLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                    <p className={cn("text-2xl font-bold font-mono mt-1", summary.totalPnl >= 0 ? "text-profit" : "text-loss")}>
                      {summary.totalPnl >= 0 ? "+" : ""}₹{summary.totalPnl.toLocaleString()}
                    </p>
                  )}
                </div>
                {!isLoading && <Sparkline data={pnlSparkline} width={64} height={28} fill />}
              </div>
            </div>
            <div
              role="button"
              tabIndex={0}
              className="premium-card-hover !p-5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => { setStatusFilter("OPEN"); setActiveStatFilter("Open"); }}
              onKeyDown={(e) => { if (e.key === "Enter") { setStatusFilter("OPEN"); setActiveStatFilter("Open"); } }}
              aria-label="Filter to Open trades"
            >
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Open</p>
              {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                <p className="text-2xl font-bold font-mono text-profit mt-1">{statusCounts.OPEN}</p>
              )}
            </div>
            <div
              role="button"
              tabIndex={0}
              className="premium-card-hover !p-5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => { setStatusFilter("PENDING"); setActiveStatFilter("Planned"); }}
              onKeyDown={(e) => { if (e.key === "Enter") { setStatusFilter("PENDING"); setActiveStatFilter("Planned"); } }}
              aria-label="Filter to Planned trades"
            >
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Planned</p>
              {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                <p className="text-2xl font-bold font-mono text-warning mt-1">{statusCounts.PENDING}</p>
              )}
            </div>
            <div
              role="button"
              tabIndex={0}
              className="premium-card-hover !p-5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => { setStatusFilter("CLOSED"); setActiveStatFilter("Closed Today"); }}
              onKeyDown={(e) => { if (e.key === "Enter") { setStatusFilter("CLOSED"); setActiveStatFilter("Closed Today"); } }}
              aria-label="Filter to Closed trades"
            >
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Closed Today</p>
              {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                <p className="text-2xl font-bold font-mono mt-1">{summary.closedToday}</p>
              )}
            </div>
            <div
              role="button"
              tabIndex={0}
              className="premium-card-hover !p-5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => { setStatusFilter("CLOSED"); setActiveStatFilter("Win Rate"); }}
              onKeyDown={(e) => { if (e.key === "Enter") { setStatusFilter("CLOSED"); setActiveStatFilter("Win Rate"); } }}
              aria-label="Filter to show Win Rate"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Win Rate</p>
                {isPolling && openTradeInstruments.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-profit">
                    <Radio className="w-3 h-3 animate-pulse" /> Live
                  </span>
                )}
              </div>
              {isLoading ? <Skeleton className="h-8 w-20 mt-1" /> : (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold font-mono text-warning mt-1">{summary.winRate.toFixed(1)}%</p>
                    {lastUpdated && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                  <Sparkline data={winRateSparkline} width={64} height={28} color="hsl(var(--warning))" fill />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Tabs + Filters + Sort + View */}
      <div className="space-y-3">
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {(["ALL", "PENDING", "OPEN", "CLOSED", "CANCELLED"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1 text-[11px] font-medium rounded-md border transition-all duration-200 shrink-0",
                statusFilter === status
                  ? "border-primary/15 bg-primary/6 text-primary"
                  : "border-border/15 text-muted-foreground/50 hover:text-foreground hover:border-border/30"
              )}
            >
              {status === "ALL" ? "All" : statusConfig[status]?.label} ({statusCounts[status]})
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
            <Input
              placeholder="Search trades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-[13px] bg-muted/20 border-border/20 focus:border-primary/30"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {/* Segment filter: Select on mobile, buttons on desktop */}
            {isMobile ? (
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="h-7 text-xs rounded-lg border border-border bg-card px-2 text-foreground"
              >
                <option value="ALL">All Segments</option>
                {Object.entries(segmentLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            ) : (
              <div className="flex gap-1">
                {[{ key: "ALL", label: "All Segments" }, ...Object.entries(segmentLabels).map(([key, label]) => ({ key, label }))].map((seg) => (
                  <Button
                    key={seg.key}
                    variant="outline"
                    size="sm"
                    onClick={() => setSegmentFilter(seg.key)}
                    className={cn(
                      "border-border text-xs h-7",
                      segmentFilter === seg.key && "bg-primary/10 border-primary/20 text-primary"
                    )}
                  >
                    {seg.label}
                  </Button>
                ))}
              </div>
            )}
            <SortSelect value={sortBy} onValueChange={setSortBy} options={sortOptions} />
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>
      </div>

      {/* Trades Grid/List */}
      {isLoading ? (
        <div className={cn(
          viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-2"
        )}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} className={viewMode === "grid" ? "h-52" : "h-16"} />)}
        </div>
      ) : sortedTrades.length > 0 ? (
        <>
        <div className={cn(
          viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-2"
        )}>
          {paginatedTrades.map((trade) => {
            const targets = (trade.targets as number[]) || [];
            const sc = statusConfig[trade.status || "PENDING"];
            const livePrice = prices[trade.symbol];
            const currentLtp = livePrice?.ltp || trade.current_price || undefined;
            const dayChange = livePrice?.changePercent;

            const levels = [
              ...(trade.entry_price ? [{ label: "Entry", value: trade.entry_price }] : []),
              ...(trade.stop_loss ? [{ label: "SL", value: trade.stop_loss, color: "text-loss" }] : []),
              ...(targets.length > 0 ? [{ label: `T1${targets.length > 1 ? `–T${targets.length}` : ""}`, value: targets[0], color: "text-profit" }] : []),
            ];

            let potentialPercent: number | undefined;
            let riskReward: string | undefined;
            if (trade.entry_price && targets.length > 0) {
              const reward = Math.abs(targets[0] - trade.entry_price);
              potentialPercent = (reward / trade.entry_price) * 100 * (trade.trade_type === "BUY" ? 1 : -1);
              if (trade.stop_loss) {
                const risk = Math.abs(trade.entry_price - trade.stop_loss);
                if (risk > 0) riskReward = `1:${(reward / risk).toFixed(1)}`;
              }
            }

            const entryDate = new Date(trade.entry_time);

            const menuActions: InsightCardAction[] = [
              { label: "View Details", icon: Eye, onClick: () => setSelectedTrade(trade) },
              ...(trade.status === "CANCELLED" ? [] : [
                { label: "Cancel", icon: XCircle, onClick: () => updateTrade.mutate({ id: trade.id, status: "CANCELLED" }), variant: "destructive" as const },
              ]),
              { label: "Delete", icon: Trash2, onClick: () => { setTradeToDelete(trade); setDeleteModalOpen(true); }, variant: "destructive" as const },
            ];

            return isMobile && viewMode === "list" ? (
              <SwipeableTradeRow
                key={trade.id}
                onView={() => setSelectedTrade(trade)}
                onClose={trade.status === "OPEN" ? () => {
                  const exitPrice = prices[trade.symbol]?.ltp || trade.current_price || trade.entry_price || 0;
                  if (exitPrice > 0) closeTrade.mutate({ id: trade.id, exitPrice, closureReason: "Swipe close" });
                } : undefined}
              >
                <InsightCard
                  symbol={trade.symbol}
                  direction={trade.trade_type as "BUY" | "SELL"}
                  ltp={currentLtp}
                  dayChangePercent={dayChange}
                  typeLabel={segmentLabels[trade.segment] || trade.segment}
                  typeColor={trade.trade_type === "BUY" ? "text-profit bg-profit/10" : "text-loss bg-loss/10"}
                  status={sc?.label || trade.status || "Planned"}
                  statusColor={sc?.color}
                  levels={levels}
                  potentialPercent={potentialPercent}
                  riskReward={riskReward}
                  pnl={trade.pnl ?? undefined}
                  pnlPercent={trade.pnl_percent ?? undefined}
                  subtitle={`Qty: ${trade.quantity}`}
                  timestamp={entryDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                  notes={trade.notes || undefined}
                  onView={() => setSelectedTrade(trade)}
                  menuActions={menuActions}
                  viewMode={viewMode}
                />
              </SwipeableTradeRow>
            ) : (
              <InsightCard
                key={trade.id}
                symbol={trade.symbol}
                direction={trade.trade_type as "BUY" | "SELL"}
                ltp={currentLtp}
                dayChangePercent={dayChange}
                typeLabel={segmentLabels[trade.segment] || trade.segment}
                typeColor={trade.trade_type === "BUY" ? "text-profit bg-profit/10" : "text-loss bg-loss/10"}
                status={sc?.label || trade.status || "Planned"}
                statusColor={sc?.color}
                levels={levels}
                potentialPercent={potentialPercent}
                riskReward={riskReward}
                pnl={trade.pnl ?? undefined}
                pnlPercent={trade.pnl_percent ?? undefined}
                subtitle={`Qty: ${trade.quantity}`}
                timestamp={entryDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                notes={trade.notes || undefined}
                onView={() => setSelectedTrade(trade)}
                menuActions={menuActions}
                viewMode={viewMode}
              />
            );
          })}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-5 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * TRADES_PER_PAGE + 1}–{Math.min(currentPage * TRADES_PER_PAGE, sortedTrades.length)} of {sortedTrades.length}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 text-xs px-3" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                return (
                  <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" className="h-8 w-8 text-xs p-0" onClick={() => setCurrentPage(page)}>{page}</Button>
                );
              })}
              <Button variant="outline" size="sm" className="h-8 text-xs px-3" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
        </>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="No trades yet"
          description="Start logging your trades to build a journal and uncover your trading edge."
          createLabel="Log Your First Trade"
          onCreate={() => setCreateModalOpen(true)}
          steps={["Add entry details", "Set SL & targets", "Review after close"]}
          hint="You can also import trades via CSV or auto-sync from Dhan"
        />
      )}

      <CreateTradeModal
        open={createModalOpen}
        onOpenChange={(open) => {
          setCreateModalOpen(open);
          if (!open) setDuplicateData(null);
        }}
        initialData={duplicateData}
      />
      <TradeDetailModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onOpenChange={(open) => !open && setSelectedTrade(null)}
        onDuplicate={(data) => {
          setDuplicateData(data);
          setCreateModalOpen(true);
        }}
      />
      <MultiLegStrategyModal open={strategyModalOpen} onOpenChange={setStrategyModalOpen} />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={async () => {
          if (tradeToDelete) {
            await deleteTrade.mutateAsync(tradeToDelete.id);
            setDeleteModalOpen(false);
            setTradeToDelete(null);
          }
        }}
        isLoading={deleteTrade.isPending}
        title="Delete Trade"
        description={`Are you sure you want to remove the trade for "${tradeToDelete?.symbol}"? It will be marked as cancelled.`}
      />
      <CsvImportModal
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onImportComplete={() => {}}
      />
    </div>
  );
}
