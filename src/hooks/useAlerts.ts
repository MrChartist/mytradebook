import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Alert = Database["public"]["Tables"]["alerts"]["Row"];
type AlertInsert = Database["public"]["Tables"]["alerts"]["Insert"];
type AlertUpdate = Database["public"]["Tables"]["alerts"]["Update"];

export function useAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ["alerts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Alert[];
    },
    enabled: !!user,
  });

  const createAlert = useMutation({
    mutationFn: async (
      input: Omit<AlertInsert, "user_id" | "id" | "created_at">
    ) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("alerts")
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: "Alert created",
        description: "Your alert has been created successfully.",
      });
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
    }: AlertUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("alerts")
        .update(updates)
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: data.active ? "Alert activated" : "Alert paused",
        description: `Alert for ${data.symbol} has been ${data.active ? "activated" : "paused"}.`,
      });
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
      const { error } = await supabase.from("alerts").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: "Alert deleted",
        description: "Your alert has been deleted.",
      });
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
