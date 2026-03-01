import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

interface StudyCreatedNotification {
  type: "study_created";
  study_id: string;
}

interface StudyUpdatedNotification {
  type: "study_updated";
  study_id: string;
  old_status?: string;
}

interface StudyTriggeredNotification {
  type: "study_triggered";
  study_id: string;
}

interface CustomNotification {
  type: "custom";
  message: string;
  chat_id?: string;
  bot_token?: string;
}

interface TestNotification {
  type: "test";
  message?: string;
}

interface ManualTradeSnapshotNotification {
  type: "manual_trade_snapshot";
  trade_id: string;
}

interface ManualPnlSnapshotNotification {
  type: "manual_pnl_snapshot";
  trade_id: string;
}

interface ManualCustomNoteNotification {
  type: "manual_custom_note";
  trade_id: string;
  custom_message: string;
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
  | StudyCreatedNotification
  | StudyUpdatedNotification
  | StudyTriggeredNotification
  | CustomNotification
  | TestNotification
  | ManualTradeSnapshotNotification
  | ManualPnlSnapshotNotification
  | ManualCustomNoteNotification;

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

async function getUserSettings(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_settings")
    .select("telegram_chat_id, ra_public_mode, ra_disclaimer")
    .eq("user_id", userId)
    .maybeSingle();
  return data || { telegram_chat_id: null, ra_public_mode: false, ra_disclaimer: null };
}

// Get all telegram_chats for a user, filtered by notification type and segment
async function getUserTelegramChats(
  supabase: any,
  userId: string,
  notificationType: string, // 'trade', 'alert', 'study', 'report', 'test'
  segment?: string | null
): Promise<Array<{ chat_id: string; bot_token: string | null }>> {
  const { data } = await supabase
    .from("telegram_chats")
    .select("chat_id, bot_token, segments, notification_types, enabled")
    .eq("user_id", userId)
    .eq("enabled", true);

  if (!data || data.length === 0) return [];

  // Filter chats based on notification_types routing
  const filteredChats = data.filter((chat: any) => {
    // If notification_types exists, use new routing logic
    if (chat.notification_types && Object.keys(chat.notification_types).length > 0) {
      const typeSegments = chat.notification_types[notificationType];

      // If notification type not configured, skip this chat
      if (!typeSegments || typeSegments.length === 0) return false;

      // If wildcard "*", allow all
      if (typeSegments.includes("*")) return true;

      // For alerts/studies/reports (no segment), include if any segments configured
      if (!segment) return typeSegments.length > 0;

      // For trades (with segment), check if segment is included
      return typeSegments.includes(segment);
    }

    // Fallback to old segments array (for backward compatibility)
    if (notificationType === "trade" && segment) {
      return chat.segments && chat.segments.includes(segment);
    }

    // For non-trade types, include if segments array has any items
    return chat.segments && chat.segments.length > 0;
  });

  return filteredChats.map((c: any) => ({
    chat_id: c.chat_id,
    bot_token: c.bot_token
  }));
}

interface TelegramResult {
  success: boolean;
  messageId?: number;
  error?: string;
  errorCode?: number;
  errorDescription?: string;
  retryable?: boolean;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendTelegramPhoto(
  token: string, chatId: string, photoUrl: string, caption: string
): Promise<TelegramResult> {
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

    if (!response.ok) {
      const errorCode = result.error_code || response.status;
      const errorDescription = result.description || "Unknown error";
      console.error("Telegram sendPhoto error:", { errorCode, errorDescription, chatId });

      // Determine if error is retryable
      const retryable = errorCode === 429 || errorCode >= 500;

      return {
        success: false,
        error: errorDescription,
        errorCode,
        errorDescription,
        retryable,
      };
    }
    return { success: true, messageId: result.result?.message_id };
  } catch (e) {
    console.error("Failed to send Telegram photo:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error",
      retryable: true, // Network errors are retryable
    };
  }
}

async function sendTelegramMessage(
  token: string, chatId: string, message: string
): Promise<TelegramResult> {
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

    if (!response.ok) {
      const errorCode = result.error_code || response.status;
      const errorDescription = result.description || "Unknown error";
      console.error("Telegram sendMessage error:", { errorCode, errorDescription, chatId });

      // Determine if error is retryable
      const retryable = errorCode === 429 || errorCode >= 500;

      return {
        success: false,
        error: errorDescription,
        errorCode,
        errorDescription,
        retryable,
      };
    }
    return { success: true, messageId: result.result?.message_id };
  } catch (e) {
    console.error("Failed to send Telegram message:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error",
      retryable: true, // Network errors are retryable
    };
  }
}

