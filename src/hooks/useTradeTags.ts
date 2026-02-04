import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type PatternTag = Tables<"pattern_tags">;
export type CandlestickTag = Tables<"candlestick_tags">;
export type VolumeTag = Tables<"volume_tags">;
export type MistakeTag = Tables<"mistake_tags">;

export function useTradeTags(tradeId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available tags
  const patternTagsQuery = useQuery({
    queryKey: ["pattern-tags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pattern_tags").select("*");
      if (error) throw error;
      return data as PatternTag[];
    },
  });

  const candlestickTagsQuery = useQuery({
    queryKey: ["candlestick-tags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("candlestick_tags").select("*");
      if (error) throw error;
      return data as CandlestickTag[];
    },
  });

  const volumeTagsQuery = useQuery({
    queryKey: ["volume-tags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("volume_tags").select("*");
      if (error) throw error;
      return data as VolumeTag[];
    },
  });

  const mistakeTagsQuery = useQuery({
    queryKey: ["mistake-tags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mistake_tags").select("*");
      if (error) throw error;
      return data as MistakeTag[];
    },
  });

  // Fetch trade's linked tags
  const tradePatterns = useQuery({
    queryKey: ["trade-patterns", tradeId],
    queryFn: async () => {
      if (!tradeId) return [];
      const { data, error } = await supabase
        .from("trade_patterns")
        .select("pattern_id, pattern_tags(*)")
        .eq("trade_id", tradeId);
      if (error) throw error;
      return data.map((d) => d.pattern_tags) as PatternTag[];
    },
    enabled: !!tradeId,
  });

  const tradeCandlesticks = useQuery({
    queryKey: ["trade-candlesticks", tradeId],
    queryFn: async () => {
      if (!tradeId) return [];
      const { data, error } = await supabase
        .from("trade_candlesticks")
        .select("candlestick_id, candlestick_tags(*)")
        .eq("trade_id", tradeId);
      if (error) throw error;
      return data.map((d) => d.candlestick_tags) as CandlestickTag[];
    },
    enabled: !!tradeId,
  });

  const tradeVolume = useQuery({
    queryKey: ["trade-volume", tradeId],
    queryFn: async () => {
      if (!tradeId) return [];
      const { data, error } = await supabase
        .from("trade_volume")
        .select("volume_id, volume_tags(*)")
        .eq("trade_id", tradeId);
      if (error) throw error;
      return data.map((d) => d.volume_tags) as VolumeTag[];
    },
    enabled: !!tradeId,
  });

  const tradeMistakes = useQuery({
    queryKey: ["trade-mistakes", tradeId],
    queryFn: async () => {
      if (!tradeId) return [];
      const { data, error } = await supabase
        .from("trade_mistakes")
        .select("mistake_id, mistake_tags(*)")
        .eq("trade_id", tradeId);
      if (error) throw error;
      return data.map((d) => d.mistake_tags) as MistakeTag[];
    },
    enabled: !!tradeId,
  });

  // Add tag mutations
  const addPattern = useMutation({
    mutationFn: async (patternId: string) => {
      if (!tradeId) throw new Error("Trade ID required");
      const { error } = await supabase
        .from("trade_patterns")
        .insert({ trade_id: tradeId, pattern_id: patternId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-patterns", tradeId] });
      toast({ title: "Pattern added" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addCandlestick = useMutation({
    mutationFn: async (candlestickId: string) => {
      if (!tradeId) throw new Error("Trade ID required");
      const { error } = await supabase
        .from("trade_candlesticks")
        .insert({ trade_id: tradeId, candlestick_id: candlestickId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-candlesticks", tradeId] });
      toast({ title: "Candlestick pattern added" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addVolume = useMutation({
    mutationFn: async (volumeId: string) => {
      if (!tradeId) throw new Error("Trade ID required");
      const { error } = await supabase
        .from("trade_volume")
        .insert({ trade_id: tradeId, volume_id: volumeId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-volume", tradeId] });
      toast({ title: "Volume tag added" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addMistake = useMutation({
    mutationFn: async (mistakeId: string) => {
      if (!tradeId) throw new Error("Trade ID required");
      const { error } = await supabase
        .from("trade_mistakes")
        .insert({ trade_id: tradeId, mistake_id: mistakeId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-mistakes", tradeId] });
      toast({ title: "Mistake tagged" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removePattern = useMutation({
    mutationFn: async (patternId: string) => {
      if (!tradeId) throw new Error("Trade ID required");
      const { error } = await supabase
        .from("trade_patterns")
        .delete()
        .eq("trade_id", tradeId)
        .eq("pattern_id", patternId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-patterns", tradeId] });
    },
  });

  const removeCandlestick = useMutation({
    mutationFn: async (candlestickId: string) => {
      if (!tradeId) throw new Error("Trade ID required");
      const { error } = await supabase
        .from("trade_candlesticks")
        .delete()
        .eq("trade_id", tradeId)
        .eq("candlestick_id", candlestickId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-candlesticks", tradeId] });
    },
  });

  const removeVolume = useMutation({
    mutationFn: async (volumeId: string) => {
      if (!tradeId) throw new Error("Trade ID required");
      const { error } = await supabase
        .from("trade_volume")
        .delete()
        .eq("trade_id", tradeId)
        .eq("volume_id", volumeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-volume", tradeId] });
    },
  });

  const removeMistake = useMutation({
    mutationFn: async (mistakeId: string) => {
      if (!tradeId) throw new Error("Trade ID required");
      const { error } = await supabase
        .from("trade_mistakes")
        .delete()
        .eq("trade_id", tradeId)
        .eq("mistake_id", mistakeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-mistakes", tradeId] });
    },
  });

  return {
    // Available tags
    allPatterns: patternTagsQuery.data || [],
    allCandlesticks: candlestickTagsQuery.data || [],
    allVolumes: volumeTagsQuery.data || [],
    allMistakes: mistakeTagsQuery.data || [],
    
    // Trade's tags
    patterns: tradePatterns.data || [],
    candlesticks: tradeCandlesticks.data || [],
    volumes: tradeVolume.data || [],
    mistakes: tradeMistakes.data || [],
    
    // Mutations
    addPattern,
    addCandlestick,
    addVolume,
    addMistake,
    removePattern,
    removeCandlestick,
    removeVolume,
    removeMistake,
    
    isLoading: 
      patternTagsQuery.isLoading || 
      candlestickTagsQuery.isLoading || 
      volumeTagsQuery.isLoading ||
      mistakeTagsQuery.isLoading,
  };
}
