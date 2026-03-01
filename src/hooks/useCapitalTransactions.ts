import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CapitalTransaction {
  id: string;
  user_id: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  transaction_date: string;
  notes: string | null;
  created_at: string;
}

export function useCapitalTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["capital-transactions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("capital_transactions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as CapitalTransaction[];
    },
    enabled: !!user?.id,
  });

  const totalDeposited = transactions
    .filter((t) => t.type === "DEPOSIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalWithdrawn = transactions
    .filter((t) => t.type === "WITHDRAWAL")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const addTransaction = useMutation({
    mutationFn: async (tx: { type: "DEPOSIT" | "WITHDRAWAL"; amount: number; transaction_date: string; notes?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("capital_transactions" as any)
        .insert({ user_id: user.id, ...tx } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capital-transactions", user?.id] });
      toast.success("Transaction added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("capital_transactions" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capital-transactions", user?.id] });
      toast.success("Transaction deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { transactions, isLoading, totalDeposited, totalWithdrawn, addTransaction, deleteTransaction };
}
