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
  timeframe: string | null;
  holding_period: string | null;
  trailing_sl_enabled: boolean;
  trailing_sl_percent: number | null;
  trailing_sl_points: number | null;
  trailing_sl_current: number | null;
  trailing_sl_trigger_price: number | null;
  trailing_sl_active: boolean;
  rating: number | null;
  confidence_score: number | null;
  auto_track_enabled: boolean;
  telegram_post_enabled: boolean;
  security_id: string | null;
  exchange_segment: string | null;
}

// Helper function to get user's telegram chat ID
async function getUserChatId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("user_settings")
    .select("telegram_chat_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.telegram_chat_id || null;
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
    const DEFAULT_TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

     // Fetch all open trades with auto_track_enabled
    const { data: openTrades, error: tradesError } = await supabase
      .from("trades")
      .select("*")
       .eq("status", "OPEN")
       .eq("auto_track_enabled", true);

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
      tslHits: [] as string[],
      tslUpdates: [] as string[],
      targetHits: [] as string[],
      priceUpdates: 0,
    };

    // Group trades by user to resolve per-user Dhan tokens
    const tradesByUser: Record<string, Trade[]> = {};
    for (const trade of openTrades as Trade[]) {
      if (!tradesByUser[trade.user_id]) tradesByUser[trade.user_id] = [];
      tradesByUser[trade.user_id].push(trade);
    }

    for (const [userId, userTrades] of Object.entries(tradesByUser)) {
      // Resolve user-specific Dhan token
      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("dhan_access_token, dhan_client_id, dhan_enabled")
        .eq("user_id", userId)
        .single();

      const userToken = userSettings?.dhan_enabled ? userSettings.dhan_access_token : null;
      const userClientId = userSettings?.dhan_enabled ? userSettings.dhan_client_id : null;
      const activeToken = userToken || DHAN_ACCESS_TOKEN;
      const activeClientId = userClientId || DHAN_CLIENT_ID;

      // Batch fetch prices for all user trades using security_ids
      const priceMap = await batchFetchPrices(userTrades, activeToken, activeClientId);

    for (const trade of userTrades) {
      // Get user-specific chat ID for this trade
      const userChatId = await getUserChatId(supabase, trade.user_id);
      const chatId = trade.telegram_post_enabled 
        ? (userChatId || DEFAULT_TELEGRAM_CHAT_ID)
        : undefined;

      // Get price from batch result - skip if no valid price
      const currentPrice = priceMap[trade.symbol];
      if (!currentPrice || currentPrice <= 0) continue;

      // Calculate P&L (using quantity 1 for research trades if not set)
      const qty = trade.quantity || 1;
      const pnlMultiplier = trade.trade_type === "BUY" ? 1 : -1;
      const pnl = (currentPrice - trade.entry_price) * qty * pnlMultiplier;
      const pnlPercent = ((currentPrice - trade.entry_price) / trade.entry_price) * 100 * pnlMultiplier;

      // Prepare update object
      const updateData: Record<string, unknown> = {
        current_price: currentPrice,
        pnl: pnl,
        pnl_percent: pnlPercent,
        updated_at: new Date().toISOString(),
      };

      let tslActiveNow = trade.trailing_sl_active;
      let tslCurrentNow = trade.trailing_sl_current;

      // Check and update Trailing Stop Loss
      if (trade.trailing_sl_enabled) {
        const tslResult = await processTrailingStopLoss(
          trade,
          currentPrice,
          pnl,
          pnlPercent,
          supabase,
          TELEGRAM_BOT_TOKEN,
          chatId
        );

        if (tslResult.tslHit) {
          results.tslHits.push(trade.symbol);
          continue; // Skip other checks if TSL hit
        }

        if (tslResult.tslUpdated) {
          results.tslUpdates.push(trade.symbol);
          updateData.trailing_sl_current = tslResult.newTslValue;
          updateData.trailing_sl_active = tslResult.tslActive;

          tslActiveNow = tslResult.tslActive;
          tslCurrentNow = tslResult.newTslValue;
        }
      }

      // Update current price in database
      await supabase
        .from("trades")
        .update(updateData)
        .eq("id", trade.id);

      results.priceUpdates++;

      // Check Stop Loss / Trailing Stop Loss
      const effectiveSL = tslActiveNow && tslCurrentNow ? tslCurrentNow : trade.stop_loss;

      if (effectiveSL) {
        const slHit = trade.trade_type === "BUY" 
          ? currentPrice <= effectiveSL
          : currentPrice >= effectiveSL;

        if (slHit) {
          const isTslHit = !!(tslActiveNow && tslCurrentNow && effectiveSL === tslCurrentNow);
          const eventType = isTslHit ? "TSL_HIT" : "SL_HIT";
          const reason = isTslHit ? "TSL_HIT" : "SL_HIT";

          if (isTslHit) {
            results.tslHits.push(trade.symbol);
          } else {
            results.slHits.push(trade.symbol);
          }
          
          // Log SL/TSL hit event
          await supabase.from("trade_events").insert({
            trade_id: trade.id,
            event_type: eventType,
            price: currentPrice,
            quantity: qty,
            pnl_realized: pnl,
            notes: `${isTslHit ? "Trailing stop loss" : "Stop loss"} hit at ₹${currentPrice.toFixed(2)}`,
          });

          // Close trade
          await supabase
            .from("trades")
            .update({
              status: "CLOSED",
              closed_at: new Date().toISOString(),
              closure_reason: reason,
              pnl: pnl,
              pnl_percent: pnlPercent,
              current_price: currentPrice,
            })
            .eq("id", trade.id);

           // Send notification only if telegram is enabled and chat ID is available
         if (TELEGRAM_BOT_TOKEN && chatId && trade.telegram_post_enabled) {
            const emoji = pnl >= 0 ? "✅" : "🛑";
            const slType = isTslHit ? "Trailing Stop Loss" : "Stop Loss";
            const lockedGain = isTslHit && pnl > 0 
              ? `\n💰 Locked Gain: +₹${pnl.toFixed(2)} (+${pnlPercent.toFixed(2)}%)` 
              : "";

            const message = `${emoji} *${slType} Hit!*\n\n` +
              `Symbol: *${trade.symbol}*\n` +
              `Type: ${trade.trade_type}\n` +
              `Entry: ₹${trade.entry_price.toLocaleString()}\n` +
              `Exit: ₹${currentPrice.toFixed(2)}\n` +
              `P&L: ${pnl >= 0 ? "+" : ""}₹${pnl.toFixed(2)} (${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%)${lockedGain}`;

            await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, message);
          }

          // Auto-execute via Dhan if configured
          if (DHAN_ACCESS_TOKEN && DHAN_CLIENT_ID) {
            await executeExitOrder(trade, currentPrice, reason, DHAN_ACCESS_TOKEN, DHAN_CLIENT_ID);
          }

          continue; // Skip target checks if SL/TSL hit
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
                notes: `Target ${targetNum} hit at ₹${currentPrice.toFixed(2)}`,
              });

              // If target 1 hit and TSL is configured but not active, activate it
              if (targetNum === 1 && trade.trailing_sl_enabled && !trade.trailing_sl_active) {
                const newTslValue = calculateTrailingStopLoss(trade, currentPrice);
                await supabase
                  .from("trades")
                  .update({
                    trailing_sl_active: true,
                    trailing_sl_current: newTslValue,
                  })
                  .eq("id", trade.id);

                // Log TSL activation
                await supabase.from("trade_events").insert({
                  trade_id: trade.id,
                  event_type: "TSL_UPDATED",
                  price: currentPrice,
                  notes: `Trailing SL activated at ₹${newTslValue.toFixed(2)}`,
                });
              }

               // Send notification only if telegram is enabled
               if (TELEGRAM_BOT_TOKEN && chatId && trade.telegram_post_enabled) {
                const tslInfo = trade.trailing_sl_enabled
                  ? `\n🔄 TSL: ${trade.trailing_sl_active ? "Active" : "Activating"}`
                  : "";

                const message = `🎯 *Target ${targetNum} Hit!*\n\n` +
                  `Symbol: *${trade.symbol}*\n` +
                  `Entry: ₹${trade.entry_price.toLocaleString()}\n` +
                  `Target: ₹${target.toLocaleString()}\n` +
                  `Current: ₹${currentPrice.toFixed(2)}\n` +
                  `P&L: +₹${pnl.toFixed(2)} (+${pnlPercent.toFixed(2)}%)${tslInfo}`;

                await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, message);
              }
            }
          }
        }
      }
    } // end user loop
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

