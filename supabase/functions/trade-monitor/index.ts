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
  trailing_sl_active: boolean;
  trailing_sl_current: number | null;
  trailing_sl_trigger_price: number | null;
  rating: number | null;
  confidence_score: number | null;
  auto_track_enabled: boolean;
  telegram_post_enabled: boolean;
  security_id: string | null;
  exchange_segment: string | null;
  // New TSL tracking fields
  highest_since_entry: number | null;
  lowest_since_entry: number | null;
  last_trail_anchor_price: number | null;
  last_tsl_notified_at: string | null;
}

interface TslProfile {
  activate_pct: number;
  step_pct: number;
  trail_gap_pct: number;
  cooldown_sec: number;
  min_sl_improve_pct: number;
}

const DEFAULT_TSL_PROFILES: Record<string, TslProfile> = {
  Equity_Intraday: { activate_pct: 0.5, step_pct: 0.5, trail_gap_pct: 1.0, cooldown_sec: 120, min_sl_improve_pct: 0.1 },
  Equity_Positional: { activate_pct: 2.0, step_pct: 3.0, trail_gap_pct: 4.0, cooldown_sec: 1200, min_sl_improve_pct: 0.5 },
  Futures: { activate_pct: 1.0, step_pct: 1.0, trail_gap_pct: 2.0, cooldown_sec: 300, min_sl_improve_pct: 0.2 },
  Options: { activate_pct: 1.5, step_pct: 2.0, trail_gap_pct: 3.0, cooldown_sec: 300, min_sl_improve_pct: 0.3 },
  Commodities: { activate_pct: 1.0, step_pct: 1.5, trail_gap_pct: 2.5, cooldown_sec: 300, min_sl_improve_pct: 0.2 },
};

// deno-lint-ignore no-explicit-any
async function getUserTelegramInfo(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_settings")
    .select("telegram_chat_id, tsl_profiles")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    chatId: data?.telegram_chat_id || null,
    tslProfiles: data?.tsl_profiles || null,
  };
}

function getTslProfile(userProfiles: Record<string, TslProfile> | null, segment: string): TslProfile {
  if (userProfiles && userProfiles[segment]) return userProfiles[segment];
  return DEFAULT_TSL_PROFILES[segment] || DEFAULT_TSL_PROFILES.Equity_Intraday;
}

