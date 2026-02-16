/**
 * Error handling utilities
 *
 * Provides type-safe error handling helpers to replace unsafe 'any' types in catch blocks.
 */

/**
 * Type guard to check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Get error message from unknown error type
 * Safely extracts message from Error objects or converts to string
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return 'An unknown error occurred';
}

/**
 * Log error with proper typing
 */
export function logError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  const contextMsg = context ? `[${context}] ` : '';

  console.error(`${contextMsg}${message}`);

  if (isError(error) && error.stack) {
    console.error(error.stack);
  }
}
