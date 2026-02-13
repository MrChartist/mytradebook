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
  "1min": "1 Min", "5min": "5 Min", "15min": "15 Min", "30min": "30 Min",
  "1H": "1 Hour", "4H": "4 Hour", "1D": "Daily", "1W": "Weekly",
};

const conditionLabels: Record<string, string> = {
  PRICE_GT: "Price Above", PRICE_LT: "Price Below",
  PERCENT_CHANGE_GT: "Gain Above", PERCENT_CHANGE_LT: "Loss Above",
  VOLUME_SPIKE: "Volume Spike", CUSTOM: "Custom",
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

// Safe number formatting — never show NaN
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

// Get user settings including RA mode
async function getUserSettings(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_settings")
    .select("telegram_chat_id, ra_public_mode, ra_disclaimer")
    .eq("user_id", userId)
    .maybeSingle();
  return data || { telegram_chat_id: null, ra_public_mode: false, ra_disclaimer: null };
}

// Helper function to send Telegram photo with caption
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

// Helper function to send Telegram message
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

// ── SEGMENT-AWARE NEW TRADE TEMPLATES ──

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

  // SL info
  const slLine = trade.stop_loss
    ? `SL: ${fmt(trade.stop_loss)}`
    : "SL: —";

  // Entry info
  const entryLine = trade.entry_price
    ? `Entry: ${fmt(trade.entry_price)}`
    : "Entry: At LTP";

  // TSL info
  let tslLine = "";
  if (trade.trailing_sl_enabled) {
    const tslVal = trade.trailing_sl_percent
      ? `${trade.trailing_sl_percent}%`
      : trade.trailing_sl_points ? `${trade.trailing_sl_points} pts` : "ON";
    tslLine = `\n🔄 TSL: ${tslVal}`;
  }

  // Segment-specific header and risk note
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

  // Build the message
  let msg = `${headerEmoji} *NEW TRADE (${typeLabel})* | ${tag}\n`;
  msg += `*${side} ${symbol}* (${tag})\n\n`;
  msg += `${entryLine}\n`;
  msg += `${slLine}`;
  if (trade.stop_loss && trade.entry_price) {
    const slPct = ((trade.entry_price - trade.stop_loss) / trade.entry_price * 100 * (side === "BUY" ? 1 : -1));
    if (!Number.isNaN(slPct)) msg += ` (${Math.abs(slPct).toFixed(1)}%)`;
  }
  msg += "\n";

  // Qty line — only in normal mode
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

  // RA compliance footer
  if (isRaMode) {
    msg += "\n\n⚠️ _Position sizing as per your risk plan. Quantity not shared publicly._";
    if (disclaimer) {
      msg += `\n\n🧾 _${disclaimer}_`;
    }
  }

  return msg;
}

// ── TRADE CLOSED TEMPLATE ──

function buildTradeClosedMessage(trade: any, isRaMode: boolean, disclaimer: string | null): string {
  const segment = trade.segment || "Equity_Intraday";
  const tag = segmentTag[segment] || "NSE";
  const side = trade.trade_type || "BUY";
  const symbol = trade.symbol || "—";

  const pnl = trade.pnl || 0;
  const isProfit = pnl >= 0;
  const emoji = isProfit ? "✅" : "❌";
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

  if (trade.notes) msg += `\n📝 ${trade.notes}`;

  if (isRaMode && disclaimer) {
    msg += `\n\n🧾 _${disclaimer}_`;
  }

  return msg;
}

// ── TRADE UPDATE TEMPLATE ──

