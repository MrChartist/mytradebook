/**
 * Application Constants
 *
 * Centralized constants to avoid magic numbers and improve maintainability.
 * All time values are in milliseconds unless otherwise specified.
 */

// ============================================
// POLLING & REFRESH INTERVALS
// ============================================

/** Live price polling interval (30 seconds) */
export const LIVE_PRICE_POLL_INTERVAL_MS = 30000;

/** Alert evaluation check interval (5 minutes) */
export const ALERT_CHECK_INTERVAL_MS = 5 * 60 * 1000;

/** Token refresh check interval (24 hours) */
export const TOKEN_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

// ============================================
// TIMEOUTS & DELAYS
// ============================================

/** Request timeout for API calls (30 seconds) */
export const API_REQUEST_TIMEOUT_MS = 30000;

/** Debounce delay for search inputs (300ms) */
export const SEARCH_DEBOUNCE_MS = 300;

/** Toast notification duration (5 seconds) */
export const TOAST_DURATION_MS = 5000;

// ============================================
// PAGINATION & LIMITS
// ============================================

/** Default page size for trades list */
export const DEFAULT_PAGE_SIZE = 50;

/** Maximum trades to display without pagination */
export const MAX_TRADES_WITHOUT_PAGINATION = 100;

/** Maximum alerts per user (soft limit) */
export const MAX_ALERTS_PER_USER = 100;

/** Maximum chart images per trade */
export const MAX_CHART_IMAGES_PER_TRADE = 5;

// ============================================
// VALIDATION LIMITS
// ============================================

/** Minimum password length */
export const MIN_PASSWORD_LENGTH = 8;

/** Maximum trade quantity */
export const MAX_TRADE_QUANTITY = 1000000;

/** Maximum number of targets per trade */
export const MAX_TARGETS_PER_TRADE = 3;

/** Minimum entry price (to prevent accidental zeros) */
export const MIN_ENTRY_PRICE = 0.01;

/** Maximum entry price (sanity check) */
export const MAX_ENTRY_PRICE = 1000000;

// ============================================
// TELEGRAM CONFIGURATION
// ============================================

/** Telegram verification code length */
export const TELEGRAM_CODE_LENGTH = 12;

/** Telegram verification code expiry (15 minutes) */
export const TELEGRAM_CODE_EXPIRY_MS = 15 * 60 * 1000;

/** Telegram message character limit */
export const TELEGRAM_MESSAGE_MAX_LENGTH = 4096;

/** Telegram caption character limit (for images) */
export const TELEGRAM_CAPTION_MAX_LENGTH = 1024;

// ============================================
// TRADING CONFIGURATION
// ============================================

/** Market hours - Opening time (IST) */
export const MARKET_OPEN_HOUR = 9;
export const MARKET_OPEN_MINUTE = 15;

/** Market hours - Closing time (IST) */
export const MARKET_CLOSE_HOUR = 15;
export const MARKET_CLOSE_MINUTE = 30;

/** IST timezone offset from UTC (hours) */
export const IST_OFFSET_HOURS = 5.5;

/** Default stop loss percentage */
export const DEFAULT_SL_PERCENT = 2;

/** Default alert cooldown (minutes) */
export const DEFAULT_ALERT_COOLDOWN_MINUTES = 15;

// ============================================
// FILE UPLOAD LIMITS
// ============================================

/** Maximum chart image size (5 MB) */
export const MAX_CHART_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/** Allowed chart image formats */
export const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'] as const;

// ============================================
// CACHE CONFIGURATION
// ============================================

/** React Query stale time for trades (5 minutes) */
export const TRADES_STALE_TIME_MS = 5 * 60 * 1000;

/** React Query stale time for alerts (1 minute) */
export const ALERTS_STALE_TIME_MS = 60 * 1000;

/** React Query stale time for settings (10 minutes) */
export const SETTINGS_STALE_TIME_MS = 10 * 60 * 1000;

