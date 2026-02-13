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

const APP = "TradeBook";

const timeframeLabels: Record<string, string> = {
  "1min": "1 Min", "5min": "5 Min", "15min": "15 Min", "30min": "30 Min",
  "1H": "1 Hour", "4H": "4 Hour", "1D": "Daily", "1W": "Weekly",
};

const conditionLabels: Record<string, string> = {
  PRICE_GT: "Price Above", PRICE_LT: "Price Below",
  PRICE_CROSS_ABOVE: "Cross Above", PRICE_CROSS_BELOW: "Cross Below",
  PERCENT_CHANGE_GT: "Day % Above", PERCENT_CHANGE_LT: "Day % Below",
  VOLUME_SPIKE: "Volume Spike", CUSTOM: "Custom",
};

const conditionEmojis: Record<string, string> = {
  PRICE_GT: "📈", PRICE_LT: "📉",
  PRICE_CROSS_ABOVE: "⚡", PRICE_CROSS_BELOW: "⚡",
  PERCENT_CHANGE_GT: "📊", PERCENT_CHANGE_LT: "📊",
  VOLUME_SPIKE: "🔊", CUSTOM: "🚨",
};

const conditionHeaders: Record<string, string> = {
  PRICE_GT: "PRICE ABOVE HIT",
  PRICE_LT: "PRICE BELOW HIT",
  PRICE_CROSS_ABOVE: "CROSS ABOVE CONFIRMED",
  PRICE_CROSS_BELOW: "CROSS BELOW CONFIRMED",
  PERCENT_CHANGE_GT: "DAY % CHANGE ABOVE",
  PERCENT_CHANGE_LT: "DAY % CHANGE BELOW",
  VOLUME_SPIKE: "VOLUME SPIKE",
  CUSTOM: "CUSTOM ALERT",
};

const eventTypeLabels: Record<string, string> = {
  ENTRY: "Entry", SL_HIT: "Stop Loss Hit",
  TARGET1_HIT: "Target 1 Hit", TARGET2_HIT: "Target 2 Hit", TARGET3_HIT: "Target 3 Hit",
  PARTIAL_EXIT: "Partial Exit", SL_MODIFIED: "SL Modified",
  TARGET_MODIFIED: "Target Modified", CLOSED: "Closed",
  TSL_UPDATED: "TSL Updated", TSL_HIT: "TSL Hit",
};

const segmentLabels: Record<string, string> = {
  Equity_Intraday: "Equity Cash",
  Equity_Positional: "Equity Cash",
  Futures: "Futures",
  Options: "Options",
  Commodities: "Commodity",
};

const segmentTag: Record<string, string> = {
  Equity_Intraday: "NSE·EQ",
  Equity_Positional: "NSE·EQ",
  Futures: "NSE·F&O",
  Options: "NSE·F&O",
  Commodities: "MCX",
};

function getExchangeTag(exchange: string | null): string {
  switch (exchange) {
    case "NSE": return "NSE·EQ";
    case "BSE": return "BSE·EQ";
    case "NFO": return "NSE·F&O";
    case "MCX": return "MCX";
    default: return exchange || "NSE·EQ";
  }
}

// Safe number formatting
function fmt(val: number | null | undefined, fallback = "—"): string {
  if (val === null || val === undefined || Number.isNaN(val)) return fallback;
  return `₹${val.toLocaleString("en-IN")}`;
}

function fmtPct(val: number | null | undefined, fallback = "—"): string {
  if (val === null || val === undefined || Number.isNaN(val)) return fallback;
  const sign = val >= 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}

function fmtNum(val: number | null | undefined, fallback = "—"): string {
  if (val === null || val === undefined || Number.isNaN(val)) return fallback;
  return val.toLocaleString("en-IN");
}

function istTimestamp(): string {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short",
  });
}

const modeLabels: Record<string, string> = {
  ONCE: "One-time", DAILY: "Repeating (Daily)", CONTINUOUS: "Repeating",
};

// Get user settings including RA mode
async function getUserSettings(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_settings")
    .select("telegram_chat_id, ra_public_mode, ra_disclaimer")
    .eq("user_id", userId)
    .maybeSingle();
  return data || { telegram_chat_id: null, ra_public_mode: false, ra_disclaimer: null };
}

