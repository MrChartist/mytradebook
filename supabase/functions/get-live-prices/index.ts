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
   source: "dhan" | "unavailable";
   timestamp: string;
   security_id?: string;
  exchange_segment?: string;
  warning?: string;
 }
 
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
      const userId = body.user_id; // Optional: for per-user Dhan token
     
     // Support both old format (symbols array) and new format (instruments array)
     const symbols: string[] = body.symbols || [];
     const instruments: InstrumentInput[] = body.instruments || [];
     
    console.log("LTP Request - symbols:", symbols.length, "instruments:", instruments.length);
    
     // Convert instruments to symbols for backward compatibility
     if (instruments.length > 0) {
       instruments.forEach((inst) => {
         if (!symbols.includes(inst.symbol)) {
           symbols.push(inst.symbol);
         }
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
     
    // Get user's Dhan token if user_id provided
     let userDhanToken: string | null = null;
    let userDhanClientId: string | null = null;
    const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY 
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
      : null;
    
    if (userId && supabase) {
      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("dhan_access_token, dhan_client_id, dhan_enabled")
        .eq("user_id", userId)
        .single();
      
      if (userSettings?.dhan_access_token && userSettings?.dhan_client_id && userSettings?.dhan_enabled) {
        userDhanToken = userSettings.dhan_access_token;
        userDhanClientId = userSettings.dhan_client_id;
        console.log("Using per-user Dhan token");
      }
    }
    
    // Use user token if available, else fall back to global
     const activeToken = userDhanToken || DHAN_ACCESS_TOKEN;
    const activeClientId = userDhanClientId || DHAN_CLIENT_ID;
    // Build security ID to symbol mapping for precise API calls
    const securityIdMap: Record<string, { symbol: string; exchangeSegment: string }> = {};
    instruments.forEach((inst) => {
      if (inst.security_id) {
        securityIdMap[inst.security_id] = {
          symbol: inst.symbol,
          exchangeSegment: inst.exchange_segment || "NSE_EQ",
        };
      }
    });
    
    // Look up security_ids from instrument_master for symbols that don't have them
    if (supabase) {
      // For instruments without security_id
      const symbolsNeedingLookup = instruments
        .filter((i) => !i.security_id)
        .map((i) => i.symbol);
      
      // Also include raw symbols that might not be in instruments array
      const rawSymbols = symbols.filter((s) => !instruments.find((i) => i.symbol === s));
      symbolsNeedingLookup.push(...rawSymbols);
      
      const uniqueSymbols = [...new Set(symbolsNeedingLookup)];
      
      if (uniqueSymbols.length > 0) {
        console.log("Looking up security_ids for:", uniqueSymbols);
        
        const { data: lookupData } = await supabase
          .from("instrument_master")
          .select("security_id, trading_symbol, exchange_segment")
          .in("trading_symbol", uniqueSymbols);
        
        if (lookupData) {
          lookupData.forEach((row) => {
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
    
    if (activeToken && activeClientId) {
      try {
         // Build request body grouped by exchange segment
         const requestBody: Record<string, string[]> = {};
         
         // Add instruments with security_id by exchange segment
         Object.entries(securityIdMap).forEach(([secId, info]) => {
           const segment = info.exchangeSegment;
           if (!requestBody[segment]) {
             requestBody[segment] = [];
           }
           requestBody[segment].push(secId);
         });
         
         // Fallback: add symbols without security_id to NSE_EQ
         const symbolsWithoutSecId = symbols.filter(
           (s) => !instruments.find((i) => i.symbol === s && i.security_id)
         );
         if (symbolsWithoutSecId.length > 0) {
           if (!requestBody["NSE_EQ"]) {
             requestBody["NSE_EQ"] = [];
           }
           // For symbols without security_id, we can't reliably fetch - skip Dhan API
         }
         
         // Only call Dhan if we have security IDs
         if (Object.keys(requestBody).some((k) => requestBody[k].length > 0)) {
          // Log what we're requesting
          const requestSummary = Object.entries(requestBody)
            .map(([seg, ids]) => `${seg}: ${ids.length} instruments`)
            .join(", ");
          console.log("Dhan API request:", requestSummary);
          
            const response = await fetch(`${DHAN_API_URL}/marketfeed/ltp`, {
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "access-token": activeToken,
                "client-id": activeClientId,
              },
             body: JSON.stringify(requestBody),
           });
          
          console.log("Dhan API response status:", response.status);

           if (response.ok) {
             const data = await response.json();
            console.log("Dhan API success, data keys:", Object.keys(data?.data || {}));
             
             // Process Dhan response for each exchange segment
             for (const segment of Object.keys(requestBody)) {
               const segmentData = data?.data?.[segment];
               if (segmentData) {
                 for (const [secId, quote] of Object.entries(segmentData)) {
                   const info = securityIdMap[secId];
                   if (info && quote) {
                     const q = quote as Record<string, number>;
                     const ltp = q.last_price || q.ltp || 0;
                     const prevClose = q.prev_close || ltp;
                     const change = ltp - prevClose;
                     const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
                     
                      // Sanity check: detect potential mismatch
                      let warning: string | undefined;
                      if (prevClose > 0 && Math.abs(changePercent) > 50) {
                        warning = "Large price change detected - verify symbol mapping";
                        console.warn(`Warning for ${info.symbol}: ${changePercent.toFixed(1)}% change`);
                      }
                      
                     prices[info.symbol] = {
                       ltp,
                       change: parseFloat(change.toFixed(2)),
                       changePercent: parseFloat(changePercent.toFixed(2)),
                       source: "dhan",
                       timestamp,
                       security_id: secId,
                        exchange_segment: segment,
                        warning,
                     };
                   }
                 }
              }
            }
           } else {
             const errorText = await response.text();
              console.error("Dhan API error:", response.status, errorText);
          }
        }
      } catch (e) {
        console.error("Dhan API exception:", e);
      }
    }
    
    // Log unfetched symbols
    const unfetched = symbols.filter((s) => !prices[s]);
    if (unfetched.length > 0) {
      console.log(`Prices unavailable for: ${unfetched.join(", ")}`);
    }

    // Note: Symbols without real Dhan data will NOT have prices returned
    // This ensures we never show fake/mock prices to users

    return new Response(
      JSON.stringify({
        success: true,
        prices,
        timestamp,
        source: activeToken ? "dhan" : "unavailable",
        fetched_count: Object.keys(prices).length,
        requested_count: symbols.length,
        using_user_token: !!userDhanToken,
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
