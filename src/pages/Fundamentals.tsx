import { useState, useMemo, useCallback } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "@/components/ui/sparkline";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, X, BarChart3, Plus, Trash2, Save, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedScannerPresets } from "@/hooks/useSavedScannerPresets";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input as DialogInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

/* ─── Custom Filter Constants ─── */
const FILTER_FIELDS = [
  { label: "P/E Ratio", value: "price_earnings_ttm" },
  { label: "P/B Ratio", value: "price_book_ratio" },
  { label: "ROE (%)", value: "return_on_equity" },
  { label: "Net Margin (%)", value: "net_margin" },
  { label: "Dividend Yield (%)", value: "dividends_yield" },
  { label: "Debt/Equity", value: "debt_to_equity" },
  { label: "Current Ratio", value: "current_ratio" },
  { label: "Market Cap", value: "market_cap_basic" },
  { label: "RSI", value: "RSI" },
  { label: "Change (%)", value: "change" },
  { label: "Volume", value: "volume" },
  { label: "Relative Volume", value: "relative_volume_10d_calc" },
  { label: "EPS", value: "earnings_per_share_basic_ttm" },
  { label: "Beta", value: "beta_1_year" },
];

const FILTER_OPS = [
  { label: ">", value: "greater" },
  { label: "<", value: "less" },
];

type CustomFilter = { field: string; op: string; value: string };

function getFieldLabel(field: string) {
  return FILTER_FIELDS.find((f) => f.value === field)?.label ?? field;
}

function getOpLabel(op: string) {
  return FILTER_OPS.find((o) => o.value === op)?.label ?? op;
}

/* ─── Helpers ─── */

/** Build a synthetic sparkline from available price anchors */
function buildSparklineData(s: FundamentalData): number[] {
  const points = [s.atl, s.low_52w, s.sma50, s.sma20, s.sma10, s.close].filter(
    (v): v is number => v != null && v > 0
  );
  return points.length >= 2 ? points : [];
}

/** Split price into integer + decimal parts with visual hierarchy */
function LTPDisplay({ value, change }: { value: number | null; change?: number | null }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  const formatted = value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dotIdx = formatted.lastIndexOf(".");
  const intPart = formatted.slice(0, dotIdx);
  const decPart = formatted.slice(dotIdx);

  const isUp = change != null && change > 0;
  const isDown = change != null && change < 0;

  return (
    <span className="inline-flex items-baseline gap-[1px] font-mono tabular-nums group/ltp">
      <span className="text-[10px] text-muted-foreground/70 font-normal mr-[1px]">₹</span>
      <span className={cn(
        "font-semibold text-[13.5px] tracking-tight transition-colors",
        isUp && "text-profit",
        isDown && "text-loss",
        !isUp && !isDown && "text-foreground"
      )}>
        {intPart}
      </span>
      <span className="text-[10.5px] text-muted-foreground/60 font-medium">{decPart}</span>
    </span>
  );
}

