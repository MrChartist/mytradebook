import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DHAN_API_URL = "https://api.dhan.co/v2";

interface OrderRequest {
  tradeId: string;
  orderType: "MARKET" | "LIMIT";
  transactionType: "BUY" | "SELL";
  quantity: number;
  price?: number;
  symbol: string;
  securityId: string;
  exchangeSegment: "NSE_EQ" | "BSE_EQ" | "NSE_FNO" | "MCX_COMM";
  productType: "CNC" | "INTRADAY" | "MARGIN" | "MTF" | "CO" | "BO";
  reason: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DHAN_ACCESS_TOKEN = Deno.env.get("DHAN_ACCESS_TOKEN");
    const DHAN_CLIENT_ID = Deno.env.get("DHAN_CLIENT_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!DHAN_ACCESS_TOKEN || !DHAN_CLIENT_ID) {
      throw new Error("Dhan API credentials not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabaseClient.auth.getClaims(token);
    
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub as string;
    const body: OrderRequest = await req.json();

    // Validate required fields
    if (!body.tradeId || !body.symbol || !body.quantity || !body.transactionType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map segment from our DB to Dhan format
    const exchangeSegmentMap: Record<string, string> = {
      Equity_Intraday: "NSE_EQ",
      Equity_Positional: "NSE_EQ",
      Futures: "NSE_FNO",
      Options: "NSE_FNO",
      Commodities: "MCX_COMM",
    };

    const productTypeMap: Record<string, string> = {
      Equity_Intraday: "INTRADAY",
      Equity_Positional: "CNC",
      Futures: "MARGIN",
      Options: "MARGIN",
      Commodities: "MARGIN",
    };

    // Place order with Dhan
    const orderPayload = {
      dhanClientId: DHAN_CLIENT_ID,
      transactionType: body.transactionType,
      exchangeSegment: body.exchangeSegment || "NSE_EQ",
      productType: body.productType || "CNC",
      orderType: body.orderType || "MARKET",
      validity: "DAY",
      tradingSymbol: body.symbol,
      securityId: body.securityId || "",
      quantity: body.quantity,
      price: body.price || 0,
      triggerPrice: 0,
      disclosedQuantity: 0,
      afterMarketOrder: false,
      amoTime: "OPEN",
      boProfitValue: 0,
      boStopLossValue: 0,
    };

    const orderResponse = await fetch(`${DHAN_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "access-token": DHAN_ACCESS_TOKEN,
      },
      body: JSON.stringify(orderPayload),
    });

    const orderResult = await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(`Dhan order failed: ${JSON.stringify(orderResult)}`);
    }

    // Update trade in database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { error: updateError } = await supabase
      .from("trades")
      .update({
        status: "CLOSED",
        closed_at: new Date().toISOString(),
        closure_reason: body.reason,
        dhan_order_id: orderResult.orderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.tradeId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update trade:", updateError);
    }

    // Log trade event
    await supabase.from("trade_events").insert({
      trade_id: body.tradeId,
      event_type: body.reason === "SL_HIT" ? "SL_HIT" : "CLOSED",
      price: body.price || 0,
      quantity: body.quantity,
      notes: `Order executed via Dhan. Order ID: ${orderResult.orderId}`,
    });

    // Send Telegram notification
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
    
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const message = `🔔 *Trade Executed*\n\n` +
        `Symbol: *${body.symbol}*\n` +
        `Type: ${body.transactionType}\n` +
        `Quantity: ${body.quantity}\n` +
        `Reason: ${body.reason}\n` +
        `Order ID: ${orderResult.orderId}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderResult.orderId,
        message: `Order placed successfully for ${body.symbol}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Dhan execute error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
