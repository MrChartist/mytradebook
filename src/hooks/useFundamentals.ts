import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FundamentalData {
  ticker: string;
  name: string | null;
  description: string | null;
  industry: string | null;
  sector: string | null;
  close: number | null;
  change: number | null;
  volume: number | null;
  relative_volume: number | null;
  avg_volume_10d: number | null;
  market_cap: number | null;
  pe_ratio: number | null;
  eps: number | null;
  pb_ratio: number | null;
  ps_ratio: number | null;
  dividend_yield: number | null;
  roe: number | null;
  roa: number | null;
  net_margin: number | null;
  operating_margin: number | null;
  gross_margin: number | null;
  debt_to_equity: number | null;
  current_ratio: number | null;
  total_revenue: number | null;
  net_income: number | null;
  sma10: number | null;
  sma20: number | null;
  sma50: number | null;
  rsi: number | null;
  ath: number | null;
  atl: number | null;
  high_52w: number | null;
  low_52w: number | null;
  perf_w: number | null;
  perf_1m: number | null;
  perf_3m: number | null;
  perf_y: number | null;
  beta: number | null;
  atr: number | null;
  // Today's OHLC (using "open", "high", "low" fields)
  open: number | null;
  day_high: number | null;
  day_low: number | null;
}

export interface ScanResponse {
  data: FundamentalData[];
  totalCount: number;
}

export interface ScanFilter {
  field: string;
  op: string;
  value: number;
}

/**
 * Client-side post-filters for cross-field percentage comparisons.
 * Used for 52W High/Low proximity, ATH/ATL zones, Day High/Low, SMA proximity etc.
 * These cannot be expressed as simple TradingView filter expressions.
 */
export interface ClientPostFilter {
  /** Field on FundamentalData to test (e.g. "close") */
  sourceField: keyof FundamentalData;
  /** Reference field on FundamentalData to compare against (e.g. "high_52w") */
  targetField: keyof FundamentalData;
  /**
   * "within_pct_below" → (targetField - sourceField) / targetField <= threshold/100
   * "within_pct_above" → (sourceField - targetField) / targetField <= threshold/100
   * "above"            → sourceField > targetField
   * "below"            → sourceField < targetField
   */
  direction: "within_pct_below" | "within_pct_above" | "above" | "below";
  /** Percentage threshold (only for within_pct_* directions) */
  threshold?: number;
}

export interface ScanParams {
  symbols?: string[];
  mode?: "symbols" | "top";
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: ScanFilter[];
  rawFilters?: unknown[];
  /** When set, fetches a larger batch and applies these filters client-side */
  clientPostFilters?: ClientPostFilter[];
}

/** Apply a single client post-filter to a row */
function applyClientPostFilter(s: FundamentalData, f: ClientPostFilter): boolean {
  const src = s[f.sourceField] as number | null;
  const tgt = s[f.targetField] as number | null;
  if (src == null || tgt == null || tgt === 0) return false;

  switch (f.direction) {
    case "within_pct_below":
      return tgt > 0 && (tgt - src) / tgt <= (f.threshold ?? 0) / 100;
    case "within_pct_above":
      return tgt > 0 && (src - tgt) / tgt <= (f.threshold ?? 0) / 100;
    case "above":
      return src > tgt;
    case "below":
      return src < tgt;
    default:
      return true;
  }
}

export function useFundamentals(params: ScanParams = {}) {
  const {
    symbols,
    mode,
    limit = 500,
    offset = 0,
    sortBy,
    sortOrder,
    filters,
    rawFilters,
    clientPostFilters,
  } = params;

  // When we have clientPostFilters, request a larger batch so that after
  // filtering we still have enough rows. We fetch up to 1000 from offset 0
  // and do pagination ourselves.
  const hasClientFilters = (clientPostFilters?.length ?? 0) > 0;
  const fetchLimit = hasClientFilters ? 1000 : limit;
  const fetchOffset = hasClientFilters ? 0 : offset;

  const { data: result, isLoading, isFetching, error } = useQuery<ScanResponse>({
    queryKey: [
      "fundamentals",
      symbols ?? "top",
      fetchLimit,
      fetchOffset,
      sortBy,
      sortOrder,
      filters,
      rawFilters,
      clientPostFilters,
    ],
    queryFn: async () => {
      const payload: Record<string, unknown> = { limit: fetchLimit, offset: fetchOffset };

      if (symbols?.length) {
        payload.symbols = symbols;
        payload.mode = "symbols";
      } else {
        payload.mode = mode || "top";
      }

      if (sortBy) {
        payload.sortBy = sortBy;
        payload.sortOrder = sortOrder || "desc";
      }

      if (filters?.length) {
        payload.filters = filters;
      }

      if (rawFilters?.length) {
        payload.rawFilters = rawFilters;
      }

      const { data, error } = await supabase.functions.invoke("tradingview-scan", {
        body: payload,
      });

      if (error) throw new Error(error.message || "Failed to fetch fundamentals");
      return data as ScanResponse;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Apply client-side post-filters and slice the page
  const filteredData = (() => {
    if (!result) return null;
    if (!hasClientFilters) return result;

    const filtered = result.data.filter((row) =>
      clientPostFilters!.every((f) => applyClientPostFilter(row, f))
    );

    // Paginate the client-filtered results
    const page = filtered.slice(offset, offset + limit);
    return {
      data: page,
      totalCount: filtered.length,
    } as ScanResponse;
  })();

  return {
    data: filteredData ?? result,
    isLoading,
    isFetching,
    error,
  };
}

// Formatting helpers
export function formatMarketCap(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `₹${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(0)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(0)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatPercent(n: number | null, decimals = 2): string {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

export function formatRatio(n: number | null, decimals = 2): string {
  if (n == null) return "—";
  return n.toFixed(decimals);
}

export function formatCurrency(n: number | null): string {
  if (n == null) return "—";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatVolume(n: number | null): string {
  if (n == null || n === 0) return "—";
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}
