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
  delayed?: boolean;   // true for Yahoo Finance (15-min delay)
  warning?: string;
}

export interface InstrumentInput {
  symbol: string;
  security_id?: string | null;
  exchange_segment?: string | null;
  isUS?: boolean;  // true for US market symbols (AAPL, TSLA, etc.)
}

interface UseLivePricesResult {
  prices: Record<string, PriceData>;
  isPolling: boolean;
  setIsPolling: (polling: boolean) => void;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  /** Soft flag: Dhan token expired but prices may still be available via Yahoo */
  dhanTokenExpired: boolean;
  refresh: () => Promise<void>;
  activeProvider: "dhan" | "yahoo" | "unavailable";
  failoverActive: boolean;
  isStale: boolean;
}

const STALE_THRESHOLD_MS = 90_000;

export function useLivePrices(
  symbolsOrInstruments: string[] | InstrumentInput[],
  intervalMs = LIVE_PRICE_POLL_INTERVAL_MS
): UseLivePricesResult {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isPolling, setIsPollingState] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dhanTokenExpired, setDhanTokenExpired] = useState(false);
  const [activeProvider, setActiveProvider] = useState<"dhan" | "yahoo" | "unavailable">("unavailable");
  const [failoverActive, setFailoverActive] = useState(false);
  const [isStale, setIsStale] = useState(false);

  const isVisibleRef = useRef(true);
  const consecutiveFailsRef = useRef(0);

  const setIsPolling = (polling: boolean) => setIsPollingState(polling);

  const instruments: InstrumentInput[] =
    symbolsOrInstruments.length > 0 && typeof symbolsOrInstruments[0] === "object"
      ? (symbolsOrInstruments as InstrumentInput[])
      : (symbolsOrInstruments as string[]).map((s) => ({ symbol: s }));

  const indiaInstruments = instruments.filter((i) => !i.isUS);
  const usInstruments = instruments.filter((i) => i.isUS);
  const allSymbols = instruments.map((i) => i.symbol);

  const stableKey = instruments
    .map((i) => `${i.symbol}:${i.security_id || ""}:${i.exchange_segment || ""}:${i.isUS ? "US" : "IN"}`)
    .sort().join(",");

  useEffect(() => {
    const handleVisibility = () => {
      isVisibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (!lastUpdated) return;
    const checkStale = () => setIsStale(Date.now() - lastUpdated.getTime() > STALE_THRESHOLD_MS);
    checkStale();
    const timer = setInterval(checkStale, 10_000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Market hours check (IST 9:15 AM – 3:30 PM, Mon–Fri)
  const isMarketOpen = useCallback((): boolean => {
    const now = new Date();
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const istMinutes = utcMinutes + 330; // IST = UTC + 5:30
    const istTimeNorm = istMinutes >= 1440 ? istMinutes - 1440 : istMinutes;
    const marketOpen = 9 * 60 + 15;  // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM
    // Get IST day of week
    const istDate = new Date(now.getTime() + 330 * 60000);
    const dayOfWeek = istDate.getUTCDay(); // 0=Sun, 6=Sat
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    return istTimeNorm >= marketOpen && istTimeNorm <= marketClose;
  }, []);

  const fetchPrices = useCallback(async (signal?: AbortSignal, isManual = false) => {
    if (instruments.length === 0) return;
    if (signal?.aborted) return;
    if (!isVisibleRef.current) return;
    // Skip automatic polls outside market hours (manual refresh always works)
    if (!isManual && !isMarketOpen()) return;

    setIsLoading(true);
    setError(null);

    try {
      const hasInstrumentDetails = indiaInstruments.some((i) => i.security_id);
      const body: Record<string, unknown> = {};

      if (hasInstrumentDetails) {
        body.instruments = indiaInstruments.map((i) => ({
          symbol: i.symbol,
          security_id: i.security_id || undefined,
          exchange_segment: i.exchange_segment || undefined,
        }));
      } else if (indiaInstruments.length > 0) {
        body.symbols = indiaInstruments.map((i) => i.symbol);
      }

      if (usInstruments.length > 0) {
        body.us_symbols = usInstruments.map((i) => i.symbol);
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        "get-live-prices",
        { body }
      );

      if (signal?.aborted) return;
      if (fnError) throw new Error(fnError.message);

      // Soft flag — Dhan token expired but Yahoo may have filled in prices
      if (data?.dhan_token_expired) {
        setDhanTokenExpired(true);
        // Only show error if we got NO prices at all
        if (!data?.prices || Object.keys(data.prices).length === 0) {
          setError("Unable to fetch prices. Check your Dhan token in Settings → Integrations.");
          return;
        }
        // Otherwise prices came from Yahoo — don't show error, just note the fallback
      } else {
        setDhanTokenExpired(false);
      }

      if (data?.success && data?.prices && Object.keys(data.prices).length > 0) {
        const validPrices: Record<string, PriceData> = {};
        for (const [sym, priceData] of Object.entries(data.prices)) {
          if (
            typeof priceData === "object" && priceData !== null &&
            "ltp" in priceData && typeof (priceData as any).ltp === "number" &&
            (priceData as any).ltp > 0
          ) {
            validPrices[sym] = priceData as PriceData;
          }
        }
        if (Object.keys(validPrices).length > 0) {
          setPrices((prev) => ({ ...prev, ...validPrices }));
          setLastUpdated(new Date());
          setIsStale(false);
          consecutiveFailsRef.current = 0;
        }
        if (data.source) setActiveProvider(data.source);
        if (data.failover_active !== undefined) setFailoverActive(data.failover_active);
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (e) {
      if (signal?.aborted) return;
      consecutiveFailsRef.current += 1;
      console.error("Price polling error:", e);
      if (consecutiveFailsRef.current >= 2) {
        setError(e instanceof Error ? e.message : "Failed to fetch prices");
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [stableKey]);

  useEffect(() => {
    if (instruments.length === 0 || !isPolling) return;

    setDhanTokenExpired(false);
    const abortController = new AbortController();
    const { signal } = abortController;

    fetchPrices(signal);
    const interval = setInterval(() => {
      if (isVisibleRef.current) fetchPrices(signal);
    }, intervalMs);

    return () => {
      abortController.abort();
      clearInterval(interval);
    };
  }, [stableKey, intervalMs, isPolling, fetchPrices]);

  useEffect(() => {
    const current = new Set(allSymbols);
    setPrices((prev) => {
      const cleaned: Record<string, PriceData> = {};
      for (const [sym, data] of Object.entries(prev)) {
        if (current.has(sym)) cleaned[sym] = data;
      }
      return cleaned;
    });
  }, [stableKey]);

  return {
    prices, isPolling, setIsPolling, lastUpdated,
    isLoading, error, dhanTokenExpired,
    refresh: () => fetchPrices(undefined, true), activeProvider, failoverActive, isStale,
  };
}