// Retry with exponential backoff
async function sendWithRetry(
  token: string,
  chatId: string,
  message: string,
  imageUrl: string | null,
  maxRetries = 3
): Promise<TelegramResult> {
  let lastResult: TelegramResult = { success: false, error: "No attempts made" };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Try sending with image first, fallback to text-only
    if (imageUrl) {
      lastResult = await sendTelegramPhoto(token, chatId, imageUrl, message);
      if (!lastResult.success) {
        console.log(`Photo send failed for ${chatId}, trying text-only...`);
        lastResult = await sendTelegramMessage(token, chatId, message);
      }
    } else {
      lastResult = await sendTelegramMessage(token, chatId, message);
    }

    // Success - return immediately
    if (lastResult.success) {
      return lastResult;
    }

    // Don't retry if error is not retryable (e.g., invalid chat_id, bot blocked)
    if (!lastResult.retryable) {
      console.error(`Non-retryable error for ${chatId}: ${lastResult.error}`);
      return lastResult;
    }

    // Wait before retry (exponential backoff: 1s, 2s, 4s)
    if (attempt < maxRetries) {
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      console.log(`Retry ${attempt}/${maxRetries} for ${chatId} after ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }

  return lastResult;
}

// Log delivery attempt to database
async function logDeliveryAttempt(
  supabase: any,
  userId: string,
  chatId: string,
  notificationType: string,
  segment: string | null,
  result: TelegramResult,
  attemptNumber: number
): Promise<void> {
  try {
    await supabase.from("telegram_delivery_log").insert({
      user_id: userId,
      chat_id: chatId,
      notification_type: notificationType,
      segment: segment,
      success: result.success,
      error_message: result.error || null,
      response_data: result.errorCode
        ? { error_code: result.errorCode, description: result.errorDescription }
        : result.messageId
        ? { message_id: result.messageId }
        : null,
      attempt_number: attemptNumber,
    });
  } catch (e) {
    // Don't fail the main flow if logging fails
    console.error("Failed to log delivery attempt:", e);
  }
}

// Send to multiple chats with retry and logging
interface ChatDeliveryResult {
  chat_id: string;
  success: boolean;
  error?: string;
  message_id?: number;
}

async function sendToMultipleChats(
  supabase: any,
  defaultToken: string,
  chats: Array<{ chat_id: string; bot_token: string | null }>,
  message: string,
  imageUrl: string | null,
  userId: string | null,
  notificationType: string,
  segment: string | null
): Promise<{
  successCount: number;
  failCount: number;
  results: ChatDeliveryResult[];
}> {
  let successCount = 0;
  let failCount = 0;
  const results: ChatDeliveryResult[] = [];

  for (const chat of chats) {
    const token = chat.bot_token || defaultToken;
    const result = await sendWithRetry(token, chat.chat_id, message, imageUrl, 3);

    // Log to database if we have userId
    if (userId) {
      await logDeliveryAttempt(
        supabase,
        userId,
        chat.chat_id,
        notificationType,
        segment,
        result,
        1 // We track retries internally, but log as single attempt
      );
    }

    if (result.success) {
      successCount++;
      results.push({
        chat_id: chat.chat_id,
        success: true,
        message_id: result.messageId,
      });
    } else {
      failCount++;
      results.push({
        chat_id: chat.chat_id,
        success: false,
        error: result.error || "Unknown error",
      });
    }
  }

  return { successCount, failCount, results };
}

function getFirstChartImage(trade: any): string | null {
  if (!trade.chart_images || !Array.isArray(trade.chart_images)) return null;
  const firstImage = trade.chart_images[0];
  if (typeof firstImage === 'string') return firstImage;
  if (typeof firstImage === 'object' && firstImage?.url) return firstImage.url;
  return null;
}

// ════════════════════════════════════════
//  MESSAGE TEMPLATES (unchanged)
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
  if (isPct) triggerText = `Day % ${ct.includes("GT") ? "above" : "below"} ${alert.threshold}%`;
  else if (isVol) triggerText = `Spike Triggered ✅`;
  else if (isCross) triggerText = `Crossed: ${fmt(alert.threshold)}`;
  else triggerText = `Level: ${ct.includes("GT") ? "Above" : "Below"} ${fmt(alert.threshold)}`;

  let msg = `${emoji} *${header}*\n*${alert.symbol}* (${tag})\n\n${triggerText}\n`;
  if (isPct) msg += `Now: ${fmtPct(ltp ? ((ltp - (alert.threshold || 0)) / (alert.threshold || 1)) * 100 : null)} | LTP: ${fmt(ltp)}\n`;
  else msg += `Now: LTP ${fmt(ltp)}\n`;
  msg += `Mode: ${mode}\n`;
  if (alert.notes) msg += `Reason: ${alert.notes}\n`;
  if (alert.chart_link) msg += `📊 [Chart](${alert.chart_link})\n`;
  msg += `\n⏱ ${time}`;
  return msg;
}

function buildAlertCreatedMessage(alert: any): string {
  const tag = getExchangeTag(alert.exchange);
  const condLabel = conditionLabels[alert.condition_type] || alert.condition_type;
  const mode = modeLabels[alert.recurrence || "ONCE"] || alert.recurrence;
  const isPct = alert.condition_type?.includes("PERCENT_CHANGE");
  const triggerText = isPct ? `${alert.threshold}%` : fmt(alert.threshold);
  const inApp = alert.delivery_in_app !== false ? "✅" : "❌";
  const tg = alert.telegram_enabled ? "✅" : "❌";
  const wh = alert.webhook_enabled ? "✅" : "❌";

  let msg = `✅ *ALERT CREATED* | ${APP}\n*${alert.symbol}* (${tag})\n\n`;
  msg += `Condition: ${condLabel}\nTrigger: ${triggerText}\nMode: ${mode}\n`;
  msg += `Delivery: In-App ${inApp} | Telegram ${tg} | Webhook ${wh}\n`;
  if (alert.notes) msg += `Reason: ${alert.notes}\n`;
  if (alert.chart_link) msg += `📊 [Chart](${alert.chart_link})\n`;
  return msg;
}

function buildAlertPausedMessage(alert: any, isPaused: boolean): string {
  const tag = getExchangeTag(alert.exchange);
  const condLabel = conditionLabels[alert.condition_type] || alert.condition_type;
  const isPct = alert.condition_type?.includes("PERCENT_CHANGE");
  const triggerText = isPct ? `${alert.threshold}%` : fmt(alert.threshold);
  return isPaused
    ? `⏸ *ALERT PAUSED:* ${alert.symbol} (${tag}) | ${condLabel} ${triggerText}`
    : `▶️ *ALERT RESUMED:* ${alert.symbol} (${tag}) | ${condLabel} ${triggerText}`;
}

function buildAlertDeletedMessage(symbol: string, conditionType: string, threshold: number | null): string {
  const condLabel = conditionLabels[conditionType] || conditionType;
  const isPct = conditionType?.includes("PERCENT_CHANGE");
  const triggerText = isPct ? `${threshold}%` : fmt(threshold);
  return `🗑️ *Alert Deleted:* ${symbol} | ${condLabel} ${triggerText}`;
}

function buildNewTradeMessage(trade: any, isRaMode: boolean, disclaimer: string | null): string {
  const segment = trade.segment || "Equity_Intraday";
  const label = segmentLabels[segment] || segment;
  const tag = segmentTag[segment] || "NSE";
  const side = trade.trade_type || "BUY";
  const symbol = trade.symbol || "—";
  const targets = trade.targets || [];
  const targetsStr = targets.length > 0 ? targets.map((t: number, i: number) => `T${i + 1}: ${fmt(t)}`).join(" / ") : "—";
  const holdType = trade.holding_period || (segment === "Equity_Intraday" ? "Intraday" : "Positional");
  const tf = trade.timeframe ? (timeframeLabels[trade.timeframe] || trade.timeframe) : "";
  const slLine = trade.stop_loss ? `SL: ${fmt(trade.stop_loss)}` : "SL: —";
  const entryLine = trade.entry_price ? `Entry: ${fmt(trade.entry_price)}` : "Entry: At LTP";

  let tslLine = "";
  if (trade.trailing_sl_enabled) {
    const tslVal = trade.trailing_sl_percent ? `${trade.trailing_sl_percent}%` : trade.trailing_sl_points ? `${trade.trailing_sl_points} pts` : "ON";
    tslLine = `\n🔄 TSL: ${tslVal}`;
  }

  let typeLabel = label;
  let riskNote = "";
  if (segment === "Options") {
    typeLabel = side === "SELL" ? "Options Sell" : "Options Buy";
    riskNote = side === "SELL" ? "\n⚠️ _Option selling needs defined risk. Prefer hedge._" : "\n⚠️ _Options are high risk. Use strict SL._";
  } else if (segment === "Commodities") {
    typeLabel = "Commodity";
  }

  let msg = `🔔 *NEW TRADE (${typeLabel})* | ${tag}\n*${side} ${symbol}* (${tag})\n\n`;
  msg += `${entryLine}\n${slLine}`;
  if (trade.stop_loss && trade.entry_price) {
    const slPct = ((trade.entry_price - trade.stop_loss) / trade.entry_price * 100 * (side === "BUY" ? 1 : -1));
    if (!Number.isNaN(slPct)) msg += ` (${Math.abs(slPct).toFixed(1)}%)`;
  }
  msg += "\n";
  if (!isRaMode && trade.quantity && trade.quantity > 1) msg += `Qty: ${fmtNum(trade.quantity)}\n`;
  msg += `Targets: ${targetsStr}\nHold: ${holdType}`;
  if (tf) msg += ` | TF: ${tf}`;
  msg += "\n";
  if (trade.notes) msg += `\n📝 ${trade.notes}\n`;
  if (trade.chart_link) msg += `\n📊 [Chart](${trade.chart_link})\n`;
  msg += tslLine + riskNote;
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
  const reasonLabels: Record<string, string> = { SL_HIT: "Stop Loss", TSL_HIT: "Trailing SL", TARGET1_HIT: "Target 1", TARGET2_HIT: "Target 2", TARGET3_HIT: "Target 3", MANUAL: "Manual" };
  const reasonLabel = reasonLabels[trade.closure_reason || ""] || trade.closure_reason || "Manual";

  let msg = `📒 *TRADE CLOSED* ${emoji}\nInstrument: *${symbol}* | ${tag}\nSide: ${side}\n\n`;
  if (!isRaMode && trade.quantity && trade.quantity > 1) msg += `Qty: ${fmtNum(trade.quantity)}\n`;
  msg += `Entry: ${fmt(trade.entry_price)}\nExit: ${fmt(trade.current_price)}\n`;
  if (!isRaMode) msg += `P&L: ${fmt(pnl)} (${fmtPct(trade.pnl_percent)})\n`;
  msg += `Outcome: *${outcome}*\nReason: ${reasonLabel}\n\n⏱ ${istTimestamp()}`;
  if (trade.notes) msg += `\n\n📝 ${trade.notes}`;
  if (trade.chart_link) msg += `\n📊 [Chart](${trade.chart_link})`;
  if (isRaMode && disclaimer) msg += `\n\n🧾 _${disclaimer}_`;
  return msg;
}

function buildTradeUpdateMessage(trade: any, latestEvent: any, isRaMode: boolean): string {
  const symbol = trade.symbol || "—";
  const eventType = latestEvent?.event_type || "UPDATE";

  if (eventType.includes("TARGET") && eventType !== "TARGET_MODIFIED") {
    const targetNum = eventType.replace("TARGET", "T").replace("_HIT", "");
    let msg = `🎯 *TARGET HIT: ${symbol}*\nTarget Achieved: ${targetNum} ✅\n\nLTP: ${fmt(trade.current_price)}\n`;
    if (!isRaMode) msg += `P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})\n`;
    msg += `\nAction: Partial booking suggested`;
    if (trade.trailing_sl_current) msg += ` + SL trail to ${fmt(trade.trailing_sl_current)}`;
    msg += `\n\n⏱ ${istTimestamp()}`;
    return msg;
  }
  if (eventType === "SL_HIT") {
    let msg = `🛑 *SL HIT: ${symbol}*\nSL: ${fmt(trade.stop_loss)} Triggered ✅\nExit done as per plan.\n`;
    if (!isRaMode) msg += `\nP&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})`;
    if (latestEvent?.notes) msg += `\n\n📝 ${latestEvent.notes}`;
    msg += `\n\n⏱ ${istTimestamp()}\nNext: wait for fresh setup.`;
    return msg;
  }
  if (eventType === "TSL_UPDATED") {
    let msg = `🧲 *TSL UPDATE: ${symbol}*\nNew TSL: ${fmt(trade.trailing_sl_current)}\n`;
    if (trade.trailing_sl_active) msg += `Status: Active ✅`;
    if (latestEvent?.notes) msg += `\n\n📝 ${latestEvent.notes}`;
    msg += `\n\n⏱ ${istTimestamp()}`;
    return msg;
  }
  if (eventType === "TSL_HIT") {
    let msg = `🔄 *TSL HIT: ${symbol}*\nTrailing SL triggered at ${fmt(latestEvent?.price)}\n`;
    if (!isRaMode) msg += `P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})`;
    msg += `\n\n⏱ ${istTimestamp()}`;
    return msg;
  }
  if (eventType === "SL_MODIFIED") {
    let msg = `✏️ *SL MODIFIED: ${symbol}*\nNew SL: ${fmt(latestEvent?.price)}\nLTP: ${fmt(trade.current_price)}`;
    if (latestEvent?.notes) msg += `\nReason: ${latestEvent.notes}`;
    msg += `\n\n⏱ ${istTimestamp()}`;
    return msg;
  }

  let emoji = "📊";
  if (eventType === "PARTIAL_EXIT") emoji = "🎯";
  let msg = `${emoji} *Trade Update*\n\n*${symbol}* — ${eventType.replace(/_/g, " ")}\nLTP: ${fmt(trade.current_price)}\n`;
  if (!isRaMode) msg += `P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})\n`;
  msg += `SL: ${fmt(trade.stop_loss)}`;
  if (trade.trailing_sl_active && trade.trailing_sl_current) msg += `\nTSL: ${fmt(trade.trailing_sl_current)} (active)`;
  if (latestEvent?.notes) msg += `\n\n📝 ${latestEvent.notes}`;
  msg += `\n\n⏱ ${istTimestamp()}`;
  return msg;
}

function buildSLModifiedMessage(trade: any, oldSL: number, newSL: number): string {
  let msg = `🧲 *TSL UPDATE: ${trade.symbol}*\nOld SL: ${fmt(oldSL)} → New SL: ${fmt(newSL)}\nCurrent P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})`;
  msg += `\n\n⏱ ${istTimestamp()}`;
  return msg;
}

function buildTradeEventMessage(trade: any, eventType: string, price: number, notes?: string): string {
  const eventLabel = eventTypeLabels[eventType] || eventType.replace(/_/g, " ");
  const tag = segmentTag[trade.segment] || "NSE";
  let msg = `📝 *TRADE EVENT* | ${APP}\nInstrument: *${trade.symbol}* (${tag})\n\nEvent: ${eventLabel}\nPrice: ${fmt(price)}\nLTP: ${fmt(trade.current_price)}\n`;
  if (notes) msg += `Notes: ${notes}\n`;
  msg += `\n⏱ ${istTimestamp()}`;
  return msg;
}

// ════════════════════════════════════════
//  MANUAL SEND MESSAGE TEMPLATES
// ════════════════════════════════════════

function buildManualTradeSnapshotMessage(trade: any, isRaMode: boolean, disclaimer: string | null): string {
  const segment = trade.segment || "Equity_Intraday";
  const label = segmentLabels[segment] || segment;
  const tag = segmentTag[segment] || "NSE";
  const side = trade.trade_type || "BUY";
  const targets = trade.targets || [];
  const targetsStr = targets.length > 0 ? targets.map((t: number, i: number) => `T${i + 1}: ${fmt(t)}`).join(" / ") : "—";
  const holdType = trade.holding_period || (segment === "Equity_Intraday" ? "Intraday" : "Positional");
  const tf = trade.timeframe ? (timeframeLabels[trade.timeframe] || trade.timeframe) : "";
  const slLine = trade.stop_loss ? `SL: ${fmt(trade.stop_loss)}` : "SL: —";
  const entryLine = trade.entry_price ? `Entry: ${fmt(trade.entry_price)}` : "Entry: —";
  const pnl = trade.pnl || 0;
  const pnlPct = trade.pnl_percent || 0;

  let tslLine = "";
  if (trade.trailing_sl_enabled && trade.trailing_sl_current) {
    tslLine = `\n🔄 TSL: ${fmt(trade.trailing_sl_current)} ${trade.trailing_sl_active ? "(active)" : "(pending)"}`;
  }

  let msg = `📋 *TRADE SNAPSHOT* | ${tag}\n*${side} ${trade.symbol}* (${label})\n\n`;
  msg += `${entryLine}\nLTP: ${fmt(trade.current_price)}\n${slLine}\n`;
  if (!isRaMode && trade.quantity > 1) msg += `Qty: ${fmtNum(trade.quantity)}\n`;
  msg += `Targets: ${targetsStr}\n`;
  msg += `P&L: ${fmt(pnl)} (${fmtPct(pnlPct)})\n`;
  msg += `Status: ${trade.status}\nHold: ${holdType}`;
  if (tf) msg += ` | TF: ${tf}`;
  msg += tslLine;
  if (trade.notes) msg += `\n\n📝 ${trade.notes}`;
  if (trade.chart_link) msg += `\n📊 [Chart](${trade.chart_link})`;
  msg += `\n\n⏱ ${istTimestamp()}`;
  if (isRaMode && disclaimer) msg += `\n\n🧾 _${disclaimer}_`;
  return msg;
}

function buildManualPnlSnapshotMessage(trade: any, isRaMode: boolean): string {
  const tag = segmentTag[trade.segment] || "NSE";
  const pnl = trade.pnl || 0;
  const pnlPct = trade.pnl_percent || 0;
  const emoji = pnl >= 0 ? "📈" : "📉";

  let msg = `${emoji} *P&L UPDATE: ${trade.symbol}* | ${tag}\n\n`;
  msg += `Side: ${trade.trade_type}\nEntry: ${fmt(trade.entry_price)}\nLTP: ${fmt(trade.current_price)}\n`;
  if (!isRaMode) msg += `P&L: ${fmt(pnl)} (${fmtPct(pnlPct)})\n`;
  if (trade.stop_loss) msg += `SL: ${fmt(trade.stop_loss)}\n`;
  if (trade.trailing_sl_active && trade.trailing_sl_current) msg += `TSL: ${fmt(trade.trailing_sl_current)} (active)\n`;
  msg += `Status: ${trade.status}\n\n⏱ ${istTimestamp()}`;
  return msg;
}

function buildManualCustomNoteMessage(trade: any, customMessage: string): string {
  const tag = segmentTag[trade.segment] || "NSE";
  let msg = `💬 *NOTE: ${trade.symbol}* | ${tag}\n\n`;
  msg += `${customMessage}\n\n`;
  msg += `LTP: ${fmt(trade.current_price)} | P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})\n`;
  msg += `\n⏱ ${istTimestamp()}`;
  return msg;
}

// ════════════════════════════════════════
//  STUDY MESSAGE TEMPLATES
// ════════════════════════════════════════

const studyStatusEmojis: Record<string, string> = {
  Draft: "📝", Active: "🔍", Triggered: "🎯", Invalidated: "❌", Archived: "📦",
};

function buildStudyMessage(study: any, action: string, oldStatus?: string): string {
  const emoji = studyStatusEmojis[study.status] || "📋";
  const header = action === "triggered" ? "STUDY: TRIGGERED" : action === "created" ? "STUDY CREATED" : "STUDY UPDATED";
  const tags = (study.tags || []).map((t: string) => `#${t.replace(/\s+/g, "")}`).join(" ");
  const duration = study.pattern_duration || "—";

  let msg = `${emoji} *${header}*\n*${study.symbol}*\n\n`;
  msg += `Title: ${study.title}\n`;
  if (study.category) msg += `Category: ${study.category}\n`;
  msg += `Duration: ${duration}\n`;
  if (oldStatus) msg += `Status: ${oldStatus} → ${study.status}\n`;
  else msg += `Status: ${study.status}\n`;
  if (tags) msg += `\nTags: ${tags}\n`;

  // Include chart links from attachments or links
  const links = study.links || [];
  if (links.length > 0) {
    for (const link of links.slice(0, 2)) {
      const linkUrl = typeof link === "string" ? link : link?.url;
      const linkLabel = typeof link === "object" && link?.label ? link.label : "Chart";
      if (linkUrl) msg += `📊 [${linkLabel}](${linkUrl})\n`;
    }
  }

  // Include first attachment image URL
  const attachments = study.attachments || [];
  if (attachments.length > 0) {
    const first = attachments[0];
    const imgUrl = typeof first === "string" ? first : first?.url;
    if (imgUrl) msg += `🖼 [View Image](${imgUrl})\n`;
  }

  if (study.notes) {
    const truncatedNotes = study.notes.length > 200 ? study.notes.substring(0, 197) + "..." : study.notes;
    msg += `\n📝 ${truncatedNotes}\n`;
  }

  msg += `\n⏱ ${istTimestamp()}`;
  return msg;
}

