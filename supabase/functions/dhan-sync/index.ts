import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DHAN_API_URL = "https://api.dhan.co/v2";

interface DhanPosition {
  dhanClientId: string;
  tradingSymbol: string;
  securityId: string;
  positionType: string;
  exchangeSegment: string;
  productType: string;
  buyAvg: number;
  costPrice: number;
  buyQty: number;
  sellAvg: number;
  sellQty: number;
  netQty: number;
  realizedProfit: number;
  unrealizedProfit: number;
  rbiReferenceRate: number;
  multiplier: number;
  carryForwardBuyQty: number;
  carryForwardSellQty: number;
  carryForwardBuyValue: number;
  carryForwardSellValue: number;
  dayBuyQty: number;
  daySellQty: number;
  dayBuyValue: number;
  daySellValue: number;
  drvExpiryDate: string | null;
  drvOptionType: string | null;
  drvStrikePrice: number | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DHAN_ACCESS_TOKEN = Deno.env.get("DHAN_ACCESS_TOKEN");
    const DHAN_CLIENT_ID = Deno.env.get("DHAN_CLIENT_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!DHAN_ACCESS_TOKEN) {
      throw new Error("DHAN_ACCESS_TOKEN is not configured");
    }
    if (!DHAN_CLIENT_ID) {
      throw new Error("DHAN_CLIENT_ID is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Get user_id from request body (for cron) or auth header (for manual trigger)
    let userId: string | null = null;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: claims } = await supabaseClient.auth.getClaims(token);
      userId = claims?.claims?.sub as string;
    }

    // Fetch positions from Dhan API
    const positionsResponse = await fetch(`${DHAN_API_URL}/positions`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "access-token": DHAN_ACCESS_TOKEN,
        "client-id": DHAN_CLIENT_ID,
      },
    });

    if (!positionsResponse.ok) {
      const errorText = await positionsResponse.text();
      throw new Error(`Dhan API error [${positionsResponse.status}]: ${errorText}`);
    }

    const positions: DhanPosition[] = await positionsResponse.json();

    // Create Supabase admin client for updates
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Sync positions with trades table
    const syncResults = [];
    
    for (const pos of positions) {
      if (pos.netQty === 0) continue; // Skip closed positions
      
      // Find matching open trade by symbol
      const { data: existingTrades } = await supabase
        .from("trades")
        .select("*")
        .eq("symbol", pos.tradingSymbol)
        .eq("status", "OPEN")
        .limit(1);

      if (existingTrades && existingTrades.length > 0) {
        const trade = existingTrades[0];
        const currentPrice = pos.costPrice;
        const pnl = pos.unrealizedProfit;
        const pnlPercent = trade.entry_price > 0 
          ? ((currentPrice - trade.entry_price) / trade.entry_price) * 100 
          : 0;

        // Update trade with current price and P&L
        const { error: updateError } = await supabase
          .from("trades")
          .update({
            current_price: currentPrice,
            pnl: pnl,
            pnl_percent: pnlPercent,
            dhan_order_id: pos.securityId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", trade.id);

        if (!updateError) {
          syncResults.push({
            symbol: pos.tradingSymbol,
            action: "updated",
            currentPrice,
            pnl,
          });
        }
      }
    }

    // Also fetch and update LTP for symbols via market quote
    const symbolsToUpdate = positions
      .filter((p) => p.netQty !== 0)
      .map((p) => p.tradingSymbol);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${syncResults.length} positions from Dhan`,
        positions: positions.length,
        synced: syncResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Dhan sync error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
