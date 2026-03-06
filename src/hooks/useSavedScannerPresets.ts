import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SavedScannerPreset {
  id: string;
  user_id: string;
  name: string;
  filters: { field: string; op: string; value: number }[];
  sort_by: string | null;
  sort_order: string | null;
  created_at: string;
}

export function useSavedScannerPresets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: presets = [], isLoading } = useQuery({
    queryKey: ["saved-scanner-presets", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await (supabase as any)
        .from("saved_scanner_presets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as SavedScannerPreset[];
    },
    enabled: !!user?.id,
  });

  const createPreset = useMutation({
    mutationFn: async (preset: { name: string; filters: any[]; sort_by?: string; sort_order?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("saved_scanner_presets")
        .insert({ ...preset, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-scanner-presets"] });
      toast.success("Preset saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deletePreset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("saved_scanner_presets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-scanner-presets"] });
      toast.success("Preset deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { presets, isLoading, createPreset, deletePreset };
}
