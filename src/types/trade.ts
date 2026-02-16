/**
 * Type Definitions for Trade-related Data Structures
 *
 * These types provide proper TypeScript support for trade entities
 * and replace unsafe 'any' types throughout the codebase.
 */

/**
 * Trade Target Definition
 * Represents a single price target for a trade
 */
export interface TradeTarget {
  price: number;
  quantity?: number;  // Quantity to exit at this target (optional)
  hit?: boolean;      // Whether target was hit
  hit_at?: string;    // ISO timestamp when target was hit
}

/**
 * Trade Targets Array
 * Most trades have 0-3 targets
 */
export type TradeTargets = TradeTarget[];

/**
 * Alert Parameters
 * Dynamic parameters for different alert condition types
 */
export interface AlertParameters {
  // For PERCENT_CHANGE alerts
  percent_threshold?: number;
  lookback_period?: number;

  // For VOLUME_SPIKE alerts
  volume_multiplier?: number;
  average_period?: number;

  // For CUSTOM alerts
  custom_condition?: string;

  // General parameters
  [key: string]: unknown;  // Allow additional fields
}

/**
 * Trade Chart Image
 * Represents an uploaded chart image for a trade
 */
export interface TradeChartImage {
  url: string;
  filename?: string;
  uploaded_at?: string;
  size?: number;  // File size in bytes
}

/**
 * Trade OHLC Data
 * Open, High, Low, Close data points
 */
export interface TradeOHLC {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp?: string;
}

/**
 * Strategy Leg (for multi-leg options strategies)
 */
export interface StrategyLeg {
  symbol: string;
  strike: number;
  option_type: 'CALL' | 'PUT';
  quantity: number;
  entry_price: number;
  exit_price?: number;
  position_type: 'LONG' | 'SHORT';
}

/**
 * Weekly Report Metrics
 */
export interface WeeklyReportMetrics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  avg_pnl_per_trade: number;
  largest_win: number;
  largest_loss: number;
  sharpe_ratio?: number;
}

/**
 * Dashboard Layout Widget Configuration
 */
export interface DashboardWidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  size?: 'small' | 'medium' | 'large';
}
