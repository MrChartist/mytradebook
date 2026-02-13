import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DHAN_API_URL = "https://api.dhan.co/v2";

interface Alert {
  id: string;
  user_id: string;
  symbol: string;
  condition_type: string;
  threshold: number;
  parameters: Record<string, unknown> | null;
  active: boolean;
  recurrence: string;
  last_triggered: string | null;
  trigger_count: number;
  notes: string | null;
  telegram_enabled: boolean;
  exchange: string | null;
  cooldown_minutes: number | null;
  active_hours_only: boolean | null;
  snooze_until: string | null;
  expires_at: string | null;
}

interface MarketQuote {
  open: number;
  high: number;
  low: number;
  close: number;
  ltp: number;
  volume: number;
  sellQuantity: number;
  buyQuantity: number;
  previousClose: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const DHAN_ACCESS_TOKEN = Deno.env.get("DHAN_ACCESS_TOKEN");
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();

    // Check if within market hours (IST 09:15 - 15:30)
    const istHour = now.getUTCHours() + 5;
    const istMinute = now.getUTCMinutes() + 30;
    const istTimeMinutes = (istHour >= 24 ? istHour - 24 : istHour) * 60 + istMinute;
    const marketOpen = 9 * 60 + 15; // 09:15
    const marketClose = 15 * 60 + 30; // 15:30
    const isMarketHours = istTimeMinutes >= marketOpen && istTimeMinutes <= marketClose;

    // Fetch all active alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("alerts")
      .select("*")
      .eq("active", true);

    if (alertsError) {
      throw new Error(`Failed to fetch alerts: ${alertsError.message}`);
    }

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No active alerts to evaluate" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter alerts: skip expired, snoozed, active-hours-only outside market, cooldown
    const eligibleAlerts = (alerts as Alert[]).filter(alert => {
      // Skip expired
      if (alert.expires_at && new Date(alert.expires_at) < now) {
        return false;
      }
      // Skip snoozed
      if (alert.snooze_until && new Date(alert.snooze_until) > now) {
        return false;
      }
      // Skip if active hours only and not market hours
      if (alert.active_hours_only && !isMarketHours) {
        return false;
      }
      // Skip if within cooldown
      if (alert.last_triggered && alert.cooldown_minutes && alert.cooldown_minutes > 0) {
        const lastTriggered = new Date(alert.last_triggered);
        const cooldownEnd = new Date(lastTriggered.getTime() + alert.cooldown_minutes * 60 * 1000);
        if (now < cooldownEnd) {
          return false;
        }
      }
      return true;
    });

    // Group by symbol for efficient API calls
    const symbolsToCheck = [...new Set(eligibleAlerts.map(a => a.symbol))];
    const priceData: Record<string, MarketQuote> = {};

    // Fetch current prices from Dhan (if configured)
    if (DHAN_ACCESS_TOKEN && symbolsToCheck.length > 0) {
      try {
        const quoteResponse = await fetch(`${DHAN_API_URL}/marketfeed/ltp`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "access-token": DHAN_ACCESS_TOKEN,
          },
          body: JSON.stringify({ NSE_EQ: symbolsToCheck }),
        });