export default function Fundamentals() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("market_cap");
  const [sortAsc, setSortAsc] = useState(false);
  const [presetId, setPresetId] = useState("all");
  const [selectedStock, setSelectedStock] = useState<FundamentalData | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  // Custom filter state
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<ScanFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState("");
  const { presets: savedPresets, createPreset, deletePreset } = useSavedScannerPresets();
  const isCustomMode = presetId === "custom";
  const preset = SCANNER_PRESETS.find((p) => p.id === presetId) ?? SCANNER_PRESETS[0];

  const activeFilters = isCustomMode ? appliedFilters : preset.filters;

  const { data: result, isLoading, isFetching } = useFundamentals({
    limit: pageSize,
    offset: page * pageSize,
    sortBy: isCustomMode ? sortKey : (preset.sortBy || sortKey),
    sortOrder: isCustomMode ? (sortAsc ? "asc" : "desc") : (preset.sortOrder || (sortAsc ? "asc" : "desc")),
    filters: activeFilters,
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
    if (id !== "custom") {
      setShowFilterBuilder(false);
      setCustomFilters([]);
      setAppliedFilters([]);
    }
  }, []);

  // Custom filter handlers
  const addFilterRow = useCallback(() => {
    if (customFilters.length >= 8) return;
    setCustomFilters((prev) => [...prev, { field: "price_earnings_ttm", op: "greater", value: "" }]);
  }, [customFilters.length]);

  const updateFilterRow = useCallback((idx: number, patch: Partial<CustomFilter>) => {
    setCustomFilters((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  }, []);

  const removeFilterRow = useCallback((idx: number) => {
    setCustomFilters((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const applyCustomFilters = useCallback(() => {
    const valid = customFilters.filter((f) => f.value !== "" && !isNaN(Number(f.value)));
    if (valid.length === 0) return;
    const scanFilters: ScanFilter[] = valid.map((f) => ({
      field: f.field,
      op: f.op,
      value: Number(f.value),
    }));
    setAppliedFilters(scanFilters);
    setPresetId("custom");
    setPage(0);
  }, [customFilters]);

  const clearCustomFilters = useCallback(() => {
    setCustomFilters([]);
    setAppliedFilters([]);
    setShowFilterBuilder(false);
    setPresetId("all");
    setPage(0);
  }, []);

  const toggleFilterBuilder = useCallback(() => {
    setShowFilterBuilder((prev) => {
      const next = !prev;
      if (next && customFilters.length === 0) {
        setCustomFilters([{ field: "price_earnings_ttm", op: "greater", value: "" }]);
      }
      return next;
    });
  }, [customFilters.length]);

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) return <span className="text-[9px] opacity-40 ml-0.5">↕</span>;
    return sortAsc ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  const PRESET_GROUP_COLORS: Record<string, string> = {
    cap: "bg-primary",
    fundamental: "bg-profit",
    technical: "bg-[hsl(210_80%_55%)]",
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => handleSort(field)}
      className={cn(
        "flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap",
        sortKey === field && "text-foreground"
      )}
    >
      {label}
      <SortIcon field={field} />
    </button>
  );

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
      <SEOHead title="Fundamentals — TradeBook" description="Scan & screen NSE stocks by fundamentals, valuation, and technicals." />

      <div className="space-y-4">
        {/* ── Header Card ── */}
        <div className="rounded-2xl bg-card border border-border p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">Fundamentals</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Top NSE stocks by market cap with key metrics
                <span className="text-muted-foreground/40 mx-1.5">·</span>
                <span className="font-mono font-bold text-foreground">{totalCount.toLocaleString()}</span> stocks
                {isCustomMode && appliedFilters.length > 0 && (
                  <>
                    <span className="text-muted-foreground/40 mx-1.5">·</span>
                    <span className="font-medium text-primary">{appliedFilters.length} filters</span>
                  </>
                )}
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search symbol, sector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Grouped Scanner Presets ── */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_GROUPS.map((group, gi) => (
            <div key={group.key} className="flex items-center gap-0.5 shrink-0">
              {gi > 0 && <div className="w-px h-4 bg-border mx-2 shrink-0" />}
              <span className={cn("w-2 h-2 rounded-full shrink-0 mr-1", PRESET_GROUP_COLORS[group.key])} />
              {SCANNER_PRESETS.filter((p) => p.group === group.key).map((p) => (
                <Button
                  key={p.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 text-[11px] rounded-none px-3 shrink-0 transition-all font-medium border-b-2",
                    presetId === p.id
                      ? "border-primary text-foreground bg-muted/40"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                  onClick={() => handlePresetChange(p.id)}
                  title={p.description}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          ))}
          {/* Saved Presets */}
          {savedPresets.length > 0 && (
            <>
              <div className="w-px h-4 bg-border mx-2 shrink-0" />
              <span className="w-2 h-2 rounded-full shrink-0 mr-1 bg-accent" />
              {savedPresets.map((sp) => (
                <div key={sp.id} className="flex items-center gap-0 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 text-[11px] rounded-none px-3 transition-all font-medium border-b-2",
                      presetId === `saved_${sp.id}`
                        ? "border-primary text-foreground bg-muted/40"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                    onClick={() => {
                      setAppliedFilters(sp.filters);
                      setPresetId(`saved_${sp.id}`);
                      setCustomFilters(sp.filters.map((f) => ({ field: f.field, op: f.op, value: String(f.value) })));
                      if (sp.sort_by) setSortKey(sp.sort_by as SortKey);
                      if (sp.sort_order) setSortAsc(sp.sort_order === "asc");
                      setPage(0);
                    }}
                  >
                    <Bookmark className="w-2.5 h-2.5 mr-1" />
                    {sp.name}
                  </Button>
                  <button
                    onClick={() => deletePreset.mutate(sp.id)}
                    className="p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </>
          )}
          {/* Custom Filter Toggle */}
          <div className="w-px h-4 bg-border mx-2 shrink-0" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 text-[11px] rounded-none px-3 shrink-0 transition-all gap-1 font-medium border-b-2",
              isCustomMode
                ? "border-primary text-foreground bg-muted/40"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
            onClick={toggleFilterBuilder}
          >
            <SlidersHorizontal className="w-2.5 h-2.5" />
            Custom
            {isCustomMode && appliedFilters.length > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold">
                {appliedFilters.length}
              </span>
            )}
          </Button>
        </div>

        {/* ── Custom Filter Builder ── */}
        <Collapsible open={showFilterBuilder} onOpenChange={setShowFilterBuilder}>
          <CollapsibleContent>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Filter Conditions <span className="text-muted-foreground font-normal">(AND logic)</span></p>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground" onClick={clearCustomFilters}>
                  Clear all
                </Button>
              </div>

              <div className="space-y-2">
                {customFilters.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <Select value={f.field} onValueChange={(v) => updateFilterRow(idx, { field: v })}>
                      <SelectTrigger className="h-8 text-xs w-full sm:w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_FIELDS.map((ff) => (
                          <SelectItem key={ff.value} value={ff.value} className="text-xs">{ff.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={f.op} onValueChange={(v) => updateFilterRow(idx, { op: v })}>
                      <SelectTrigger className="h-8 text-xs w-16 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_OPS.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Value"
                      value={f.value}
                      onChange={(e) => updateFilterRow(idx, { value: e.target.value })}
                      className="h-8 text-xs w-full sm:w-28"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFilterRow(idx)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={addFilterRow}
                  disabled={customFilters.length >= 8}
                >
                  <Plus className="w-3 h-3" />
                  Add condition
                </Button>
                <div className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-3 gap-1"
                  onClick={() => {
                    const valid = customFilters.filter((f) => f.value !== "" && !isNaN(Number(f.value)));
                    if (valid.length === 0) return;
                    setShowSaveDialog(true);
                  }}
                  disabled={customFilters.every((f) => f.value === "")}
                >
                  <Save className="w-3 h-3" />
                  Save
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs px-4"
                  onClick={applyCustomFilters}
                  disabled={customFilters.every((f) => f.value === "")}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* ── Active Custom Filter Chips ── */}
        {isCustomMode && appliedFilters.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Active:</span>
            {appliedFilters.map((f, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] h-5 gap-1 font-normal">
                {getFieldLabel(f.field)} {getOpLabel(f.op)} {f.value}
              </Badge>
            ))}
            <button onClick={clearCustomFilters} className="text-[10px] text-muted-foreground hover:text-foreground ml-1 underline underline-offset-2">
              Clear
            </button>
          </div>
        )}

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
                    <TableHead className="w-[170px] sticky left-0 bg-card z-20 py-2 px-3" style={{ boxShadow: "2px 0 4px -2px rgba(0,0,0,0.06)" }}>Symbol</TableHead>
                    <TableHead className="hidden md:table-cell py-2 px-3">Sector</TableHead>
                    <TableHead className={cn("text-right py-2 px-3", sortKey === "close" && "border-b-2 border-primary")}><SortHeader label="LTP" field="close" /></TableHead>
                    <TableHead className="py-2 px-2 w-[80px] hidden sm:table-cell text-center">
                      <span className="text-[11px] font-semibold text-muted-foreground">Trend</span>
                    </TableHead>
                    <TableHead className={cn("text-right py-2 px-3", sortKey === "change" && "border-b-2 border-primary")}><SortHeader label="Chg%" field="change" /></TableHead>
                    <TableHead className={cn("text-right hidden sm:table-cell py-2 px-3", sortKey === "volume" && "border-b-2 border-primary")}><SortHeader label="Vol" field="volume" /></TableHead>
                    <TableHead className={cn("text-right hidden sm:table-cell py-2 px-3", sortKey === "market_cap" && "border-b-2 border-primary")}><SortHeader label="Mkt Cap" field="market_cap" /></TableHead>
                    <TableHead className={cn("text-right hidden lg:table-cell py-2 px-3", sortKey === "pe_ratio" && "border-b-2 border-primary")}><SortHeader label="P/E" field="pe_ratio" /></TableHead>
                    <TableHead className={cn("text-right hidden lg:table-cell py-2 px-3", sortKey === "pb_ratio" && "border-b-2 border-primary")}><SortHeader label="P/B" field="pb_ratio" /></TableHead>
                    <TableHead className={cn("text-right hidden xl:table-cell py-2 px-3", sortKey === "roe" && "border-b-2 border-primary")}><SortHeader label="ROE" field="roe" /></TableHead>
                    <TableHead className={cn("text-right hidden xl:table-cell py-2 px-3", sortKey === "net_margin" && "border-b-2 border-primary")}><SortHeader label="Net Mgn" field="net_margin" /></TableHead>
                    <TableHead className={cn("text-right hidden xl:table-cell py-2 px-3", sortKey === "debt_to_equity" && "border-b-2 border-primary")}><SortHeader label="D/E" field="debt_to_equity" /></TableHead>
                    <TableHead className={cn("text-right hidden xl:table-cell py-2 px-3", sortKey === "dividend_yield" && "border-b-2 border-primary")}><SortHeader label="Div%" field="dividend_yield" /></TableHead>
                    <TableHead className={cn("text-right hidden xl:table-cell py-2 px-3", sortKey === "rsi" && "border-b-2 border-primary")}><SortHeader label="RSI" field="rsi" /></TableHead>
                    <TableHead className="text-right hidden 2xl:table-cell py-2 px-3">52W High</TableHead>
                    <TableHead className="text-right hidden 2xl:table-cell py-2 px-3">52W Low</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((s, idx) => {
                    const isPos = (s.change ?? 0) >= 0;
                    const rsiColor = s.rsi != null ? (s.rsi > 70 ? "text-loss" : s.rsi < 30 ? "text-profit" : "") : "";
                    const sparkData = buildSparklineData(s);
                    return (
                      <TableRow
                        key={s.ticker}
                        className={cn(
                          "cursor-pointer transition-colors border-b border-border/50 border-l-2 border-l-transparent hover:border-l-primary hover:bg-muted/50",
                          idx % 2 === 1 && "bg-muted/30"
                        )}
                        onClick={() => setSelectedStock(s)}
                      >
                        <TableCell className="sticky left-0 z-10 py-2 px-3" style={{ backgroundColor: idx % 2 === 1 ? "hsl(var(--muted) / 0.3)" : "hsl(var(--card))", boxShadow: "2px 0 4px -2px rgba(0,0,0,0.06)" }}>
                          <div>
                            <p className="font-bold text-[13px] text-foreground leading-tight">{s.ticker?.replace("NSE:", "")}</p>
                            <p className="text-[9px] text-muted-foreground truncate max-w-[130px] leading-tight">{s.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-2 px-3">
                          {s.sector && (
                            <span className="inline-block bg-muted/60 text-muted-foreground px-2 py-0.5 rounded text-[10px] font-medium truncate max-w-[120px]">
                              {s.sector}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-2 px-3">
                          <LTPDisplay value={s.close} change={s.change} />
                        </TableCell>
                        <TableCell className="py-2 px-2 hidden sm:table-cell">
                          <div className="flex justify-center">
                            <Sparkline data={sparkData} width={80} height={28} fill />
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-2 px-3">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-mono font-medium",
                            isPos ? "text-profit" : "text-loss"
                          )}>
                            <span className={cn("w-1 h-1 rounded-full shrink-0", isPos ? "bg-profit" : "bg-loss")} />
                            {formatPercent(s.change)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-[11px] text-muted-foreground hidden sm:table-cell py-2 px-3 font-mono">
                          {s.volume != null ? (s.volume >= 1e7 ? `${(s.volume / 1e7).toFixed(1)}Cr` : s.volume >= 1e5 ? `${(s.volume / 1e5).toFixed(1)}L` : s.volume >= 1e3 ? `${(s.volume / 1e3).toFixed(0)}K` : s.volume) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-[11px] text-muted-foreground hidden sm:table-cell py-2 px-3 font-mono">{formatMarketCap(s.market_cap)}</TableCell>
                        <TableCell className="text-right text-[11px] hidden lg:table-cell py-2 px-3 font-mono">{formatRatio(s.pe_ratio)}</TableCell>
                        <TableCell className="text-right text-[11px] hidden lg:table-cell py-2 px-3 font-mono">{formatRatio(s.pb_ratio)}</TableCell>
                        <TableCell className="text-right text-[11px] hidden xl:table-cell py-2 px-3 font-mono">
                          <span className={cn(s.roe != null && s.roe > 0 ? "text-profit" : s.roe == null ? "text-muted-foreground" : "text-loss")}>{s.roe != null ? formatPercent(s.roe) : "—"}</span>
                        </TableCell>
                        <TableCell className="text-right text-[11px] hidden xl:table-cell py-2 px-3 font-mono">
                          <span className={cn(s.net_margin != null && s.net_margin > 0 ? "text-profit" : s.net_margin == null ? "text-muted-foreground" : "text-loss")}>{s.net_margin != null ? formatPercent(s.net_margin) : "—"}</span>
                        </TableCell>
                        <TableCell className="text-right text-[11px] hidden xl:table-cell py-2 px-3 font-mono">{formatRatio(s.debt_to_equity)}</TableCell>
                        <TableCell className="text-right text-[11px] hidden xl:table-cell py-2 px-3 font-mono">{s.dividend_yield != null ? `${s.dividend_yield.toFixed(2)}%` : "—"}</TableCell>
                        <TableCell className={cn("text-right text-[11px] hidden xl:table-cell py-2 px-3 font-mono", rsiColor)}>
                          {s.rsi != null ? s.rsi.toFixed(1) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-[11px] hidden 2xl:table-cell py-2 px-3 font-mono">{formatCurrency(s.high_52w)}</TableCell>
                        <TableCell className="text-right text-[11px] hidden 2xl:table-cell py-2 px-3 font-mono">{formatCurrency(s.low_52w)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── Pagination Footer ── */}
        <div className="rounded-xl bg-card border border-border px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}>
              <SelectTrigger className="h-6 w-14 text-[11px] border-0 bg-muted/40 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="hidden sm:inline">
              <span className="font-medium text-foreground">{page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)}</span> of <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">·</span>
            <span className="text-[9px] text-muted-foreground/60 hidden sm:inline">TradingView · 5 min cache</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            {pageNumbers.map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
                size="icon"
                className={cn("h-6 w-6 text-[11px]", p === page && "shadow-sm")}
                onClick={() => setPage(p)}
              >
                {p + 1}
              </Button>
            ))}
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <StockPopupCard open={!!selectedStock} onOpenChange={(o) => !o && setSelectedStock(null)} stock={selectedStock} />

      {/* Save Preset Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Save Scanner Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Preset Name</Label>
              <DialogInput
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g. My Value Picks"
                className="mt-1"
                autoFocus
              />
            </div>
            <Button
              className="w-full"
              size="sm"
              disabled={!presetName.trim() || createPreset.isPending}
              onClick={() => {
                const valid = customFilters.filter((f) => f.value !== "" && !isNaN(Number(f.value)));
                createPreset.mutate({
                  name: presetName.trim(),
                  filters: valid.map((f) => ({ field: f.field, op: f.op, value: Number(f.value) })),
                  sort_by: sortKey,
                  sort_order: sortAsc ? "asc" : "desc",
                });
                setShowSaveDialog(false);
                setPresetName("");
              }}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Preset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