/** LocalStorage cache expiry for instruments (24 hours) */
export const INSTRUMENT_CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

// ============================================
// RETRY CONFIGURATION
// ============================================

/** Maximum retry attempts for failed requests */
export const MAX_RETRY_ATTEMPTS = 3;

/** Base delay for exponential backoff (1 second) */
export const RETRY_BASE_DELAY_MS = 1000;

/** Maximum delay for exponential backoff (10 seconds) */
export const RETRY_MAX_DELAY_MS = 10000;

// ============================================
// ENUM VALUES
// ============================================

/** Trade statuses */
export const TradeStatus = {
  PENDING: 'PENDING',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const;

/** Trade types */
export const TradeType = {
  LONG: 'LONG',
  SHORT: 'SHORT',
} as const;

/** Trading segments */
export const TradingSegment = {
  EQUITY_INTRADAY: 'Equity_Intraday',
  EQUITY_POSITIONAL: 'Equity_Positional',
  FUTURES: 'Futures',
  OPTIONS: 'Options',
  COMMODITIES: 'Commodities',
} as const;

/** Alert condition types */
export const AlertConditionType = {
  PRICE_GT: 'PRICE_GT',
  PRICE_LT: 'PRICE_LT',
  PRICE_CROSS_ABOVE: 'PRICE_CROSS_ABOVE',
  PRICE_CROSS_BELOW: 'PRICE_CROSS_BELOW',
  PERCENT_CHANGE_GT: 'PERCENT_CHANGE_GT',
  PERCENT_CHANGE_LT: 'PERCENT_CHANGE_LT',
  VOLUME_SPIKE: 'VOLUME_SPIKE',
  CUSTOM: 'CUSTOM',
} as const;

/** Alert recurrence modes */
export const AlertRecurrence = {
  ONCE: 'ONCE',
  DAILY: 'DAILY',
  CONTINUOUS: 'CONTINUOUS',
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const ErrorMessages = {
  // Authentication
  AUTH_REQUIRED: 'You must be logged in to perform this action',
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_SESSION_EXPIRED: 'Your session has expired. Please login again',

  // Validation
  VALIDATION_REQUIRED_FIELD: 'This field is required',
  VALIDATION_INVALID_NUMBER: 'Please enter a valid number',
  VALIDATION_MIN_VALUE: 'Value must be at least {min}',
  VALIDATION_MAX_VALUE: 'Value must be at most {max}',

  // Network
  NETWORK_ERROR: 'Network error. Please check your connection',
  NETWORK_TIMEOUT: 'Request timeout. Please try again',

  // Generic
  GENERIC_ERROR: 'An unexpected error occurred. Please try again',
  NOT_FOUND: 'The requested resource was not found',
} as const;

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SuccessMessages = {
  TRADE_CREATED: 'Trade created successfully',
  TRADE_UPDATED: 'Trade updated successfully',
  TRADE_DELETED: 'Trade deleted successfully',

  ALERT_CREATED: 'Alert created successfully',
  ALERT_UPDATED: 'Alert updated successfully',
  ALERT_DELETED: 'Alert deleted successfully',

  SETTINGS_SAVED: 'Settings saved successfully',

  TELEGRAM_CONNECTED: 'Telegram connected successfully',
  TELEGRAM_DISCONNECTED: 'Telegram disconnected',

  DHAN_CONNECTED: 'Dhan account connected successfully',
  DHAN_DISCONNECTED: 'Dhan account disconnected',
} as const;

// ============================================
// TYPE HELPERS
// ============================================

export type TradeStatusType = typeof TradeStatus[keyof typeof TradeStatus];
export type TradeTypeType = typeof TradeType[keyof typeof TradeType];
export type TradingSegmentType = typeof TradingSegment[keyof typeof TradingSegment];
export type AlertConditionTypeType = typeof AlertConditionType[keyof typeof AlertConditionType];
export type AlertRecurrenceType = typeof AlertRecurrence[keyof typeof AlertRecurrence];
