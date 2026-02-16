import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface TelegramChat {
  id: string;
  user_id: string;
  chat_id: string;
  label: string;
  segments: string[];
  bot_token: string | null;
  bot_username: string | null;
  enabled: boolean;
  created_at: string;
}

const ALL_SEGMENTS = [
  "Equity_Intraday",
  "Equity_Positional",
  "Futures",
  "Options",
  "Commodities",
];

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
      return (data || []) as TelegramChat[];
    },
    enabled: !!user?.id,
  });

  const addChat = useMutation({
    mutationFn: async (input: { chat_id: string; label: string; bot_token?: string; bot_username?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("telegram_chats")
        .insert({
          user_id: user.id,
          chat_id: input.chat_id,
          label: input.label || `Chat ${input.chat_id}`,
          segments: [], // Default: OFF - user must explicitly select segments
          notification_types: {}, // Empty by default
          bot_token: input.bot_token || null,
          bot_username: input.bot_username || null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as TelegramChat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegram-chats"] });
      toast.success("Chat destination added");
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
        const errorMsg = error.message || "Test failed";
        toast.error(`Test failed: ${errorMsg}`, { duration: 5000 });
        return false;
      }

      if (data?.success) {
        toast.success("Test message sent successfully!");
        return true;
      }

      // Detailed error message from Telegram API
      const errorCode = data?.errorCode;
      const errorDesc = data?.errorDescription || data?.error;

      let userFriendlyError = "Test failed";

      if (errorCode === 400 && errorDesc?.includes("chat not found")) {
        userFriendlyError = "Chat ID not found. Check if the ID is correct.";
      } else if (errorCode === 403 && errorDesc?.includes("bot was blocked")) {
        userFriendlyError = "Bot was blocked by user. Unblock the bot and try again.";
      } else if (errorCode === 403 && errorDesc?.includes("not enough rights")) {
        userFriendlyError = "Bot is not admin. Add bot as admin in channel/group.";
      } else if (errorCode === 401) {
        userFriendlyError = "Invalid bot token. Check your bot token.";
      } else if (errorDesc) {
        userFriendlyError = errorDesc;
      }

      toast.error(userFriendlyError, { duration: 6000 });
      return false;
    } catch (e: any) {
      toast.error(e.message || "Test failed", { duration: 5000 });
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

  const deliveryLogsQuery = useQuery({
    queryKey: ["telegram-delivery-logs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("telegram_delivery_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as TelegramDeliveryLog[];
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
    testChat,
    testAllChats,
  };
}
