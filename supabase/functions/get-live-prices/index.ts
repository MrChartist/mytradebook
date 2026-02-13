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
  supabase: ReturnType<typeof createClient> | null
) {
  if (!userId || !supabase) return { token: null, clientId: null };
  const { data } = await supabase
    .from("user_settings")
    .select("dhan_access_token, dhan_client_id, dhan_enabled")
    .eq("user_id", userId)
    .single();
  if (data?.dhan_access_token && data?.dhan_client_id && data?.dhan_enabled) {
    console.log("Using per-user Dhan token");
    return { token: data.dhan_access_token, clientId: data.dhan_client_id };
  }
  return { token: null, clientId: null };
}

async function buildSecurityIdMap(
  instruments: InstrumentInput[],
  symbols: string[],
  supabase: ReturnType<typeof createClient> | null
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
            console.log(`Resolved ${row.trading_symbol} -> ${row.security_id} (${row.exchange_segment})`);
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
    if (isNaN(numericId)) {
      console.log(`Skipping non-numeric security_id: ${secId} for ${info.symbol}`);
      return;
    }
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

    console.log("LTP Request - Dhan token present:", !!DHAN_ACCESS_TOKEN);

    const body = await req.json();
    const userId = body.user_id;

    // Support both old format (symbols array) and new format (instruments array)
    const symbols: string[] = body.symbols || [];
    const instruments: InstrumentInput[] = body.instruments || [];

    console.log("LTP Request - symbols:", symbols.length, "instruments:", instruments.length);

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

    // Resolve tokens
    const userCreds = await resolveUserToken(userId, supabase);
    const activeToken = userCreds.token || DHAN_ACCESS_TOKEN;
    const activeClientId = userCreds.clientId || DHAN_CLIENT_ID;

    // Build security-id map
    const securityIdMap = await buildSecurityIdMap(instruments, symbols, supabase);
    const requestBody = buildRequestBody(securityIdMap);

    if (activeToken && activeClientId && Object.keys(requestBody).some((k) => requestBody[k].length > 0)) {
      const headers = dhanHeaders(activeToken, activeClientId);
      const bodyStr = JSON.stringify(requestBody);

      const summary = Object.entries(requestBody)
        .map(([seg, ids]) => `${seg}: [${ids.join(",")}]`)
        .join(", ");
      console.log("Dhan API request body:", summary);

      // Fetch LTP and OHLC in parallel
      const [ltpRes, ohlcRes] = await Promise.all([
        fetch(`${DHAN_API_URL}/marketfeed/ltp`, { method: "POST", headers, body: bodyStr }),
        fetch(`${DHAN_API_URL}/marketfeed/ohlc`, { method: "POST", headers, body: bodyStr }),
      ]);

      console.log("Dhan LTP status:", ltpRes.status, "OHLC status:", ohlcRes.status);

      // Process LTP
      if (ltpRes.ok) {
        const ltpData = await ltpRes.json();
        console.log("LTP data keys:", Object.keys(ltpData?.data || {}));

        for (const segment of Object.keys(requestBody)) {
          const segData = ltpData?.data?.[segment];
          if (!segData) continue;
          for (const [secId, quote] of Object.entries(segData)) {
            const info = securityIdMap[secId];
            if (!info || !quote) continue;
            const q = quote as Record<string, number>;
            const ltp = q.last_price || q.ltp || 0;
            const prevClose = q.prev_close || ltp;
            const change = ltp - prevClose;
            const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

            let warning: string | undefined;
            if (prevClose > 0 && Math.abs(changePercent) > 50) {
              warning = "Large price change detected - verify symbol mapping";
              console.warn(`Warning for ${info.symbol}: ${changePercent.toFixed(1)}% change`);
            }

            prices[info.symbol] = {
              ltp,
              change: parseFloat(change.toFixed(2)),
              changePercent: parseFloat(changePercent.toFixed(2)),
              prevClose: prevClose !== ltp ? parseFloat(prevClose.toFixed(2)) : undefined,
              source: "dhan",
              timestamp,
              security_id: secId,
              exchange_segment: segment,
              warning,
            };
          }
        }
      } else {
        const errText = await ltpRes.text();
        console.error("Dhan LTP error:", ltpRes.status, errText);
      }

      // Process OHLC – merge into existing prices
      if (ohlcRes.ok) {
        const ohlcData = await ohlcRes.json();
        console.log("OHLC data keys:", Object.keys(ohlcData?.data || {}));

        for (const segment of Object.keys(requestBody)) {
          const segData = ohlcData?.data?.[segment];
          if (!segData) continue;
          for (const [secId, quote] of Object.entries(segData)) {
            const info = securityIdMap[secId];
            if (!info || !quote) continue;
            const q = quote as Record<string, number>;

            if (prices[info.symbol]) {
              prices[info.symbol].open = q.open || undefined;
              prices[info.symbol].high = q.high || undefined;
              prices[info.symbol].low = q.low || undefined;
              prices[info.symbol].volume = q.volume || undefined;
              // Use prev_close from OHLC if we didn't get it from LTP
              if (!prices[info.symbol].prevClose && q.close) {
                prices[info.symbol].prevClose = parseFloat(q.close.toFixed(2));
              }
            }
          }
        }
      } else {
        console.error("Dhan OHLC error:", ohlcRes.status);
      }
    }

    // Log unfetched
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