        if (quoteResponse.ok) {
          const quoteData = await quoteResponse.json();
          if (quoteData?.data?.NSE_EQ) {
            for (const symbol of symbolsToCheck) {
              const quote = quoteData.data.NSE_EQ[symbol];
              if (quote) {
                priceData[symbol] = {
                  open: quote.open || 0,
                  high: quote.high || 0,
                  low: quote.low || 0,
                  close: quote.close || 0,
                  ltp: quote.last_price || quote.ltp || 0,
                  volume: quote.volume || 0,
                  sellQuantity: quote.sell_quantity || 0,
                  buyQuantity: quote.buy_quantity || 0,
                  previousClose: quote.prev_close || quote.previousClose || 0,
                };
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch prices from Dhan:", e);
      }
    }

    // Evaluate each alert
    const triggeredAlerts: Alert[] = [];

    for (const alert of eligibleAlerts) {
      const currentPrice = priceData[alert.symbol]?.ltp;
      const price = currentPrice || getMockPrice(alert.symbol);

      let isTriggered = false;
      let conditionDesc = "";

      switch (alert.condition_type) {
        case "PRICE_GT":
          isTriggered = price > alert.threshold;
          conditionDesc = `Price ₹${price.toFixed(2)} > ₹${alert.threshold}`;
          break;
        case "PRICE_LT":
          isTriggered = price < alert.threshold;
          conditionDesc = `Price ₹${price.toFixed(2)} < ₹${alert.threshold}`;
          break;
        case "PERCENT_CHANGE_GT": {
          const prevClose = priceData[alert.symbol]?.previousClose || price * 0.98;
          const pctChange = ((price - prevClose) / prevClose) * 100;
          isTriggered = pctChange > alert.threshold;
          conditionDesc = `Day change ${pctChange.toFixed(2)}% > ${alert.threshold}%`;
          break;
        }
        case "PERCENT_CHANGE_LT": {
          const prevClose2 = priceData[alert.symbol]?.previousClose || price * 1.02;
          const pctChange2 = ((price - prevClose2) / prevClose2) * 100;
          isTriggered = pctChange2 < -alert.threshold;
          conditionDesc = `Day change ${pctChange2.toFixed(2)}% < -${alert.threshold}%`;
          break;
        }
        case "VOLUME_SPIKE": {
          const volume = priceData[alert.symbol]?.volume || 0;
          isTriggered = volume > alert.threshold;
          conditionDesc = `Volume ${volume.toLocaleString()} > ${alert.threshold.toLocaleString()}`;
          break;
        }
      }

      if (isTriggered) {
        triggeredAlerts.push(alert);

        // Update alert in database
        const updates: Record<string, unknown> = {
          last_triggered: now.toISOString(),
          trigger_count: (alert.trigger_count || 0) + 1,
        };

        if (alert.recurrence === "ONCE") {
          updates.active = false;
        }

        await supabase.from("alerts").update(updates).eq("id", alert.id);

        // Send Telegram notification if enabled
        if (alert.telegram_enabled && TELEGRAM_BOT_TOKEN) {
          // Fetch user's telegram_chat_id
          const { data: settings } = await supabase
            .from("user_settings")
            .select("telegram_chat_id")
            .eq("user_id", alert.user_id)
            .maybeSingle();

          const chatId = settings?.telegram_chat_id;
          if (chatId) {
            const emoji = alert.condition_type.includes("GT") ? "📈" : "📉";
            const exchange = alert.exchange || "NSE";
            const timestamp = now.toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              dateStyle: "short",
              timeStyle: "short",
            });

            const message =
              `🔔 *ALERT TRIGGERED*\n\n` +
              `${emoji} *${alert.symbol}* (${exchange})\n` +
              `Condition: ${conditionDesc}\n` +
              `LTP: ₹${price.toLocaleString()}\n` +
              `Time: ${timestamp}\n` +
              (alert.notes ? `📝 ${alert.notes}\n` : "") +
              (alert.recurrence !== "ONCE" && alert.cooldown_minutes
                ? `\n⏱ Cooldown: ${alert.cooldown_minutes}m`
                : "");

            try {
              await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: message,
                  parse_mode: "Markdown",
                }),
              });
            } catch (e) {
              console.error(`Telegram send failed for alert ${alert.id}:`, e);
            }
          }
        }
      }
    }

    // Auto-deactivate expired alerts
    const expiredIds = (alerts as Alert[])
      .filter(a => a.expires_at && new Date(a.expires_at) < now && a.active)
      .map(a => a.id);

    if (expiredIds.length > 0) {
      await supabase
        .from("alerts")
        .update({ active: false })
        .in("id", expiredIds);
    }

    return new Response(
      JSON.stringify({
        success: true,
        evaluated: eligibleAlerts.length,
        triggered: triggeredAlerts.length,
        skipped: alerts.length - eligibleAlerts.length,
        expired_deactivated: expiredIds.length,
        alerts: triggeredAlerts.map(a => ({
          id: a.id,
          symbol: a.symbol,
          condition: a.condition_type,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Alert evaluation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getMockPrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    RELIANCE: 2450, TATASTEEL: 155, INFY: 1520, TCS: 3850,
    HDFCBANK: 1680, ICICIBANK: 1120, SBIN: 780, BHARTIARTL: 1380,
    WIPRO: 480, KOTAKBANK: 1850,
  };
  const base = basePrices[symbol] || 1000;
  return base * (1 + (Math.random() - 0.5) * 0.02);
}
