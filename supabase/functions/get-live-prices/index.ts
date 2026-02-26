import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DHAN_API_URL = "https://api.dhan.co/v2";


// Yahoo Finance v8 chart API — free, no auth, NSE (.NS), BSE (.BO), US stocks (as-is)
// NOTE: v7/quote endpoint is DEAD (returns Unauthorized). Use v8/chart instead.
const YAHOO_CHART_URL = "https://query2.finance.yahoo.com/v8/finance/chart";

interface InstrumentInput {
  symbol: string;
  security_id?: string | null;
  exchange_segment?: string;
}

interface PriceResult {
  ltp: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
  volume?: number;
  source: "dhan" | "yahoo" | "unavailable";
  timestamp: string;
  security_id?: string;
  exchange_segment?: string;
  warning?: string;
  delayed?: boolean;
}

// ── User credential resolvers ─────────────────────────────────────────

async function resolveUserDhanToken(userId: string | undefined, supabase: any) {
  if (!userId || !supabase) return { token: null, clientId: null, hasApiKey: false };
  const { data } = await supabase
    .from("user_settings")
    .select("dhan_access_token, dhan_client_id, dhan_enabled, dhan_api_key, dhan_api_secret")
    .eq("user_id", userId)
    .single();
  if (data?.dhan_access_token && data?.dhan_client_id && data?.dhan_enabled) {
    return {
      token: data.dhan_access_token as string,
      clientId: data.dhan_client_id as string,
      hasApiKey: !!(data.dhan_api_key && data.dhan_api_secret),
    };
  }
  return { token: null, clientId: null, hasApiKey: false };
}



// ── Instrument helpers ────────────────────────────────────────────────

async function buildSecurityIdMap(
  instruments: InstrumentInput[],
  symbols: string[],
  supabase: any
) {
  const securityIdMap: Record<string, { symbol: string; exchangeSegment: string }> = {};

  instruments.forEach((inst) => {
    if (inst.security_id) {
      securityIdMap[inst.security_id] = {
        symbol: inst.symbol,
        exchangeSegment: inst.exchange_segment || "NSE_EQ",
      };
    }
  });

  if (supabase) {
    const symbolsNeedingLookup = instruments.filter((i) => !i.security_id).map((i) => i.symbol);
    const rawSymbols = symbols.filter((s) => !instruments.find((i) => i.symbol === s));
    symbolsNeedingLookup.push(...rawSymbols);
    const unique = [...new Set(symbolsNeedingLookup)];

    if (unique.length > 0) {
      const { data } = await supabase
        .from("instrument_master")
        .select("security_id, trading_symbol, exchange_segment")
        .in("trading_symbol", unique);
      if (data) {
        data.forEach((row: any) => {
          if (!securityIdMap[row.security_id]) {
            securityIdMap[row.security_id] = {
              symbol: row.trading_symbol,
              exchangeSegment: row.exchange_segment,
            };
          }
        });
      }
    }
  }
  return securityIdMap;
}

function buildDhanRequestBody(
  securityIdMap: Record<string, { symbol: string; exchangeSegment: string }>
) {
  const requestBody: Record<string, number[]> = {};
  Object.entries(securityIdMap).forEach(([secId, info]) => {
    const numericId = parseInt(secId, 10);
    if (isNaN(numericId)) return;
    const seg = info.exchangeSegment;
    if (!requestBody[seg]) requestBody[seg] = [];
    requestBody[seg].push(numericId);
  });
  return requestBody;
}

// ── Dhan token renewal ────────────────────────────────────────────────

