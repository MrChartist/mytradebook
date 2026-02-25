import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DHAN_API_URL = "https://api.dhan.co/v2";

// TrueData REST API base URL
// Adjust based on your TrueData subscription plan
const TRUEDATA_API_URL = "https://live.truedata.in/getLiveData";

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
  source: "dhan" | "truedata" | "unavailable";
  timestamp: string;
  security_id?: string;
  exchange_segment?: string;
  warning?: string;
}

// ── helpers ──────────────────────────────────────────────────────────

async function resolveUserToken(userId: string | undefined, supabase: any) {
  if (!userId || !supabase) return { token: null, clientId: null, hasApiKey: false };
  const { data } = await supabase
    .from("user_settings")
    .select("dhan_access_token, dhan_client_id, dhan_enabled, dhan_api_key, dhan_api_secret")
    .eq("user_id", userId)
    .single();
  if (data?.dhan_access_token && data?.dhan_client_id && data?.dhan_enabled) {
    console.log("Using per-user Dhan token");
    return {
      token: data.dhan_access_token,
      clientId: data.dhan_client_id,
      hasApiKey: !!(data.dhan_api_key && data.dhan_api_secret),
    };
  }
  return {
    token: null,
    clientId: null,
    hasApiKey: !!(data?.dhan_api_key && data?.dhan_api_secret),
  };
}

async function resolveTrueDataCreds(userId: string | undefined, supabase: any) {
  // Per-user credentials first
  if (userId && supabase) {
    const { data } = await supabase
      .from("user_settings")
      .select("truedata_username, truedata_password, truedata_enabled")
      .eq("user_id", userId)
      .single();
    if (data?.truedata_username && data?.truedata_password && data?.truedata_enabled) {
      console.log("Using per-user TrueData credentials");
      return { username: data.truedata_username, password: data.truedata_password };
    }
  }
  // Fallback to global secrets
  const username = Deno.env.get("TRUEDATA_USERNAME");
  const password = Deno.env.get("TRUEDATA_PASSWORD");
  if (username && password) {
    console.log("Using global TrueData credentials");
    return { username, password };
  }
  return { username: null, password: null };
}

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
    const symbolsNeedingLookup = instruments
      .filter((i) => !i.security_id)
      .map((i) => i.symbol);
    const rawSymbols = symbols.filter((s) => !instruments.find((i) => i.symbol === s));
    symbolsNeedingLookup.push(...rawSymbols);
    const unique = [...new Set(symbolsNeedingLookup)];

    if (unique.length > 0) {
      console.log("Looking up security_ids for:", unique);
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

function buildRequestBody(securityIdMap: Record<string, { symbol: string; exchangeSegment: string }>) {
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

function dhanHeaders(token: string, clientId: string) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "access-token": token,
    "client-id": clientId,
  };
}

// ── Dhan fetcher ────────────────────────────────────────────────────

