import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type PatternTag = Tables<"pattern_tags">;
export type CandlestickTag = Tables<"candlestick_tags">;
export type VolumeTag = Tables<"volume_tags">;
export type MistakeTag = Tables<"mistake_tags">;

export function useAvailableTags() {
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

  return {
    patterns: patternTagsQuery.data || [],
    candlesticks: candlestickTagsQuery.data || [],
    volumes: volumeTagsQuery.data || [],
    mistakes: mistakeTagsQuery.data || [],
    isLoading:
      patternTagsQuery.isLoading ||
      candlestickTagsQuery.isLoading ||
      volumeTagsQuery.isLoading ||
      mistakeTagsQuery.isLoading,
  };
}