function calculateTrailingStopLoss(trade: Trade, currentPrice: number): number {
  const isBuy = trade.trade_type === "BUY";
  
  if (trade.trailing_sl_percent) {
    const distance = trade.entry_price * (trade.trailing_sl_percent / 100);
    return isBuy ? currentPrice - distance : currentPrice + distance;
  } else if (trade.trailing_sl_points) {
    return isBuy ? currentPrice - trade.trailing_sl_points : currentPrice + trade.trailing_sl_points;
  }
  
  return isBuy ? currentPrice * 0.98 : currentPrice * 1.02; // Default 2%
}

async function processTrailingStopLoss(
  trade: Trade,
  currentPrice: number,
  pnl: number,
  pnlPercent: number,
  // deno-lint-ignore no-explicit-any
  supabase: any,
  telegramToken: string | undefined,
  chatId: string | undefined
): Promise<{ tslHit: boolean; tslUpdated: boolean; newTslValue: number | null; tslActive: boolean }> {
  const isBuy = trade.trade_type === "BUY";
  
  // Check if TSL should be activated
  if (!trade.trailing_sl_active) {
    const hasTrigger = !!trade.trailing_sl_trigger_price;

    // TSL should activate immediately unless a specific trigger price is set.
    // If trigger price is set -> wait until crossed.
    // Otherwise -> activate immediately from the first price check.
    const shouldActivate = hasTrigger
      ? (isBuy
          ? currentPrice >= (trade.trailing_sl_trigger_price as number)
          : currentPrice <= (trade.trailing_sl_trigger_price as number))
      : true; // Immediately activate

    if (shouldActivate) {
      const newTslValue = calculateTrailingStopLoss(trade, currentPrice);

      const activationReason = hasTrigger
        ? `trigger: ₹${trade.trailing_sl_trigger_price}`
        : "no trigger & no targets";

      // Log activation event
      await supabase.from("trade_events").insert({
        trade_id: trade.id,
        event_type: "TSL_UPDATED",
        price: currentPrice,
        notes: `Trailing SL activated at ₹${newTslValue.toFixed(2)} (${activationReason})`,
      });

      // Send notification
      if (telegramToken && chatId) {
        const message = `🔄 *Trailing SL Activated!*\n\n` +
          `Symbol: *${trade.symbol}*\n` +
          `Entry: ₹${trade.entry_price.toLocaleString()}\n` +
          `Current: ₹${currentPrice.toFixed(2)}\n` +
          `TSL: ₹${newTslValue.toFixed(2)}\n` +
          (hasTrigger ? `Trigger Price: ₹${trade.trailing_sl_trigger_price}\n` : "") +
          `P&L: ${pnl >= 0 ? "+" : ""}₹${pnl.toFixed(2)} (${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%)`;

        await sendTelegramMessage(telegramToken, chatId, message);
      }

      return { tslHit: false, tslUpdated: true, newTslValue, tslActive: true };
    }
  }
  
  // Check if TSL should be updated (price moved favorably)
  if (trade.trailing_sl_active && trade.trailing_sl_current) {
    const newTslValue = calculateTrailingStopLoss(trade, currentPrice);
    const shouldUpdate = isBuy 
      ? newTslValue > trade.trailing_sl_current
      : newTslValue < trade.trailing_sl_current;
    
    if (shouldUpdate) {
      const oldTsl = trade.trailing_sl_current;
      const lockedGain = isBuy 
        ? (newTslValue - trade.entry_price)
        : (trade.entry_price - newTslValue);
      const lockedPercent = (lockedGain / trade.entry_price) * 100;

      // Log update event
      await supabase.from("trade_events").insert({
        trade_id: trade.id,
        event_type: "TSL_UPDATED",
        price: currentPrice,
        notes: `TSL moved from ₹${oldTsl.toFixed(2)} to ₹${newTslValue.toFixed(2)}`,
      });

      // Send notification
      if (telegramToken && chatId) {
        const message = `🔄 *Trailing SL Moved*\n\n` +
          `Symbol: *${trade.symbol}*\n` +
          `Entry: ₹${trade.entry_price.toLocaleString()}\n` +
          `Current: ₹${currentPrice.toFixed(2)}\n` +
          `TSL: ₹${oldTsl.toFixed(2)} → ₹${newTslValue.toFixed(2)}\n` +
          `💰 Locked Gain: ${lockedGain >= 0 ? "+" : ""}₹${lockedGain.toFixed(2)} (${lockedPercent >= 0 ? "+" : ""}${lockedPercent.toFixed(2)}%)`;

        await sendTelegramMessage(telegramToken, chatId, message);
      }

      return { tslHit: false, tslUpdated: true, newTslValue, tslActive: true };
    }
  }

  return { tslHit: false, tslUpdated: false, newTslValue: null, tslActive: trade.trailing_sl_active };
}

