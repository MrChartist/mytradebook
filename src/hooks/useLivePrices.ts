import { useState, useEffect, useCallback, useRef } from "react";
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

export interface InstrumentInput {
  symbol: string;
  security_id?: string | null;
  exchange_segment?: string | null;
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
  symbolsOrInstruments: string[] | InstrumentInput[],
  intervalMs = 30000
): UseLivePricesResult {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize input: determine if we have instruments or plain symbols
  const instruments: InstrumentInput[] =
    symbolsOrInstruments.length > 0 && typeof symbolsOrInstruments[0] === "object"
      ? (symbolsOrInstruments as InstrumentInput[])
      : (symbolsOrInstruments as string[]).map((s) => ({ symbol: s }));

  const symbols = instruments.map((i) => i.symbol);

  // Stable key for dependency tracking
  const stableKey = instruments
    .map((i) => `${i.symbol}:${i.security_id || ""}:${i.exchange_segment || ""}`)
    .sort()
    .join(",");

  const fetchPrices = useCallback(async () => {
    if (instruments.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build the request body with instrument details when available
      const hasInstrumentDetails = instruments.some((i) => i.security_id);
      const body: Record<string, any> = {};

      if (hasInstrumentDetails) {
        body.instruments = instruments.map((i) => ({
          symbol: i.symbol,
          security_id: i.security_id || undefined,
          exchange_segment: i.exchange_segment || undefined,
        }));
      } else {
        body.symbols = symbols;
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        "get-live-prices",
        { body }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error === "token_expired") {
        setError("Dhan token expired — update in Settings");
        return;
      }

      if (data?.success && data?.prices && Object.keys(data.prices).length > 0) {
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
  }, [stableKey]);

  useEffect(() => {
    if (instruments.length === 0 || !isPolling) return;

    fetchPrices();
    const interval = setInterval(fetchPrices, intervalMs);
    return () => clearInterval(interval);
  }, [stableKey, intervalMs, isPolling, fetchPrices]);

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
