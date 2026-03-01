import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface NotificationTypeRouting {
  trade: string[];
  alert: string[];
  study: string[];
  report: string[];
}

export const DEFAULT_NOTIFICATION_TYPES: NotificationTypeRouting = {
  trade: [],
  alert: [],
  study: [],
  report: [],
};

export interface TelegramChat {
  id: string;
  user_id: string;
  chat_id: string;
  label: string;
  segments: string[];
  bot_token: string | null;
  bot_username: string | null;
  enabled: boolean;
  notification_types: NotificationTypeRouting | null;
  last_verified_at: string | null;
  verification_status: string | null;
  created_at: string;
}

export const SEGMENT_LABELS: Record<string, string> = {
  Equity_Intraday: "Equity - Intraday & Short Term",
  Equity_Positional: "Equity - Positional & Investment",
  Futures: "Futures Trade",
  Options: "Options Trade",
  Commodities: "MCX / Commodity Trade",
};

export interface TelegramDeliveryLog {
  id: string;
  user_id: string;
  chat_id: string;
  notification_type: string;
  segment: string | null;
  success: boolean;
  error_message: string | null;
  response_data: any;
  attempt_number: number;
  created_at: string;
}

// ──────────────────────────────────────────────
// Friendly error mapping for Telegram API errors
// ──────────────────────────────────────────────
function mapTelegramError(raw: string): string {
  const lower = raw.toLowerCase();

  if (lower.includes("chat not found")) {
    return "Chat ID not found. Tips:\n• Personal chat — send /start to your bot first\n• Group — add the bot to the group\n• Channel — add the bot as admin\n• Channel IDs start with -100 (e.g. -1001234567890)";
  }
  if (lower.includes("bot was blocked")) {
    return "This user has blocked the bot. They need to unblock it and send /start again.";
  }
  if (lower.includes("bot is not a member") || lower.includes("forbidden")) {
    return "The bot isn't a member of this group/channel. Add it as a member (or admin for channels) first.";
  }
  if (lower.includes("group chat was upgraded")) {
    return "This group was upgraded to a supergroup. Use the new Chat ID (starts with -100).";
  }
  if (lower.includes("not enough rights")) {
    return "The bot doesn't have permission to send messages in this chat. Check admin/member permissions.";
  }
  if (lower.includes("too many requests") || lower.includes("429")) {
    return "Rate limited by Telegram. Wait a minute and try again.";
  }
  return raw;
}

// Auto-label based on Chat ID format
function autoLabel(chatId: string): string {
  if (chatId.startsWith("-100")) return "Channel / Supergroup";
  if (chatId.startsWith("-")) return "Group";
  return "Personal Chat";
}

