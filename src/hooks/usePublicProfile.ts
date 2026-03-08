import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export interface PublicProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_public: boolean;
  disclaimer: string | null;
  monthly_stats: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function usePublicProfile(userId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetId = userId || user?.id;

  const { data: publicProfile, isLoading } = useQuery({
    queryKey: ["public-profile", targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("user_id", targetId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as PublicProfile | null;
    },
    enabled: !!targetId,
  });

  const upsertProfile = useMutation({
    mutationFn: async (updates: Partial<Omit<PublicProfile, "monthly_stats">> & { monthly_stats?: Json }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data: existing } = await supabase
        .from("public_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("public_profiles")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("public_profiles")
          .insert({ user_id: user.id, ...updates });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["public-profile", user?.id] }),
  });

  return { publicProfile, isLoading, upsertProfile };
}
