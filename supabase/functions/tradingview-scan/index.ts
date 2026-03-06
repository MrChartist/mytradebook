import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TRADINGVIEW_SCAN_URL = "https://scanner.tradingview.com/india/scan";

const FIELDS = [
  // Identity
  "name", "description", "industry", "sector",
  // Price
  "close", "change", "volume", "relative_volume_10d_calc", "average_volume_10d_calc",
  // Valuation
  "market_cap_basic", "price_earnings_ttm", "earnings_per_share_basic_ttm",
  "price_book_ratio", "price_sales_ratio", "enterprise_value_to_ebitda_ttm", "dividends_yield",
  // Profitability
  "return_on_equity", "return_on_assets", "net_margin", "operating_margin", "gross_margin",
  // Financial Health
  "debt_to_equity", "current_ratio", "total_revenue", "net_income",
  // Technicals
  "SMA10", "SMA20", "SMA50", "RSI",
  "High.All", "Low.All",
  "Perf.W", "Perf.1M", "Perf.3M", "Perf.Y",
  "beta_1_year", "ATR",
];

// Simple in-memory cache
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(symbols: string[] | undefined, mode: string): string {
  if (mode === "top") return "__top50__";
  return (symbols ?? []).slice().sort().join(",");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const symbols: string[] | undefined = body.symbols;
    const mode: string = body.mode || (symbols ? "symbols" : "top");

    const cacheKey = getCacheKey(symbols, mode);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build TradingView request
    let filter: unknown[] = [];
    let tvSymbols: unknown = undefined;
    let sort: unknown = { sortBy: "market_cap_basic", sortOrder: "desc" };
    let range: unknown = [0, 50];

    if (mode === "symbols" && symbols?.length) {
      tvSymbols = {
        tickers: symbols.map((s) => {
          // If already prefixed, use as-is
          if (s.includes(":")) return s;
          return `NSE:${s}`;
        }),
      };
      sort = undefined;
      range = [0, symbols.length];
    } else {
      // Top 50 by market cap - NSE equities
      filter = [
        { left: "exchange", operation: "equal", right: "NSE" },
        { left: "is_primary", operation: "equal", right: true },
        { left: "type", operation: "equal", right: "stock" },
      ];
    }

    const tvPayload: Record<string, unknown> = {
      columns: FIELDS,
      range,
      ...(tvSymbols ? { symbols: tvSymbols } : {}),
      ...(filter.length ? { filter } : {}),
      ...(sort ? { sort } : {}),
    };

    const tvRes = await fetch(TRADINGVIEW_SCAN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tvPayload),
    });

    if (!tvRes.ok) {
      const errText = await tvRes.text();
      console.error("TradingView error:", tvRes.status, errText);
      return new Response(JSON.stringify({ error: "TradingView API error", status: tvRes.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tvData = await tvRes.json();
    const rows = tvData.data || [];

    const results = rows.map((row: { s: string; d: (number | string | null)[] }) => {
      const d = row.d;
      return {
        ticker: row.s,
        // Identity
        name: d[0],
        description: d[1],
        industry: d[2],
        sector: d[3],
        // Price
        close: d[4],
        change: d[5],
        volume: d[6],
        relative_volume: d[7],
        avg_volume_10d: d[8],
        // Valuation
        market_cap: d[9],
        pe_ratio: d[10],
        eps: d[11],
        pb_ratio: d[12],
        ps_ratio: d[13],
        ev_ebitda: d[14],
        dividend_yield: d[15],
        // Profitability
        roe: d[16],
        roa: d[17],
        net_margin: d[18],
        operating_margin: d[19],
        gross_margin: d[20],
        // Financial
        debt_to_equity: d[21],
        current_ratio: d[22],
        total_revenue: d[23],
        net_income: d[24],
        // Technicals
        sma10: d[25],
        sma20: d[26],
        sma50: d[27],
        rsi: d[28],
        high_52w: d[29],
        low_52w: d[30],
        perf_w: d[31],
        perf_1m: d[32],
        perf_3m: d[33],
        perf_y: d[34],
        beta: d[35],
        atr: d[36],
      };
    });

    const responseData = { data: results, totalCount: tvData.totalCount || results.length };

    // Update cache
    cache.set(cacheKey, { data: responseData, ts: Date.now() });
    // Limit cache size
    if (cache.size > 100) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
      if (oldest) cache.delete(oldest[0]);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("tradingview-scan error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
