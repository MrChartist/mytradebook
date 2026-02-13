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
  previous_ltp: number | null;
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

    // IST market hours check
    const istOffset = 5.5 * 60; // minutes
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const istMinutes = utcMinutes + istOffset;
    const istTimeNorm = istMinutes >= 1440 ? istMinutes - 1440 : istMinutes;
    const marketOpen = 9 * 60 + 15;
    const marketClose = 15 * 60 + 30;
    const isMarketHours = istTimeNorm >= marketOpen && istTimeNorm <= marketClose;

    // Fetch all active alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("alerts")
      .select("*")
      .eq("active", true);

    if (alertsError) throw new Error(`Failed to fetch alerts: ${alertsError.message}`);
    if (!alerts || alerts.length === 0) {
      return jsonResponse({ success: true, message: "No active alerts" });
    }

    // Filter eligible alerts
    const eligible = (alerts as Alert[]).filter(a => {
      if (a.expires_at && new Date(a.expires_at) < now) return false;
      if (a.snooze_until && new Date(a.snooze_until) > now) return false;
      if (a.active_hours_only && !isMarketHours) return false;
      if (a.last_triggered && a.cooldown_minutes && a.cooldown_minutes > 0) {
        const cooldownEnd = new Date(new Date(a.last_triggered).getTime() + a.cooldown_minutes * 60000);
        if (now < cooldownEnd) return false;
      }
      return true;
    });

    // Fetch prices
    const symbols = [...new Set(eligible.map(a => a.symbol))];
    const priceData: Record<string, { ltp: number; previousClose: number; volume: number; high: number; low: number }> = {};

    if (DHAN_ACCESS_TOKEN && symbols.length > 0) {
      try {
        const res = await fetch(`${DHAN_API_URL}/marketfeed/ltp`, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json", "access-token": DHAN_ACCESS_TOKEN },
          body: JSON.stringify({ NSE_EQ: symbols }),
        });
        if (res.ok) {
          const d = await res.json();
          if (d?.data?.NSE_EQ) {
            for (const sym of symbols) {
              const q = d.data.NSE_EQ[sym];
              if (q) {
                priceData[sym] = {
                  ltp: q.last_price || q.ltp || 0,
                  previousClose: q.prev_close || q.previousClose || 0,
                  volume: q.volume || 0,
                  high: q.high || 0,
                  low: q.low || 0,
                };
              }
            }
          }
        }
      } catch (e) { console.error("Dhan fetch error:", e); }
    }

    // Evaluate
    const triggered: Alert[] = [];

    for (const alert of eligible) {
      const quote = priceData[alert.symbol];
      const price = quote?.ltp || getMockPrice(alert.symbol);
      const prevLtp = alert.previous_ltp;

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

        case "PRICE_CROSS_ABOVE":
          // Cross detection: was below (or unknown), now above
          if (prevLtp !== null && prevLtp !== undefined) {
            isTriggered = prevLtp <= alert.threshold && price > alert.threshold;
          } else {
            // First check — can't detect cross without previous, just track
            isTriggered = false;
          }
          conditionDesc = `Price crossed above ₹${alert.threshold} (prev: ₹${prevLtp?.toFixed(2) || "—"}, now: ₹${price.toFixed(2)})`;
          break;

        case "PRICE_CROSS_BELOW":
          if (prevLtp !== null && prevLtp !== undefined) {
            isTriggered = prevLtp >= alert.threshold && price < alert.threshold;
          } else {
            isTriggered = false;
          }
          conditionDesc = `Price crossed below ₹${alert.threshold} (prev: ₹${prevLtp?.toFixed(2) || "—"}, now: ₹${price.toFixed(2)})`;
          break;

        case "PERCENT_CHANGE_GT": {
          const pc = quote?.previousClose || price * 0.98;
          const pct = ((price - pc) / pc) * 100;
          isTriggered = pct > alert.threshold;
          conditionDesc = `Day change ${pct.toFixed(2)}% > ${alert.threshold}%`;
          break;
        }

        case "PERCENT_CHANGE_LT": {
          const pc = quote?.previousClose || price * 1.02;
          const pct = ((price - pc) / pc) * 100;
          isTriggered = pct < -alert.threshold;
          conditionDesc = `Day change ${pct.toFixed(2)}% < -${alert.threshold}%`;
          break;
        }

        case "VOLUME_SPIKE": {
          const vol = quote?.volume || 0;
          isTriggered = vol > alert.threshold;
          conditionDesc = `Volume ${vol.toLocaleString()} > ${alert.threshold.toLocaleString()}`;
          break;
        }
      }

      // Always update previous_ltp for cross detection
      await supabase
        .from("alerts")
        .update({ previous_ltp: price })
        .eq("id", alert.id);

      if (isTriggered) {
        triggered.push(alert);

        const updates: Record<string, unknown> = {
          last_triggered: now.toISOString(),
          trigger_count: (alert.trigger_count || 0) + 1,
          previous_ltp: price,
        };
        if (alert.recurrence === "ONCE") updates.active = false;

        await supabase.from("alerts").update(updates).eq("id", alert.id);

        // Send Telegram
        if (alert.telegram_enabled && TELEGRAM_BOT_TOKEN) {
          const { data: settings } = await supabase
            .from("user_settings")
            .select("telegram_chat_id")
            .eq("user_id", alert.user_id)
            .maybeSingle();

          const chatId = settings?.telegram_chat_id;
          if (chatId) {
            const ct = alert.condition_type;
            const isCross = ct.startsWith("PRICE_CROSS");
            const isPct = ct.includes("PERCENT_CHANGE");
            const isVol = ct === "VOLUME_SPIKE";

            const emojiMap: Record<string, string> = {
              PRICE_GT: "📈", PRICE_LT: "📉",
              PRICE_CROSS_ABOVE: "⚡", PRICE_CROSS_BELOW: "⚡",
              PERCENT_CHANGE_GT: "📊", PERCENT_CHANGE_LT: "📊",
              VOLUME_SPIKE: "🔊", CUSTOM: "🚨",
            };
            const headerMap: Record<string, string> = {
              PRICE_GT: "PRICE ABOVE HIT", PRICE_LT: "PRICE BELOW HIT",
              PRICE_CROSS_ABOVE: "CROSS ABOVE CONFIRMED", PRICE_CROSS_BELOW: "CROSS BELOW CONFIRMED",
              PERCENT_CHANGE_GT: "DAY % CHANGE ABOVE", PERCENT_CHANGE_LT: "DAY % CHANGE BELOW",
              VOLUME_SPIKE: "VOLUME SPIKE", CUSTOM: "CUSTOM ALERT",
            };

            const emoji = emojiMap[ct] || "🚨";
            const header = headerMap[ct] || "ALERT TRIGGERED";
            const exchangeMap: Record<string, string> = {
              NSE: "NSE·EQ", BSE: "BSE·EQ", NFO: "NSE·F&O", MCX: "MCX",
            };
            const tag = exchangeMap[alert.exchange || "NSE"] || alert.exchange || "NSE·EQ";
            const ts = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short" });
            const modeLabel = alert.recurrence === "ONCE" ? "One-time" : alert.recurrence === "DAILY" ? "Repeating (Daily)" : "Repeating";

            let triggerText = "";
            if (isPct) triggerText = `Triggered: Day % ${ct.includes("GT") ? "above" : "below"} ${alert.threshold}%`;
            else if (isVol) triggerText = `Spike Triggered ✅`;
            else if (isCross) triggerText = `Crossed: ₹${alert.threshold.toLocaleString()}`;
            else triggerText = `Level: ${ct.includes("GT") ? "Above" : "Below"} ₹${alert.threshold.toLocaleString()}`;

            let message = `${emoji} *${header}*\n`;
            message += `*${alert.symbol}* (${tag})\n\n`;
            message += `${triggerText}\n`;
            message += `Now: LTP ₹${price.toLocaleString()}\n`;
            message += `Mode: ${modeLabel}\n`;
            if (alert.notes) message += `Reason: ${alert.notes}\n`;
            message += `\n⏱ ${ts}`;

            try {
              await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
              });
            } catch (e) { console.error(`Telegram failed for ${alert.id}:`, e); }
          }
        }
      }
    }

    // Auto-deactivate expired
    const expiredIds = (alerts as Alert[])
      .filter(a => a.expires_at && new Date(a.expires_at) < now && a.active)
      .map(a => a.id);
    if (expiredIds.length > 0) {
      await supabase.from("alerts").update({ active: false }).in("id", expiredIds);
    }

    return jsonResponse({
      success: true,
      evaluated: eligible.length,
      triggered: triggered.length,
      skipped: alerts.length - eligible.length,
      expired_deactivated: expiredIds.length,
    });
  } catch (error: unknown) {
    console.error("Alert evaluation error:", error);
    return jsonResponse({ success: false, error: error instanceof Error ? error.message : "Unknown" }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getMockPrice(symbol: string): number {
  const bases: Record<string, number> = {
    RELIANCE: 2450, TATASTEEL: 155, INFY: 1520, TCS: 3850,
    HDFCBANK: 1680, ICICIBANK: 1120, SBIN: 780, BHARTIARTL: 1380,
  };
  return (bases[symbol] || 1000) * (1 + (Math.random() - 0.5) * 0.02);
}
