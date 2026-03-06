import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FundamentalData {
  ticker: string;
  // Identity
  name: string | null;
  description: string | null;
  industry: string | null;
  sector: string | null;
  // Price
  close: number | null;
  change: number | null;
  volume: number | null;
  relative_volume: number | null;
  avg_volume_10d: number | null;
  // Valuation
  market_cap: number | null;
  pe_ratio: number | null;
  eps: number | null;
  pb_ratio: number | null;
  ps_ratio: number | null;
  ev_ebitda: number | null;
  dividend_yield: number | null;
  // Profitability
  roe: number | null;
  roa: number | null;
  net_margin: number | null;
  operating_margin: number | null;
  gross_margin: number | null;
  // Financial
  debt_to_equity: number | null;
  current_ratio: number | null;
  total_revenue: number | null;
  net_income: number | null;
  // Technicals
  sma10: number | null;
  sma20: number | null;
  sma50: number | null;
  rsi: number | null;
  high_52w: number | null;
  low_52w: number | null;
  perf_w: number | null;
  perf_1m: number | null;
  perf_3m: number | null;
  perf_y: number | null;
  beta: number | null;
  atr: number | null;
}

interface ScanResponse {
  data: FundamentalData[];
  totalCount: number;
}

export function useFundamentals(symbols?: string[]) {
  return useQuery<ScanResponse>({
    queryKey: ["fundamentals", symbols ?? "top"],
    queryFn: async () => {
      const payload: Record<string, unknown> = {};
      if (symbols?.length) {
        payload.symbols = symbols;
        payload.mode = "symbols";
      } else {
        payload.mode = "top";
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
