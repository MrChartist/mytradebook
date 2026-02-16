/**
 * Structured Logging Utility for Edge Functions
 *
 * Usage:
 * ```typescript
 * import { logger } from '../_shared/logger.ts';
 *
 * logger.info('User logged in', { userId: '123', method: 'oauth' });
 * logger.error('Failed to fetch prices', error, { symbols: ['RELIANCE', 'TCS'] });
 * logger.warn('Rate limit approaching', { current: 90, limit: 100 });
 * ```
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  function?: string;
  correlationId?: string;
}

class Logger {
  private functionName: string;
  private correlationId?: string;

  constructor() {
    this.functionName = Deno.env.get('FUNCTION_NAME') || 'unknown';
  }

  setCorrelationId(id: string) {
    this.correlationId = id;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      function: this.functionName,
      correlationId: this.correlationId,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      if (error instanceof Error) {
        entry.error = {
          message: error.message,
          stack: error.stack,
          code: (error as { code?: string }).code,
        };
      } else {
        entry.error = {
          message: String(error),
        };
      }
    }

    // Output as JSON for structured logging
    const logLine = JSON.stringify(entry);

    // Use appropriate console method
    switch (level) {
      case 'error':
        console.error(logLine);
        break;
      case 'warn':
        console.warn(logLine);
        break;
      case 'debug':
        console.debug(logLine);
        break;
      default:
        console.log(logLine);
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: unknown, context?: LogContext) {
    this.log('error', message, context, error);
  }

  /**
   * Time a function execution and log the duration
   */
  async time<T>(
    name: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`${name} completed`, { ...context, durationMs: duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${name} failed`, error, { ...context, durationMs: duration });
      throw error;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Generate a correlation ID for request tracing
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
