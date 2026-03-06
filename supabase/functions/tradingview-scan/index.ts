import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TRADINGVIEW_SCAN_URL = "https://scanner.tradingview.com/india/scan";

// Only fields known to work on the India scanner
const FIELDS = [
  "name", "description", "industry", "sector",
  "close", "change", "volume", "relative_volume_10d_calc", "average_volume_10d_calc",
  "market_cap_basic", "price_earnings_ttm", "earnings_per_share_basic_ttm",
  "price_book_ratio", "price_sales_ratio", "dividends_yield",
  "return_on_equity", "return_on_assets", "net_margin", "operating_margin", "gross_margin",
  "debt_to_equity", "current_ratio", "total_revenue", "net_income",
  "SMA10", "SMA20", "SMA50", "RSI",
  "High.All", "Low.All",
  "price_52_week_high", "price_52_week_low",
  "Perf.W", "Perf.1M", "Perf.3M", "Perf.Y",
  "beta_1_year", "ATR",
];

// Build a name→friendly-key map so we never rely on hardcoded indices
const FIELD_KEY_MAP: Record<string, string> = {
  "name": "name",
  "description": "description",
  "industry": "industry",
  "sector": "sector",
  "close": "close",
  "change": "change",
  "volume": "volume",
  "relative_volume_10d_calc": "relative_volume",
  "average_volume_10d_calc": "avg_volume_10d",
  "market_cap_basic": "market_cap",
  "price_earnings_ttm": "pe_ratio",
  "earnings_per_share_basic_ttm": "eps",
  "price_book_ratio": "pb_ratio",
  "price_sales_ratio": "ps_ratio",
  "dividends_yield": "dividend_yield",
  "return_on_equity": "roe",
  "return_on_assets": "roa",
  "net_margin": "net_margin",
  "operating_margin": "operating_margin",
  "gross_margin": "gross_margin",
  "debt_to_equity": "debt_to_equity",
  "current_ratio": "current_ratio",
  "total_revenue": "total_revenue",
  "net_income": "net_income",
  "SMA10": "sma10",
  "SMA20": "sma20",
  "SMA50": "sma50",
  "RSI": "rsi",
  "High.All": "ath",
  "Low.All": "atl",
  "price_52_week_high": "high_52w",
  "price_52_week_low": "low_52w",
  "Perf.W": "perf_w",
  "Perf.1M": "perf_1m",
  "Perf.3M": "perf_3m",
  "Perf.Y": "perf_y",
  "beta_1_year": "beta",
  "ATR": "atr",
};

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

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

    let filter: unknown[] = [];
    let tvSymbols: unknown = undefined;
    const limit: number = body.limit ?? 500;
    const offset: number = body.offset ?? 0;
    let sort: unknown = { sortBy: "market_cap_basic", sortOrder: "desc" };
    let range: unknown = [offset, offset + limit];

    if (mode === "symbols" && symbols?.length) {
      tvSymbols = {
        tickers: symbols.map((s) => (s.includes(":") ? s : `NSE:${s}`)),
      };
      sort = undefined;
      range = [0, symbols.length];
    } else {
      filter = [
        { left: "exchange", operation: "equal", right: "NSE" },
        { left: "is_primary", operation: "equal", right: true },
        { left: "type", operation: "equal", right: "stock" },
      ];

      // Apply server-side filters from request
      const filters: { field: string; op: string; value: number }[] = body.filters ?? [];
      for (const f of filters) {
        filter.push({ left: f.field, operation: f.op, right: f.value });
      }

      if (body.sortBy) {
        // Map friendly keys back to TV field names
        const reverseMap: Record<string, string> = {};
        for (const [tvField, friendlyKey] of Object.entries(FIELD_KEY_MAP)) {
          reverseMap[friendlyKey] = tvField;
        }
        const tvSortField = reverseMap[body.sortBy] || body.sortBy;
        sort = { sortBy: tvSortField, sortOrder: body.sortOrder || "desc" };
      }
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
      const record: Record<string, unknown> = { ticker: row.s };
      FIELDS.forEach((field, idx) => {
        const key = FIELD_KEY_MAP[field] || field;
        record[key] = row.d[idx];
      });
      return record;
    });

    const responseData = { data: results, totalCount: tvData.totalCount || results.length };

    cache.set(cacheKey, { data: responseData, ts: Date.now() });
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
