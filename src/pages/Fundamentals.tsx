import { useState, useMemo, useCallback } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { StockPopupCard } from "@/components/trade/StockPopupCard";
import {
  useFundamentals,
  type FundamentalData,
  type ScanFilter,
  formatMarketCap,
  formatPercent,
  formatRatio,
  formatCurrency,
} from "@/hooks/useFundamentals";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, X, BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
type SortKey = "market_cap" | "pe_ratio" | "pb_ratio" | "roe" | "dividend_yield" | "change" | "close" | "volume" | "rsi" | "net_margin" | "debt_to_equity";

type ScannerPreset = {
  id: string;
  label: string;
  description: string;
  filters: ScanFilter[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  group: "cap" | "fundamental" | "technical";
};

const SCANNER_PRESETS: ScannerPreset[] = [
  { id: "all", label: "All Stocks", description: "All NSE stocks by market cap", filters: [], group: "cap" },
  { id: "large_cap", label: "Large Cap", description: "Mkt cap > ₹20,000 Cr", filters: [{ field: "market_cap_basic", op: "greater", value: 2e11 }], group: "cap" },
  { id: "mid_cap", label: "Mid Cap", description: "₹5,000 – ₹20,000 Cr", filters: [{ field: "market_cap_basic", op: "greater", value: 5e10 }, { field: "market_cap_basic", op: "less", value: 2e11 }], group: "cap" },
  { id: "small_cap", label: "Small Cap", description: "Mkt cap < ₹5,000 Cr", filters: [{ field: "market_cap_basic", op: "greater", value: 1e9 }, { field: "market_cap_basic", op: "less", value: 5e10 }], group: "cap" },
  { id: "undervalued", label: "Undervalued", description: "Low P/E + Low P/B", filters: [{ field: "price_earnings_ttm", op: "greater", value: 0 }, { field: "price_earnings_ttm", op: "less", value: 20 }, { field: "price_book_ratio", op: "less", value: 3 }], sortBy: "pe_ratio", sortOrder: "asc", group: "fundamental" },
  { id: "growth", label: "High Growth", description: "ROE > 15%, Margin > 10%", filters: [{ field: "return_on_equity", op: "greater", value: 15 }, { field: "net_margin", op: "greater", value: 10 }], sortBy: "roe", sortOrder: "desc", group: "fundamental" },
  { id: "dividend", label: "Dividend", description: "Yield > 1%", filters: [{ field: "dividends_yield", op: "greater", value: 1 }], sortBy: "dividend_yield", sortOrder: "desc", group: "fundamental" },
  { id: "low_debt", label: "Low Debt", description: "D/E < 0.5, CR > 1.5", filters: [{ field: "debt_to_equity", op: "less", value: 0.5 }, { field: "debt_to_equity", op: "greater", value: 0 }, { field: "current_ratio", op: "greater", value: 1.5 }], sortBy: "debt_to_equity", sortOrder: "asc", group: "fundamental" },
  { id: "momentum", label: "Momentum", description: "+1M & +3M returns", filters: [{ field: "Perf.1M", op: "greater", value: 0 }, { field: "Perf.3M", op: "greater", value: 0 }], sortBy: "change", sortOrder: "desc", group: "technical" },
  { id: "oversold", label: "Oversold RSI", description: "RSI < 30", filters: [{ field: "RSI", op: "less", value: 30 }, { field: "RSI", op: "greater", value: 0 }], sortBy: "rsi", sortOrder: "asc", group: "technical" },
  { id: "overbought", label: "Overbought RSI", description: "RSI > 70", filters: [{ field: "RSI", op: "greater", value: 70 }], sortBy: "rsi", sortOrder: "desc", group: "technical" },
  { id: "high_volume", label: "Volume Spike", description: "Rel. vol > 2×", filters: [{ field: "relative_volume_10d_calc", op: "greater", value: 2 }], sortBy: "volume", sortOrder: "desc", group: "technical" },
  { id: "near_52w_high", label: "Near 52W High", description: "Within 5% of high", filters: [], sortBy: "change", sortOrder: "desc", group: "technical" },
];

const PRESET_GROUPS: { key: string; label: string }[] = [
  { key: "cap", label: "Market Cap" },
  { key: "fundamental", label: "Fundamental" },
  { key: "technical", label: "Technical" },
];

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

export default function Fundamentals() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("market_cap");
  const [sortAsc, setSortAsc] = useState(false);
  const [presetId, setPresetId] = useState("all");
  const [selectedStock, setSelectedStock] = useState<FundamentalData | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const preset = SCANNER_PRESETS.find((p) => p.id === presetId) ?? SCANNER_PRESETS[0];

  const { data: result, isLoading, isFetching } = useFundamentals({
    limit: pageSize,
    offset: page * pageSize,
    sortBy: preset.sortBy || sortKey,
    sortOrder: preset.sortOrder || (sortAsc ? "asc" : "desc"),
    filters: preset.filters,
  });

  const stocks = useMemo(() => {
    let list = result?.data ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.ticker?.toLowerCase().includes(q) ||
          s.name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.sector?.toLowerCase().includes(q) ||
          s.industry?.toLowerCase().includes(q)
      );
    }
    if (presetId === "near_52w_high") {
      list = list.filter(
        (s) => s.close != null && s.high_52w != null && s.high_52w > 0 && ((s.high_52w - s.close) / s.high_52w) * 100 < 5
      );
    }
    return list;
  }, [result, search, presetId]);

  const totalCount = result?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) { setSortAsc((a) => !a); return key; }
      setSortAsc(false);
      return key;
    });
    setPage(0);
  }, []);

  const handlePresetChange = useCallback((id: string) => {
    setPresetId(id);
    setPage(0);
    setSearch("");
  }, []);

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortAsc ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <SortIcon field={field} />
    </button>
  );

  // Pagination page numbers (up to 5 visible)
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    let start = Math.max(0, page - 2);
    let end = Math.min(totalPages - 1, start + 4);
    start = Math.max(0, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  return (
    <>
      <SEOHead title="Stock Scanner — TradeBook" description="Scan & screen NSE stocks by fundamentals, valuation, and technicals." />

      <div className="space-y-4">
        {/* ── Header Card ── */}
        <div className="rounded-2xl bg-card border border-border p-5 relative overflow-hidden">
          {/* Dot grid background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Stock Scanner</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono font-bold text-foreground">{totalCount.toLocaleString()}</span>
                  <span>NSE stocks</span>
                  <span className="text-muted-foreground/50">·</span>
                  <Badge variant="secondary" className="text-[10px] h-5">{preset.label}</Badge>
                </div>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search symbol, sector, industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-background"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Grouped Scanner Presets ── */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_GROUPS.map((group, gi) => (
            <div key={group.key} className="flex items-center gap-1 shrink-0">
              {gi > 0 && <div className="w-px h-5 bg-border mx-1.5 shrink-0" />}
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1 shrink-0">{group.label}</span>
              {SCANNER_PRESETS.filter((p) => p.group === group.key).map((p) => (
                <Button
                  key={p.id}
                  variant={presetId === p.id ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 text-[11px] rounded-full px-3 shrink-0 transition-all",
                    presetId === p.id && "shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                  )}
                  onClick={() => handlePresetChange(p.id)}
                  title={p.description}
                >
                  {p.id !== "all" && <Filter className="w-3 h-3 mr-1" />}
                  {p.label}
                </Button>
              ))}
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        ) : stocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <BarChart3 className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No stocks found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Try adjusting your filters or search query to find matching stocks.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden bg-card relative">
            {/* Loading progress bar */}
            {isFetching && (
              <div className="absolute top-0 left-0 right-0 z-20">
                <div className="h-0.5 bg-primary/20 overflow-hidden">
                  <div className="h-full bg-primary animate-pulse w-full origin-left" style={{ animation: "indeterminate 1.5s infinite linear" }} />
                </div>
              </div>
            )}
            <style>{`@keyframes indeterminate { 0% { transform: translateX(-100%) scaleX(0.3); } 50% { transform: translateX(0%) scaleX(0.5); } 100% { transform: translateX(100%) scaleX(0.3); } }`}</style>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-card border-b-2 border-border sticky top-0 z-10">
                    <TableHead className="w-[180px] sticky left-0 bg-card z-20 py-2.5 px-3">Symbol</TableHead>
                    <TableHead className="hidden md:table-cell py-2.5 px-3">Sector</TableHead>
                    <TableHead className="text-right py-2.5 px-3"><SortHeader label="LTP" field="close" /></TableHead>
                    <TableHead className="text-right py-2.5 px-3"><SortHeader label="Chg%" field="change" /></TableHead>
                    <TableHead className="text-right hidden sm:table-cell py-2.5 px-3"><SortHeader label="Vol" field="volume" /></TableHead>
                    <TableHead className="text-right hidden sm:table-cell py-2.5 px-3"><SortHeader label="Mkt Cap" field="market_cap" /></TableHead>
                    <TableHead className="text-right hidden lg:table-cell py-2.5 px-3"><SortHeader label="P/E" field="pe_ratio" /></TableHead>
                    <TableHead className="text-right hidden lg:table-cell py-2.5 px-3"><SortHeader label="P/B" field="pb_ratio" /></TableHead>
                    <TableHead className="text-right hidden xl:table-cell py-2.5 px-3"><SortHeader label="ROE" field="roe" /></TableHead>
                    <TableHead className="text-right hidden xl:table-cell py-2.5 px-3"><SortHeader label="Net Mgn" field="net_margin" /></TableHead>
                    <TableHead className="text-right hidden xl:table-cell py-2.5 px-3"><SortHeader label="D/E" field="debt_to_equity" /></TableHead>
                    <TableHead className="text-right hidden xl:table-cell py-2.5 px-3"><SortHeader label="Div%" field="dividend_yield" /></TableHead>
                    <TableHead className="text-right hidden xl:table-cell py-2.5 px-3"><SortHeader label="RSI" field="rsi" /></TableHead>
                    <TableHead className="text-right hidden 2xl:table-cell py-2.5 px-3">52W High</TableHead>
                    <TableHead className="text-right hidden 2xl:table-cell py-2.5 px-3">52W Low</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((s, idx) => {
                    const isPos = (s.change ?? 0) >= 0;
                    const rsiColor = s.rsi != null ? (s.rsi > 70 ? "text-loss" : s.rsi < 30 ? "text-profit" : "") : "";
                    return (
                      <TableRow
                        key={s.ticker}
                        className={cn(
                          "cursor-pointer hover:bg-muted/40 transition-colors border-b border-border/50",
                          idx % 2 === 1 && "bg-muted/20"
                        )}
                        onClick={() => setSelectedStock(s)}
                      >
                        <TableCell className="sticky left-0 z-10 py-2.5 px-3" style={{ backgroundColor: idx % 2 === 1 ? "hsl(var(--muted) / 0.2)" : "hsl(var(--card))" }}>
                          <div>
                            <p className="font-bold text-sm text-foreground">{s.ticker?.replace("NSE:", "")}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{s.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-2.5 px-3">
                          {s.sector && <Badge variant="secondary" className="text-[10px] font-normal">{s.sector}</Badge>}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-sm py-2.5 px-3">{formatCurrency(s.close)}</TableCell>
                        <TableCell className="text-right py-2.5 px-3">
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-mono font-medium",
                            isPos ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isPos ? "bg-profit" : "bg-loss")} />
                            {formatPercent(s.change)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell py-2.5 px-3 font-mono">
                          {s.volume != null ? (s.volume >= 1e7 ? `${(s.volume / 1e7).toFixed(1)}Cr` : s.volume >= 1e5 ? `${(s.volume / 1e5).toFixed(1)}L` : s.volume >= 1e3 ? `${(s.volume / 1e3).toFixed(0)}K` : s.volume) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell py-2.5 px-3 font-mono">{formatMarketCap(s.market_cap)}</TableCell>
                        <TableCell className="text-right text-xs hidden lg:table-cell py-2.5 px-3 font-mono">{formatRatio(s.pe_ratio)}</TableCell>
                        <TableCell className="text-right text-xs hidden lg:table-cell py-2.5 px-3 font-mono">{formatRatio(s.pb_ratio)}</TableCell>
                        <TableCell className="text-right text-xs hidden xl:table-cell py-2.5 px-3 font-mono">
                          <span className={cn(s.roe != null && s.roe > 0 ? "text-profit" : "text-loss")}>{formatPercent(s.roe)}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs hidden xl:table-cell py-2.5 px-3 font-mono">
                          <span className={cn(s.net_margin != null && s.net_margin > 0 ? "text-profit" : "text-loss")}>{formatPercent(s.net_margin)}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs hidden xl:table-cell py-2.5 px-3 font-mono">{formatRatio(s.debt_to_equity)}</TableCell>
                        <TableCell className="text-right text-xs hidden xl:table-cell py-2.5 px-3 font-mono">{s.dividend_yield != null ? `${s.dividend_yield.toFixed(2)}%` : "—"}</TableCell>
                        <TableCell className={cn("text-right text-xs hidden xl:table-cell py-2.5 px-3 font-mono", rsiColor)}>
                          {s.rsi != null ? s.rsi.toFixed(1) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs hidden 2xl:table-cell py-2.5 px-3 font-mono">{formatCurrency(s.high_52w)}</TableCell>
                        <TableCell className="text-right text-xs hidden 2xl:table-cell py-2.5 px-3 font-mono">{formatCurrency(s.low_52w)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── Pagination Footer ── */}
        <div className="rounded-xl bg-card border border-border p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Rows:</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}>
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="hidden sm:inline text-muted-foreground">
              Showing <span className="font-medium text-foreground">{page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)}</span> of <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground/50 hidden sm:inline">·</span>
            <Badge variant="outline" className="text-[9px] h-4 hidden sm:inline-flex text-muted-foreground font-normal">
              TradingView · 5 min cache
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {pageNumbers.map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
                size="icon"
                className={cn("h-7 w-7 text-xs", p === page && "shadow-sm")}
                onClick={() => setPage(p)}
              >
                {p + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <StockPopupCard open={!!selectedStock} onOpenChange={(o) => !o && setSelectedStock(null)} stock={selectedStock} />
    </>
  );
}
