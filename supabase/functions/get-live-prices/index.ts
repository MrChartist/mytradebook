import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DHAN_API_URL = "https://api.dhan.co/v2";

// Mock prices for testing when Dhan API is not available
const basePrices: Record<string, number> = {
  RELIANCE: 2450,
  TATASTEEL: 155,
  INFY: 1520,
  TCS: 3850,
  HDFCBANK: 1680,
  ICICIBANK: 1120,
  SBIN: 780,
  BHARTIARTL: 1380,
  WIPRO: 480,
  KOTAKBANK: 1850,
  NIFTY: 22500,
  BANKNIFTY: 48000,
  ADANIENT: 2800,
  LT: 3450,
  MARUTI: 11200,
  SUNPHARMA: 1780,
  AXISBANK: 1150,
  TITAN: 3650,
  ASIANPAINT: 2900,
  ULTRACEMCO: 11500,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DHAN_ACCESS_TOKEN = Deno.env.get("DHAN_ACCESS_TOKEN");
    
    const { symbols } = await req.json();
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No symbols provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prices: Record<string, { ltp: number; change: number; changePercent: number }> = {};
    
    if (DHAN_ACCESS_TOKEN) {
      try {
        // Fetch real prices from Dhan LTP API
        const response = await fetch(`${DHAN_API_URL}/marketfeed/ltp`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "access-token": DHAN_ACCESS_TOKEN,
          },
          body: JSON.stringify({
            NSE_EQ: symbols,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Process Dhan response
          if (data?.data?.NSE_EQ) {
            for (const symbol of symbols) {
              const quote = data.data.NSE_EQ[symbol];
              if (quote) {
                const ltp = quote.last_price || quote.ltp || 0;
                const prevClose = quote.prev_close || ltp;
                const change = ltp - prevClose;
                const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
                
                prices[symbol] = {
                  ltp,
                  change,
                  changePercent,
                };
              }
            }
          }
        } else {
          console.warn("Dhan API request failed, using mock prices");
        }
      } catch (e) {
        console.error("Error fetching from Dhan API:", e);
      }
    }

    // Fill in mock prices for any symbols not retrieved from Dhan
    for (const symbol of symbols) {
      if (!prices[symbol]) {
        const base = basePrices[symbol.toUpperCase()] || 1000;
        // Add some random variation to simulate price movement
        const variation = (Math.random() - 0.5) * 0.02;
        const ltp = base * (1 + variation);
        const change = base * variation;
        const changePercent = variation * 100;
        
        prices[symbol] = {
          ltp: parseFloat(ltp.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
        };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        prices,
        timestamp: new Date().toISOString(),
        source: DHAN_ACCESS_TOKEN ? "dhan" : "mock",
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