async function fetchFromDhan(
  activeToken: string,
  activeClientId: string,
  requestBody: Record<string, number[]>,
  securityIdMap: Record<string, { symbol: string; exchangeSegment: string }>,
  timestamp: string,
  hasApiKey: boolean
): Promise<{ prices: Record<string, PriceResult>; error?: string; tokenExpired?: boolean }> {
  const headers = dhanHeaders(activeToken, activeClientId);
  const bodyStr = JSON.stringify(requestBody);
  const prices: Record<string, PriceResult> = {};

  console.log("Calling Dhan /marketfeed/quote for", Object.values(requestBody).flat().length, "instruments");

  let retries = 0;
  let quoteRes: Response | null = null;

  while (retries < 3) {
    quoteRes = await fetch(`${DHAN_API_URL}/marketfeed/quote`, {
      method: "POST",
      headers,
      body: bodyStr,
    });

    if (quoteRes.status === 429) {
      retries++;
      const waitMs = 1000 * retries;
      console.warn(`Rate limited (429), retry ${retries}/3 after ${waitMs}ms`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    break;
  }

  if (quoteRes && quoteRes.ok) {
    const quoteData = await quoteRes.json();

    for (const segment of Object.keys(requestBody)) {
      const segData = quoteData?.data?.[segment];
      if (!segData) continue;

      for (const [secId, quote] of Object.entries(segData)) {
        const info = securityIdMap[secId];
        if (!info || !quote) continue;
        const q = quote as Record<string, any>;

        const ltp = q.last_price || q.ltp || 0;
        const ohlc = q.ohlc || {};
        const open = ohlc.open || undefined;
        const high = ohlc.high || undefined;
        const low = ohlc.low || undefined;
        const prevClose = ohlc.close || q.prev_close || undefined;
        const volume = q.volume || undefined;
        const netChange = q.net_change;

        const change = netChange != null ? parseFloat(Number(netChange).toFixed(2)) : (prevClose ? parseFloat((ltp - prevClose).toFixed(2)) : 0);
        const changePercent = prevClose && prevClose > 0 ? parseFloat(((change / prevClose) * 100).toFixed(2)) : 0;

        let warning: string | undefined;
        if (prevClose && prevClose > 0 && Math.abs(changePercent) > 50) {
          warning = "Large price change detected - verify symbol mapping";
        }

        prices[info.symbol] = {
          ltp,
          change,
          changePercent,
          open,
          high,
          low,
          prevClose: prevClose ? parseFloat(Number(prevClose).toFixed(2)) : undefined,
          volume,
          source: "dhan",
          timestamp,
          security_id: secId,
          exchange_segment: segment,
          warning,
        };
      }
    }
    return { prices };
  } else if (quoteRes) {
    const errText = await quoteRes.text();
    console.error("Dhan quote error:", quoteRes.status, errText);

    if (quoteRes.status === 401) {
      return {
        prices: {},
        error: hasApiKey
          ? "Dhan token expired. Go to Settings to re-authorize with your API Key."
          : "Dhan access token is invalid or expired. Update it in Settings.",
        tokenExpired: true,
      };
    }
    return { prices: {}, error: `Dhan API error: ${quoteRes.status}` };
  }

  return { prices: {}, error: "No response from Dhan API" };
}

// ── TrueData fetcher ────────────────────────────────────────────────

/**
 * Fetch live prices from TrueData REST API.
 * 
 * TrueData symbol format: "NSE:RELIANCE" or just "RELIANCE"
 * Adjust the URL and auth mechanism based on your TrueData subscription.
 * 
 * Common TrueData REST endpoints:
 * - GET https://live.truedata.in/getLiveData?user={user}&password={pass}&symbol=NSE:RELIANCE
 * - POST https://api.truedata.in/getMultiQuotes (for batch)
 */
async function fetchFromTrueData(
  username: string,
  password: string,
  symbols: string[],
  timestamp: string
): Promise<{ prices: Record<string, PriceResult>; error?: string }> {
  const prices: Record<string, PriceResult> = {};

  if (symbols.length === 0) {
    return { prices, error: "No symbols provided" };
  }

  try {
    // TrueData expects symbols in format "NSE:SYMBOL" for equities
    const trueDataSymbols = symbols.map((s) => {
      // If already prefixed, keep as-is
      if (s.includes(":")) return s;
      // Default to NSE equity
      return `NSE:${s}`;
    });

    const symbolParam = trueDataSymbols.join(",");
    const url = `${TRUEDATA_API_URL}?user=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&symbol=${encodeURIComponent(symbolParam)}`;

    console.log("Calling TrueData API for", symbols.length, "symbols");

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("TrueData API error:", response.status, errText);
      return { prices, error: `TrueData API error: ${response.status}` };
    }

    const data = await response.json();

    // TrueData response format varies by plan. Common structure:
    // { "status": "success", "data": [ { "symbol": "NSE:RELIANCE", "ltp": 2800, ... } ] }
    // OR: { "RELIANCE": { "ltp": 2800, "open": 2790, ... } }
    
    if (Array.isArray(data?.data)) {
      // Array format
      for (const item of data.data) {
        const rawSymbol = item.symbol || item.Symbol || "";
        // Strip exchange prefix to match our internal format
        const symbol = rawSymbol.includes(":") ? rawSymbol.split(":")[1] : rawSymbol;
        
        if (!symbol || !symbols.includes(symbol)) continue;

        const ltp = parseFloat(item.ltp || item.LTP || item.last_price || 0);
        const open = parseFloat(item.open || item.Open || 0) || undefined;
        const high = parseFloat(item.high || item.High || 0) || undefined;
        const low = parseFloat(item.low || item.Low || 0) || undefined;
        const prevClose = parseFloat(item.prev_close || item.close || item.Close || 0) || undefined;
        const volume = parseInt(item.volume || item.Volume || 0) || undefined;

        const change = prevClose ? parseFloat((ltp - prevClose).toFixed(2)) : 0;
        const changePercent = prevClose && prevClose > 0
          ? parseFloat(((change / prevClose) * 100).toFixed(2))
          : 0;

        prices[symbol] = {
          ltp,
          change,
          changePercent,
          open,
          high,
          low,
          prevClose: prevClose ? parseFloat(Number(prevClose).toFixed(2)) : undefined,
          volume,
          source: "truedata",
          timestamp,
        };
      }
    } else if (typeof data === "object" && data !== null) {
      // Object/map format: { "RELIANCE": { ... }, "TCS": { ... } }
      for (const [key, item] of Object.entries(data)) {
        if (key === "status" || key === "message") continue;
        const q = item as Record<string, any>;
        const symbol = key.includes(":") ? key.split(":")[1] : key;
        
        if (!symbols.includes(symbol)) continue;

        const ltp = parseFloat(q.ltp || q.LTP || q.last_price || 0);
        const open = parseFloat(q.open || q.Open || 0) || undefined;
        const high = parseFloat(q.high || q.High || 0) || undefined;
        const low = parseFloat(q.low || q.Low || 0) || undefined;
        const prevClose = parseFloat(q.prev_close || q.close || q.Close || 0) || undefined;
        const volume = parseInt(q.volume || q.Volume || 0) || undefined;

        const change = prevClose ? parseFloat((ltp - prevClose).toFixed(2)) : 0;
        const changePercent = prevClose && prevClose > 0
          ? parseFloat(((change / prevClose) * 100).toFixed(2))
          : 0;

        prices[symbol] = {
          ltp,
          change,
          changePercent,
          open,
          high,
          low,
          prevClose: prevClose ? parseFloat(Number(prevClose).toFixed(2)) : undefined,
          volume,
          source: "truedata",
          timestamp,
        };
      }
    }

    return { prices };
  } catch (e) {
    console.error("TrueData fetch error:", e);
    return { prices, error: e instanceof Error ? e.message : "TrueData fetch failed" };
  }
}

// ── main handler ─────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DHAN_ACCESS_TOKEN = Deno.env.get("DHAN_ACCESS_TOKEN");
    const DHAN_CLIENT_ID = Deno.env.get("DHAN_CLIENT_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const body = await req.json();

    // Resolve user_id: prefer body, then extract from auth JWT
    let userId = body.user_id;
    if (!userId && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const authHeader = req.headers.get("authorization") || "";
      if (authHeader.startsWith("Bearer ")) {
        const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") || SUPABASE_SERVICE_KEY);
        const { data: { user } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
        userId = user?.id;
      }
    }

    const symbols: string[] = body.symbols || [];
    const instruments: InstrumentInput[] = body.instruments || [];

    if (instruments.length > 0) {
      instruments.forEach((inst) => {
        if (!symbols.includes(inst.symbol)) symbols.push(inst.symbol);
      });
    }

    if (symbols.length === 0 && instruments.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No symbols or instruments provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const timestamp = new Date().toISOString();
    const supabase =
      SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

    // Resolve credentials for both providers
    const userCreds = await resolveUserToken(userId, supabase);
    const trueDataCreds = await resolveTrueDataCreds(userId, supabase);
    const activeToken = userCreds.token || DHAN_ACCESS_TOKEN;
    const activeClientId = userCreds.clientId || DHAN_CLIENT_ID;

    const securityIdMap = await buildSecurityIdMap(instruments, symbols, supabase);
    const requestBody = buildRequestBody(securityIdMap);
    const hasIds = Object.keys(requestBody).some((k) => requestBody[k].length > 0);

    let prices: Record<string, PriceResult> = {};
    let activeSource: "dhan" | "truedata" | "unavailable" = "unavailable";
    let failoverActive = false;
    let dhanError: string | undefined;

    // ── Step 1: Try Dhan (primary) ──────────────────────────────────
    if (activeToken && activeClientId && hasIds) {
      const dhanResult = await fetchFromDhan(
        activeToken, activeClientId, requestBody, securityIdMap,
        timestamp, userCreds.hasApiKey
      );

      if (dhanResult.tokenExpired) {
        // Token expired — return immediately so UI can prompt user
        return new Response(
          JSON.stringify({
            success: false,
            error: "token_expired",
            message: dhanResult.error,
            has_api_key: userCreds.hasApiKey,
            prices: {},
            timestamp,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (Object.keys(dhanResult.prices).length > 0) {
        prices = dhanResult.prices;
        activeSource = "dhan";
      } else {
        dhanError = dhanResult.error;
        console.warn("Dhan returned no prices:", dhanError);
      }
    }

    // ── Step 2: Failover to TrueData if Dhan failed ─────────────────
    if (
      Object.keys(prices).length === 0 &&
      trueDataCreds.username &&
      trueDataCreds.password
    ) {
      console.log("Dhan failed or unavailable, failing over to TrueData");
      failoverActive = true;

      const trueDataResult = await fetchFromTrueData(
        trueDataCreds.username,
        trueDataCreds.password,
        symbols,
        timestamp
      );

      if (Object.keys(trueDataResult.prices).length > 0) {
        prices = trueDataResult.prices;
        activeSource = "truedata";
      } else {
        console.warn("TrueData also failed:", trueDataResult.error);
      }
    }

    const unfetched = symbols.filter((s) => !prices[s]);
    if (unfetched.length > 0) console.log(`Prices unavailable for: ${unfetched.join(", ")}`);

    return new Response(
      JSON.stringify({
        success: true,
        prices,
        timestamp,
        source: activeSource,
        fetched_count: Object.keys(prices).length,
        requested_count: symbols.length,
        using_user_token: !!userCreds.token,
        failover_active: failoverActive,
        dhan_error: dhanError,
        truedata_available: !!(trueDataCreds.username && trueDataCreds.password),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Get live prices error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
