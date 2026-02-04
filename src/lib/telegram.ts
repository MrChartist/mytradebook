import { supabase } from "@/integrations/supabase/client";

type NotificationType = 
  | "new_trade" 
  | "trade_update" 
  | "trade_closed" 
  | "trade_sl_modified"
  | "alert_triggered" 
  | "alert_created"
  | "alert_paused"
  | "alert_deleted"
  | "trade_event_added"
  | "weekly_report" 
  | "custom";

interface BaseNotification {
  type: NotificationType;
}

interface TradeNotification extends BaseNotification {
  type: "new_trade" | "trade_update" | "trade_closed";
  trade_id: string;
}

interface SLModifiedNotification extends BaseNotification {
  type: "trade_sl_modified";
  trade_id: string;
  old_sl: number;
  new_sl: number;
}

interface AlertNotification extends BaseNotification {
  type: "alert_triggered";
  alert_id: string;
  current_price: number;
}

interface AlertCreatedNotification extends BaseNotification {
  type: "alert_created";
  alert_id: string;
}

interface AlertPausedNotification extends BaseNotification {
  type: "alert_paused";
  alert_id: string;
  is_paused: boolean;
}

interface AlertDeletedNotification extends BaseNotification {
  type: "alert_deleted";
  symbol: string;
  condition_type: string;
  threshold: number | null;
}

interface TradeEventAddedNotification extends BaseNotification {
  type: "trade_event_added";
  trade_id: string;
  event_type: string;
  price: number;
  notes?: string;
}

interface ReportNotification extends BaseNotification {
  type: "weekly_report";
  report_id: string;
}

interface CustomNotification extends BaseNotification {
  type: "custom";
  message: string;
  chat_id?: string;
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
  | CustomNotification;

interface TelegramResponse {
  success: boolean;
  message_id?: number;
  chat_id?: string;
  error?: string;
}

export async function sendTelegramNotification(
  payload: NotificationPayload
): Promise<TelegramResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("telegram-notify", {
      body: payload,
    });

    if (error) {
      console.error("Telegram notification error:", error);
      return { success: false, error: error.message };
    }

    return data as TelegramResponse;
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}

// Convenience functions for trades
export async function notifyNewTrade(tradeId: string) {
  return sendTelegramNotification({ type: "new_trade", trade_id: tradeId });
}

export async function notifyTradeUpdate(tradeId: string) {
  return sendTelegramNotification({ type: "trade_update", trade_id: tradeId });
}

export async function notifyTradeClosed(tradeId: string) {
  return sendTelegramNotification({ type: "trade_closed", trade_id: tradeId });
}

export async function notifySLModified(tradeId: string, oldSL: number, newSL: number) {
  return sendTelegramNotification({ 
    type: "trade_sl_modified", 
    trade_id: tradeId,
    old_sl: oldSL,
    new_sl: newSL 
  });
}

// Convenience functions for alerts
export async function notifyAlertTriggered(alertId: string, currentPrice: number) {
  return sendTelegramNotification({ 
    type: "alert_triggered", 
    alert_id: alertId,
    current_price: currentPrice 
  });
}

export async function notifyAlertCreated(alertId: string) {
  return sendTelegramNotification({ 
    type: "alert_created", 
    alert_id: alertId 
  });
}

export async function notifyAlertPaused(alertId: string, isPaused: boolean) {
  return sendTelegramNotification({ 
    type: "alert_paused", 
    alert_id: alertId,
    is_paused: isPaused 
  });
}

export async function notifyAlertDeleted(symbol: string, conditionType: string, threshold: number | null) {
  return sendTelegramNotification({ 
    type: "alert_deleted", 
    symbol,
    condition_type: conditionType,
    threshold 
  });
}

// Convenience functions for trade events
export async function notifyTradeEventAdded(
  tradeId: string, 
  eventType: string, 
  price: number, 
  notes?: string
) {
  return sendTelegramNotification({ 
    type: "trade_event_added", 
    trade_id: tradeId,
    event_type: eventType,
    price,
    notes 
  });
}

// Convenience functions for reports
export async function notifyWeeklyReport(reportId: string) {
  return sendTelegramNotification({ type: "weekly_report", report_id: reportId });
}

export async function sendCustomMessage(message: string, chatId?: string) {
  return sendTelegramNotification({ 
    type: "custom", 
    message,
    chat_id: chatId 
  });
}