async function sendTelegramPhoto(
  token: string, chatId: string, photoUrl: string, caption: string
): Promise<{ success: boolean; messageId?: number }> {
  try {
    const truncatedCaption = caption.length > 1024 ? caption.substring(0, 1021) + "..." : caption;
    const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId, photo: photoUrl,
        caption: truncatedCaption, parse_mode: "Markdown",
      }),
    });
    const result = await response.json();
    if (!response.ok) { console.error("Telegram sendPhoto error:", result); return { success: false }; }
    return { success: true, messageId: result.result?.message_id };
  } catch (e) {
    console.error("Failed to send Telegram photo:", e);
    return { success: false };
  }
}

async function sendTelegramMessage(
  token: string, chatId: string, message: string
): Promise<{ success: boolean; messageId?: number }> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId, text: message,
        parse_mode: "Markdown", disable_web_page_preview: true,
      }),
    });
    const result = await response.json();
    if (!response.ok) { console.error("Telegram sendMessage error:", result); return { success: false }; }
    return { success: true, messageId: result.result?.message_id };
  } catch (e) {
    console.error("Failed to send Telegram message:", e);
    return { success: false };
  }
}

function getFirstChartImage(trade: any): string | null {
  if (!trade.chart_images || !Array.isArray(trade.chart_images)) return null;
  const firstImage = trade.chart_images[0];
  if (typeof firstImage === 'string') return firstImage;
  if (typeof firstImage === 'object' && firstImage?.url) return firstImage.url;
  return null;
}

// ════════════════════════════════════════
//  ALERT TRIGGERED TEMPLATES
// ════════════════════════════════════════

function buildAlertTriggeredMessage(alert: any, ltp: number): string {
  const ct = alert.condition_type || "CUSTOM";
  const emoji = conditionEmojis[ct] || "🚨";
  const header = conditionHeaders[ct] || "ALERT TRIGGERED";
  const tag = getExchangeTag(alert.exchange);
  const time = istTimestamp();
  const mode = modeLabels[alert.recurrence || "ONCE"] || alert.recurrence;
  const isCross = ct.startsWith("PRICE_CROSS");
  const isPct = ct.includes("PERCENT_CHANGE");
  const isVol = ct === "VOLUME_SPIKE";

  let triggerText = "";
  if (isPct) {
    triggerText = `Day % ${ct.includes("GT") ? "above" : "below"} ${alert.threshold}%`;
  } else if (isVol) {
    triggerText = `Spike Triggered ✅`;
  } else if (isCross) {
    triggerText = `Crossed: ${fmt(alert.threshold)}`;
  } else {
    triggerText = `Level: ${ct.includes("GT") ? "Above" : "Below"} ${fmt(alert.threshold)}`;
  }

  let msg = `${emoji} *${header}*\n`;
  msg += `*${alert.symbol}* (${tag})\n\n`;
  msg += `${triggerText}\n`;

  if (isPct) {
    msg += `Now: ${fmtPct(ltp ? ((ltp - (alert.threshold || 0)) / (alert.threshold || 1)) * 100 : null)} | LTP: ${fmt(ltp)}\n`;
  } else {
    msg += `Now: LTP ${fmt(ltp)}\n`;
  }

  msg += `Mode: ${mode}\n`;
  if (alert.notes) msg += `Reason: ${alert.notes}\n`;
  msg += `\n⏱ ${time}`;

  return msg;
}

// ════════════════════════════════════════
//  ALERT LIFECYCLE TEMPLATES
// ════════════════════════════════════════

function buildAlertCreatedMessage(alert: any): string {
  const tag = getExchangeTag(alert.exchange);
  const condLabel = conditionLabels[alert.condition_type] || alert.condition_type;
  const mode = modeLabels[alert.recurrence || "ONCE"] || alert.recurrence;
  const isPct = alert.condition_type?.includes("PERCENT_CHANGE");
  const triggerText = isPct ? `${alert.threshold}%` : fmt(alert.threshold);

  const inApp = alert.delivery_in_app !== false ? "✅" : "❌";
  const tg = alert.telegram_enabled ? "✅" : "❌";
  const wh = alert.webhook_enabled ? "✅" : "❌";

  let msg = `✅ *ALERT CREATED* | ${APP}\n`;
  msg += `*${alert.symbol}* (${tag})\n\n`;
  msg += `Condition: ${condLabel}\n`;
  msg += `Trigger: ${triggerText}\n`;
  msg += `Mode: ${mode}\n`;
  msg += `Delivery: In-App ${inApp} | Telegram ${tg} | Webhook ${wh}\n`;
  if (alert.notes) msg += `Reason: ${alert.notes}\n`;

  return msg;
}

