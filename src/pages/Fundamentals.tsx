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
  rawFilters?: unknown[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  group: "cap" | "fundamental" | "technical" | "price" | "volume";
};

const SCANNER_PRESETS: ScannerPreset[] = [
  // ── Market Cap ──
  { id: "all", label: "All Stocks", description: "All NSE stocks by market cap", filters: [], group: "cap" },
  { id: "large_cap", label: "Large Cap", description: "Mkt cap > ₹20,000 Cr", filters: [{ field: "market_cap_basic", op: "greater", value: 2e11 }], group: "cap" },
  { id: "mid_cap", label: "Mid Cap", description: "₹5,000 – ₹20,000 Cr", filters: [{ field: "market_cap_basic", op: "greater", value: 5e10 }, { field: "market_cap_basic", op: "less", value: 2e11 }], group: "cap" },
  { id: "small_cap", label: "Small Cap", description: "Mkt cap < ₹5,000 Cr", filters: [{ field: "market_cap_basic", op: "greater", value: 1e9 }, { field: "market_cap_basic", op: "less", value: 5e10 }], group: "cap" },
  { id: "micro_cap", label: "Micro Cap", description: "Mkt cap < ₹500 Cr", filters: [{ field: "market_cap_basic", op: "greater", value: 1e8 }, { field: "market_cap_basic", op: "less", value: 5e9 }], group: "cap" },

  // ── Fundamental ──
  { id: "undervalued", label: "Undervalued", description: "Low P/E + Low P/B", filters: [{ field: "price_earnings_ttm", op: "greater", value: 0 }, { field: "price_earnings_ttm", op: "less", value: 20 }, { field: "price_book_ratio", op: "less", value: 3 }], sortBy: "pe_ratio", sortOrder: "asc", group: "fundamental" },
  { id: "growth", label: "High Growth", description: "ROE > 15%, Margin > 10%", filters: [{ field: "return_on_equity", op: "greater", value: 15 }, { field: "net_margin", op: "greater", value: 10 }], sortBy: "roe", sortOrder: "desc", group: "fundamental" },
  { id: "dividend", label: "Dividend Stars", description: "Yield > 2%", filters: [{ field: "dividends_yield", op: "greater", value: 2 }], sortBy: "dividend_yield", sortOrder: "desc", group: "fundamental" },
  { id: "low_debt", label: "Low Debt", description: "D/E < 0.5, CR > 1.5", filters: [{ field: "debt_to_equity", op: "less", value: 0.5 }, { field: "debt_to_equity", op: "greater", value: 0 }, { field: "current_ratio", op: "greater", value: 1.5 }], sortBy: "debt_to_equity", sortOrder: "asc", group: "fundamental" },
  { id: "quality", label: "Quality", description: "ROE > 20%, D/E < 1, Margin > 15%", filters: [{ field: "return_on_equity", op: "greater", value: 20 }, { field: "debt_to_equity", op: "less", value: 1 }, { field: "net_margin", op: "greater", value: 15 }], sortBy: "roe", sortOrder: "desc", group: "fundamental" },
  { id: "high_margin", label: "High Margin", description: "Net margin > 20%", filters: [{ field: "net_margin", op: "greater", value: 20 }], sortBy: "net_margin", sortOrder: "desc", group: "fundamental" },
  { id: "cash_rich", label: "Cash Rich", description: "CR > 2, D/E < 0.3", filters: [{ field: "current_ratio", op: "greater", value: 2 }, { field: "debt_to_equity", op: "less", value: 0.3 }, { field: "debt_to_equity", op: "greater", value: 0 }], sortBy: "current_ratio", sortOrder: "desc", group: "fundamental" },
  { id: "value_picks", label: "Value Picks", description: "P/E < 15, ROE > 12%, Yield > 1%", filters: [{ field: "price_earnings_ttm", op: "greater", value: 0 }, { field: "price_earnings_ttm", op: "less", value: 15 }, { field: "return_on_equity", op: "greater", value: 12 }, { field: "dividends_yield", op: "greater", value: 1 }], sortBy: "pe_ratio", sortOrder: "asc", group: "fundamental" },
  { id: "high_eps", label: "High EPS", description: "EPS > ₹50", filters: [{ field: "earnings_per_share_basic_ttm", op: "greater", value: 50 }], sortBy: "change", sortOrder: "desc", group: "fundamental" },

  // ── Price Action ──
  { id: "top_gainers", label: "Top Gainers", description: "Biggest % gainers today", filters: [{ field: "change", op: "greater", value: 2 }], sortBy: "change", sortOrder: "desc", group: "price" },
  { id: "top_losers", label: "Top Losers", description: "Biggest % losers today", filters: [{ field: "change", op: "less", value: -2 }], sortBy: "change", sortOrder: "asc", group: "price" },
  { id: "52w_high", label: "52W High", description: "Within 3% of 52-week high", filters: [], rawFilters: [{ left: "close", operation: "egreater", right: "price_52_week_high*0.97" }], sortBy: "change", sortOrder: "desc", group: "price" },
  { id: "52w_low", label: "52W Low", description: "Within 3% of 52-week low", filters: [], rawFilters: [{ left: "close", operation: "eless", right: "price_52_week_low*1.03" }], sortBy: "change", sortOrder: "asc", group: "price" },
  { id: "ath_zone", label: "All-Time High", description: "Within 5% of all-time high", filters: [], rawFilters: [{ left: "close", operation: "egreater", right: "High.All*0.95" }], sortBy: "change", sortOrder: "desc", group: "price" },
  { id: "atl_zone", label: "All-Time Low", description: "Within 10% of all-time low", filters: [], rawFilters: [{ left: "close", operation: "eless", right: "Low.All*1.10" }], sortBy: "change", sortOrder: "asc", group: "price" },
  { id: "near_day_high", label: "Near Day High", description: "Within 1% of day high", filters: [], rawFilters: [{ left: "close", operation: "egreater", right: "High.D*0.99" }], sortBy: "change", sortOrder: "desc", group: "price" },
  { id: "near_day_low", label: "Near Day Low", description: "Within 1% of day low", filters: [], rawFilters: [{ left: "close", operation: "eless", right: "Low.D*1.01" }], sortBy: "change", sortOrder: "asc", group: "price" },
  { id: "penny_stocks", label: "Penny Stocks", description: "Price < ₹50", filters: [{ field: "close", op: "less", value: 50 }, { field: "close", op: "greater", value: 1 }], sortBy: "change", sortOrder: "desc", group: "price" },
  { id: "blue_chip", label: "Blue Chip", description: "Price > ₹1,000, Large cap", filters: [{ field: "close", op: "greater", value: 1000 }, { field: "market_cap_basic", op: "greater", value: 2e11 }], sortBy: "change", sortOrder: "desc", group: "price" },

  // ── Volume ──
  { id: "vol_gainers", label: "Volume Gainers", description: "Rel. vol > 1.5× + price up", filters: [{ field: "relative_volume_10d_calc", op: "greater", value: 1.5 }, { field: "change", op: "greater", value: 0 }], sortBy: "volume", sortOrder: "desc", group: "volume" },
  { id: "vol_spike", label: "Volume Spike", description: "Rel. vol > 3× — unusual activity", filters: [{ field: "relative_volume_10d_calc", op: "greater", value: 3 }], sortBy: "volume", sortOrder: "desc", group: "volume" },
  { id: "vol_breakout", label: "Volume Breakout", description: "Vol > 2× + change > 3%", filters: [{ field: "relative_volume_10d_calc", op: "greater", value: 2 }, { field: "change", op: "greater", value: 3 }], sortBy: "volume", sortOrder: "desc", group: "volume" },
  { id: "vol_dry", label: "Low Volume", description: "Rel. vol < 0.5 — quiet stocks", filters: [{ field: "relative_volume_10d_calc", op: "less", value: 0.5 }, { field: "relative_volume_10d_calc", op: "greater", value: 0 }], sortBy: "volume", sortOrder: "asc", group: "volume" },
  { id: "vol_sell_pressure", label: "Sell Pressure", description: "Vol > 2× + price down", filters: [{ field: "relative_volume_10d_calc", op: "greater", value: 2 }, { field: "change", op: "less", value: -1 }], sortBy: "volume", sortOrder: "desc", group: "volume" },
  { id: "high_avg_vol", label: "High Avg Volume", description: "Avg vol > 10L/day", filters: [{ field: "average_volume_10d_calc", op: "greater", value: 1000000 }], sortBy: "volume", sortOrder: "desc", group: "volume" },

  // ── Technical ──
  { id: "momentum", label: "Momentum", description: "+1M & +3M returns", filters: [{ field: "Perf.1M", op: "greater", value: 0 }, { field: "Perf.3M", op: "greater", value: 0 }], sortBy: "change", sortOrder: "desc", group: "technical" },
  { id: "strong_momentum", label: "Strong Rally", description: "+5% weekly, +15% monthly", filters: [{ field: "Perf.W", op: "greater", value: 5 }, { field: "Perf.1M", op: "greater", value: 15 }], sortBy: "change", sortOrder: "desc", group: "technical" },
  { id: "oversold", label: "Oversold RSI", description: "RSI < 30", filters: [{ field: "RSI", op: "less", value: 30 }, { field: "RSI", op: "greater", value: 0 }], sortBy: "rsi", sortOrder: "asc", group: "technical" },
  { id: "overbought", label: "Overbought RSI", description: "RSI > 70", filters: [{ field: "RSI", op: "greater", value: 70 }], sortBy: "rsi", sortOrder: "desc", group: "technical" },
  { id: "above_sma50", label: "Above SMA 50", description: "Price > 50-day SMA", filters: [], rawFilters: [{ left: "close", operation: "egreater", right: "SMA50" }], sortBy: "change", sortOrder: "desc", group: "technical" },
  { id: "low_beta", label: "Low Beta", description: "Beta < 0.8 (defensive)", filters: [{ field: "beta_1_year", op: "less", value: 0.8 }, { field: "beta_1_year", op: "greater", value: 0 }], sortBy: "change", sortOrder: "desc", group: "technical" },
  { id: "high_beta", label: "High Beta", description: "Beta > 1.5 (aggressive)", filters: [{ field: "beta_1_year", op: "greater", value: 1.5 }], sortBy: "change", sortOrder: "desc", group: "technical" },
  { id: "high_atr", label: "High Volatility", description: "ATR-based volatile movers", filters: [{ field: "ATR", op: "greater", value: 5 }, { field: "change", op: "greater", value: 1 }], sortBy: "change", sortOrder: "desc", group: "technical" },
];