function isValidPrice(p: number | null | undefined): p is number {
  return typeof p === "number" && isFinite(p) && p > 0;
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

    const { data: openTrades, error: tradesError } = await supabase
      .from("trades")
      .select("*")
      .eq("status", "OPEN")
      .eq("auto_track_enabled", true);

    if (tradesError) throw new Error(`Failed to fetch trades: ${tradesError.message}`);

    if (!openTrades || openTrades.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No open trades to monitor" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      monitored: openTrades.length,
      slHits: [] as string[],
      tslUpdates: [] as string[],
      targetHits: [] as string[],
      priceUpdates: 0,
    };

    // Group trades by user
    const tradesByUser: Record<string, Trade[]> = {};
    for (const trade of openTrades as Trade[]) {
      if (!tradesByUser[trade.user_id]) tradesByUser[trade.user_id] = [];
      tradesByUser[trade.user_id].push(trade);
    }

    for (const [userId, userTrades] of Object.entries(tradesByUser)) {
      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("dhan_access_token, dhan_client_id, dhan_enabled, tsl_profiles, telegram_chat_id")
        .eq("user_id", userId)
        .single();

      const userToken = userSettings?.dhan_enabled ? userSettings.dhan_access_token : null;
      const userClientId = userSettings?.dhan_enabled ? userSettings.dhan_client_id : null;
      const activeToken = userToken || DHAN_ACCESS_TOKEN;
      const activeClientId = userClientId || DHAN_CLIENT_ID;
      const userTslProfiles = userSettings?.tsl_profiles || null;
      const userChatId = userSettings?.telegram_chat_id || null;

      const priceMap = await batchFetchPrices(userTrades, activeToken, activeClientId);

      for (const trade of userTrades) {
        const chatId = trade.telegram_post_enabled
          ? (userChatId || DEFAULT_TELEGRAM_CHAT_ID)
          : undefined;

        const currentPrice = priceMap[trade.symbol];
        if (!isValidPrice(currentPrice)) continue;

        // Outlier check: reject >20% jump from last known price
        if (isValidPrice(trade.current_price) && Math.abs(currentPrice / trade.current_price - 1) > 0.20) {
          console.warn(`Outlier price rejected for ${trade.symbol}: ${currentPrice} vs last ${trade.current_price}`);
          continue;
        }

        const qty = trade.quantity || 1;
        const isBuy = trade.trade_type === "BUY";
        const pnlMultiplier = isBuy ? 1 : -1;
        const entryPrice = trade.entry_price;

        if (!isValidPrice(entryPrice)) continue;

        const pnl = (currentPrice - entryPrice) * qty * pnlMultiplier;
        const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100 * pnlMultiplier;

        const updateData: Record<string, unknown> = {
          current_price: currentPrice,
          pnl,
          pnl_percent: pnlPercent,
          updated_at: new Date().toISOString(),
        };

        // --- TSL Logic (segment-based) ---
        let slClosed = false;
        if (trade.trailing_sl_enabled) {
          const profile = getTslProfile(userTslProfiles, trade.segment);
          const tslResult = processSegmentTsl(trade, currentPrice, entryPrice, isBuy, profile);

          if (tslResult.updateHighLow) {
            updateData.highest_since_entry = tslResult.highestSinceEntry;
            updateData.lowest_since_entry = tslResult.lowestSinceEntry;
          }

          if (tslResult.newSl !== null) {
            updateData.trailing_sl_current = tslResult.newSl;
            updateData.trailing_sl_active = true;
            updateData.last_trail_anchor_price = tslResult.newAnchor;
            results.tslUpdates.push(trade.symbol);

            // Log event
            await supabase.from("trade_events").insert({
              trade_id: trade.id,
              event_type: "TSL_UPDATED",
              price: currentPrice,
              notes: `TSL: ₹${(trade.trailing_sl_current ?? 0).toFixed(2)} → ₹${tslResult.newSl.toFixed(2)} | ${trade.segment}`,
            });

            // Notification with cooldown
            if (TELEGRAM_BOT_TOKEN && chatId && trade.telegram_post_enabled) {
              const now = Date.now();
              const lastNotified = trade.last_tsl_notified_at ? new Date(trade.last_tsl_notified_at).getTime() : 0;
              const cooldownMs = profile.cooldown_sec * 1000;

              if (now - lastNotified >= cooldownMs) {
                const oldSl = trade.trailing_sl_current ?? trade.stop_loss ?? 0;
                const msg = `🧲 *TSL Updated: ${trade.symbol}*\nSL: ₹${oldSl.toFixed(2)} → ₹${tslResult.newSl.toFixed(2)}\nSegment: ${trade.segment}\nLTP: ₹${currentPrice.toFixed(2)}`;
                await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, msg);
                updateData.last_tsl_notified_at = new Date().toISOString();
              }
            }
          }
        }

        // Update trade in DB
        await supabase.from("trades").update(updateData).eq("id", trade.id);
        results.priceUpdates++;

        // --- Check SL Hit (use TSL current if active, else static SL) ---
        const effectiveSL = (trade.trailing_sl_active && isValidPrice(trade.trailing_sl_current))
          ? (updateData.trailing_sl_current as number ?? trade.trailing_sl_current!)
          : trade.stop_loss;

        if (isValidPrice(effectiveSL)) {
          const slHit = isBuy ? currentPrice <= effectiveSL : currentPrice >= effectiveSL;

          if (slHit) {
            const isTslHit = trade.trailing_sl_active && isValidPrice(trade.trailing_sl_current);
            const reason = isTslHit ? "TSL_HIT" : "SL_HIT";
            results.slHits.push(trade.symbol);

            await supabase.from("trade_events").insert({
              trade_id: trade.id,
              event_type: reason,
              price: currentPrice,
              quantity: qty,
              pnl_realized: pnl,
              notes: `${isTslHit ? "Trailing SL" : "Stop loss"} hit at ₹${currentPrice.toFixed(2)}`,
            });

            await supabase.from("trades").update({
              status: "CLOSED",
              closed_at: new Date().toISOString(),
              closure_reason: reason,
              pnl, pnl_percent: pnlPercent,
              current_price: currentPrice,
            }).eq("id", trade.id);

            if (TELEGRAM_BOT_TOKEN && chatId && trade.telegram_post_enabled) {
              const emoji = pnl >= 0 ? "✅" : "🛑";
              const slType = isTslHit ? "Trailing SL" : "Stop Loss";
              const msg = `${emoji} *${slType} Hit!*\n\nSymbol: *${trade.symbol}*\nType: ${trade.trade_type}\nEntry: ₹${entryPrice.toLocaleString()}\nExit: ₹${currentPrice.toFixed(2)}\nP&L: ${pnl >= 0 ? "+" : ""}₹${pnl.toFixed(2)} (${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%)`;
              await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, msg);
            }

            if (activeToken && activeClientId) {
              await executeExitOrder(trade, currentPrice, reason, activeToken, activeClientId);
            }
            slClosed = true;
          }
        }

        if (slClosed) continue;

        // --- Check Targets ---
        if (trade.targets && Array.isArray(trade.targets)) {
          for (let i = 0; i < trade.targets.length; i++) {
            const target = trade.targets[i];
            const targetHit = isBuy ? currentPrice >= target : currentPrice <= target;

            if (targetHit) {
              const targetNum = i + 1;
              const eventType = `TARGET${targetNum}_HIT` as "TARGET1_HIT" | "TARGET2_HIT" | "TARGET3_HIT";

              const { data: existing } = await supabase
                .from("trade_events")
                .select("id")
                .eq("trade_id", trade.id)
                .eq("event_type", eventType);

              if (!existing || existing.length === 0) {
                results.targetHits.push(`${trade.symbol} T${targetNum}`);

                await supabase.from("trade_events").insert({
                  trade_id: trade.id,
                  event_type: eventType,
                  price: currentPrice,
                  notes: `Target ${targetNum} hit at ₹${currentPrice.toFixed(2)}`,
                });

                if (TELEGRAM_BOT_TOKEN && chatId && trade.telegram_post_enabled) {
                  const msg = `🎯 *Target ${targetNum} Hit!*\n\nSymbol: *${trade.symbol}*\nEntry: ₹${entryPrice.toLocaleString()}\nTarget: ₹${target.toLocaleString()}\nCurrent: ₹${currentPrice.toFixed(2)}\nP&L: +₹${pnl.toFixed(2)} (+${pnlPercent.toFixed(2)}%)`;
                  await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, msg);
                }
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
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

// --- Segment-based TSL processor ---
function processSegmentTsl(
  trade: Trade,
  ltp: number,
  entryPrice: number,
  isBuy: boolean,
  profile: TslProfile
): {
  updateHighLow: boolean;
  highestSinceEntry: number;
  lowestSinceEntry: number;
  newSl: number | null;
  newAnchor: number | null;
} {
  let highest = trade.highest_since_entry ?? (isBuy ? entryPrice : ltp);
  let lowest = trade.lowest_since_entry ?? (isBuy ? ltp : entryPrice);
  const lastAnchor = trade.last_trail_anchor_price ?? entryPrice;
  const currentSl = trade.trailing_sl_current;

  // Update high/low watermarks
  highest = Math.max(highest, ltp);
  lowest = Math.min(lowest, ltp);

  const result = {
    updateHighLow: true,
    highestSinceEntry: highest,
    lowestSinceEntry: lowest,
    newSl: null as number | null,
    newAnchor: null as number | null,
  };

  if (isBuy) {
    // Activation check: price must have moved activatePct above entry
    if (highest < entryPrice * (1 + profile.activate_pct / 100)) return result;

    // Step check: price must have moved stepPct above last anchor
    if (highest < lastAnchor * (1 + profile.step_pct / 100)) return result;

    // Candidate SL
    const candidateSl = highest * (1 - profile.trail_gap_pct / 100);
    const newSl = Math.max(currentSl ?? 0, candidateSl);

    // Only update if actually improved
    if (currentSl !== null && newSl <= currentSl) return result;

    // Min improvement check
    if (currentSl !== null && profile.min_sl_improve_pct > 0) {
      const improvePct = ((newSl - currentSl) / currentSl) * 100;
      if (improvePct < profile.min_sl_improve_pct) return result;
    }

    result.newSl = newSl;
    result.newAnchor = highest;
  } else {
    // SELL logic (inverse)
    if (lowest > entryPrice * (1 - profile.activate_pct / 100)) return result;
    if (lowest > lastAnchor * (1 - profile.step_pct / 100)) return result;

    const candidateSl = lowest * (1 + profile.trail_gap_pct / 100);
    const newSl = Math.min(currentSl ?? Infinity, candidateSl);

    if (currentSl !== null && newSl >= currentSl) return result;

    if (currentSl !== null && currentSl !== Infinity && profile.min_sl_improve_pct > 0) {
      const improvePct = ((currentSl - newSl) / currentSl) * 100;
      if (improvePct < profile.min_sl_improve_pct) return result;
    }

    result.newSl = newSl;
    result.newAnchor = lowest;
  }

  return result;
}

// --- Helpers ---

async function batchFetchPrices(
  trades: Trade[],
  dhanToken: string | undefined,
  dhanClientId: string | undefined
): Promise<Record<string, number>> {
  const priceMap: Record<string, number> = {};
  if (!dhanToken || !dhanClientId) return priceMap;

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

  if (!Object.keys(requestBody).some((k) => requestBody[k].length > 0)) return priceMap;

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
        // deno-lint-ignore no-explicit-any
        for (const [secId, quote] of Object.entries(segData) as [string, any][]) {
          const sym = secIdToSymbol[secId];
          if (!sym) continue;
          const ltp = quote.last_price || quote.ltp || 0;
          if (ltp > 0) priceMap[sym] = ltp;
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
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
    });
  } catch (e) {
    console.error("Failed to send Telegram message:", e);
  }
}

async function executeExitOrder(
  trade: Trade,
  _exitPrice: number,
  _reason: string,
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
        Accept: "application/json",
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
