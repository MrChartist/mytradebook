import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const KNOWN_INDICES = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX", "MIDCPNIFTY", "NIFTYNXT50", "BANKEX"];

export function useFnoUnderlyings() {
  const { data, isLoading } = useQuery({
    queryKey: ["fno-underlyings"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_fno_underlyings");

      if (error) throw error;

      const symbols = (data || []).map((r: { underlying_symbol: string }) => r.underlying_symbol);

      const indices = symbols.filter(s => KNOWN_INDICES.includes(s));
      const stocks = symbols.filter(s => !KNOWN_INDICES.includes(s));

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