async function tryRenewDhanToken(
  currentToken: string,
  clientId: string,
  userId: string | undefined,
  supabase: any
): Promise<string | null> {
  try {
    const renewRes = await fetch(`${DHAN_API_URL}/RenewToken`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "access-token": currentToken,
        dhanClientId: clientId,
      },
    });

    if (renewRes.ok) {
      const renewData = await renewRes.json();
      const newToken = renewData?.accessToken || renewData?.data?.accessToken;
      if (newToken) {
        if (userId && supabase) {
          const expiryTime = renewData?.expiryTime || renewData?.data?.expiryTime || null;
          await supabase
            .from("user_settings")
            .update({
              dhan_access_token: newToken,
              dhan_verified_at: new Date().toISOString(),
              ...(expiryTime && { dhan_token_expiry: expiryTime }),
            } as any)
            .eq("user_id", userId);
        }
        console.log("Dhan token auto-renewed!");
        return newToken;
      }
    } else {
      console.warn("Dhan /RenewToken failed:", renewRes.status);
    }
  } catch (e) {
    console.warn("Dhan token renewal exception:", e);
  }
  return null;
}

// ── Dhan fetcher (real-time, user-specific) ───────────────────────────

async function fetchFromDhan(
  token: string,
  clientId: string,
  requestBody: Record<string, number[]>,
  securityIdMap: Record<string, { symbol: string; exchangeSegment: string }>,
  timestamp: string,
  userId: string | undefined,
  supabase: any
): Promise<{ prices: Record<string, PriceResult>; tokenExpired?: boolean }> {
  const prices: Record<string, PriceResult> = {};
  const bodyStr = JSON.stringify(requestBody);

  const doFetch = (t: string) =>
    fetch(`${DHAN_API_URL}/marketfeed/quote`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "access-token": t,
        "client-id": clientId,
      },
      body: bodyStr,
    });

  let res = await doFetch(token);

  // Handle rate limit
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 1500));
    res = await doFetch(token);
  }

  // Auto-renew on 401
  if (res.status === 401) {
    console.log("Dhan 401 — attempting token renewal...");
    const newToken = await tryRenewDhanToken(token, clientId, userId, supabase);
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      console.warn("Token renewal failed — will fall back to Yahoo");
      return { prices, tokenExpired: true };
    }
  }

  // Still failing after renewal attempt
  if (res.status === 401) {
    console.warn("Dhan still 401 after renewal — falling back to Yahoo");
    return { prices, tokenExpired: true };
  }

  if (!res.ok) {
    console.warn("Dhan API error:", res.status);
    return { prices };
  }

  const quoteData = await res.json();

  for (const segment of Object.keys(requestBody)) {
    const segData = quoteData?.data?.[segment];
    if (!segData) continue;

    for (const [secId, quote] of Object.entries(segData)) {
      const info = securityIdMap[secId];
      if (!info || !quote) continue;
      const q = quote as Record<string, any>;

      const ltp = q.last_price || q.ltp || 0;
      if (!ltp) continue;

      const ohlc = q.ohlc || {};
      const prevClose = ohlc.close || q.prev_close || undefined;
      const netChange = q.net_change;
      const change = netChange != null
        ? parseFloat(Number(netChange).toFixed(2))
        : prevClose ? parseFloat((ltp - prevClose).toFixed(2)) : 0;
      const changePercent = prevClose && prevClose > 0
        ? parseFloat(((change / prevClose) * 100).toFixed(2))
        : 0;

      prices[info.symbol] = {
        ltp,
        change,
        changePercent,
        open: ohlc.open || undefined,
        high: ohlc.high || undefined,
        low: ohlc.low || undefined,
        prevClose: prevClose ? parseFloat(Number(prevClose).toFixed(2)) : undefined,
        volume: q.volume || undefined,
        source: "dhan",
        timestamp,
        security_id: secId,
        exchange_segment: segment,
      };
    }
  }

  return { prices };
}



// ── Yahoo Finance fetcher (central default) ───────────────────────────
//
// Symbol mapping:
//   Indian NSE  → append ".NS"  (RELIANCE → RELIANCE.NS)
//   Indian BSE  → append ".BO"  (RELIANCE → RELIANCE.BO)
//   US stocks   → use as-is     (AAPL, TSLA, MSFT)
//   exchange override in symbol: "RELIANCE:NSE" → RELIANCE.NS
//                                "AAPL:US"       → AAPL