export function useTelegramChats() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const chatsQuery = useQuery({
    queryKey: ["telegram-chats", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("telegram_chats")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as TelegramChat[];
    },
    enabled: !!user?.id,
  });

  const addChat = useMutation({
    mutationFn: async (input: { chat_id: string; label: string; bot_token?: string; bot_username?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const chatId = input.chat_id.trim();
      if (!/^-?\d+$/.test(chatId)) {
        throw new Error("Chat ID must be a number (e.g. 123456789 or -1001234567890)");
      }

      // Use provided label or auto-generate from Chat ID pattern
      const label = input.label || autoLabel(chatId);

      // Insert the chat first
      const { data, error } = await supabase
        .from("telegram_chats")
        .insert({
          user_id: user.id,
          chat_id: chatId,
          label,
          segments: [],
          bot_token: input.bot_token || null,
          bot_username: input.bot_username || null,
        })
        .select()
        .single();
      if (error) throw error;

      // Verify by sending a test message
      const chatRow = data as unknown as TelegramChat;
      try {
        const { data: testData, error: testError } = await supabase.functions.invoke("telegram-notify", {
          body: {
            type: "custom",
            message: `✅ *Chat Connected!*\n\nThis chat is now linked to TradeBook.\nNotifications will arrive here.\n\n⏱ ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
            chat_id: chatId,
            ...(input.bot_token ? { bot_token: input.bot_token } : {}),
          },
        });

        if (testError || (testData && !testData.success)) {
          // Verification failed — delete the chat and throw
          await supabase.from("telegram_chats").delete().eq("id", chatRow.id);
          let errorMsg = "Bot cannot reach this chat";
          if (testData?.errorDescription) {
            errorMsg = testData.errorDescription;
          } else if (testData?.error) {
            errorMsg = testData.error;
          } else if (testError?.context) {
            try {
              const body = await testError.context.json();
              errorMsg = body?.errorDescription || body?.error || testError.message;
            } catch {
              errorMsg = testError.message || errorMsg;
            }
          } else if (testError?.message) {
            errorMsg = testError.message;
          }
          throw new Error(`Verification failed: ${mapTelegramError(errorMsg)}`);
        }
      } catch (verifyErr: any) {
        if (verifyErr.message?.startsWith("Verification failed:")) throw verifyErr;
        await supabase.from("telegram_chats").delete().eq("id", chatRow.id);
        throw new Error(`Verification failed: ${mapTelegramError(verifyErr.message || "Could not reach chat")}`);
      }

      return chatRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegram-chats"] });
      toast.success("Chat destination added & verified ✅");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateChat = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TelegramChat> & { id: string }) => {
      const { error } = await supabase
        .from("telegram_chats")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegram-chats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeChat = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("telegram_chats")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegram-chats"] });
      toast.success("Chat destination removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeAllChats = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("telegram_chats")
        .delete()
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegram-chats"] });
      toast.success("All chat destinations removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleSegment = async (chatId: string, segment: string, currentSegments: string[]) => {
    const newSegments = currentSegments.includes(segment)
      ? currentSegments.filter((s) => s !== segment)
      : [...currentSegments, segment];
    await updateChat.mutateAsync({ id: chatId, segments: newSegments } as any);
  };

  const toggleNotificationType = async (
    chatId: string,
    category: keyof NotificationTypeRouting,
    segment: string,
    currentTypes: NotificationTypeRouting | null
  ) => {
    const types = currentTypes || { ...DEFAULT_NOTIFICATION_TYPES };
    const currentSegments = types[category] || [];
    const newSegments = currentSegments.includes(segment)
      ? currentSegments.filter((s) => s !== segment)
      : [...currentSegments, segment];
    const newTypes = { ...types, [category]: newSegments };
    await updateChat.mutateAsync({ id: chatId, notification_types: newTypes } as any);
  };

  const toggleNotificationAll = async (
    chatId: string,
    category: keyof NotificationTypeRouting,
    enabled: boolean,
    currentTypes: NotificationTypeRouting | null
  ) => {
    const types = currentTypes || { ...DEFAULT_NOTIFICATION_TYPES };
    const newTypes = { ...types, [category]: enabled ? ["*"] : [] };
    await updateChat.mutateAsync({ id: chatId, notification_types: newTypes } as any);
  };

  const testChat = async (chatId: string, botToken?: string | null) => {
    try {
      const { data, error } = await supabase.functions.invoke("telegram-notify", {
        body: {
          type: "custom",
          message: `✅ *Test Successful!*\n\nThis chat is connected to TradeBook.\nNotifications will arrive here.\n\n⏱ ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
          chat_id: chatId,
          ...(botToken ? { bot_token: botToken } : {}),
        },
      });

      if (error) {
        let errorDesc: string | undefined;
        try {
          const errorBody = error.context ? await error.context.json?.() : null;
          if (errorBody) errorDesc = errorBody.errorDescription || errorBody.error;
        } catch { /* ignore */ }

        toast.error(mapTelegramError(errorDesc || error.message || "Test failed"), { duration: 6000 });
        queryClient.invalidateQueries({ queryKey: ["telegram-chats"] });
        queryClient.invalidateQueries({ queryKey: ["telegram-delivery-logs"] });
        return false;
      }

      if (data?.success) {
        toast.success("Test message sent successfully!");
        queryClient.invalidateQueries({ queryKey: ["telegram-chats"] });
        queryClient.invalidateQueries({ queryKey: ["telegram-delivery-logs"] });
        return true;
      }

      const errorMsg = data?.errorDescription || data?.error || "Test failed";
      toast.error(mapTelegramError(errorMsg), { duration: 6000 });
      queryClient.invalidateQueries({ queryKey: ["telegram-chats"] });
      queryClient.invalidateQueries({ queryKey: ["telegram-delivery-logs"] });
      return false;
    } catch (e: any) {
      toast.error(mapTelegramError(e.message || "Test failed"), { duration: 5000 });
      return false;
    }
  };

  const testAllChats = async () => {
    const chats = chatsQuery.data || [];
    let successCount = 0;
    for (const chat of chats) {
      const ok = await testChat(chat.chat_id, chat.bot_token);
      if (ok) successCount++;
    }
    if (successCount === chats.length) {
      toast.success(`All ${chats.length} chats tested successfully!`);
    } else {
      toast.warning(`${successCount}/${chats.length} chats responded`);
    }
  };

  // Verify a bot token via the telegram-verify edge function
  const verifyBotToken = async (token: string): Promise<{ success: boolean; bot?: { username: string; first_name: string }; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke("telegram-verify", {
        body: { action: "verify_bot_token", bot_token: token },
      });

      if (error) {
        let errorMsg = "Could not verify bot token";
        try {
          const body = error.context ? await error.context.json?.() : null;
          if (body?.error) errorMsg = body.error;
        } catch { /* ignore */ }
        return { success: false, error: errorMsg };
      }

      if (data?.success && data?.bot) {
        return { success: true, bot: data.bot };
      }

      return { success: false, error: data?.error || "Invalid bot token" };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const deliveryLogsQuery = useQuery({
    queryKey: ["telegram-delivery-logs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("telegram_delivery_log" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as unknown as TelegramDeliveryLog[];
    },
    enabled: !!user?.id,
  });

  return {
    chats: chatsQuery.data || [],
    isLoading: chatsQuery.isLoading,
    deliveryLogs: deliveryLogsQuery.data || [],
    logsLoading: deliveryLogsQuery.isLoading,
    addChat,
    updateChat,
    removeChat,
    removeAllChats,
    toggleSegment,
    toggleNotificationType,
    toggleNotificationAll,
    testChat,
    testAllChats,
    verifyBotToken,
  };
}
