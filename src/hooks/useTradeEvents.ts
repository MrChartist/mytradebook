import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notifyTradeEventAdded } from "@/lib/telegram";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type TradeEvent = Tables<"trade_events">;
export type TradeEventInsert = TablesInsert<"trade_events">;

export function useTradeEvents(tradeId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ["trade-events", tradeId],
    queryFn: async () => {
      if (!tradeId) return [];

      const { data, error } = await supabase
        .from("trade_events")
        .select("*")
        .eq("trade_id", tradeId)
        .order("timestamp", { ascending: true });

      if (error) throw error;
      return data as TradeEvent[];
    },
    enabled: !!tradeId,
  });

  const addEvent = useMutation({
    mutationFn: async (event: Omit<TradeEventInsert, "trade_id"> & { trade_id?: string }) => {
      if (!tradeId) throw new Error("Trade ID required");

      const { data, error } = await supabase
        .from("trade_events")
        .insert({ ...event, trade_id: tradeId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["trade-events", tradeId] });
      toast({
        title: "Event added",
        description: "Trade event has been logged.",
      });
      
      // Send Telegram notification
      if (tradeId) {
        notifyTradeEventAdded(
          tradeId, 
          data.event_type, 
          data.price, 
          data.notes || undefined
        ).catch(console.error);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    addEvent,
  };
}
