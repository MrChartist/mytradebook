import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const KNOWN_INDICES = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX", "MIDCPNIFTY", "NIFTYNXT50", "BANKEX"];

export function useFnoUnderlyings() {
  const { data, isLoading } = useQuery({
    queryKey: ["fno-underlyings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instrument_master")
        .select("underlying_symbol")
        .eq("exchange", "NFO")
        .not("underlying_symbol", "is", null)
        .order("underlying_symbol", { ascending: true });

      if (error) throw error;

      const unique = [...new Set(
        (data || [])
          .map(r => r.underlying_symbol!)
          .filter(s => s && !s.includes("NSETEST"))
      )];

      const indices = unique.filter(s => KNOWN_INDICES.includes(s));
      const stocks = unique.filter(s => !KNOWN_INDICES.includes(s));

      return { indices, stocks, all: [...indices, ...stocks] };
    },
    staleTime: 1000 * 60 * 30, // 30 min cache
  });

  return {
    indices: data?.indices ?? KNOWN_INDICES,
    stocks: data?.stocks ?? [],
    all: data?.all ?? KNOWN_INDICES,
    isLoading,
  };
}
