import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PriceData {
  ltp: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
  volume?: number;
}

interface UseLivePricesResult {
  prices: Record<string, PriceData>;
  isPolling: boolean;
  setIsPolling: (polling: boolean) => void;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLivePrices(
  symbols: string[],
  intervalMs = 30000
): UseLivePricesResult {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "get-live-prices",
        {
          body: { symbols },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error === "token_expired") {
        setError("Dhan token expired — update in Settings");
        return;
      }

      if (data?.success && data?.prices && Object.keys(data.prices).length > 0) {
        // Only update prices that have valid LTP values (> 0)
        const validPrices: Record<string, PriceData> = {};
        for (const [sym, priceData] of Object.entries(data.prices)) {
          const p = priceData as any;
          if (p && p.ltp && p.ltp > 0) {
            validPrices[sym] = p;
          }
        }
        if (Object.keys(validPrices).length > 0) {
          setPrices(validPrices);
          setLastUpdated(new Date());
        }
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error("Price polling error:", e);
      setError(e instanceof Error ? e.message : "Failed to fetch prices");
    } finally {
      setIsLoading(false);
    }
  }, [symbols.join(",")]);

  useEffect(() => {
    if (symbols.length === 0 || !isPolling) return;

    // Initial fetch
    fetchPrices();

    // Set up polling interval
    const interval = setInterval(fetchPrices, intervalMs);

    return () => clearInterval(interval);
  }, [symbols.join(","), intervalMs, isPolling, fetchPrices]);

  return {
    prices,
    isPolling,
    setIsPolling,
    lastUpdated,
    isLoading,
    error,
    refresh: fetchPrices,
  };
}