const PRESET_GROUPS: { key: string; label: string }[] = [
  { key: "cap", label: "Market Cap" },
  { key: "price", label: "Price Action" },
  { key: "volume", label: "Volume" },
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
      <span className="text-[11px] text-muted-foreground/70 font-normal mr-[1px]">₹</span>
      <span className={cn(
        "font-semibold text-[14px] sm:text-[13.5px] tracking-tight transition-colors",
        isUp && "text-profit",
        isDown && "text-loss",
        !isUp && !isDown && "text-foreground"
      )}>
        {intPart}
      </span>
      <span className="text-[11px] text-muted-foreground/60 font-medium">{decPart}</span>
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
  const activeRawFilters = isCustomMode ? undefined : preset.rawFilters;

  const { data: result, isLoading, isFetching } = useFundamentals({
    limit: pageSize,
    offset: page * pageSize,
    sortBy: isCustomMode ? sortKey : (preset.sortBy || sortKey),
    sortOrder: isCustomMode ? (sortAsc ? "asc" : "desc") : (preset.sortOrder || (sortAsc ? "asc" : "desc")),
    filters: activeFilters,
    rawFilters: activeRawFilters,
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
    price: "bg-warning",
    volume: "bg-[hsl(280_60%_55%)]",
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

      <div className="space-y-3.5">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="text-[22px] lg:text-[26px] font-bold tracking-tight text-foreground font-heading">Fundamentals</h1>
            <p className="text-[14px] text-muted-foreground/80 leading-relaxed">
              {preset.id !== "all" && !isCustomMode ? (
                <>
                  <span className="font-medium text-foreground">{preset.label}</span>
                  <span className="text-muted-foreground/40 mx-1.5">·</span>
                  <span>{preset.description}</span>
                  <span className="text-muted-foreground/40 mx-1.5">·</span>
                </>
              ) : isCustomMode && appliedFilters.length > 0 ? (
                <>
                  <span className="font-medium text-primary">{appliedFilters.length} custom filters</span>
                  <span className="text-muted-foreground/40 mx-1.5">·</span>
                </>
              ) : null}
              <span className="font-mono font-semibold text-foreground">{totalCount.toLocaleString()}</span> stocks
            </p>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
            <Input
              placeholder="Search symbol, sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-[13px] bg-muted/20 border-border/20 focus:border-primary/30"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile Quick Presets ── */}
        <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {[
            SCANNER_PRESETS.find(p => p.id === "top_gainers")!,
            SCANNER_PRESETS.find(p => p.id === "top_losers")!,
            SCANNER_PRESETS.find(p => p.id === "52w_high")!,
            SCANNER_PRESETS.find(p => p.id === "52w_low")!,
            SCANNER_PRESETS.find(p => p.id === "all")!,
          ].map((p) => (
            <button
              key={p.id}
              className={cn(
                "shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all duration-200",
                presetId === p.id
                  ? "border-primary/15 bg-primary/6 text-primary"
                  : "border-border/15 text-muted-foreground/50 hover:text-foreground"
              )}
              onClick={() => handlePresetChange(p.id)}
            >
              {p.label}
            </button>
          ))}
          <button
            className={cn(
              "shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1",
              isCustomMode
                ? "border-primary/15 bg-primary/6 text-primary"
                : "border-border/15 text-muted-foreground/50 hover:text-foreground"
            )}
            onClick={toggleFilterBuilder}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Custom
          </button>
        </div>

        {/* ── Desktop Grouped Scanner Presets ── */}
        <div className="hidden sm:flex items-center gap-0.5 overflow-x-auto pb-0.5 scrollbar-none">
          {PRESET_GROUPS.map((group, gi) => (
            <div key={group.key} className="flex items-center gap-0 shrink-0">
              {gi > 0 && <div className="w-px h-3.5 bg-border/20 mx-1.5 shrink-0" />}
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mr-1 opacity-60", PRESET_GROUP_COLORS[group.key])} />
              {SCANNER_PRESETS.filter((p) => p.group === group.key).map((p) => (
                <button
                  key={p.id}
                  className={cn(
                    "h-7 text-[10px] px-2.5 shrink-0 transition-all duration-200 font-medium rounded-md",
                    presetId === p.id
                      ? "text-primary bg-primary/6"
                      : "text-muted-foreground/50 hover:text-foreground hover:bg-muted/30"
                  )}
                  onClick={() => handlePresetChange(p.id)}
                  title={p.description}
                >
                  {p.label}
                </button>
              ))}
            </div>
          ))}
          {/* Saved Presets */}
          {savedPresets.length > 0 && (
            <>
              <div className="w-px h-3.5 bg-border/20 mx-1.5 shrink-0" />
              <span className="w-1.5 h-1.5 rounded-full shrink-0 mr-1 bg-accent opacity-60" />
              {savedPresets.map((sp) => (
                <div key={sp.id} className="flex items-center gap-0 shrink-0">
                  <button
                    className={cn(
                      "h-7 text-[10px] px-2.5 transition-all duration-200 font-medium rounded-md inline-flex items-center gap-1",
                      presetId === `saved_${sp.id}`
                        ? "text-primary bg-primary/6"
                        : "text-muted-foreground/50 hover:text-foreground hover:bg-muted/30"
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
                    <Bookmark className="w-2.5 h-2.5" />
                    {sp.name}
                  </button>
                  <button
                    onClick={() => deletePreset.mutate(sp.id)}
                    className="p-0.5 text-muted-foreground/30 hover:text-destructive transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </>
          )}
          {/* Custom Filter Toggle */}
          <div className="w-px h-3.5 bg-border/20 mx-1.5 shrink-0" />
          <button
            className={cn(
              "h-7 text-[10px] px-2.5 shrink-0 transition-all duration-200 gap-1 font-medium rounded-md inline-flex items-center",
              isCustomMode
                ? "text-primary bg-primary/6"
                : "text-muted-foreground/50 hover:text-foreground hover:bg-muted/30"
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
          </button>
        </div>

        {/* ── Custom Filter Builder ── */}
        <Collapsible open={showFilterBuilder} onOpenChange={setShowFilterBuilder}>
          <CollapsibleContent>
             <div className="rounded-xl border border-border/20 bg-card/80 p-3.5 space-y-2.5">
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
          <div className="rounded-[1.25rem] border border-border/30 overflow-hidden bg-card relative">
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
                  <TableRow className="bg-card border-b border-border/30 sticky top-0 z-10">
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
                          "cursor-pointer transition-colors duration-150 border-b border-border/15 border-l-2 border-l-transparent hover:border-l-primary hover:bg-primary/[0.02]",
                          idx % 2 === 1 && "bg-muted/30"
                        )}
                        onClick={() => setSelectedStock(s)}
                      >
                        <TableCell className="sticky left-0 z-10 py-2.5 sm:py-2 px-3" style={{ backgroundColor: idx % 2 === 1 ? "hsl(var(--muted) / 0.3)" : "hsl(var(--card))", boxShadow: "2px 0 4px -2px rgba(0,0,0,0.06)" }}>
                          <div>
                            <p className="font-bold text-[14px] sm:text-[13px] text-foreground leading-tight">{s.ticker?.replace("NSE:", "")}</p>
                            <p className="text-[10px] sm:text-[9px] text-muted-foreground truncate max-w-[130px] leading-tight">{s.description}</p>
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
                        <TableCell className="text-right py-2.5 sm:py-2 px-3">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[12px] sm:text-[11px] font-mono font-semibold",
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
        <div className="rounded-xl bg-card border border-border/20 px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}>
              <SelectTrigger className="h-7 w-14 text-[11px] border-0 bg-muted/40 px-2">
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
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-6 sm:w-6" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </Button>
            {pageNumbers.map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
                size="icon"
                className={cn("h-8 w-8 sm:h-6 sm:w-6 text-[12px] sm:text-[11px]", p === page && "shadow-sm")}
                onClick={() => setPage(p)}
              >
                {p + 1}
              </Button>
            ))}
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-6 sm:w-6" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
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
