import type { MarketDataProviderName } from "./models/Tick";

export interface MarketDataConfig {
  primaryProvider: MarketDataProviderName;
  secondaryProvider: MarketDataProviderName;
  enableFailover: boolean;
  staleTickSeconds: number;
  maxRetries: number;
  pollIntervalMs: number;
}

export const MARKET_DATA_CONFIG: MarketDataConfig = {
  primaryProvider: "dhan",
  secondaryProvider: "truedata",
  enableFailover: true,
  staleTickSeconds: 90,       // 3 missed polls = stale
  maxRetries: 3,
  pollIntervalMs: 30000,
};
