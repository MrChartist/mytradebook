import { useState, useMemo, useCallback } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Search, TrendingUp, TrendingDown, Filter, ArrowUpDown, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
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
};

const SCANNER_PRESETS: ScannerPreset[] = [
  {
    id: "all",
    label: "All Stocks",
    description: "All NSE stocks by market cap",
    filters: [],
  },
  {
    id: "large_cap",
    label: "Large Cap",
    description: "Market cap > ₹20,000 Cr",
    filters: [{ field: "market_cap_basic", op: "greater", value: 2e11 }],
  },
  {
    id: "mid_cap",
    label: "Mid Cap",
    description: "₹5,000 – ₹20,000 Cr",
    filters: [
      { field: "market_cap_basic", op: "greater", value: 5e10 },
      { field: "market_cap_basic", op: "less", value: 2e11 },
    ],
  },
  {
    id: "small_cap",
    label: "Small Cap",
    description: "Market cap < ₹5,000 Cr",
    filters: [
      { field: "market_cap_basic", op: "greater", value: 1e9 },
      { field: "market_cap_basic", op: "less", value: 5e10 },
    ],
  },
  {
    id: "undervalued",
    label: "Undervalued",
    description: "Low P/E + Low P/B",
    filters: [
      { field: "price_earnings_ttm", op: "greater", value: 0 },
      { field: "price_earnings_ttm", op: "less", value: 20 },
      { field: "price_book_ratio", op: "less", value: 3 },
    ],
    sortBy: "pe_ratio",
    sortOrder: "asc",
  },
  {
    id: "growth",
    label: "High Growth",
    description: "ROE > 15%, Net Margin > 10%",
    filters: [
      { field: "return_on_equity", op: "greater", value: 15 },
      { field: "net_margin", op: "greater", value: 10 },
    ],
    sortBy: "roe",
    sortOrder: "desc",
  },
  {
    id: "dividend",
    label: "Dividend",
    description: "Yield > 1%",
    filters: [{ field: "dividends_yield", op: "greater", value: 1 }],
    sortBy: "dividend_yield",
    sortOrder: "desc",
  },
  {
    id: "momentum",
    label: "Momentum",
    description: "Positive 1M & 3M performance",
    filters: [
      { field: "Perf.1M", op: "greater", value: 0 },
      { field: "Perf.3M", op: "greater", value: 0 },
    ],
    sortBy: "change",
    sortOrder: "desc",
  },
  {
    id: "oversold",
    label: "Oversold RSI",
    description: "RSI < 30",
    filters: [
      { field: "RSI", op: "less", value: 30 },
      { field: "RSI", op: "greater", value: 0 },
    ],
    sortBy: "rsi",
    sortOrder: "asc",
  },
  {
    id: "overbought",
    label: "Overbought RSI",
    description: "RSI > 70",
    filters: [{ field: "RSI", op: "greater", value: 70 }],
    sortBy: "rsi",
    sortOrder: "desc",
  },
  {
    id: "high_volume",
    label: "Volume Spike",
    description: "Relative volume > 2x",
    filters: [{ field: "relative_volume_10d_calc", op: "greater", value: 2 }],
    sortBy: "volume",
    sortOrder: "desc",
  },
  {
    id: "low_debt",
    label: "Low Debt",
    description: "D/E < 0.5 & Current Ratio > 1.5",
    filters: [
      { field: "debt_to_equity", op: "less", value: 0.5 },
      { field: "debt_to_equity", op: "greater", value: 0 },
      { field: "current_ratio", op: "greater", value: 1.5 },
    ],
    sortBy: "debt_to_equity",
    sortOrder: "asc",
  },
  {
    id: "near_52w_high",
    label: "Near 52W High",
    description: "Within 5% of 52-week high",
    filters: [],
    sortBy: "change",
    sortOrder: "desc",
  },
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

    // Client-side search filter
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

    // Near 52W high special filter (client-side)
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
      if (prev === key) {
        setSortAsc((a) => !a);
        return key;
      }
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

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className={cn("w-3 h-3", sortKey === field && "text-primary")} />
    </button>
  );

  return (
    <>
      <SEOHead title="Stock Scanner — TradeBook" description="Scan & screen NSE stocks by fundamentals, valuation, and technicals." />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              Stock Scanner
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalCount.toLocaleString()} NSE stocks · {preset.label}
              {preset.description !== preset.label && ` · ${preset.description}`}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search symbol, sector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scanner Presets */}
        <div className="flex gap-1.5 flex-wrap">
          {SCANNER_PRESETS.map((p) => (
            <Button
              key={p.id}
              variant={presetId === p.id ? "default" : "outline"}
              size="sm"
              className="h-7 text-[11px] rounded-full px-3"
              onClick={() => handlePresetChange(p.id)}
            >
              {p.id !== "all" && <Filter className="w-3 h-3 mr-1" />}
              {p.label}
            </Button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No stocks match your filters.
          </div>
        ) : (
          <div className={cn("rounded-xl border border-border overflow-hidden", isFetching && "opacity-70 transition-opacity")}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[180px] sticky left-0 bg-muted/30 z-10">Symbol</TableHead>
                    <TableHead className="hidden md:table-cell">Sector</TableHead>
                    <TableHead className="text-right"><SortHeader label="LTP" field="close" /></TableHead>
                    <TableHead className="text-right"><SortHeader label="Chg%" field="change" /></TableHead>
                    <TableHead className="text-right hidden sm:table-cell"><SortHeader label="Vol" field="volume" /></TableHead>
                    <TableHead className="text-right hidden sm:table-cell"><SortHeader label="Mkt Cap" field="market_cap" /></TableHead>
                    <TableHead className="text-right hidden lg:table-cell"><SortHeader label="P/E" field="pe_ratio" /></TableHead>
                    <TableHead className="text-right hidden lg:table-cell"><SortHeader label="P/B" field="pb_ratio" /></TableHead>
                    <TableHead className="text-right hidden xl:table-cell"><SortHeader label="ROE" field="roe" /></TableHead>
                    <TableHead className="text-right hidden xl:table-cell"><SortHeader label="Net Mgn" field="net_margin" /></TableHead>
                    <TableHead className="text-right hidden xl:table-cell"><SortHeader label="D/E" field="debt_to_equity" /></TableHead>
                    <TableHead className="text-right hidden xl:table-cell"><SortHeader label="Div%" field="dividend_yield" /></TableHead>
                    <TableHead className="text-right hidden xl:table-cell"><SortHeader label="RSI" field="rsi" /></TableHead>
                    <TableHead className="text-right hidden 2xl:table-cell">52W High</TableHead>
                    <TableHead className="text-right hidden 2xl:table-cell">52W Low</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((s) => {
                    const isPos = (s.change ?? 0) >= 0;
                    const rsiColor = s.rsi != null ? (s.rsi > 70 ? "text-loss" : s.rsi < 30 ? "text-profit" : "") : "";
                    return (
                      <TableRow
                        key={s.ticker}
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => setSelectedStock(s)}
                      >
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div>
                            <p className="font-medium text-sm">{s.ticker?.replace("NSE:", "")}</p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">{s.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {s.sector && <Badge variant="secondary" className="text-[10px]">{s.sector}</Badge>}
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">{formatCurrency(s.close)}</TableCell>
                        <TableCell className="text-right">
                          <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", isPos ? "text-profit" : "text-loss")}>
                            {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {formatPercent(s.change)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell">
                          {s.volume != null ? (s.volume >= 1e7 ? `${(s.volume / 1e7).toFixed(1)}Cr` : s.volume >= 1e5 ? `${(s.volume / 1e5).toFixed(1)}L` : s.volume >= 1e3 ? `${(s.volume / 1e3).toFixed(0)}K` : s.volume) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell">{formatMarketCap(s.market_cap)}</TableCell>
                        <TableCell className="text-right text-xs hidden lg:table-cell">{formatRatio(s.pe_ratio)}</TableCell>
                        <TableCell className="text-right text-xs hidden lg:table-cell">{formatRatio(s.pb_ratio)}</TableCell>
                        <TableCell className="text-right text-xs hidden xl:table-cell">
                          <span className={cn(s.roe != null && s.roe > 0 ? "text-profit" : "text-loss")}>{formatPercent(s.roe)}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs hidden xl:table-cell">
                          <span className={cn(s.net_margin != null && s.net_margin > 0 ? "text-profit" : "text-loss")}>{formatPercent(s.net_margin)}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs hidden xl:table-cell">{formatRatio(s.debt_to_equity)}</TableCell>
                        <TableCell className="text-right text-xs hidden xl:table-cell">{s.dividend_yield != null ? `${s.dividend_yield.toFixed(2)}%` : "—"}</TableCell>
                        <TableCell className={cn("text-right text-xs hidden xl:table-cell font-mono", rsiColor)}>
                          {s.rsi != null ? s.rsi.toFixed(1) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs hidden 2xl:table-cell">{formatCurrency(s.high_52w)}</TableCell>
                        <TableCell className="text-right text-xs hidden 2xl:table-cell">{formatCurrency(s.low_52w)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
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
            <span className="hidden sm:inline">
              · Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} of {totalCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-2 font-medium">
              Page {page + 1} of {Math.max(totalPages, 1)}
            </span>
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Data from TradingView Scanner · Refreshes every 5 min
        </p>
      </div>

      <StockPopupCard open={!!selectedStock} onOpenChange={(o) => !o && setSelectedStock(null)} stock={selectedStock} />
    </>
  );
}
