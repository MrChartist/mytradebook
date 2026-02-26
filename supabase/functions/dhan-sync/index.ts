import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DHAN_API_URL = "https://api.dhan.co/v2";

interface DhanOrder {
  dhanClientId: string;
  orderId: string;
  exchangeOrderId: string;
  correlationId: string;
  orderStatus: string;
  transactionType: string;
  exchangeSegment: string;
  productType: string;
  orderType: string;
  validity: string;
  tradingSymbol: string;
  securityId: string;
  quantity: number;
  disclosedQuantity: number;
  price: number;
  triggerPrice: number;
  afterMarketOrder: boolean;
  boProfitValue: number;
  boStopLossValue: number;
  legName: string;
  createTime: string;
  updateTime: string;
  exchangeTime: string;
  drvExpiryDate: string | null;
  drvOptionType: string | null;
  drvStrikePrice: number | null;
  omsErrorCode: string | null;
  omsErrorDescription: string | null;
  filledQty: number;
  remainingQuantity: number;
  averageTradedPrice: number;
}

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
  multiplier: number;
  dayBuyQty: number;
  daySellQty: number;
  dayBuyValue: number;
  daySellValue: number;
  drvExpiryDate: string | null;
  drvOptionType: string | null;
  drvStrikePrice: number | null;
}

function mapExchangeSegment(seg: string): string {
  const map: Record<string, string> = {
    "NSE_EQ": "Equity_Intraday",
    "NSE_FNO": "Futures",
    "BSE_EQ": "Equity_Intraday",
    "MCX_COMM": "Commodities",
  };
  return map[seg] || "Equity_Intraday";
}