function buildAlertPausedMessage(alert: any, isPaused: boolean): string {
  const tag = getExchangeTag(alert.exchange);
  const condLabel = conditionLabels[alert.condition_type] || alert.condition_type;
  const isPct = alert.condition_type?.includes("PERCENT_CHANGE");
  const triggerText = isPct ? `${alert.threshold}%` : fmt(alert.threshold);

  if (isPaused) {
    return `⏸ *ALERT PAUSED:* ${alert.symbol} (${tag}) | ${condLabel} ${triggerText}`;
  }
  return `▶️ *ALERT RESUMED:* ${alert.symbol} (${tag}) | ${condLabel} ${triggerText}`;
}

function buildAlertDeletedMessage(symbol: string, conditionType: string, threshold: number | null): string {
  const condLabel = conditionLabels[conditionType] || conditionType;
  const isPct = conditionType?.includes("PERCENT_CHANGE");
  const triggerText = isPct ? `${threshold}%` : fmt(threshold);
  return `🗑️ *Alert Deleted:* ${symbol} | ${condLabel} ${triggerText}`;
}

// ════════════════════════════════════════
//  TRADE TEMPLATES
// ════════════════════════════════════════

function buildNewTradeMessage(trade: any, isRaMode: boolean, disclaimer: string | null): string {
  const segment = trade.segment || "Equity_Intraday";
  const label = segmentLabels[segment] || segment;
  const tag = segmentTag[segment] || "NSE";
  const side = trade.trade_type || "BUY";
  const symbol = trade.symbol || "—";

  const targets = trade.targets || [];
  const targetsStr = targets.length > 0
    ? targets.map((t: number, i: number) => `T${i + 1}: ${fmt(t)}`).join(" / ")
    : "—";

  const holdType = trade.holding_period || (segment === "Equity_Intraday" ? "Intraday" : "Positional");
  const tf = trade.timeframe ? (timeframeLabels[trade.timeframe] || trade.timeframe) : "";

  const slLine = trade.stop_loss ? `SL: ${fmt(trade.stop_loss)}` : "SL: —";
  const entryLine = trade.entry_price ? `Entry: ${fmt(trade.entry_price)}` : "Entry: At LTP";

  let tslLine = "";
  if (trade.trailing_sl_enabled) {
    const tslVal = trade.trailing_sl_percent
      ? `${trade.trailing_sl_percent}%`
      : trade.trailing_sl_points ? `${trade.trailing_sl_points} pts` : "ON";
    tslLine = `\n🔄 TSL: ${tslVal}`;
  }

  let headerEmoji = "🔔";
  let typeLabel = label;
  let riskNote = "";

  if (segment === "Options") {
    typeLabel = side === "SELL" ? "Options Sell" : "Options Buy";
    riskNote = side === "SELL"
      ? "\n⚠️ _Option selling needs defined risk. Prefer hedge._"
      : "\n⚠️ _Options are high risk. Use strict SL._";
  } else if (segment === "Commodities") {
    typeLabel = "Commodity";
  }

  let msg = `${headerEmoji} *NEW TRADE (${typeLabel})* | ${tag}\n`;
  msg += `*${side} ${symbol}* (${tag})\n\n`;
  msg += `${entryLine}\n`;
  msg += `${slLine}`;
  if (trade.stop_loss && trade.entry_price) {
    const slPct = ((trade.entry_price - trade.stop_loss) / trade.entry_price * 100 * (side === "BUY" ? 1 : -1));
    if (!Number.isNaN(slPct)) msg += ` (${Math.abs(slPct).toFixed(1)}%)`;
  }
  msg += "\n";

  if (!isRaMode && trade.quantity && trade.quantity > 1) {
    msg += `Qty: ${fmtNum(trade.quantity)}\n`;
  }

  msg += `Targets: ${targetsStr}\n`;
  msg += `Hold: ${holdType}`;
  if (tf) msg += ` | TF: ${tf}`;
  msg += "\n";

  if (trade.notes) msg += `\n📝 ${trade.notes}\n`;
  msg += tslLine;
  msg += riskNote;

  msg += `\n\n⏱ ${istTimestamp()}`;

  if (isRaMode) {
    msg += "\n\n⚠️ _Position sizing as per your risk plan. Quantity not shared publicly._";
    if (disclaimer) msg += `\n\n🧾 _${disclaimer}_`;
  }

  return msg;
}

