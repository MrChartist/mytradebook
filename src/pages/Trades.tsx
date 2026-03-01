import { useState, useMemo, useEffect, useCallback } from "react";
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
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const [csvImportOpen, setCsvImportOpen] = useState(false);

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
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Trades</h1>
          <p className="text-sm text-muted-foreground">Track and manage your positions</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className={cn("border-border", bulkMode && "bg-primary/10 border-primary/30")}
            onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
          >
            <CheckSquare className="w-4 h-4 mr-1.5" />
            {bulkMode ? "Exit Bulk" : "Bulk"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { syncPortfolio.mutate(); monitorTrades.mutate(); }}
            disabled={isSyncing}
          >
            {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStrategyModalOpen(true)}>
            <Layers className="w-4 h-4 mr-2" />
            Multi-Leg
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          role="button"
          tabIndex={0}
          className="premium-card-hover !p-5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => { setSortBy("pnl_high"); setStatusFilter("ALL"); setActiveStatFilter("Total P&L"); }}
          onKeyDown={(e) => { if (e.key === "Enter") { setSortBy("pnl_high"); setStatusFilter("ALL"); setActiveStatFilter("Total P&L"); } }}
          aria-label="Sort by Total P&L"
        >
          <div className="absolute -top-3 -right-3 w-14 h-14 dot-pattern opacity-30 rounded-bl-2xl" />
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total P&L</p>
          {isLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
            <p className={cn("text-2xl font-bold font-mono mt-1", summary.totalPnl >= 0 ? "text-profit" : "text-loss")}>
              {summary.totalPnl >= 0 ? "+" : ""}₹{summary.totalPnl.toLocaleString()}
            </p>
          )}
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
            <>
              <p className="text-2xl font-bold font-mono text-warning mt-1">{summary.winRate.toFixed(1)}%</p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">
                  {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Status Tabs + Filters + Sort + View */}
      <div className="space-y-3">
        <div className="flex gap-1 flex-wrap">
          {(["ALL", "PENDING", "OPEN", "CLOSED", "CANCELLED"] as StatusFilter[]).map((status) => (
            <Button
              key={status}
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "border-border text-xs h-7",
                statusFilter === status && (
                  status === "ALL" ? "bg-primary/10 border-primary/20 text-primary" :
                  statusConfig[status]?.color
                )
              )}
            >
              {status === "ALL" ? "All" : statusConfig[status]?.label}
              <span className="ml-1 text-muted-foreground">({statusCounts[status]})</span>
            </Button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search trades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <div className="flex gap-2 items-center flex-wrap">
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
        <div className={cn(
          viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-2"
        )}>
          {sortedTrades.map((trade) => {
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

            return (
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
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="No trades found"
          description="Start tracking your trades to build your journal and improve your edge."
          createLabel="Add Trade"
          onCreate={() => setCreateModalOpen(true)}
        />
      )}

      <CreateTradeModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <TradeDetailModal trade={selectedTrade} open={!!selectedTrade} onOpenChange={(open) => !open && setSelectedTrade(null)} />
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
        description={`Are you sure you want to delete the trade for "${tradeToDelete?.symbol}"? This action cannot be undone.`}
      />
      <CsvImportModal
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onImportComplete={() => {}}
      />
    </div>
  );
}