function inferSegment(exchangeSegment: string, productType: string, drvOptionType: string | null): string {
  if (drvOptionType) return "Options";
  if (exchangeSegment === "NSE_FNO" || exchangeSegment === "BSE_FNO") return "Futures";
  if (exchangeSegment === "MCX_COMM") return "Commodities";
  if (productType === "INTRADAY" || productType === "MARGIN") return "Equity_Intraday";
  return "Equity_Positional";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine which users to sync
    // If called with a user_id body param (cron), sync that user
    // If called with auth header (manual), sync that user
    // If called without either (cron for all), sync all auto_sync users
    let userIds: string[] = [];

    let body: any = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { }
    }

    if (body?.user_id) {
      userIds = [body.user_id];
    } else {
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const userClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await userClient.auth.getUser();
        if (user) userIds = [user.id];
      }
    }

    // If no specific user, get all users with auto_sync enabled
    if (userIds.length === 0) {
      const { data: autoSyncUsers } = await supabase
        .from("user_settings")
        .select("user_id, dhan_client_id, dhan_access_token")
        .eq("auto_sync_portfolio", true)
        .eq("dhan_enabled", true)
        .not("dhan_access_token", "is", null);

      if (autoSyncUsers) {
        userIds = autoSyncUsers.map((u: any) => u.user_id);
      }
    }

    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No users to sync", synced: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allResults: any[] = [];

    for (const userId of userIds) {
      try {
        const result = await syncUserOrders(supabase, userId);
        allResults.push({ userId, ...result });
      } catch (err) {
        console.error(`Sync failed for user ${userId}:`, err);
        allResults.push({ userId, error: err instanceof Error ? err.message : String(err) });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${allResults.length} user(s)`,
        results: allResults,
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

async function syncUserOrders(supabase: any, userId: string) {
  // Get user's Dhan credentials
  const { data: settings } = await supabase
    .from("user_settings")
    .select("dhan_client_id, dhan_access_token")
    .eq("user_id", userId)
    .single();

  if (!settings?.dhan_access_token || !settings?.dhan_client_id) {
    throw new Error("Dhan credentials not configured");
  }

  const dhanHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "access-token": settings.dhan_access_token,
    "client-id": settings.dhan_client_id,
  };

  // 1. Fetch today's orders from Dhan
  const ordersResponse = await fetch(`${DHAN_API_URL}/orders`, {
    method: "GET",
    headers: dhanHeaders,
  });

  let orders: DhanOrder[] = [];
  if (ordersResponse.ok) {
    orders = await ordersResponse.json();
    if (!Array.isArray(orders)) orders = [];
  } else {
    console.error(`Orders API error [${ordersResponse.status}]:`, await ordersResponse.text());
  }

  // 2. Fetch positions from Dhan
  const positionsResponse = await fetch(`${DHAN_API_URL}/positions`, {
    method: "GET",
    headers: dhanHeaders,
  });

  let positions: DhanPosition[] = [];
  if (positionsResponse.ok) {
    positions = await positionsResponse.json();
    if (!Array.isArray(positions)) positions = [];
  } else {
    console.error(`Positions API error [${positionsResponse.status}]:`, await positionsResponse.text());
  }

  // 3. Get existing dhan_order_ids for this user to avoid duplicates
  const { data: existingTrades } = await supabase
    .from("trades")
    .select("id, dhan_order_id, symbol, status")
    .eq("user_id", userId)
    .not("dhan_order_id", "is", null);

  const existingOrderIds = new Set(
    (existingTrades || []).map((t: any) => t.dhan_order_id)
  );

  // 4. Import completed BUY/SELL orders as new trades
  const completedOrders = orders.filter(
    (o) => o.orderStatus === "TRADED" && !existingOrderIds.has(o.orderId)
  );

  const importedTrades: any[] = [];
  const updatedTrades: any[] = [];

  for (const order of completedOrders) {
    const segment = inferSegment(
      order.exchangeSegment,
      order.productType,
      order.drvOptionType
    );
    const tradeType = order.transactionType === "BUY" ? "BUY" : "SELL";

    // Check if there's already an open trade for this symbol that this could be an exit for
    const { data: openTrades } = await supabase
      .from("trades")
      .select("id, trade_type, quantity, entry_price")
      .eq("user_id", userId)
      .eq("symbol", order.tradingSymbol)
      .eq("status", "OPEN")
      .limit(1);

    if (openTrades && openTrades.length > 0) {
      const openTrade = openTrades[0];
      // If opposite direction, this is a close
      if (
        (openTrade.trade_type === "BUY" && tradeType === "SELL") ||
        (openTrade.trade_type === "SELL" && tradeType === "BUY")
      ) {
        const exitPrice = order.averageTradedPrice || order.price;
        const entryPrice = openTrade.entry_price || 0;
        const pnl = openTrade.trade_type === "BUY"
          ? (exitPrice - entryPrice) * order.filledQty
          : (entryPrice - exitPrice) * order.filledQty;
        const pnlPercent = entryPrice > 0
          ? ((openTrade.trade_type === "BUY" ? exitPrice - entryPrice : entryPrice - exitPrice) / entryPrice) * 100
          : 0;

        await supabase
          .from("trades")
          .update({
            status: "CLOSED",
            current_price: exitPrice,
            pnl,
            pnl_percent: pnlPercent,
            closed_at: order.exchangeTime || new Date().toISOString(),
            closure_reason: "Dhan Auto-Sync",
            updated_at: new Date().toISOString(),
          })
          .eq("id", openTrade.id);

        // Add trade event
        await supabase.from("trade_events").insert({
          trade_id: openTrade.id,
          event_type: "CLOSED",
          price: exitPrice,
          quantity: order.filledQty,
          pnl_realized: pnl,
          notes: `Auto-closed via Dhan sync (Order: ${order.orderId})`,
        });

        updatedTrades.push({
          symbol: order.tradingSymbol,
          action: "closed",
          exitPrice,
          pnl,
          orderId: order.orderId,
        });
        continue;
      }
    }

    // Otherwise create a new trade entry
    const entryPrice = order.averageTradedPrice || order.price;
    const { data: newTrade, error: insertError } = await supabase
      .from("trades")
      .insert({
        user_id: userId,
        symbol: order.tradingSymbol,
        segment,
        trade_type: tradeType,
        quantity: order.filledQty || order.quantity,
        entry_price: entryPrice,
        entry_time: order.exchangeTime || order.createTime || new Date().toISOString(),
        status: "OPEN",
        dhan_order_id: order.orderId,
        security_id: order.securityId,
        exchange_segment: order.exchangeSegment,
        auto_track_enabled: true,
        notes: `Imported from Dhan (${order.productType} | ${order.orderType})`,
      })
      .select("id")
      .single();

    if (!insertError && newTrade) {
      // Add ENTRY event
      await supabase.from("trade_events").insert({
        trade_id: newTrade.id,
        event_type: "ENTRY",
        price: entryPrice,
        quantity: order.filledQty || order.quantity,
        notes: `Dhan Order ${order.orderId}`,
      });

      importedTrades.push({
        symbol: order.tradingSymbol,
        action: "imported",
        entryPrice,
        orderId: order.orderId,
      });
    }
  }

  // 5. Update current prices for open positions
  let priceUpdates = 0;
  for (const pos of positions) {
    if (pos.netQty === 0) continue;

    const { data: matchingTrades } = await supabase
      .from("trades")
      .select("id, entry_price, trade_type")
      .eq("user_id", userId)
      .eq("symbol", pos.tradingSymbol)
      .eq("status", "OPEN")
      .limit(1);

    if (matchingTrades && matchingTrades.length > 0) {
      const trade = matchingTrades[0];
      const entryPrice = trade.entry_price || 0;
      const pnl = pos.unrealizedProfit;

      // Compute current LTP from unrealizedProfit:
      // For BUY: pnl = (currentPrice - entryPrice) * qty → currentPrice = entryPrice + pnl/qty
      // For SELL: pnl = (entryPrice - currentPrice) * qty → currentPrice = entryPrice - pnl/qty
      const netQty = Math.abs(pos.netQty) || 1;
      const currentPrice = trade.trade_type === "SELL"
        ? entryPrice - (pnl / netQty)
        : entryPrice + (pnl / netQty);

      const pnlPercent = entryPrice > 0
        ? (trade.trade_type === "SELL"
          ? ((entryPrice - currentPrice) / entryPrice) * 100
          : ((currentPrice - entryPrice) / entryPrice) * 100)
        : 0;

      await supabase
        .from("trades")
        .update({
          current_price: currentPrice,
          pnl,
          pnl_percent: pnlPercent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", trade.id);

      priceUpdates++;
    }
  }

  return {
    imported: importedTrades.length,
    closed: updatedTrades.length,
    priceUpdates,
    importedTrades,
    updatedTrades,
  };
}
