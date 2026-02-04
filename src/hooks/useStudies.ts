import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Study = Tables<"studies">;
export type StudyInsert = TablesInsert<"studies">;
export type StudyUpdate = TablesUpdate<"studies">;

export interface StudyFilters {
  category?: "Technical" | "Fundamental" | "News" | "Sentiment" | "Other";
  symbol?: string;
  fromDate?: string;
}

export function useStudies(filters?: StudyFilters) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const studiesQuery = useQuery({
    queryKey: ["studies", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("studies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.symbol) {
        query = query.ilike("symbol", `%${filters.symbol}%`);
      }
      if (filters?.fromDate) {
        query = query.gte("analysis_date", filters.fromDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Study[];
    },
    enabled: !!user?.id,
  });

  const createStudy = useMutation({
    mutationFn: async (study: Omit<StudyInsert, "user_id">) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("studies")
        .insert({ ...study, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      toast({
        title: "Study created",
        description: "Your study has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStudy = useMutation({
    mutationFn: async ({ id, ...updates }: StudyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("studies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      toast({
        title: "Study updated",
        description: "Study has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteStudy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("studies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      toast({
        title: "Study deleted",
        description: "Study has been deleted successfully.",
      });
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
    studies: studiesQuery.data || [],
    isLoading: studiesQuery.isLoading,
    error: studiesQuery.error,
    refetch: studiesQuery.refetch,
    createStudy,
    updateStudy,
    deleteStudy,
  };
}
