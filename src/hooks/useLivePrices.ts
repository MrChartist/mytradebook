import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LIVE_PRICE_POLL_INTERVAL_MS } from "@/lib/constants";

interface PriceData {
  ltp: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
  volume?: number;
  source?: "dhan" | "yahoo" | "unavailable";
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
  primarySource: "dhan" | "yahoo" | "unavailable" | null;
  yahooFallbackUsed: boolean;
}

export function useLivePrices(
  symbolsOrInstruments: string[] | InstrumentInput[],
  intervalMs = LIVE_PRICE_POLL_INTERVAL_MS
): UseLivePricesResult {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primarySource, setPrimarySource] = useState<"dhan" | "yahoo" | "unavailable" | null>(null);
  const [yahooFallbackUsed, setYahooFallbackUsed] = useState(false);

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

  const fetchPrices = useCallback(async (signal?: AbortSignal) => {
    if (instruments.length === 0) return;

    // Don't start new fetch if aborted
    if (signal?.aborted) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build the request body with instrument details when available
      const hasInstrumentDetails = instruments.some((i) => i.security_id);
      const body: Record<string, unknown> = {};

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

      // Check if aborted after async operation
      if (signal?.aborted) return;

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error === "token_expired" && !data?.yahoo_fallback_used) {
        setError("Dhan token expired — update in Settings");
        return;
      }

      if (data?.error === "data_api_not_subscribed" && !data?.yahoo_fallback_used) {
        setError("Dhan Data API not active — subscribe at web.dhan.co → My Profile → Access DhanHQ APIs");
        return;
      }

      if (data?.success && data?.prices && Object.keys(data.prices).length > 0) {
        const validPrices: Record<string, PriceData> = {};
        for (const [sym, priceData] of Object.entries(data.prices)) {
          if (
            typeof priceData === 'object' &&
            priceData !== null &&
            'ltp' in priceData &&
            typeof priceData.ltp === 'number' &&
            priceData.ltp > 0
          ) {
            validPrices[sym] = priceData as PriceData;
          }
        }
        if (Object.keys(validPrices).length > 0) {
          setPrices(validPrices);
          setLastUpdated(new Date());
        }

        // Track source info
        setPrimarySource(data.source || null);
        setYahooFallbackUsed(!!data.yahoo_fallback_used);

        // Show soft warning when Yahoo is in use
        if (data.yahoo_fallback_used && data.dhan_failed) {
          setError("Using delayed prices (Yahoo) — Dhan unavailable");
        }
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (e) {
      // Don't update error state if aborted
      if (signal?.aborted) return;

      console.error("Price polling error:", e);
      setError(e instanceof Error ? e.message : "Failed to fetch prices");
    } finally {
      // Don't update loading state if aborted
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [stableKey]);

  useEffect(() => {
    if (instruments.length === 0 || !isPolling) return;

    // Create AbortController for cleanup
    const abortController = new AbortController();
    const { signal } = abortController;

    // Initial fetch
    fetchPrices(signal);

    // Set up polling interval
    const interval = setInterval(() => {
      fetchPrices(signal);
    }, intervalMs);

    // Cleanup: abort in-flight requests and clear interval
    return () => {
      abortController.abort();
      clearInterval(interval);
    };
  }, [stableKey, intervalMs, isPolling, fetchPrices]);

  return {
    prices,
    isPolling,
    setIsPolling,
    lastUpdated,
    isLoading,
    error,
    refresh: fetchPrices,
    primarySource,
    yahooFallbackUsed,
  };
}
