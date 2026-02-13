import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TradingRule {
  id: string;
  user_id: string;
  rule_text: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export function useTradingRules() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["trading-rules", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("trading_rules")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as TradingRule[];
    },
    enabled: !!user?.id,
  });

  const addRule = useMutation({
    mutationFn: async (ruleText: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("trading_rules").insert({
        user_id: user.id,
        rule_text: ruleText,
        sort_order: rules.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading-rules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteRule = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase.from("trading_rules").delete().eq("id", ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading-rules"] });
    },
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("trading_rules").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading-rules"] });
    },
  });

  return { rules, isLoading, addRule, deleteRule, toggleRule };
}