function buildTradeUpdateMessage(trade: any, latestEvent: any, isRaMode: boolean): string {
  const symbol = trade.symbol || "—";
  const eventType = latestEvent?.event_type || "UPDATE";

  let emoji = "📊";
  if (eventType.includes("TARGET")) emoji = "🎯";
  if (eventType === "SL_HIT") emoji = "🛑";
  if (eventType === "TSL_HIT" || eventType === "TSL_UPDATED") emoji = "🔄";
  if (eventType === "SL_MODIFIED") emoji = "✏️";
  if (eventType === "PARTIAL_EXIT") emoji = "🎯";

  // Use specific templates based on event type
  if (eventType.includes("TARGET") && eventType !== "TARGET_MODIFIED") {
    const targetNum = eventType.replace("TARGET", "T").replace("_HIT", "");
    let msg = `🎯 *TARGET HIT: ${symbol}*\n`;
    msg += `Target Achieved: ${targetNum} ✅\n\n`;
    msg += `LTP: ${fmt(trade.current_price)}\n`;
    if (!isRaMode) msg += `P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})\n`;
    msg += `\nAction: Partial booking suggested`;
    if (trade.trailing_sl_current) msg += ` + SL trail to ${fmt(trade.trailing_sl_current)}`;
    return msg;
  }

  if (eventType === "SL_HIT") {
    let msg = `🛑 *SL HIT: ${symbol}*\n`;
    msg += `SL: ${fmt(trade.stop_loss)} Triggered ✅\n`;
    msg += `Exit done as per plan.\n`;
    if (!isRaMode) msg += `\nP&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})`;
    if (latestEvent?.notes) msg += `\n\n📝 ${latestEvent.notes}`;
    msg += `\n\nNext: wait for fresh setup.`;
    return msg;
  }

  if (eventType === "TSL_UPDATED") {
    let msg = `🧲 *TSL UPDATE: ${symbol}*\n`;
    msg += `New TSL: ${fmt(trade.trailing_sl_current)}\n`;
    if (trade.trailing_sl_active) msg += `Status: Active ✅`;
    if (latestEvent?.notes) msg += `\n\n📝 ${latestEvent.notes}`;
    return msg;
  }

  if (eventType === "TSL_HIT") {
    let msg = `🔄 *TSL HIT: ${symbol}*\n`;
    msg += `Trailing SL triggered at ${fmt(latestEvent?.price)}\n`;
    if (!isRaMode) msg += `P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})`;
    return msg;
  }

  if (eventType === "SL_MODIFIED") {
    let msg = `✏️ *SL MODIFIED: ${symbol}*\n`;
    msg += `New SL: ${fmt(latestEvent?.price)}\n`;
    msg += `LTP: ${fmt(trade.current_price)}`;
    if (latestEvent?.notes) msg += `\nReason: ${latestEvent.notes}`;
    return msg;
  }

  // Generic update
  let msg = `${emoji} *Trade Update*\n\n`;
  msg += `*${symbol}* — ${eventType.replace(/_/g, " ")}\n`;
  msg += `LTP: ${fmt(trade.current_price)}\n`;
  if (!isRaMode) msg += `P&L: ${fmt(trade.pnl)} (${fmtPct(trade.pnl_percent)})\n`;
  msg += `SL: ${fmt(trade.stop_loss)}`;
  if (trade.trailing_sl_active && trade.trailing_sl_current) {
    msg += `\nTSL: ${fmt(trade.trailing_sl_current)} (active)`;
  }
  if (latestEvent?.notes) msg += `\n\n📝 ${latestEvent.notes}`;

  return msg;
}

// ── SL MODIFIED TEMPLATE ──

