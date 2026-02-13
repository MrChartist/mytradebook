import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Scanner {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  scan_type: string;
  conditions: any[];
  exchange: string | null;
  is_system: boolean | null;
  last_run_at: string | null;
  last_result_count: number | null;
  active: boolean | null;
  run_interval_minutes: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ScannerResult {
  id: string;
  scanner_id: string;
  symbol: string;
  exchange: string | null;
  security_id: string | null;
  metadata: any;
  matched_at: string | null;
}

// Predefined scanner templates
export const scannerTemplates = [
  {
    name: "52-Week High Breakout",
    description: "Stocks breaking above 52-week high with volume confirmation",
    scan_type: "breakout_52w_high",
    conditions: [{ type: "price_near_52w_high", threshold: 2 }, { type: "volume_above_avg", multiplier: 1.5 }],
  },
  {
    name: "52-Week Low Breakdown",
    description: "Stocks breaking below 52-week low",
    scan_type: "breakdown_52w_low",
    conditions: [{ type: "price_near_52w_low", threshold: 2 }],
  },
  {
    name: "Volume Spike (2x+)",
    description: "Stocks with volume 2x or more than 20-day average",
    scan_type: "volume_spike",
    conditions: [{ type: "volume_above_avg", multiplier: 2, lookback: 20 }],
  },
  {
    name: "Gap Up > 2%",
    description: "Stocks opening 2%+ above previous close",
    scan_type: "gap_up",
    conditions: [{ type: "gap_percent", direction: "up", threshold: 2 }],
  },
  {
    name: "Gap Down > 2%",
    description: "Stocks opening 2%+ below previous close",
    scan_type: "gap_down",
    conditions: [{ type: "gap_percent", direction: "down", threshold: 2 }],
  },
  {
    name: "Range Breakout (Yesterday High)",
    description: "Stocks breaking above yesterday's high",
    scan_type: "range_break_high",
    conditions: [{ type: "price_above_prev_high" }],
  },
  {
    name: "Range Breakdown (Yesterday Low)",
    description: "Stocks breaking below yesterday's low",
    scan_type: "range_break_low",
    conditions: [{ type: "price_below_prev_low" }],
  },
  {
    name: "Top Gainers (> 3%)",
    description: "Stocks up more than 3% today",
    scan_type: "top_gainers",
    conditions: [{ type: "day_change_percent", direction: "up", threshold: 3 }],
  },
  {
    name: "Top Losers (> 3%)",
    description: "Stocks down more than 3% today",
    scan_type: "top_losers",
    conditions: [{ type: "day_change_percent", direction: "down", threshold: 3 }],
  },
];

export function useScanners() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scannersQuery = useQuery({
    queryKey: ["scanners", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("scanner_definitions" as any)
        .select("*")
        .or(`user_id.eq.${user.id},is_system.eq.true`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Scanner[];
    },
    enabled: !!user,
  });

  const createScanner = useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      scan_type: string;
      conditions: any[];
      exchange?: string;
      run_interval_minutes?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("scanner_definitions" as any)
        .insert({ ...input, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Scanner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scanners"] });
      toast({ title: "Scanner created" });
    },
    onError: (e) => toast({ title: "Failed to create scanner", description: e.message, variant: "destructive" }),
  });

  const deleteScanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scanner_definitions" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scanners"] });
      toast({ title: "Scanner deleted" });
    },
    onError: (e) => toast({ title: "Failed to delete", description: e.message, variant: "destructive" }),
  });

  return {
    scanners: scannersQuery.data ?? [],
    isLoading: scannersQuery.isLoading,
    createScanner,
    deleteScanner,
  };
}

export function useScannerResults(scannerId: string | null) {
  const resultsQuery = useQuery({
    queryKey: ["scanner-results", scannerId],
    queryFn: async () => {
      if (!scannerId) return [];
      const { data, error } = await supabase
        .from("scanner_results" as any)
        .select("*")
        .eq("scanner_id", scannerId)
        .order("matched_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ScannerResult[];
    },
    enabled: !!scannerId,
  });

  return {
    results: resultsQuery.data ?? [],
    isLoading: resultsQuery.isLoading,
  };
}
