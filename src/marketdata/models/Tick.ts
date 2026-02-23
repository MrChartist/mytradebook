/**
 * Standardized tick model for all market data providers.
 * All providers must convert their raw messages into this format.
 */
export interface Tick {
  symbol: string;           // e.g., "RELIANCE"
  ltp: number;
  bid?: number;
  ask?: number;
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
  volume?: number;
  oi?: number;
  change: number;
  changePercent: number;
  timestamp: number;        // epoch ms
  provider: MarketDataProviderName;
}

export type MarketDataProviderName = "dhan" | "truedata";
