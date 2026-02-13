import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  symbol: string;
  exchange: string | null;
  security_id: string | null;
  exchange_segment: string | null;
  notes: string | null;
  sort_order: number | null;
  added_at: string | null;
}

export function useWatchlists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const watchlistsQuery = useQuery({
    queryKey: ["watchlists", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("watchlists" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Watchlist[];
    },
    enabled: !!user,
  });

  const createWatchlist = useMutation({
    mutationFn: async (input: { name: string; description?: string; color?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("watchlists" as any)
        .insert({ ...input, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Watchlist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      toast({ title: "Watchlist created" });
    },
    onError: (e) => toast({ title: "Failed to create watchlist", description: e.message, variant: "destructive" }),
  });

  const updateWatchlist = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; color?: string }) => {
      const { data, error } = await supabase
        .from("watchlists" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      toast({ title: "Watchlist updated" });
    },
    onError: (e) => toast({ title: "Failed to update", description: e.message, variant: "destructive" }),
  });

  const deleteWatchlist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("watchlists" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      toast({ title: "Watchlist deleted" });
    },
    onError: (e) => toast({ title: "Failed to delete", description: e.message, variant: "destructive" }),
  });

  return {
    watchlists: watchlistsQuery.data ?? [],
    isLoading: watchlistsQuery.isLoading,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
  };
}

export function useWatchlistItems(watchlistId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ["watchlist-items", watchlistId],
    queryFn: async () => {
      if (!watchlistId) return [];
      const { data, error } = await supabase
        .from("watchlist_items" as any)
        .select("*")
        .eq("watchlist_id", watchlistId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as WatchlistItem[];
    },
    enabled: !!watchlistId,
  });

  const addItem = useMutation({
    mutationFn: async (input: {
      watchlist_id: string;
      symbol: string;
      exchange?: string;
      security_id?: string;
      exchange_segment?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("watchlist_items" as any)
        .insert(input as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist-items"] });
      toast({ title: "Symbol added" });
    },
    onError: (e) => toast({ title: "Failed to add", description: e.message, variant: "destructive" }),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("watchlist_items" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist-items"] });
      toast({ title: "Symbol removed" });
    },
    onError: (e) => toast({ title: "Failed to remove", description: e.message, variant: "destructive" }),
  });

  return {
    items: itemsQuery.data ?? [],
    isLoading: itemsQuery.isLoading,
    addItem,
    removeItem,
  };
}
