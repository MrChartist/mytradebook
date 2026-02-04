import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TradeNotification {
  type: "new_trade" | "trade_update" | "trade_closed";
  trade_id: string;
}

interface SLModifiedNotification {
  type: "trade_sl_modified";
  trade_id: string;
  old_sl: number;
  new_sl: number;
}

interface AlertNotification {
  type: "alert_triggered";
  alert_id: string;
  current_price: number;
}

interface AlertCreatedNotification {
  type: "alert_created";
  alert_id: string;
}

interface AlertPausedNotification {
  type: "alert_paused";
  alert_id: string;
  is_paused: boolean;
}

interface AlertDeletedNotification {
  type: "alert_deleted";
  symbol: string;
  condition_type: string;
  threshold: number | null;
}

interface TradeEventAddedNotification {
  type: "trade_event_added";
  trade_id: string;
  event_type: string;
  price: number;
  notes?: string;
}

interface ReportNotification {
  type: "weekly_report";
  report_id: string;
}

interface CustomNotification {
  type: "custom";
  message: string;
  chat_id?: string;
}

interface TestNotification {
  type: "test";
  message?: string;
}

type NotificationPayload =
  | TradeNotification
  | SLModifiedNotification
  | AlertNotification
  | AlertCreatedNotification
  | AlertPausedNotification
  | AlertDeletedNotification
  | TradeEventAddedNotification
  | ReportNotification
  | CustomNotification
  | TestNotification;

const timeframeLabels: Record<string, string> = {
  "1min": "1 Min",
  "5min": "5 Min",
  "15min": "15 Min",
  "30min": "30 Min",
  "1H": "1 Hour",
  "4H": "4 Hour",
  "1D": "Daily",
  "1W": "Weekly",
};

const conditionLabels: Record<string, string> = {
  PRICE_GT: "Price Above",
  PRICE_LT: "Price Below",
  PERCENT_CHANGE_GT: "Gain Above",
  PERCENT_CHANGE_LT: "Loss Above",
  VOLUME_SPIKE: "Volume Spike",
  CUSTOM: "Custom",
};

