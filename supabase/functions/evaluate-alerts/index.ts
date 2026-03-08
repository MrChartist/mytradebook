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
  chain_children: Record<string, unknown>[] | null;
  security_id: string | null;
  exchange_segment: string | null;
  check_interval_minutes: number | null;
  last_checked_at: string | null;
  priority: string | null;
}

interface EvaluationMetrics {
  total_evaluated: number;
  total_triggered: number;
  avg_latency_ms: number;
  errors: number;
}

// Fetch prices using per-user Dhan credentials via security_ids
async function fetchPricesForUser(
  supabase: any,
  userId: string,
  alerts: Alert[]
): Promise<Record<string, { ltp: number; previousClose: number; volume: number; high: number; low: number }>> {
  const priceData: Record<string, { ltp: number; previousClose: number; volume: number; high: number; low: number }> = {};

  const { data: settings } = await supabase
    .from("user_settings")
    .select("dhan_access_token, dhan_client_id, dhan_enabled")
    .eq("user_id", userId)
    .single();

  const token = settings?.dhan_enabled ? settings.dhan_access_token : null;
  const clientId = settings?.dhan_enabled ? settings.dhan_client_id : null;

  if (!token || !clientId) {
    console.log(`No Dhan credentials for user ${userId}, skipping price fetch`);
    return priceData;
  }

  const requestBody: Record<string, number[]> = {};
  const secIdToSymbol: Record<string, string> = {};

  for (const alert of alerts) {
    let secId = alert.security_id;
    let exchSeg = alert.exchange_segment || "NSE_EQ";

    if (!secId) {
      const { data: inst } = await supabase
        .from("instrument_master")
        .select("security_id, exchange_segment")
        .eq("trading_symbol", alert.symbol)
        .limit(1)
        .maybeSingle();
      if (inst) {
        secId = inst.security_id;
        exchSeg = inst.exchange_segment;
      }
    }

    if (!secId) continue;
    const numericId = parseInt(secId, 10);
    if (isNaN(numericId)) continue;

    if (!requestBody[exchSeg]) requestBody[exchSeg] = [];
    if (!requestBody[exchSeg].includes(numericId)) {
      requestBody[exchSeg].push(numericId);
    }
    secIdToSymbol[secId] = alert.symbol;
  }

  const hasIds = Object.keys(requestBody).some((k) => requestBody[k].length > 0);
  if (!hasIds) return priceData;

  try {
    let retries = 0;
    let res: Response | null = null;

    while (retries < 3) {
      res = await fetch(`${DHAN_API_URL}/marketfeed/quote`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "access-token": token,
          "client-id": clientId,
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
          if (!sym || !quote) continue;
          const q = quote as Record<string, any>;
          const ltp = q.last_price || q.ltp || 0;
          const ohlc = q.ohlc || {};
          if (ltp > 0) {
            priceData[sym] = {
              ltp,
              previousClose: ohlc.close || q.prev_close || 0,
              volume: q.volume || 0,
              high: ohlc.high || q.high || 0,
              low: ohlc.low || q.low || 0,
            };
          }
        }
      }
    } else if (res) {
      console.error(`Dhan quote error for user ${userId}:`, res.status, await res.text());
    }
  } catch (e) {
    console.error(`Dhan fetch error for user ${userId}:`, e);
  }

  return priceData;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const metrics: EvaluationMetrics = {
    total_evaluated: 0,
    total_triggered: 0,
    avg_latency_ms: 0,
    errors: 0,
  };

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();

    // IST market hours check
    const istOffset = 5.5 * 60;
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const istMinutes = utcMinutes + istOffset;
    const istTimeNorm = istMinutes >= 1440 ? istMinutes - 1440 : istMinutes;
    const marketOpen = 9 * 60 + 15;
    const marketClose = 15 * 60 + 30;
    const isMarketHours = istTimeNorm >= marketOpen && istTimeNorm <= marketClose;

    // Fetch all active alerts with staggered check interval support
    const { data: alerts, error: alertsError } = await supabase
      .from("alerts")
      .select("*")
      .eq("active", true)
      .order("last_checked_at", { ascending: true, nullsFirst: true })
      .limit(500); // Process in batches

    if (alertsError) throw new Error(`Failed to fetch alerts: ${alertsError.message}`);
    if (!alerts || alerts.length === 0) {
      return jsonResponse({ success: true, message: "No active alerts", metrics });
    }

    // Filter eligible alerts with staggered check intervals
    const eligible = (alerts as Alert[]).filter(a => {
      if (a.expires_at && new Date(a.expires_at) < now) return false;
      if (a.snooze_until && new Date(a.snooze_until) > now) return false;
      if (a.active_hours_only && !isMarketHours) return false;
      
      // Cooldown check
      if (a.last_triggered && a.cooldown_minutes && a.cooldown_minutes > 0) {
        const cooldownEnd = new Date(new Date(a.last_triggered).getTime() + a.cooldown_minutes * 60000);
        if (now < cooldownEnd) return false;
      }
      
      // Staggered check interval - use last_checked_at
      const checkInterval = a.check_interval_minutes || 5;
      if (a.last_checked_at) {
        const nextCheckAt = new Date(new Date(a.last_checked_at).getTime() + checkInterval * 60000);
        if (now < nextCheckAt) return false;
      }
      
      // Priority-based throttling: high priority always, normal every check, low every other
      if (a.priority === "low" && Math.random() > 0.5) return false;
      
      return true;
    });

    // Group eligible alerts by user for per-user token resolution
    const alertsByUser: Record<string, Alert[]> = {};
    for (const alert of eligible) {
      if (!alertsByUser[alert.user_id]) alertsByUser[alert.user_id] = [];
      alertsByUser[alert.user_id].push(alert);
    }

    const triggered: Alert[] = [];
    let skippedNoPrice = 0;
    const evaluationLatencies: number[] = [];

    for (const [userId, userAlerts] of Object.entries(alertsByUser)) {
      const userStartTime = Date.now();
      
      // Fetch real prices using this user's Dhan credentials
      const priceData = await fetchPricesForUser(supabase, userId, userAlerts);

      for (const alert of userAlerts) {
        const evalStart = Date.now();
        const quote = priceData[alert.symbol];
        
        // Update last_checked_at regardless of price availability
        await supabase
          .from("alerts")
          .update({ last_checked_at: now.toISOString() })
          .eq("id", alert.id);
        
        if (!quote || quote.ltp <= 0) {
          console.log(`No real price for ${alert.symbol}, skipping alert ${alert.id}`);
          skippedNoPrice++;
          continue;
        }

        const price = quote.ltp;
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
            if (prevLtp !== null && prevLtp !== undefined) {
              isTriggered = prevLtp <= alert.threshold && price > alert.threshold;
            }
            conditionDesc = `Price crossed above ₹${alert.threshold}`;
            break;

          case "PRICE_CROSS_BELOW":
            if (prevLtp !== null && prevLtp !== undefined) {
              isTriggered = prevLtp >= alert.threshold && price < alert.threshold;
            }
            conditionDesc = `Price crossed below ₹${alert.threshold}`;
            break;

          case "PERCENT_CHANGE_GT": {
            const pc = quote.previousClose || 0;
            if (pc > 0) {
              const pct = ((price - pc) / pc) * 100;
              isTriggered = pct > alert.threshold;
              conditionDesc = `Day change ${pct.toFixed(2)}% > ${alert.threshold}%`;
            }
            break;
          }

          case "PERCENT_CHANGE_LT": {
            const pc = quote.previousClose || 0;
            if (pc > 0) {
              const pct = ((price - pc) / pc) * 100;
              isTriggered = pct < -alert.threshold;
              conditionDesc = `Day change ${pct.toFixed(2)}% < -${alert.threshold}%`;
            }
            break;
          }

          case "VOLUME_SPIKE": {
            const vol = quote.volume || 0;
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
          metrics.total_triggered++;

          const updates: Record<string, unknown> = {
            last_triggered: now.toISOString(),
            trigger_count: (alert.trigger_count || 0) + 1,
            previous_ltp: price,
          };
          if (alert.recurrence === "ONCE") updates.active = false;

          await supabase.from("alerts").update(updates).eq("id", alert.id);

          // Create in-app notification
          try {
            await supabase.from("notifications").insert({
              user_id: alert.user_id,
              type: "alert_triggered",
              title: `${alert.symbol} Alert Triggered`,
              message: conditionDesc,
              data: { alert_id: alert.id, price, condition: alert.condition_type },
            });
          } catch (e) {
            console.error("Failed to create notification:", e);
          }

          // Alert Chains
          if (alert.chain_children && Array.isArray(alert.chain_children) && alert.chain_children.length > 0) {
            try {
              const childInserts = alert.chain_children.map((child: any) => ({
                user_id: alert.user_id,
                symbol: child.symbol || alert.symbol,
                condition_type: child.condition_type || "PRICE_GT",
                threshold: child.threshold,
                recurrence: child.recurrence || "ONCE",
                notes: child.notes || `Chained from ${alert.symbol} alert`,
                telegram_enabled: child.telegram_enabled ?? alert.telegram_enabled,
                exchange: child.exchange || alert.exchange || "NSE",
                active: true,
              }));
              await supabase.from("alerts").insert(childInserts);
              console.log(`Created ${childInserts.length} chained alerts from ${alert.id}`);
            } catch (e) {
              console.error(`Chain creation failed for ${alert.id}:`, e);
              metrics.errors++;
            }
          }

          // Send Telegram via telegram-notify function
          if (alert.telegram_enabled && TELEGRAM_BOT_TOKEN) {
            try {
              await supabase.functions.invoke("telegram-notify", {
                body: {
                  type: "alert_triggered",
                  alert_id: alert.id,
                  current_price: price,
                },
              });
            } catch (e) {
              console.error(`Telegram notify failed for ${alert.id}:`, e);
              metrics.errors++;
            }
          }
        }

        const evalEnd = Date.now();
        evaluationLatencies.push(evalEnd - evalStart);
        metrics.total_evaluated++;
      }
    }

    // Auto-deactivate expired alerts
    const expiredIds = (alerts as Alert[])
      .filter(a => a.expires_at && new Date(a.expires_at) < now && a.active)
      .map(a => a.id);
    if (expiredIds.length > 0) {
      await supabase.from("alerts").update({ active: false }).in("id", expiredIds);
    }

    // Calculate average latency
    if (evaluationLatencies.length > 0) {
      metrics.avg_latency_ms = Math.round(
        evaluationLatencies.reduce((a, b) => a + b, 0) / evaluationLatencies.length
      );
    }

    const totalTime = Date.now() - startTime;

    return jsonResponse({
      success: true,
      evaluated: metrics.total_evaluated,
      triggered: metrics.total_triggered,
      skipped: alerts.length - eligible.length,
      skipped_no_price: skippedNoPrice,
      expired_deactivated: expiredIds.length,
      total_time_ms: totalTime,
      metrics,
    });
  } catch (error: unknown) {
    console.error("Alert evaluation error:", error);
    metrics.errors++;
    return jsonResponse({ success: false, error: error instanceof Error ? error.message : "Unknown", metrics }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