function buildTradeClosedMessage(trade: any, isRaMode: boolean, disclaimer: string | null): string {
  const segment = trade.segment || "Equity_Intraday";
  const tag = segmentTag[segment] || "NSE";
  const side = trade.trade_type || "BUY";
  const symbol = trade.symbol || "—";

  const pnl = trade.pnl || 0;
  const emoji = pnl >= 0 ? "✅" : "❌";
  const outcome = pnl > 0 ? "WIN" : pnl < 0 ? "LOSS" : "BREAKEVEN";

  const reasonLabels: Record<string, string> = {
    SL_HIT: "Stop Loss", TSL_HIT: "Trailing SL",
    TARGET1_HIT: "Target 1", TARGET2_HIT: "Target 2", TARGET3_HIT: "Target 3",
    MANUAL: "Manual",
  };
  const reasonLabel = reasonLabels[trade.closure_reason || ""] || trade.closure_reason || "Manual";

  let msg = `📒 *TRADE CLOSED* ${emoji}\n`;
  msg += `Instrument: *${symbol}* | ${tag}\n`;
  msg += `Side: ${side}\n\n`;

  if (!isRaMode && trade.quantity && trade.quantity > 1) {
    msg += `Qty: ${fmtNum(trade.quantity)}\n`;
  }

  msg += `Entry: ${fmt(trade.entry_price)}\n`;
  msg += `Exit: ${fmt(trade.current_price)}\n`;

  if (!isRaMode) {
    msg += `P&L: ${fmt(pnl)} (${fmtPct(trade.pnl_percent)})\n`;
  }

  msg += `Outcome: *${outcome}*\n`;
  msg += `Reason: ${reasonLabel}\n`;
  msg += `\n⏱ ${istTimestamp()}`;

  if (trade.notes) msg += `\n\n📝 ${trade.notes}`;

  if (isRaMode && disclaimer) {
    msg += `\n\n🧾 _${disclaimer}_`;
  }

  return msg;
}

function buildTradeUpdateMessage(trade: any, latestEvent: any, isRaMode: boolean): string {
  const symbol = trade.symbol || "—";
  const eventType = latestEvent?.event_type || "UPDATE";

  if (eventType.includes("TARGET") && eventType !== "TARGET_MODIFIED") {
    const targetNum = eventType.replace("TARGET", "T").replace("_HIT", "");
    let msg = `🎯 *TARGET HIT: ${symbol}*\n`;
    msg += `Target Achieved: ${targetNum} ✅\n\n`;
    msg += `LTP: ${fmt(trade.current_price)}\n`;
    if (!isRaMode) msg += `P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})\n`;
    msg += `\nAction: Partial booking suggested`;
    if (trade.trailing_sl_current) msg += ` + SL trail to ${fmt(trade.trailing_sl_current)}`;
    msg += `\n\n⏱ ${istTimestamp()}`;
    return msg;
  }

  if (eventType === "SL_HIT") {
    let msg = `🛑 *SL HIT: ${symbol}*\n`;
    msg += `SL: ${fmt(trade.stop_loss)} Triggered ✅\n`;
    msg += `Exit done as per plan.\n`;
    if (!isRaMode) msg += `\nP&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})`;
    if (latestEvent?.notes) msg += `\n\n📝 ${latestEvent.notes}`;
    msg += `\n\n⏱ ${istTimestamp()}\nNext: wait for fresh setup.`;
    return msg;
  }

  if (eventType === "TSL_UPDATED") {
    let msg = `🧲 *TSL UPDATE: ${symbol}*\n`;
    msg += `New TSL: ${fmt(trade.trailing_sl_current)}\n`;
    if (trade.trailing_sl_active) msg += `Status: Active ✅`;
    if (latestEvent?.notes) msg += `\n\n📝 ${latestEvent.notes}`;
    msg += `\n\n⏱ ${istTimestamp()}`;
    return msg;
  }

  if (eventType === "TSL_HIT") {
    let msg = `🔄 *TSL HIT: ${symbol}*\n`;
    msg += `Trailing SL triggered at ${fmt(latestEvent?.price)}\n`;
    if (!isRaMode) msg += `P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})`;
    msg += `\n\n⏱ ${istTimestamp()}`;
    return msg;
  }

  if (eventType === "SL_MODIFIED") {
    let msg = `✏️ *SL MODIFIED: ${symbol}*\n`;
    msg += `New SL: ${fmt(latestEvent?.price)}\n`;
    msg += `LTP: ${fmt(trade.current_price)}`;
    if (latestEvent?.notes) msg += `\nReason: ${latestEvent.notes}`;
    msg += `\n\n⏱ ${istTimestamp()}`;
    return msg;
  }

  // Generic update
  let emoji = "📊";
  if (eventType === "PARTIAL_EXIT") emoji = "🎯";
  let msg = `${emoji} *Trade Update*\n\n`;
  msg += `*${symbol}* — ${eventType.replace(/_/g, " ")}\n`;
  msg += `LTP: ${fmt(trade.current_price)}\n`;
  if (!isRaMode) msg += `P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})\n`;
  msg += `SL: ${fmt(trade.stop_loss)}`;
  if (trade.trailing_sl_active && trade.trailing_sl_current) {
    msg += `\nTSL: ${fmt(trade.trailing_sl_current)} (active)`;
  }
  if (latestEvent?.notes) msg += `\n\n📝 ${latestEvent.notes}`;
  msg += `\n\n⏱ ${istTimestamp()}`;

  return msg;
}