const eventTypeLabels: Record<string, string> = {
  ENTRY: "Entry",
  SL_HIT: "Stop Loss Hit",
  TARGET1_HIT: "Target 1 Hit",
  TARGET2_HIT: "Target 2 Hit",
  TARGET3_HIT: "Target 3 Hit",
  PARTIAL_EXIT: "Partial Exit",
  SL_MODIFIED: "SL Modified",
  TARGET_MODIFIED: "Target Modified",
  CLOSED: "Closed",
  TSL_UPDATED: "TSL Updated",
  TSL_HIT: "TSL Hit",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const DEFAULT_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload: NotificationPayload = await req.json();

    let message = "";
    let chatId = DEFAULT_CHAT_ID;

    switch (payload.type) {
      case "new_trade": {
        const { data: trade, error } = await supabase
          .from("trades")
          .select(
            `
            *,
            profiles:user_id (name),
            user_settings:user_id (telegram_chat_id)
          `
          )
          .eq("id", payload.trade_id)
          .single();

        if (error || !trade) {
          throw new Error(`Trade not found: ${payload.trade_id}`);
        }

        // Use user's telegram_chat_id if available
        if (trade.user_settings?.telegram_chat_id) {
          chatId = trade.user_settings.telegram_chat_id;
        }

        const targets = trade.targets || [];
        const targetsStr = targets.length > 0 
          ? targets.map((t: number, i: number) => `T${i + 1}: ₹${t.toLocaleString()}`).join(" | ")
          : "Not set";

        // Calculate SL percentage
        const slPercent = trade.stop_loss 
          ? (((trade.entry_price - trade.stop_loss) / trade.entry_price) * 100 * (trade.trade_type === "BUY" ? 1 : -1)).toFixed(1)
          : null;

        // Build TSL info
        let tslInfo = "";
        if (trade.trailing_sl_enabled) {
          const tslValue = trade.trailing_sl_percent 
            ? `${trade.trailing_sl_percent}%` 
            : `${trade.trailing_sl_points} pts`;
          const triggerInfo = trade.trailing_sl_trigger_price 
            ? `activates at ₹${trade.trailing_sl_trigger_price.toLocaleString()}`
            : "on T1";
          tslInfo = `🔄 *TSL:* ${tslValue} (${triggerInfo})\n`;
        }

        // Build timeframe/holding period info
        let timeInfo = "";
        if (trade.timeframe || trade.holding_period) {
          const tf = trade.timeframe ? timeframeLabels[trade.timeframe] || trade.timeframe : "";
          const hp = trade.holding_period || "";
          timeInfo = `⏱ *${[tf, hp].filter(Boolean).join(" | ")}*\n`;
        }

        message = `🚀 *New Research Trade*\n\n` +
          `*${trade.trade_type}* *${trade.symbol}* at ₹${trade.entry_price.toLocaleString()}\n` +
          `📊 ${trade.segment.replace("_", " ")}\n` +
          timeInfo +
          `🛑 *SL:* ₹${trade.stop_loss?.toLocaleString() || "Not set"}${slPercent ? ` (${slPercent}%)` : ""}\n` +
          tslInfo +
          `🎯 *Targets:* ${targetsStr}\n\n` +
          `⭐ Rating: ${trade.rating || "N/A"}/10 | Confidence: ${trade.confidence_score || "N/A"}/5` +
          (trade.notes ? `\n\n📝 ${trade.notes}` : "");
        break;
      }

      case "trade_update": {
        const { data: trade, error } = await supabase
          .from("trades")
          .select(
            `
            *,
            user_settings:user_id (telegram_chat_id),
            trade_events (*)
          `
          )
          .eq("id", payload.trade_id)
          .order("timestamp", { foreignTable: "trade_events", ascending: false })
          .limit(1, { foreignTable: "trade_events" })
          .single();

        if (error || !trade) {
          throw new Error(`Trade not found: ${payload.trade_id}`);
        }

        if (trade.user_settings?.telegram_chat_id) {
          chatId = trade.user_settings.telegram_chat_id;
        }

        const latestEvent = trade.trade_events?.[0];
        const eventType = latestEvent?.event_type || "UPDATE";
        const pnlPercent =
          trade.pnl_percent >= 0 ? `+${trade.pnl_percent.toFixed(2)}%` : `${trade.pnl_percent.toFixed(2)}%`;

        let emoji = "📊";
        if (eventType.includes("TARGET")) emoji = "🎯";
        if (eventType === "SL_HIT") emoji = "🛑";
        if (eventType === "TSL_HIT") emoji = "🔄";
        if (eventType === "TSL_UPDATED") emoji = "🔄";
        if (eventType === "SL_MODIFIED") emoji = "✏️";

        const eventLabel = eventType.replace(/_/g, " ");

        message = `${emoji} *Trade Update*\n\n` +
          `*${trade.symbol}* - ${eventLabel}\n` +
          `💰 P&L: ₹${trade.pnl?.toFixed(2) || 0} (${pnlPercent})\n` +
          `📍 Current: ₹${trade.current_price?.toFixed(2) || trade.entry_price}\n` +
          `🛑 SL: ₹${trade.stop_loss || "Not set"}` +
          (trade.trailing_sl_active && trade.trailing_sl_current 
            ? `\n🔄 TSL: ₹${trade.trailing_sl_current.toFixed(2)} (active)` 
            : "") +
          (latestEvent?.notes ? `\n\n📝 ${latestEvent.notes}` : "");
        break;
      }

      case "trade_closed": {
        const { data: trade, error } = await supabase
          .from("trades")
          .select(
            `
            *,
            user_settings:user_id (telegram_chat_id)
          `
          )
          .eq("id", payload.trade_id)
          .single();

        if (error || !trade) {
          throw new Error(`Trade not found: ${payload.trade_id}`);
        }

        if (trade.user_settings?.telegram_chat_id) {
          chatId = trade.user_settings.telegram_chat_id;
        }

        const isProfit = (trade.pnl || 0) >= 0;
        const emoji = isProfit ? "✅" : "❌";
        const pnl = trade.pnl || 0;
        const pnlStr = isProfit ? `+₹${pnl.toFixed(2)}` : `-₹${Math.abs(pnl).toFixed(2)}`;
        const pnlPercent = trade.pnl_percent || 0;
        const pnlPercentStr =
          pnlPercent >= 0 ? `+${pnlPercent.toFixed(2)}%` : `${pnlPercent.toFixed(2)}%`;

        // Determine closure reason label
        const reasonLabels: Record<string, string> = {
          SL_HIT: "Stop Loss",
          TSL_HIT: "Trailing SL",
          TARGET1_HIT: "Target 1",
          TARGET2_HIT: "Target 2",
          TARGET3_HIT: "Target 3",
          MANUAL: "Manual",
        };
        const reasonLabel = reasonLabels[trade.closure_reason || ""] || trade.closure_reason || "Manual";

        message = `${emoji} *Trade Closed*\n\n` +
          `*${trade.symbol}* - ${trade.trade_type}\n` +
          `Entry: ₹${trade.entry_price.toLocaleString()} → Exit: ₹${trade.current_price?.toFixed(2) || "N/A"}\n\n` +
          `💰 *P&L:* ${pnlStr} (${pnlPercentStr})\n` +
          `📊 Reason: ${reasonLabel}` +
          (trade.notes ? `\n\n📝 ${trade.notes}` : "");
        break;
      }

      case "trade_sl_modified": {
        const { data: trade, error } = await supabase
          .from("trades")
          .select(
            `
            *,
            user_settings:user_id (telegram_chat_id)
          `
          )
          .eq("id", payload.trade_id)
          .single();

        if (error || !trade) {
          throw new Error(`Trade not found: ${payload.trade_id}`);
        }

        if (trade.user_settings?.telegram_chat_id) {
          chatId = trade.user_settings.telegram_chat_id;
        }

        const pnl = trade.pnl || 0;
        const pnlPercent = trade.pnl_percent || 0;
        const pnlStr = pnl >= 0 
          ? `+₹${pnl.toLocaleString()}` 
          : `-₹${Math.abs(pnl).toLocaleString()}`;
        const pnlPercentStr = pnlPercent >= 0 
          ? `+${pnlPercent.toFixed(1)}%` 
          : `${pnlPercent.toFixed(1)}%`;

        message = `✏️ *Stop Loss Modified*\n\n` +
          `Symbol: *${trade.symbol}*\n` +
          `Old SL: ₹${payload.old_sl.toLocaleString()} → New SL: ₹${payload.new_sl.toLocaleString()}\n` +
          `Current P&L: ${pnlStr} (${pnlPercentStr})`;
        break;
      }

      case "alert_triggered": {
        const { data: alert, error } = await supabase
          .from("alerts")
          .select(
            `
            *,
            user_settings:user_id (telegram_chat_id)
          `
          )
          .eq("id", payload.alert_id)
          .single();

        if (error || !alert) {
          throw new Error(`Alert not found: ${payload.alert_id}`);
        }

        if (alert.user_settings?.telegram_chat_id) {
          chatId = alert.user_settings.telegram_chat_id;
        }

        const conditionMap: Record<string, string> = {
          PRICE_GT: "crossed above",
          PRICE_LT: "crossed below",
          PERCENT_CHANGE_GT: "gained more than",
          PERCENT_CHANGE_LT: "lost more than",
          VOLUME_SPIKE: "volume spike detected",
          CUSTOM: "custom condition met",
        };

        const condition = conditionMap[alert.condition_type] || alert.condition_type;

        message = `🔔 *ALERT TRIGGERED*\n\n` +
          `*${alert.symbol}* ${condition} ₹${alert.threshold}\n\n` +
          `📍 Current Price: ₹${payload.current_price.toFixed(2)}\n` +
          `🔁 Recurrence: ${alert.recurrence}\n` +
          `📊 Trigger Count: ${(alert.trigger_count || 0) + 1}`;
        break;
      }

      case "alert_created": {
        const { data: alert, error } = await supabase
          .from("alerts")
          .select(
            `
            *,
            user_settings:user_id (telegram_chat_id)
          `
          )
          .eq("id", payload.alert_id)
          .single();

        if (error || !alert) {
          throw new Error(`Alert not found: ${payload.alert_id}`);
        }

        if (alert.user_settings?.telegram_chat_id) {
          chatId = alert.user_settings.telegram_chat_id;
        }

        const conditionLabel = conditionLabels[alert.condition_type] || alert.condition_type;
        const recurrenceLabels: Record<string, string> = {
          ONCE: "One-time",
          DAILY: "Daily",
          CONTINUOUS: "Continuous",
        };
        const recurrence = recurrenceLabels[alert.recurrence || "ONCE"] || alert.recurrence;

        message = `🔔 *New Alert Created*\n\n` +
          `Symbol: *${alert.symbol}*\n` +
          `Condition: ${conditionLabel} ₹${alert.threshold?.toLocaleString() || "N/A"}\n` +
          `Recurrence: ${recurrence}`;
        break;
      }

      case "alert_paused": {
        const { data: alert, error } = await supabase
          .from("alerts")
          .select(
            `
            *,
            user_settings:user_id (telegram_chat_id)
          `
          )
          .eq("id", payload.alert_id)
          .single();

        if (error || !alert) {
          throw new Error(`Alert not found: ${payload.alert_id}`);
        }

        if (alert.user_settings?.telegram_chat_id) {
          chatId = alert.user_settings.telegram_chat_id;
        }

        const conditionLabel = conditionLabels[alert.condition_type] || alert.condition_type;
        const emoji = payload.is_paused ? "⏸️" : "▶️";
        const statusText = payload.is_paused ? "Paused" : "Resumed";

        message = `${emoji} *Alert ${statusText}*\n\n` +
          `Symbol: *${alert.symbol}*\n` +
          `Condition: ${conditionLabel} ₹${alert.threshold?.toLocaleString() || "N/A"}`;
        break;
      }

      case "alert_deleted": {
        // For deleted alerts, we use the passed data directly since the alert no longer exists
        const conditionLabel = conditionLabels[payload.condition_type] || payload.condition_type;

        message = `🗑️ *Alert Deleted*\n\n` +
          `Symbol: *${payload.symbol}*\n` +
          `Condition: ${conditionLabel} ₹${payload.threshold?.toLocaleString() || "N/A"}`;
        break;
      }

      case "trade_event_added": {
        const { data: trade, error } = await supabase
          .from("trades")
          .select(
            `
            *,
            user_settings:user_id (telegram_chat_id)
          `
          )
          .eq("id", payload.trade_id)
          .single();

        if (error || !trade) {
          throw new Error(`Trade not found: ${payload.trade_id}`);
        }

        if (trade.user_settings?.telegram_chat_id) {
          chatId = trade.user_settings.telegram_chat_id;
        }

        const eventLabel = eventTypeLabels[payload.event_type] || payload.event_type.replace(/_/g, " ");

        message = `📝 *Trade Event Added*\n\n` +
          `Symbol: *${trade.symbol}*\n` +
          `Event: ${eventLabel}\n` +
          `Price: ₹${payload.price.toLocaleString()}` +
          (payload.notes ? `\nNotes: ${payload.notes}` : "");
        break;
      }

      case "weekly_report": {
        const { data: report, error } = await supabase
          .from("weekly_reports")
          .select(
            `
            *,
            user_settings:user_id (telegram_chat_id)
          `
          )
          .eq("id", payload.report_id)
          .single();

        if (error || !report) {
          throw new Error(`Report not found: ${payload.report_id}`);
        }

        if (report.user_settings?.telegram_chat_id) {
          chatId = report.user_settings.telegram_chat_id;
        }

        const totalPnl = report.total_pnl || 0;
        const pnlEmoji = totalPnl >= 0 ? "📈" : "📉";
        const pnlStr = totalPnl >= 0
            ? `+₹${totalPnl.toFixed(2)}`
            : `-₹${Math.abs(totalPnl).toFixed(2)}`;

        const topSetups = report.top_setups || [];
        const topSetupsStr =
          topSetups.length > 0
            ? topSetups
                .slice(0, 3)
                .map((s: { pattern: string; pnl: number }) => `• ${s.pattern}: ₹${s.pnl}`)
                .join("\n")
            : "None";

        const mistakes = report.common_mistakes || [];
        const mistakesStr =
          mistakes.length > 0
            ? mistakes
                .slice(0, 3)
                .map((m: { mistake: string; count: number }) => `• ${m.mistake} (${m.count}x)`)
                .join("\n")
            : "None";

        message = `📊 *Weekly Report – ${report.segment.replace("_", " ")}*\n` +
          `Week: ${report.week_start} to ${report.week_end}\n\n` +
          `📈 *Performance*\n` +
          `• Total Trades: ${report.total_trades || 0}\n` +
          `• Win Rate: ${(report.win_rate || 0).toFixed(1)}%\n` +
          `• Net P&L: ${pnlStr}\n\n` +
          `🎯 *Top Setups*\n${topSetupsStr}\n\n` +
          `⚠️ *Common Mistakes*\n${mistakesStr}\n\n` +
          `${pnlEmoji} Best Trade: ₹${report.best_trade_pnl || 0}\n` +
          `${(report.worst_trade_pnl || 0) < 0 ? "📉" : ""} Worst Trade: ₹${report.worst_trade_pnl || 0}`;
        break;
      }

      case "custom": {
        message = payload.message;
        if (payload.chat_id) {
          chatId = payload.chat_id;
        }
        break;
      }

      case "test": {
        message = payload.message || `🔔 *Test Notification*\n\nYour Telegram integration is working correctly!\n\n✅ TradeSync is connected.`;
        break;
      }

      default:
        throw new Error(`Unknown notification type`);
    }

    if (!chatId) {
      throw new Error("No Telegram chat ID configured");
    }

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok) {
      throw new Error(
        `Telegram API error: ${JSON.stringify(telegramResult)}`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: telegramResult.result?.message_id,
        chat_id: chatId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Telegram notification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
