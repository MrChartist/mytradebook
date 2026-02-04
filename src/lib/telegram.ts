import { supabase } from "@/integrations/supabase/client";

type NotificationType = 
  | "new_trade" 
  | "trade_update" 
  | "trade_closed" 
  | "alert_triggered" 
  | "weekly_report" 
  | "custom";

interface BaseNotification {
  type: NotificationType;
}

interface TradeNotification extends BaseNotification {
  type: "new_trade" | "trade_update" | "trade_closed";
  trade_id: string;
}

interface AlertNotification extends BaseNotification {
  type: "alert_triggered";
  alert_id: string;
  current_price: number;
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
  | AlertNotification 
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

// Convenience functions
export async function notifyNewTrade(tradeId: string) {
  return sendTelegramNotification({ type: "new_trade", trade_id: tradeId });
}

export async function notifyTradeUpdate(tradeId: string) {
  return sendTelegramNotification({ type: "trade_update", trade_id: tradeId });
}

export async function notifyTradeClosed(tradeId: string) {
  return sendTelegramNotification({ type: "trade_closed", trade_id: tradeId });
}

export async function notifyAlertTriggered(alertId: string, currentPrice: number) {
  return sendTelegramNotification({ 
    type: "alert_triggered", 
    alert_id: alertId,
    current_price: currentPrice 
  });
}

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