function buildSLModifiedMessage(trade: any, oldSL: number, newSL: number): string {
  let msg = `🧲 *TSL UPDATE: ${trade.symbol}*\n`;
  msg += `Old SL: ${fmt(oldSL)} → New SL: ${fmt(newSL)}\n`;
  msg += `Current P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})`;
  msg += `\n\n⏱ ${istTimestamp()}`;
  return msg;
}

function buildTradeEventMessage(trade: any, eventType: string, price: number, notes?: string): string {
  const eventLabel = eventTypeLabels[eventType] || eventType.replace(/_/g, " ");
  const tag = segmentTag[trade.segment] || "NSE";
  let msg = `📝 *TRADE EVENT* | ${APP}\n`;
  msg += `Instrument: *${trade.symbol}* (${tag})\n\n`;
  msg += `Event: ${eventLabel}\n`;
  msg += `Price: ${fmt(price)}\n`;
  msg += `LTP: ${fmt(trade.current_price)}\n`;
  if (notes) msg += `Notes: ${notes}\n`;
  msg += `\n⏱ ${istTimestamp()}`;
  return msg;
}

// ════════════════════════════════════════
//  MAIN HANDLER
// ════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const DEFAULT_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload: NotificationPayload = await req.json();

    let message = "";
    let chatId = DEFAULT_CHAT_ID;
    let imageUrl: string | null = null;

    switch (payload.type) {
      case "new_trade": {
        const { data: trade, error } = await supabase
          .from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });

        const settings = await getUserSettings(supabase, trade.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;
        imageUrl = getFirstChartImage(trade);
        message = buildNewTradeMessage(trade, settings.ra_public_mode, settings.ra_disclaimer);
        break;
      }

      case "trade_update": {
        const { data: trade, error } = await supabase
          .from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });

        const settings = await getUserSettings(supabase, trade.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;
        imageUrl = getFirstChartImage(trade);

        const { data: events } = await supabase
          .from("trade_events").select("*")
          .eq("trade_id", trade.id)
          .order("timestamp", { ascending: false })
          .limit(1);
        message = buildTradeUpdateMessage(trade, events?.[0], settings.ra_public_mode);
        break;
      }

      case "trade_closed": {
        const { data: trade, error } = await supabase
          .from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });

        const settings = await getUserSettings(supabase, trade.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;
        imageUrl = getFirstChartImage(trade);
        message = buildTradeClosedMessage(trade, settings.ra_public_mode, settings.ra_disclaimer);
        break;
      }

      case "trade_sl_modified": {
        const { data: trade, error } = await supabase
          .from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });

        const settings = await getUserSettings(supabase, trade.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;
        message = buildSLModifiedMessage(trade, payload.old_sl, payload.new_sl);
        break;
      }

      case "alert_triggered": {
        const { data: alert, error } = await supabase
          .from("alerts").select("*").eq("id", payload.alert_id).maybeSingle();
        if (error) throw error;
        if (!alert) return jsonOk({ success: true, skipped: true, reason: "Alert not found" });
        if (!(alert as any).telegram_enabled) return jsonOk({ success: true, skipped: true, reason: "Telegram disabled" });

        const settings = await getUserSettings(supabase, alert.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;
        message = buildAlertTriggeredMessage(alert, payload.current_price);
        break;
      }

      case "alert_created": {
        const { data: alert, error } = await supabase
          .from("alerts").select("*").eq("id", payload.alert_id).maybeSingle();
        if (error) throw error;
        if (!alert) return jsonOk({ success: true, skipped: true, reason: "Alert not found" });
        if (!(alert as any).telegram_enabled) return jsonOk({ success: true, skipped: true, reason: "Telegram disabled" });

        const settings = await getUserSettings(supabase, alert.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;
        message = buildAlertCreatedMessage(alert);
        break;
      }

      case "alert_paused": {
        const { data: alert, error } = await supabase
          .from("alerts").select("*").eq("id", payload.alert_id).maybeSingle();
        if (error) throw error;
        if (!alert) return jsonOk({ success: true, skipped: true, reason: "Alert not found" });

        const settings = await getUserSettings(supabase, alert.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;
        message = buildAlertPausedMessage(alert, payload.is_paused);
        break;
      }

      case "alert_deleted": {
        message = buildAlertDeletedMessage(payload.symbol, payload.condition_type, payload.threshold);
        break;
      }

      case "trade_event_added": {
        const { data: trade, error } = await supabase
          .from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });

        const settings = await getUserSettings(supabase, trade.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;
        message = buildTradeEventMessage(trade, payload.event_type, payload.price, payload.notes);
        break;
      }

      case "weekly_report": {
        const { data: report, error } = await supabase
          .from("weekly_reports").select("*").eq("id", payload.report_id).maybeSingle();
        if (error) throw error;
        if (!report) return jsonOk({ success: true, skipped: true, reason: "Report not found" });

        const settings = await getUserSettings(supabase, report.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;

        const totalPnl = report.total_pnl || 0;
        const pnlEmoji = totalPnl >= 0 ? "📈" : "📉";

        const topSetups = report.top_setups || [];
        const topSetupsStr = topSetups.length > 0
          ? topSetups.slice(0, 3).map((s: any) => `• ${s.pattern}: ${fmt(s.pnl)}`).join("\n")
          : "None";

        const mistakes = report.common_mistakes || [];
        const mistakesStr = mistakes.length > 0
          ? mistakes.slice(0, 3).map((m: any) => `• ${m.mistake} (${m.count}x)`).join("\n")
          : "None";

        message = `📊 *Weekly Report – ${report.segment.replace("_", " ")}* | ${APP}\n` +
          `Week: ${report.week_start} to ${report.week_end}\n\n` +
          `📈 *Performance*\n` +
          `• Total Trades: ${fmtNum(report.total_trades)}\n` +
          `• Win Rate: ${fmtPct(report.win_rate)}\n` +
          `• Net P&L: ${fmt(totalPnl)}\n\n` +
          `🎯 *Top Setups*\n${topSetupsStr}\n\n` +
          `⚠️ *Common Mistakes*\n${mistakesStr}\n\n` +
          `${pnlEmoji} Best Trade: ${fmt(report.best_trade_pnl)}\n` +
          `Worst Trade: ${fmt(report.worst_trade_pnl)}\n\n` +
          `⏱ ${istTimestamp()}`;
        break;
      }

      case "custom": {
        message = payload.message;
        if (payload.chat_id) chatId = payload.chat_id;
        break;
      }

      case "test": {
        message = payload.message || `🔔 *Test Notification* | ${APP}\n\nYour Telegram integration is working correctly!\n\n✅ ${APP} is connected.\n⏱ ${istTimestamp()}`;
        break;
      }

      default:
        throw new Error(`Unknown notification type`);
    }

    if (!chatId) throw new Error("No Telegram chat ID configured");

    let result: { success: boolean; messageId?: number };
    if (imageUrl) {
      result = await sendTelegramPhoto(TELEGRAM_BOT_TOKEN, chatId, imageUrl, message);
      if (!result.success) {
        console.log("Photo send failed, falling back to text message");
        result = await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, message);
      }
    } else {
      result = await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, message);
    }

    if (!result.success) throw new Error("Failed to send Telegram notification");

    return new Response(
      JSON.stringify({ success: true, message_id: result.messageId, chat_id: chatId, with_image: !!imageUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Telegram notification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function jsonOk(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