function toYahooTicker(symbol: string, exchangeSegment?: string): string {
  if (symbol.includes(".NS") || symbol.includes(".BO") || symbol.includes("-USD")) return symbol;

  // Explicit exchange hint in symbol string
  if (symbol.includes(":")) {
    const [base, exch] = symbol.split(":");
    if (exch === "BSE" || exch === "BSE_EQ") return `${base}.BO`;
    if (exch === "US" || exch === "NASDAQ" || exch === "NYSE") return base;
    return `${base}.NS`;
  }

  // From exchange_segment field
  if (exchangeSegment?.startsWith("BSE")) return `${symbol}.BO`;
  if (exchangeSegment === "US" || exchangeSegment === "NASDAQ") return symbol;

  // Default: NSE equity
  return `${symbol}.NS`;
}

async function fetchFromYahoo(
  symbolsWithSegment: Array<{ symbol: string; exchangeSegment?: string; isUS?: boolean }>,
  timestamp: string
): Promise<Record<string, PriceResult>> {
  const prices: Record<string, PriceResult> = {};
  if (symbolsWithSegment.length === 0) return prices;

  try {
    // Build ticker → original symbol map
    const yahooJobs: Array<{ ticker: string; originalSymbol: string }> = [];

    for (const { symbol, exchangeSegment, isUS } of symbolsWithSegment) {
      const ticker = isUS ? symbol.split(":")[0] : toYahooTicker(symbol, exchangeSegment);
      yahooJobs.push({ ticker, originalSymbol: symbol });
    }

    // De-duplicate tickers
    const seen = new Set<string>();
    const uniqueJobs = yahooJobs.filter((j) => {
      if (seen.has(j.ticker)) return false;
      seen.add(j.ticker);
      return true;
    });

    console.log(`Yahoo Finance v8: fetching ${uniqueJobs.length} symbols:`, uniqueJobs.map((j) => j.ticker).join(", "));

    // v8/chart only supports one symbol per request — fetch in parallel
    const results = await Promise.allSettled(
      uniqueJobs.map(async ({ ticker, originalSymbol }) => {
        const url = `${YAHOO_CHART_URL}/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; MyTradeBook/1.0)",
          },
        });

        if (!res.ok) {
          console.warn(`Yahoo v8 error for ${ticker}: ${res.status}`);
          return null;
        }

        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return null;

        const ltp = meta.regularMarketPrice ?? 0;
        if (!ltp) return null;

        const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
        const change = prevClose ? parseFloat((ltp - prevClose).toFixed(2)) : 0;
        const changePercent = prevClose > 0 ? parseFloat(((change / prevClose) * 100).toFixed(2)) : 0;
        const currency = meta.currency ?? "INR";

        prices[originalSymbol] = {
          ltp: parseFloat(ltp.toFixed(2)),
          change,
          changePercent,
          open: undefined,  // v8/chart meta doesn't expose regularMarketOpen directly
          high: meta.regularMarketDayHigh ?? undefined,
          low: meta.regularMarketDayLow ?? undefined,
          prevClose: prevClose ? parseFloat(Number(prevClose).toFixed(2)) : undefined,
          volume: meta.regularMarketVolume ?? undefined,
          source: "yahoo",
          timestamp,
          delayed: true,  // Yahoo free tier is ~15 min delayed
          warning: currency !== "INR" ? `Price in ${currency}` : undefined,
        };

        return originalSymbol;
      })
    );

    const fulfilled = results.filter((r) => r.status === "fulfilled" && r.value).length;
    console.log(`Yahoo Finance v8 returned ${fulfilled}/${uniqueJobs.length} prices`);
  } catch (e) {
    console.warn("Yahoo Finance v8 error:", e);
  }
  return prices;
}

// ── Main handler ──────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const body = await req.json();

    // Resolve userId from JWT only (never trust body)
    let userId: string | undefined;
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const authHeader = req.headers.get("authorization") || "";
      if (authHeader.startsWith("Bearer ")) {
        const anonClient = createClient(
          SUPABASE_URL,
          Deno.env.get("SUPABASE_ANON_KEY") || SUPABASE_SERVICE_KEY
        );
        const { data: { user } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
        userId = user?.id;
      }
    }

    const symbols: string[] = body.symbols || [];
    const instruments: InstrumentInput[] = body.instruments || [];
    const usSymbols: string[] = body.us_symbols || [];  // US market symbols (AAPL, TSLA, etc.)

    if (instruments.length > 0) {
      instruments.forEach((inst) => {
        if (!symbols.includes(inst.symbol)) symbols.push(inst.symbol);
      });
    }

    if (symbols.length === 0 && instruments.length === 0 && usSymbols.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No symbols provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const timestamp = new Date().toISOString();
    const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
      : null;

    // Load user-specific credentials
    const dhanCreds = await resolveUserDhanToken(userId, supabase);


    // Build Dhan instrument lookup (needs security IDs)
    const securityIdMap = await buildSecurityIdMap(instruments, symbols, supabase);
    const dhanRequestBody = buildDhanRequestBody(securityIdMap);
    const hasDhanIds = Object.keys(dhanRequestBody).some((k) => dhanRequestBody[k].length > 0);

    let prices: Record<string, PriceResult> = {};
    let activeSource: "dhan" | "yahoo" | "unavailable" = "unavailable";
    let dhanTokenExpired = false;

    // ── Step 1: Dhan (per-user, real-time) ─────────────────────────────
    // Only attempted if the user has connected their Dhan account
    if (dhanCreds.token && dhanCreds.clientId && hasDhanIds) {
      console.log("Trying Dhan for user", userId);
      const dhanResult = await fetchFromDhan(
        dhanCreds.token, dhanCreds.clientId, dhanRequestBody,
        securityIdMap, timestamp, userId, supabase
      );
      dhanTokenExpired = !!dhanResult.tokenExpired;

      if (Object.keys(dhanResult.prices).length > 0) {
        prices = dhanResult.prices;
        activeSource = "dhan";
        console.log(`Dhan returned ${Object.keys(prices).length} prices`);
      } else {
        console.warn("Dhan returned no prices (expired or error) — falling back");
      }
    } else {
      console.log("No user Dhan token — going directly to Yahoo Finance");
    }



    // ── Step 2: Yahoo Finance (central default — always runs for missing symbols) ──
    // Builds the list of all symbols still missing + all US symbols
    const symbolsMissing = symbols.filter((s) => !prices[s]);
    const yahooInput: Array<{ symbol: string; exchangeSegment?: string; isUS?: boolean }> = [];

    for (const sym of symbolsMissing) {
      const inst = instruments.find((i) => i.symbol === sym);
      yahooInput.push({ symbol: sym, exchangeSegment: inst?.exchange_segment, isUS: false });
    }
    for (const sym of usSymbols) {
      if (!prices[sym]) yahooInput.push({ symbol: sym, isUS: true });
    }

    if (yahooInput.length > 0) {
      const yahooPrices = await fetchFromYahoo(yahooInput, timestamp);
      if (Object.keys(yahooPrices).length > 0) {
        Object.assign(prices, yahooPrices);
        if (activeSource === "unavailable") activeSource = "yahoo";
      }
    }

    // Determine final failover state
    const failoverActive =
      activeSource !== "dhan" ||
      Object.values(prices).some((p) => p.source !== "dhan");

    const unfetched = [...symbols, ...usSymbols].filter((s) => !prices[s]);
    if (unfetched.length > 0) console.log("Still unavailable:", unfetched.join(", "));

    // ── IMPORTANT: Never return token_expired as an error if we got prices via Yahoo
    // Only return it as metadata so the Settings UI can show a "renew" nudge
    return new Response(
      JSON.stringify({
        success: true,
        prices,
        timestamp,
        source: activeSource,
        fetched_count: Object.keys(prices).length,
        requested_count: symbols.length + usSymbols.length,
        failover_active: failoverActive,
        dhan_token_expired: dhanTokenExpired,   // informational only — UI can show a soft nudge
        yahoo_used: Object.values(prices).some((p) => p.source === "yahoo"),
        dhan_connected: !!dhanCreds.token,

      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("get-live-prices error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
