import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { notifyAlertCreated, notifyAlertPaused, notifyAlertDeleted } from "@/lib/telegram";
import type { Database } from "@/integrations/supabase/types";

type Alert = Database["public"]["Tables"]["alerts"]["Row"] & {
  notes?: string | null;
  telegram_enabled?: boolean | null;
  instrument_id?: string | null;
  exchange?: string | null;
};
type AlertInsert = Database["public"]["Tables"]["alerts"]["Insert"];
type AlertUpdate = Database["public"]["Tables"]["alerts"]["Update"];

export interface AlertFilters {
  active?: boolean;
  symbol?: string;
}

export function useAlerts(filters?: AlertFilters) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ["alerts", user?.id, filters],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filters?.active !== undefined) {
        query = query.eq("active", filters.active);
      }
      if (filters?.symbol) {
        query = query.ilike("symbol", `%${filters.symbol}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Alert[];
    },
    enabled: !!user,
  });

  const createAlert = useMutation({
    mutationFn: async (
      input: Omit<AlertInsert, "user_id" | "id" | "created_at"> & {
        notes?: string | null;
        telegram_enabled?: boolean;
        instrument_id?: string | null;
        exchange?: string;
      }
    ) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("alerts")
        .insert({
          symbol: input.symbol,
          condition_type: input.condition_type,
          threshold: input.threshold,
          recurrence: input.recurrence || "ONCE",
          expires_at: input.expires_at || null,
          notes: input.notes || null,
          telegram_enabled: input.telegram_enabled || false,
          instrument_id: input.instrument_id || null,
          exchange: input.exchange || "NSE",
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: "Alert created",
        description: "Your alert has been created successfully.",
      });
      
      // Send Telegram notification if enabled
      if (data.telegram_enabled) {
        notifyAlertCreated(data.id).catch(console.error);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to create alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAlert = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: AlertUpdate & { 
      id: string;
      notes?: string | null;
      telegram_enabled?: boolean;
      instrument_id?: string | null;
      exchange?: string;
    }) => {
      const { data, error } = await supabase
        .from("alerts")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: "Alert updated",
        description: "Your alert has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleAlert = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await supabase
        .from("alerts")
        .update({ active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: data.active ? "Alert activated" : "Alert paused",
        description: `Alert for ${data.symbol} has been ${data.active ? "activated" : "paused"}.`,
      });
      
      // Send Telegram notification
      notifyAlertPaused(data.id, !data.active).catch(console.error);
    },
    onError: (error) => {
      toast({
        title: "Failed to toggle alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      // Fetch alert data before deleting for notification
      const { data: alert } = await supabase
        .from("alerts")
        .select("symbol, condition_type, threshold")
        .eq("id", id)
        .single();
      
      const { error } = await supabase.from("alerts").delete().eq("id", id);

      if (error) throw error;
      
      return alert;
    },
    onSuccess: async (deletedAlert) => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: "Alert deleted",
        description: "Your alert has been deleted.",
      });
      
      // Send Telegram notification with alert details
      if (deletedAlert) {
        notifyAlertDeleted(
          deletedAlert.symbol, 
          deletedAlert.condition_type, 
          deletedAlert.threshold
        ).catch(console.error);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to delete alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    alerts: alertsQuery.data ?? [],
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    createAlert,
    updateAlert,
    toggleAlert,
    deleteAlert,
  };
}
