/**
 * Input Validation Utilities
 *
 * Note: This is a simple validation utility.
 * For production, consider using Zod: https://deno.land/x/zod
 *
 * Usage:
 * ```typescript
 * import { validate, ValidationSchema } from '../_shared/validation.ts';
 *
 * const schema: ValidationSchema = {
 *   api_key: { type: 'string', required: true, minLength: 10 },
 *   amount: { type: 'number', required: true, min: 0 },
 * };
 *
 * const validated = validate(data, schema);
 * ```
 */

import { ApiError, ErrorCode } from './errors.ts';

export interface FieldValidation {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: unknown) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: FieldValidation;
}

export function validate<T = Record<string, unknown>>(
  data: unknown,
  schema: ValidationSchema
): T {
  if (typeof data !== 'object' || data === null) {
    throw new ApiError(
      ErrorCode.VALIDATION_INVALID_TYPE,
      'Request body must be an object'
    );
  }

  const result: Record<string, unknown> = {};
  const dataObj = data as Record<string, unknown>;

  for (const [field, rules] of Object.entries(schema)) {
    const value = dataObj[field];

    // Check required
    if (rules.required && (value === undefined || value === null)) {
      throw new ApiError(
        ErrorCode.VALIDATION_MISSING_FIELD,
        `Field '${field}' is required`,
        { field }
      );
    }

    // Skip validation if optional and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rules.type) {
      throw new ApiError(
        ErrorCode.VALIDATION_INVALID_TYPE,
        `Field '${field}' must be of type ${rules.type}`,
        { field, expected: rules.type, actual: actualType }
      );
    }

    // String validations
    if (rules.type === 'string' && typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        throw new ApiError(
          ErrorCode.VALIDATION_OUT_OF_RANGE,
          `Field '${field}' must be at least ${rules.minLength} characters`,
          { field, minLength: rules.minLength, actual: value.length }
        );
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        throw new ApiError(
          ErrorCode.VALIDATION_OUT_OF_RANGE,
          `Field '${field}' must be at most ${rules.maxLength} characters`,
          { field, maxLength: rules.maxLength, actual: value.length }
        );
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        throw new ApiError(
          ErrorCode.VALIDATION_INVALID_FORMAT,
          `Field '${field}' has invalid format`,
          { field, pattern: rules.pattern.toString() }
        );
      }

      if (rules.enum && !rules.enum.includes(value)) {
        throw new ApiError(
          ErrorCode.VALIDATION_INVALID_FORMAT,
          `Field '${field}' must be one of: ${rules.enum.join(', ')}`,
          { field, allowed: rules.enum, actual: value }
        );
      }
    }

    // Number validations
    if (rules.type === 'number' && typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        throw new ApiError(
          ErrorCode.VALIDATION_OUT_OF_RANGE,
          `Field '${field}' must be at least ${rules.min}`,
          { field, min: rules.min, actual: value }
        );
      }

      if (rules.max !== undefined && value > rules.max) {
        throw new ApiError(
          ErrorCode.VALIDATION_OUT_OF_RANGE,
          `Field '${field}' must be at most ${rules.max}`,
          { field, max: rules.max, actual: value }
        );
      }
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value);
      if (customResult !== true) {
        throw new ApiError(
          ErrorCode.VALIDATION_INVALID_FORMAT,
          typeof customResult === 'string'
            ? customResult
            : `Field '${field}' failed custom validation`,
          { field }
        );
      }
    }

    result[field] = value;
  }

  return result as T;
}

/**
 * Common validation patterns
 */
export const Patterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  TRADING_SYMBOL: /^[A-Z0-9&-]+$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
};

/**
 * Sanitize string to prevent injection attacks
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim();
}

/**
 * Escape markdown special characters for Telegram
 */
export function escapeMarkdown(str: string): string {
  return str
    .replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}
