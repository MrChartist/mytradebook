import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DHAN_API_URL = "https://api.dhan.co/v2";

interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  trade_type: "BUY" | "SELL";
  quantity: number;
  entry_price: number;
  stop_loss: number | null;
  targets: number[] | null;
  current_price: number | null;
  status: string;
  segment: string;
  dhan_order_id: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const DHAN_ACCESS_TOKEN = Deno.env.get("DHAN_ACCESS_TOKEN");
    const DHAN_CLIENT_ID = Deno.env.get("DHAN_CLIENT_ID");
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all open trades
    const { data: openTrades, error: tradesError } = await supabase
      .from("trades")
      .select("*")
      .eq("status", "OPEN");

    if (tradesError) {
      throw new Error(`Failed to fetch trades: ${tradesError.message}`);
    }

    if (!openTrades || openTrades.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No open trades to monitor" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      monitored: openTrades.length,
      slHits: [] as string[],
      targetHits: [] as string[],
      priceUpdates: 0,
    };

    // Process each open trade
    for (const trade of openTrades as Trade[]) {
      // Get current price (mock for now, real implementation would use Dhan LTP API)
      const currentPrice = await getCurrentPrice(trade.symbol, DHAN_ACCESS_TOKEN);
      
      if (!currentPrice) continue;

      // Calculate P&L
      const pnlMultiplier = trade.trade_type === "BUY" ? 1 : -1;
      const pnl = (currentPrice - trade.entry_price) * trade.quantity * pnlMultiplier;
      const pnlPercent = ((currentPrice - trade.entry_price) / trade.entry_price) * 100 * pnlMultiplier;

      // Update current price in database
      await supabase
        .from("trades")
        .update({
          current_price: currentPrice,
          pnl: pnl,
          pnl_percent: pnlPercent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", trade.id);

      results.priceUpdates++;

      // Check Stop Loss
      if (trade.stop_loss) {
        const slHit = trade.trade_type === "BUY" 
          ? currentPrice <= trade.stop_loss
          : currentPrice >= trade.stop_loss;

        if (slHit) {
          results.slHits.push(trade.symbol);
          
          // Log SL hit event
          await supabase.from("trade_events").insert({
            trade_id: trade.id,
            event_type: "SL_HIT",
            price: currentPrice,
            quantity: trade.quantity,
            pnl_realized: pnl,
            notes: `Stop loss hit at ₹${currentPrice}`,
          });

          // Close trade
          await supabase
            .from("trades")
            .update({
              status: "CLOSED",
              closed_at: new Date().toISOString(),
              closure_reason: "SL_HIT",
              pnl: pnl,
              pnl_percent: pnlPercent,
            })
            .eq("id", trade.id);

          // Send notification
          if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            const emoji = pnl >= 0 ? "✅" : "🛑";
            const message = `${emoji} *Stop Loss Hit!*\n\n` +
              `Symbol: *${trade.symbol}*\n` +
              `Entry: ₹${trade.entry_price}\n` +
              `Exit: ₹${currentPrice}\n` +
              `P&L: ${pnl >= 0 ? "+" : ""}₹${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`;

            await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, message);
          }

          // Auto-execute via Dhan if configured
          if (DHAN_ACCESS_TOKEN && DHAN_CLIENT_ID) {
            await executeExitOrder(trade, currentPrice, "SL_HIT", DHAN_ACCESS_TOKEN, DHAN_CLIENT_ID);
          }

          continue; // Skip target checks if SL hit
        }
      }

      // Check Targets
      if (trade.targets && Array.isArray(trade.targets)) {
        for (let i = 0; i < trade.targets.length; i++) {
          const target = trade.targets[i];
          const targetHit = trade.trade_type === "BUY"
            ? currentPrice >= target
            : currentPrice <= target;

          if (targetHit) {
            const targetNum = i + 1;
            const eventType = `TARGET${targetNum}_HIT` as "TARGET1_HIT" | "TARGET2_HIT" | "TARGET3_HIT";
            
            // Check if this target was already hit
            const { data: existingEvents } = await supabase
              .from("trade_events")
              .select("id")
              .eq("trade_id", trade.id)
              .eq("event_type", eventType);

            if (!existingEvents || existingEvents.length === 0) {
              results.targetHits.push(`${trade.symbol} T${targetNum}`);

              // Log target hit event
              await supabase.from("trade_events").insert({
                trade_id: trade.id,
                event_type: eventType,
                price: currentPrice,
                notes: `Target ${targetNum} hit at ₹${currentPrice}`,
              });

              // Send notification
              if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
                const message = `🎯 *Target ${targetNum} Hit!*\n\n` +
                  `Symbol: *${trade.symbol}*\n` +
                  `Entry: ₹${trade.entry_price}\n` +
                  `Target: ₹${target}\n` +
                  `Current: ₹${currentPrice}\n` +
                  `P&L: +₹${pnl.toFixed(2)} (+${pnlPercent.toFixed(2)}%)`;

                await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, message);
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Trade monitor error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getCurrentPrice(symbol: string, dhanToken: string | undefined): Promise<number | null> {
  // Mock prices for testing - in production, use Dhan LTP API
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
  };

  const base = basePrices[symbol] || 1000;
  // Simulate small price movements
  return base * (1 + (Math.random() - 0.5) * 0.03);
}

async function sendTelegramMessage(token: string, chatId: string, message: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (e) {
    console.error("Failed to send Telegram message:", e);
  }
}

async function executeExitOrder(
  trade: Trade,
  exitPrice: number,
  reason: string,
  dhanToken: string,
  clientId: string
): Promise<void> {
  try {
    const exitType = trade.trade_type === "BUY" ? "SELL" : "BUY";
    
    const orderPayload = {
      dhanClientId: clientId,
      transactionType: exitType,
      exchangeSegment: "NSE_EQ",
      productType: trade.segment === "Equity_Intraday" ? "INTRADAY" : "CNC",
      orderType: "MARKET",
      validity: "DAY",
      tradingSymbol: trade.symbol,
      securityId: trade.dhan_order_id || "",
      quantity: trade.quantity,
      price: 0,
      triggerPrice: 0,
      disclosedQuantity: 0,
      afterMarketOrder: false,
    };

    const response = await fetch(`${DHAN_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "access-token": dhanToken,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      console.error("Dhan exit order failed:", await response.text());
    }
  } catch (e) {
    console.error("Failed to execute exit order:", e);
  }
}
