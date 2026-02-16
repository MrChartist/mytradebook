/**
 * Standardized Error Codes and Error Handling for Edge Functions
 *
 * Usage:
 * ```typescript
 * import { ApiError, ErrorCode, errorResponse } from '../_shared/errors.ts';
 *
 * throw new ApiError(ErrorCode.AUTH_INVALID_TOKEN, 'Dhan token expired');
 *
 * // Or return error response directly
 * return errorResponse(ErrorCode.VALIDATION_MISSING_FIELD, 'api_key is required', { field: 'api_key' });
 * ```
 */

export enum ErrorCode {
  // Authentication errors (AUTH_xxx)
  AUTH_INVALID_TOKEN = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  AUTH_MISSING_TOKEN = 'AUTH_003',
  AUTH_UNAUTHORIZED = 'AUTH_004',
  AUTH_FORBIDDEN = 'AUTH_005',

  // Validation errors (VAL_xxx)
  VALIDATION_MISSING_FIELD = 'VAL_001',
  VALIDATION_INVALID_FORMAT = 'VAL_002',
  VALIDATION_OUT_OF_RANGE = 'VAL_003',
  VALIDATION_INVALID_TYPE = 'VAL_004',

  // Broker API errors (BROKER_xxx)
  BROKER_API_ERROR = 'BROKER_001',
  BROKER_RATE_LIMIT = 'BROKER_002',
  BROKER_INVALID_RESPONSE = 'BROKER_003',
  BROKER_CONNECTION_FAILED = 'BROKER_004',

  // Database errors (DB_xxx)
  DB_QUERY_FAILED = 'DB_001',
  DB_NOT_FOUND = 'DB_002',
  DB_DUPLICATE_KEY = 'DB_003',
  DB_CONSTRAINT_VIOLATION = 'DB_004',

  // Rate limiting (RATE_xxx)
  RATE_LIMIT_EXCEEDED = 'RATE_001',

  // Telegram errors (TG_xxx)
  TELEGRAM_SEND_FAILED = 'TG_001',
  TELEGRAM_INVALID_BOT_TOKEN = 'TG_002',
  TELEGRAM_CHAT_NOT_FOUND = 'TG_003',

  // Internal errors (INT_xxx)
  INTERNAL_SERVER_ERROR = 'INT_001',
  SERVICE_UNAVAILABLE = 'INT_002',
  TIMEOUT = 'INT_003',
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }

  toResponse(): Response {
    return new Response(JSON.stringify(this.toJSON()), {
      status: this.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  statusCode: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        details,
      },
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Map common error types to ApiError
 */
export function mapError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for known error patterns
    if (error.message.includes('JWT') || error.message.includes('token')) {
      return new ApiError(
        ErrorCode.AUTH_INVALID_TOKEN,
        'Authentication failed',
        { originalError: error.message },
        401
      );
    }

    if (error.message.includes('timeout')) {
      return new ApiError(
        ErrorCode.TIMEOUT,
        'Request timeout',
        { originalError: error.message },
        504
      );
    }

    if (error.message.includes('rate limit')) {
      return new ApiError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded',
        { originalError: error.message },
        429
      );
    }

    // Generic server error
    return new ApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      { originalError: error.message },
      500
    );
  }

  // Unknown error type
  return new ApiError(
    ErrorCode.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    { originalError: String(error) },
    500
  );
}
