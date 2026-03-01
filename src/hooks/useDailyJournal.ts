import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface DailyJournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  mood: "great" | "good" | "neutral" | "bad" | "terrible" | null;
  pre_market_plan: string | null;
  post_market_review: string | null;
  market_outlook: string | null;
  lessons_learned: string | null;
  created_at: string;
  updated_at: string;
}

export function useDailyJournal(date?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const entryQuery = useQuery({
    queryKey: ["daily-journal", user?.id, date],
    queryFn: async () => {
      if (!user?.id || !date) return null;
      const { data, error } = await supabase
        .from("daily_journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", date)
        .maybeSingle();
      if (error) throw error;
      return data as DailyJournalEntry | null;
    },
    enabled: !!user?.id && !!date,
  });

  const entriesQuery = useQuery({
    queryKey: ["daily-journal-list", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("daily_journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(90);
      if (error) throw error;
      return data as DailyJournalEntry[];
    },
    enabled: !!user?.id,
  });

  const upsertEntry = useMutation({
    mutationFn: async (entry: Partial<DailyJournalEntry> & { entry_date: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("daily_journal_entries")
        .upsert(
          { ...entry, user_id: user.id },
          { onConflict: "user_id,entry_date" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-journal"] });
      queryClient.invalidateQueries({ queryKey: ["daily-journal-list"] });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save journal", description: err.message, variant: "destructive" });
    },
  });

  return {
    entry: entryQuery.data,
    entries: entriesQuery.data || [],
    isLoading: entryQuery.isLoading,
    upsertEntry,
  };
}
