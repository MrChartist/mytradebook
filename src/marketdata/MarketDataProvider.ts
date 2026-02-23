import type { Tick, MarketDataProviderName } from "./models/Tick";

/**
 * Interface for market data providers.
 * Implemented server-side in edge functions.
 * This type exists client-side for documentation and type-safety.
 */
export interface MarketDataProvider {
  name: MarketDataProviderName;
  fetchQuotes(instruments: MarketDataInstrument[]): Promise<Record<string, Tick>>;
  isAvailable(): boolean;
}

export interface MarketDataInstrument {
  symbol: string;
  security_id?: string | null;
  exchange_segment?: string | null;
}
