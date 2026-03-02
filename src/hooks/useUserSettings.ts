import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { toast } from "sonner";

interface UserSettings {
  id: string;
  user_id: string;
  default_sl_percent: number | null;
  alert_frequency_minutes: number | null;
  auto_sync_portfolio: boolean | null;
  theme: string | null;
  timezone: string | null;
  telegram_chat_id: string | null;
  telegram_link_code: string | null;
  telegram_link_expires_at: string | null;
  telegram_verified_at: string | null;
  telegram_enabled: boolean | null;
  dhan_client_id: string | null;
  dhan_access_token: string | null;
  dhan_verified_at: string | null;
  dhan_enabled: boolean | null;
  dhan_account_name: string | null;
  dhan_token_expiry: string | null;
  dhan_api_key: string | null;
  dhan_api_secret: string | null;
  ai_provider: string | null;
  ai_api_key: string | null;
  telegram_bot_token: string | null;
  telegram_bot_username: string | null;
  ra_public_mode: boolean | null;
  ra_disclaimer: string | null;
  starting_capital: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useUserSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Realtime: auto-invalidate settings on DB changes (e.g. from another tab)
  useRealtimeInvalidate("user_settings", "user-settings");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["user-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as UserSettings;
    },
    enabled: !!user?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_settings")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings", user?.id] });
      toast.success("Settings saved successfully");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to save settings";
      toast.error(message);
    },
  });

  const testTelegramConnection = async (chatId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("telegram-notify", {
        body: {
          type: "custom",
          message: "✅ Connection test successful! Your Telegram notifications are working.",
          chat_id: chatId,
        },
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success("Telegram connection successful!");
        return true;
      } else {
        toast.error(data?.error || "Telegram connection failed");
        return false;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to test Telegram connection";
      toast.error(message);
      return false;
    }
  };

  return {
    settings,
    isLoading,
    updateSettings,
    testTelegramConnection,
  };
}
