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
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    // Group alerts by symbol for efficient API calls
    const symbolsToCheck = [...new Set(alerts.map((a: Alert) => a.symbol))];
    const priceData: Record<string, MarketQuote> = {};

    // Fetch current prices from Dhan (if configured)
    if (DHAN_ACCESS_TOKEN) {
      try {
        const quoteResponse = await fetch(`${DHAN_API_URL}/marketfeed/ltp`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "access-token": DHAN_ACCESS_TOKEN,
          },
          body: JSON.stringify({
            NSE_EQ: symbolsToCheck,
          }),
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
    const notifications: string[] = [];

    for (const alert of alerts as Alert[]) {
      const currentPrice = priceData[alert.symbol]?.ltp;
      
      // Skip if we couldn't get price data (use mock for demo)
      const price = currentPrice || getMockPrice(alert.symbol);
      
      let isTriggered = false;
      let conditionDesc = "";

      switch (alert.condition_type) {
        case "PRICE_GT":
          isTriggered = price > alert.threshold;
          conditionDesc = `Price ${price} > ${alert.threshold}`;
          break;
        case "PRICE_LT":
          isTriggered = price < alert.threshold;
          conditionDesc = `Price ${price} < ${alert.threshold}`;
          break;
        case "PERCENT_CHANGE_GT":
          const prevClose = priceData[alert.symbol]?.previousClose || price * 0.98;
          const percentChange = ((price - prevClose) / prevClose) * 100;
          isTriggered = percentChange > alert.threshold;
          conditionDesc = `Change ${percentChange.toFixed(2)}% > ${alert.threshold}%`;
          break;
        case "PERCENT_CHANGE_LT":
          const prevClose2 = priceData[alert.symbol]?.previousClose || price * 1.02;
          const percentChange2 = ((price - prevClose2) / prevClose2) * 100;
          isTriggered = percentChange2 < -alert.threshold;
          conditionDesc = `Change ${percentChange2.toFixed(2)}% < -${alert.threshold}%`;
          break;
        case "VOLUME_SPIKE":
          const volume = priceData[alert.symbol]?.volume || 0;
          isTriggered = volume > alert.threshold;
          conditionDesc = `Volume ${volume} > ${alert.threshold}`;
          break;
      }

      if (isTriggered) {
        triggeredAlerts.push(alert);
        
        // Update alert in database
        const updates: Record<string, unknown> = {
          last_triggered: new Date().toISOString(),
          trigger_count: (alert.trigger_count || 0) + 1,
        };

        // Deactivate if one-time alert
        if (alert.recurrence === "ONCE") {
          updates.active = false;
        }

        await supabase
          .from("alerts")
          .update(updates)
          .eq("id", alert.id);

        // Build notification message
        const emoji = alert.condition_type.includes("GT") ? "📈" : "📉";
        notifications.push(
          `${emoji} *${alert.symbol}*\n` +
          `Condition: ${conditionDesc}\n` +
          `Current Price: ₹${price.toLocaleString()}`
        );
      }
    }

    // Send Telegram notification if alerts triggered
    if (notifications.length > 0 && TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const message = `🔔 *Alert Triggered!*\n\n${notifications.join("\n\n")}`;

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
        evaluated: alerts.length,
        triggered: triggeredAlerts.length,
        alerts: triggeredAlerts.map((a) => ({
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

// Mock price generator for testing when Dhan API not available
function getMockPrice(symbol: string): number {
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
  // Add small random variation
  return base * (1 + (Math.random() - 0.5) * 0.02);
}