async function batchFetchPrices(
  trades: Trade[],
  dhanToken: string | undefined,
  dhanClientId: string | undefined
): Promise<Record<string, number>> {
  const priceMap: Record<string, number> = {};

  if (!dhanToken || !dhanClientId) return priceMap;

  // Build request body grouped by exchange_segment using security_ids
    const requestBody: Record<string, number[]> = {};
  const secIdToSymbol: Record<string, string> = {};

  for (const trade of trades) {
    if (!trade.security_id) continue;
    const numericId = parseInt(trade.security_id, 10);
    if (isNaN(numericId)) continue;

    const seg = trade.exchange_segment || "NSE_EQ";
    if (!requestBody[seg]) requestBody[seg] = [];
    requestBody[seg].push(numericId);
    secIdToSymbol[trade.security_id] = trade.symbol;
  }

  const hasIds = Object.keys(requestBody).some((k) => requestBody[k].length > 0);
  if (!hasIds) return priceMap;

  try {
    let retries = 0;
    let res: Response | null = null;

    while (retries < 3) {
      res = await fetch(`${DHAN_API_URL}/marketfeed/quote`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "access-token": dhanToken,
          "client-id": dhanClientId,
        },
        body: JSON.stringify(requestBody),
      });

      if (res.status === 429) {
        retries++;
        await new Promise((r) => setTimeout(r, 1000 * retries));
        continue;
      }
      break;
    }

    if (res && res.ok) {
      const data = await res.json();
      for (const seg of Object.keys(requestBody)) {
        const segData = data?.data?.[seg];
        if (!segData) continue;
        for (const [secId, quote] of Object.entries(segData)) {
          const sym = secIdToSymbol[secId];
          if (!sym) continue;
          const q = quote as Record<string, any>;
          const ltp = q.last_price || q.ltp || 0;
          if (ltp > 0) {
            priceMap[sym] = ltp;
          }
        }
      }
    } else if (res) {
      console.error("Dhan quote batch error:", res.status, await res.text());
    }
  } catch (e) {
    console.error("batchFetchPrices error:", e);
  }

  return priceMap;
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
      quantity: trade.quantity || 1,
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