function getFirstStudyImage(study: any): string | null {
  const attachments = study.attachments || [];
  if (attachments.length > 0) {
    const first = attachments[0];
    const url = typeof first === "string" ? first : first?.url;
    if (url && (url.startsWith("http") || url.startsWith("/"))) return url;
  }
  return null;
}

// ════════════════════════════════════════
//  MAIN HANDLER — Multi-chat routing
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

    // For "custom" with explicit chat_id — direct send (used by Test button)
    if (payload.type === "custom" && payload.chat_id) {
      const token = (payload as any).bot_token || TELEGRAM_BOT_TOKEN;
      const result = await sendWithRetry(token, payload.chat_id, payload.message, null, 3);

      if (!result.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: result.error || "Failed to send message",
            errorCode: result.errorCode,
            errorDescription: result.errorDescription,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return jsonOk({
        success: true,
        message_id: result.messageId,
        chat_id: payload.chat_id,
      });
    }

    // For "test" — direct send to default
    if (payload.type === "test") {
      const message = payload.message || `🔔 *Test Notification* | ${APP}\n\nYour Telegram integration is working correctly!\n\n✅ ${APP} is connected.\n⏱ ${istTimestamp()}`;
      if (!DEFAULT_CHAT_ID) throw new Error("No default chat ID configured");
      const result = await sendTelegramMessage(TELEGRAM_BOT_TOKEN, DEFAULT_CHAT_ID, message);
      if (!result.success) throw new Error("Failed to send test message");
      return jsonOk({ success: true, message_id: result.messageId });
    }

    // === Multi-chat routing for all other types ===
    let message = "";
    let imageUrl: string | null = null;
    let userId: string | null = null;
    let segment: string | null = null;
    let notificationType = "other"; // 'trade', 'alert', 'study', 'report', 'test', 'other'

    switch (payload.type) {
      case "new_trade": {
        const { data: trade, error } = await supabase.from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });
        userId = trade.user_id;
        segment = trade.segment;
        notificationType = "trade";
        const settings = await getUserSettings(supabase, trade.user_id);
        imageUrl = getFirstChartImage(trade);
        message = buildNewTradeMessage(trade, settings.ra_public_mode, settings.ra_disclaimer);
        break;
      }
      case "trade_update": {
        const { data: trade, error } = await supabase.from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });
        userId = trade.user_id;
        segment = trade.segment;
        notificationType = "trade";
        const settings = await getUserSettings(supabase, trade.user_id);
        imageUrl = getFirstChartImage(trade);
        const { data: events } = await supabase.from("trade_events").select("*").eq("trade_id", trade.id).order("timestamp", { ascending: false }).limit(1);
        message = buildTradeUpdateMessage(trade, events?.[0], settings.ra_public_mode);
        break;
      }
      case "trade_closed": {
        const { data: trade, error } = await supabase.from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });
        userId = trade.user_id;
        segment = trade.segment;
        notificationType = "trade";
        const settings = await getUserSettings(supabase, trade.user_id);
        imageUrl = getFirstChartImage(trade);
        message = buildTradeClosedMessage(trade, settings.ra_public_mode, settings.ra_disclaimer);
        break;
      }
      case "trade_sl_modified": {
        const { data: trade, error } = await supabase.from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });
        userId = trade.user_id;
        segment = trade.segment;
        notificationType = "trade";
        message = buildSLModifiedMessage(trade, payload.old_sl, payload.new_sl);
        break;
      }
      case "alert_triggered": {
        const { data: alert, error } = await supabase.from("alerts").select("*").eq("id", payload.alert_id).maybeSingle();
        if (error) throw error;
        if (!alert) return jsonOk({ success: true, skipped: true, reason: "Alert not found" });
        if (!(alert as any).telegram_enabled) return jsonOk({ success: true, skipped: true, reason: "Telegram disabled" });
        userId = alert.user_id;
        notificationType = "alert";
        message = buildAlertTriggeredMessage(alert, payload.current_price);
        break;
      }
      case "alert_created": {
        const { data: alert, error } = await supabase.from("alerts").select("*").eq("id", payload.alert_id).maybeSingle();
        if (error) throw error;
        if (!alert) return jsonOk({ success: true, skipped: true, reason: "Alert not found" });
        if (!(alert as any).telegram_enabled) return jsonOk({ success: true, skipped: true, reason: "Telegram disabled" });
        userId = alert.user_id;
        notificationType = "alert";
        message = buildAlertCreatedMessage(alert);
        break;
      }
      case "alert_paused": {
        const { data: alert, error } = await supabase.from("alerts").select("*").eq("id", payload.alert_id).maybeSingle();
        if (error) throw error;
        if (!alert) return jsonOk({ success: true, skipped: true, reason: "Alert not found" });
        userId = alert.user_id;
        notificationType = "alert";
        message = buildAlertPausedMessage(alert, payload.is_paused);
        break;
      }
      case "alert_deleted": {
        message = buildAlertDeletedMessage(payload.symbol, payload.condition_type, payload.threshold);
        notificationType = "alert";
        // No userId context for deleted alerts — falls back to legacy
        break;
      }
      case "trade_event_added": {
        const { data: trade, error } = await supabase.from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });
        userId = trade.user_id;
        segment = trade.segment;
        notificationType = "trade";
        message = buildTradeEventMessage(trade, payload.event_type, payload.price, payload.notes);
        break;
      }
      case "weekly_report": {
        const { data: report, error } = await supabase.from("weekly_reports").select("*").eq("id", payload.report_id).maybeSingle();
        if (error) throw error;
        if (!report) return jsonOk({ success: true, skipped: true, reason: "Report not found" });
        userId = report.user_id;
        notificationType = "report";

        const totalPnl = report.total_pnl || 0;
        const pnlEmoji = totalPnl >= 0 ? "📈" : "📉";
        const topSetups = report.top_setups || [];
        const topSetupsStr = topSetups.length > 0 ? topSetups.slice(0, 3).map((s: any) => `• ${s.pattern}: ${fmt(s.pnl)}`).join("\n") : "None";
        const mistakes = report.common_mistakes || [];
        const mistakesStr = mistakes.length > 0 ? mistakes.slice(0, 3).map((m: any) => `• ${m.mistake} (${m.count}x)`).join("\n") : "None";

        message = `📊 *Weekly Report – ${report.segment.replace("_", " ")}* | ${APP}\nWeek: ${report.week_start} to ${report.week_end}\n\n📈 *Performance*\n• Total Trades: ${fmtNum(report.total_trades)}\n• Win Rate: ${fmtPct(report.win_rate)}\n• Net P&L: ${fmt(totalPnl)}\n\n🎯 *Top Setups*\n${topSetupsStr}\n\n⚠️ *Common Mistakes*\n${mistakesStr}\n\n${pnlEmoji} Best Trade: ${fmt(report.best_trade_pnl)}\nWorst Trade: ${fmt(report.worst_trade_pnl)}\n\n⏱ ${istTimestamp()}`;
        break;
      }
      case "study_created": {
        const { data: study, error } = await supabase.from("studies").select("*").eq("id", payload.study_id).maybeSingle();
        if (error) throw error;
        if (!study) return jsonOk({ success: true, skipped: true, reason: "Study not found" });
        userId = study.user_id;
        notificationType = "study";
        imageUrl = getFirstStudyImage(study);
        message = buildStudyMessage(study, "created");
        break;
      }
      case "study_updated": {
        const { data: study, error } = await supabase.from("studies").select("*").eq("id", payload.study_id).maybeSingle();
        if (error) throw error;
        if (!study) return jsonOk({ success: true, skipped: true, reason: "Study not found" });
        userId = study.user_id;
        notificationType = "study";
        imageUrl = getFirstStudyImage(study);
        message = buildStudyMessage(study, "updated", payload.old_status);
        break;
      }
      case "study_triggered": {
        const { data: study, error } = await supabase.from("studies").select("*").eq("id", payload.study_id).maybeSingle();
        if (error) throw error;
        if (!study) return jsonOk({ success: true, skipped: true, reason: "Study not found" });
        userId = study.user_id;
        notificationType = "study";
        imageUrl = getFirstStudyImage(study);
        message = buildStudyMessage(study, "triggered");
        break;
      }
      case "custom": {
        message = payload.message;
        notificationType = "other";
        break;
      }
      case "manual_trade_snapshot": {
        const { data: trade, error } = await supabase.from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });
        userId = trade.user_id;
        segment = trade.segment;
        notificationType = "trade";
        imageUrl = getFirstChartImage(trade);
        const settings = await getUserSettings(supabase, trade.user_id);
        message = buildManualTradeSnapshotMessage(trade, settings.ra_public_mode, settings.ra_disclaimer);
        break;
      }
      case "manual_pnl_snapshot": {
        const { data: trade, error } = await supabase.from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });
        userId = trade.user_id;
        segment = trade.segment;
        notificationType = "trade";
        const settings = await getUserSettings(supabase, trade.user_id);
        message = buildManualPnlSnapshotMessage(trade, settings.ra_public_mode);
        break;
      }
      case "manual_custom_note": {
        const { data: trade, error } = await supabase.from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) return jsonOk({ success: true, skipped: true, reason: "Trade not found" });
        userId = trade.user_id;
        segment = trade.segment;
        notificationType = "trade";
        message = buildManualCustomNoteMessage(trade, (payload as any).custom_message);
        break;
      }
      default:
        throw new Error("Unknown notification type");
    }

    // === Resolve target chats ===
    let targetChats: Array<{ chat_id: string; bot_token: string | null }> = [];

    if (userId) {
      // Try new multi-chat system first with notification type routing
      targetChats = await getUserTelegramChats(supabase, userId, notificationType, segment);

      // Fallback to legacy single chat_id from user_settings
      if (targetChats.length === 0) {
        const settings = await getUserSettings(supabase, userId);
        if (settings.telegram_chat_id) {
          targetChats = [{ chat_id: settings.telegram_chat_id, bot_token: null }];
        }
      }
    }

    // Final fallback to env default
    if (targetChats.length === 0 && DEFAULT_CHAT_ID) {
      targetChats = [{ chat_id: DEFAULT_CHAT_ID, bot_token: null }];
    }

    if (targetChats.length === 0) {
      return jsonOk({
        success: true,
        skipped: true,
        reason: "No Telegram chat destinations configured for this notification type",
      });
    }

    const result = await sendToMultipleChats(
      supabase,
      TELEGRAM_BOT_TOKEN,
      targetChats,
      message,
      imageUrl,
      userId,
      notificationType,
      segment
    );

    if (result.successCount === 0) {
      // Return detailed error info
      const firstError = result.results.find((r) => !r.success);
      return new Response(
        JSON.stringify({
          success: false,
          error: firstError?.error || "Failed to send to any chat destination",
          sent_to: result.successCount,
          failed: result.failCount,
          results: result.results,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return jsonOk({
      success: true,
      sent_to: result.successCount,
      failed: result.failCount,
      results: result.results,
      with_image: !!imageUrl,
    });
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