function buildSLModifiedMessage(trade: any, oldSL: number, newSL: number): string {
  let msg = `🧲 *TSL UPDATE: ${trade.symbol}*\n`;
  msg += `Old SL: ${fmt(oldSL)} → New SL: ${fmt(newSL)}\n`;

  const pnl = trade.pnl || 0;
  msg += `Current P&L: ${fmt(pnl)} (${fmtPct(trade.pnl_percent)})`;

  return msg;
}

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
        if (!trade) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Trade not found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

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
        if (!trade) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Trade not found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const settings = await getUserSettings(supabase, trade.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;
        imageUrl = getFirstChartImage(trade);

        const { data: events } = await supabase
          .from("trade_events").select("*")
          .eq("trade_id", trade.id)
          .order("timestamp", { ascending: false })
          .limit(1);
        const latestEvent = events?.[0];

        message = buildTradeUpdateMessage(trade, latestEvent, settings.ra_public_mode);
        break;
      }

      case "trade_closed": {
        const { data: trade, error } = await supabase
          .from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Trade not found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

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
        if (!trade) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Trade not found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const settings = await getUserSettings(supabase, trade.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;

        message = buildSLModifiedMessage(trade, payload.old_sl, payload.new_sl);
        break;
      }

      case "alert_triggered": {
        const { data: alert, error } = await supabase
          .from("alerts").select("*").eq("id", payload.alert_id).maybeSingle();
        if (error) throw error;
        if (!alert) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Alert not found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!(alert as any).telegram_enabled) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Telegram disabled" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const settings = await getUserSettings(supabase, alert.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;

        const conditionMap: Record<string, string> = {
          PRICE_GT: "crossed above", PRICE_LT: "crossed below",
          PERCENT_CHANGE_GT: "gained more than", PERCENT_CHANGE_LT: "lost more than",
          VOLUME_SPIKE: "volume spike detected", CUSTOM: "custom condition met",
        };
        const condition = conditionMap[alert.condition_type] || alert.condition_type;
        const timestamp = new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short"
        });

        message = `🔔 *ALERT TRIGGERED*\n\n` +
          `*${alert.symbol}* (${(alert as any).exchange || "NSE"})\n` +
          `${condition} ${fmt(alert.threshold)}\n\n` +
          `📍 Current Price: ${fmt(payload.current_price)}\n` +
          `🕐 Time: ${timestamp}\n` +
          `🔁 Recurrence: ${alert.recurrence}\n` +
          `📊 Trigger Count: ${((alert.trigger_count || 0) + 1)}` +
          ((alert as any).notes ? `\n\n📝 *Notes:* ${(alert as any).notes}` : "");
        break;
      }

      case "alert_created": {
        const { data: alert, error } = await supabase
          .from("alerts").select("*").eq("id", payload.alert_id).maybeSingle();
        if (error) throw error;
        if (!alert) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Alert not found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!(alert as any).telegram_enabled) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Telegram disabled" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const settings = await getUserSettings(supabase, alert.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;

        const conditionLabel = conditionLabels[alert.condition_type] || alert.condition_type;
        const recurrenceLabels: Record<string, string> = { ONCE: "One-time", DAILY: "Daily", CONTINUOUS: "Continuous" };
        const recurrence = recurrenceLabels[alert.recurrence || "ONCE"] || alert.recurrence;

        message = `🔔 *New Alert Created*\n\n` +
          `Symbol: *${alert.symbol}* (${(alert as any).exchange || "NSE"})\n` +
          `Condition: ${conditionLabel} ${fmt(alert.threshold)}\n` +
          `Recurrence: ${recurrence}` +
          ((alert as any).notes ? `\n\n📝 *Notes:* ${(alert as any).notes}` : "");
        break;
      }

      case "alert_paused": {
        const { data: alert, error } = await supabase
          .from("alerts").select("*").eq("id", payload.alert_id).maybeSingle();
        if (error) throw error;
        if (!alert) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Alert not found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const settings = await getUserSettings(supabase, alert.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;

        const conditionLabel = conditionLabels[alert.condition_type] || alert.condition_type;
        const emoji = payload.is_paused ? "⏸️" : "▶️";
        const statusText = payload.is_paused ? "Paused" : "Resumed";

        message = `${emoji} *Alert ${statusText}*\n\n` +
          `Symbol: *${alert.symbol}*\n` +
          `Condition: ${conditionLabel} ${fmt(alert.threshold)}`;
        break;
      }

      case "alert_deleted": {
        const conditionLabel = conditionLabels[payload.condition_type] || payload.condition_type;
        message = `🗑️ *Alert Deleted*\n\n` +
          `Symbol: *${payload.symbol}*\n` +
          `Condition: ${conditionLabel} ${fmt(payload.threshold)}`;
        break;
      }

      case "trade_event_added": {
        const { data: trade, error } = await supabase
          .from("trades").select("*").eq("id", payload.trade_id).maybeSingle();
        if (error) throw error;
        if (!trade) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Trade not found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const settings = await getUserSettings(supabase, trade.user_id);
        if (settings.telegram_chat_id) chatId = settings.telegram_chat_id;

        const eventLabel = eventTypeLabels[payload.event_type] || payload.event_type.replace(/_/g, " ");

        message = `📝 *Trade Event Added*\n\n` +
          `Symbol: *${trade.symbol}*\n` +
          `Event: ${eventLabel}\n` +
          `Price: ${fmt(payload.price)}` +
          (payload.notes ? `\nNotes: ${payload.notes}` : "");
        break;
      }

      case "weekly_report": {
        const { data: report, error } = await supabase
          .from("weekly_reports").select("*").eq("id", payload.report_id).maybeSingle();
        if (error) throw error;
        if (!report) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Report not found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

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

        message = `📊 *Weekly Report – ${report.segment.replace("_", " ")}*\n` +
          `Week: ${report.week_start} to ${report.week_end}\n\n` +
          `📈 *Performance*\n` +
          `• Total Trades: ${fmtNum(report.total_trades)}\n` +
          `• Win Rate: ${fmtPct(report.win_rate)}\n` +
          `• Net P&L: ${fmt(totalPnl)}\n\n` +
          `🎯 *Top Setups*\n${topSetupsStr}\n\n` +
          `⚠️ *Common Mistakes*\n${mistakesStr}\n\n` +
          `${pnlEmoji} Best Trade: ${fmt(report.best_trade_pnl)}\n` +
          `Worst Trade: ${fmt(report.worst_trade_pnl)}`;
        break;
      }

      case "custom": {
        message = payload.message;
        if (payload.chat_id) chatId = payload.chat_id;
        break;
      }

      case "test": {
        message = payload.message || `🔔 *Test Notification*\n\nYour Telegram integration is working correctly!\n\n✅ TradeBook is connected.`;
        break;
      }

      default:
        throw new Error(`Unknown notification type`);
    }

    if (!chatId) throw new Error("No Telegram chat ID configured");

    // Send to Telegram
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
