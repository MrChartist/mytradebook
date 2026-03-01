import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DHAN_API_URL = "https://api.dhan.co/v2";

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
  source: "dhan" | "unavailable";
  timestamp: string;
  security_id?: string;
  exchange_segment?: string;
  warning?: string;
}

// ── helpers ──────────────────────────────────────────────────────────

async function resolveUserToken(
  userId: string | undefined,
  supabase: any
) {
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

    const prices: Record<string, PriceResult> = {};
    const timestamp = new Date().toISOString();

    const supabase =
      SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

    const userCreds = await resolveUserToken(userId, supabase);
    const activeToken = userCreds.token || DHAN_ACCESS_TOKEN;
    const activeClientId = userCreds.clientId || DHAN_CLIENT_ID;

    const securityIdMap = await buildSecurityIdMap(instruments, symbols, supabase);
    const requestBody = buildRequestBody(securityIdMap);

    const hasIds = Object.keys(requestBody).some((k) => requestBody[k].length > 0);

    if (activeToken && activeClientId && hasIds) {
      const headers = dhanHeaders(activeToken, activeClientId);
      const bodyStr = JSON.stringify(requestBody);

      // Use single /marketfeed/quote call — returns LTP + OHLC + Volume + depth
      // This avoids dual calls that hit Dhan's 1 req/sec rate limit
      console.log("Calling /marketfeed/quote for", Object.values(requestBody).flat().length, "instruments");

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
          const waitMs = 1000 * retries; // 1s, 2s, 3s backoff
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
      } else if (quoteRes) {
        const errText = await quoteRes.text();
        console.error("Dhan quote error:", quoteRes.status, errText);

        // If 401, parse the error body to distinguish 806 (Data API not subscribed) from actual token expiry
        if (quoteRes.status === 401) {
          let errorType = "token_expired";
          let message = userCreds.hasApiKey
            ? "Dhan token expired. Go to Settings to re-authorize with your API Key."
            : "Dhan access token is invalid or expired. Update it in Settings.";

          // Try to parse error body for specific error codes
          try {
            const errBody = JSON.parse(errText);
            if (errBody?.data?.["806"] || errText.includes("not Subscribed") || errText.includes("Data APIs")) {
              errorType = "data_api_not_subscribed";
              message = "Dhan Data API plan not active. Go to web.dhan.co → My Profile → Access DhanHQ APIs and subscribe to a Data API plan (free tier available).";
            }
          } catch { /* ignore parse errors */ }

          return new Response(
            JSON.stringify({
              success: false,
              error: errorType,
              message,
              has_api_key: userCreds.hasApiKey,
              prices: {},
              timestamp,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    const unfetched = symbols.filter((s) => !prices[s]);
    if (unfetched.length > 0) console.log(`Prices unavailable for: ${unfetched.join(", ")}`);

    return new Response(
      JSON.stringify({
        success: true,
        prices,
        timestamp,
        source: activeToken ? "dhan" : "unavailable",
        fetched_count: Object.keys(prices).length,
        requested_count: symbols.length,
        using_user_token: !!userCreds.token,
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
