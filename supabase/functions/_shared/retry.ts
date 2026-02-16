/**
 * Retry Logic with Exponential Backoff
 *
 * Usage:
 * ```typescript
 * import { withRetry } from '../_shared/retry.ts';
 *
 * const result = await withRetry(
 *   () => fetchFromDhanAPI(),
 *   { maxAttempts: 3, baseDelayMs: 1000 }
 * );
 * ```
 */

import { logger } from './logger.ts';

export interface RetryOptions {
  /**
   * Maximum number of retry attempts (including the first try)
   * Default: 3
   */
  maxAttempts?: number;

  /**
   * Base delay in milliseconds before first retry
   * Subsequent retries use exponential backoff: baseDelay * 2^attempt
   * Default: 1000ms
   */
  baseDelayMs?: number;

  /**
   * Maximum delay in milliseconds (caps exponential backoff)
   * Default: 10000ms (10 seconds)
   */
  maxDelayMs?: number;

  /**
   * Function to determine if error is retryable
   * Default: retry on network errors, timeout, 5xx status codes
   */
  shouldRetry?: (error: unknown, attempt: number) => boolean;

  /**
   * Callback called before each retry attempt
   */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  shouldRetry: (error: unknown) => {
    // Retry on network errors
    if (error instanceof Error) {
      if (
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('fetch failed')
      ) {
        return true;
      }
    }

    // Retry on HTTP 5xx errors
    if (isHttpError(error)) {
      const status = getHttpStatus(error);
      return status >= 500 && status < 600;
    }

    // Retry on specific HTTP 429 (rate limit) after delay
    if (isHttpError(error) && getHttpStatus(error) === 429) {
      return true;
    }

    return false;
  },
  onRetry: (error, attempt, delayMs) => {
    logger.warn('Retrying after error', {
      attempt,
      delayMs,
      error: error instanceof Error ? error.message : String(error),
    });
  },
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const isLastAttempt = attempt === opts.maxAttempts;
      if (isLastAttempt || !opts.shouldRetry(error, attempt)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const exponentialDelay = opts.baseDelayMs * Math.pow(2, attempt - 1);
      const delay = Math.min(exponentialDelay, opts.maxDelayMs);

      // Call retry callback
      opts.onRetry(error, attempt, delay);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is an HTTP error
 */
function isHttpError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
  );
}

/**
 * Get HTTP status code from error
 */
function getHttpStatus(error: unknown): number {
  if (isHttpError(error)) {
    return (error as { status: number }).status;
  }
  return 0;
}

/**
 * Retry configuration presets
 */
export const RetryPresets = {
  /**
   * Fast retry for quick operations (3 attempts, 500ms base delay)
   */
  FAST: {
    maxAttempts: 3,
    baseDelayMs: 500,
    maxDelayMs: 2000,
  },

  /**
   * Standard retry for most API calls (3 attempts, 1s base delay)
   */
  STANDARD: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 5000,
  },

  /**
   * Slow retry for heavy operations (5 attempts, 2s base delay)
   */
  SLOW: {
    maxAttempts: 5,
    baseDelayMs: 2000,
    maxDelayMs: 10000,
  },

  /**
   * No retry (1 attempt)
   */
  NONE: {
    maxAttempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
  },
};
