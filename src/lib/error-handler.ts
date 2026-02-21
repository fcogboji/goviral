// Production-safe error handler
// Sanitizes error messages to prevent information leakage

import { NextResponse } from 'next/server';
import { logger } from './logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Sanitize error message for production
 * Removes sensitive information like file paths, internal details
 */
export function sanitizeErrorMessage(error: unknown): string {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // In development, return full error details
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  // In production, return generic messages
  if (error instanceof Error) {
    // Check for known safe error messages
    const safePatterns = [
      /unauthorized/i,
      /forbidden/i,
      /not found/i,
      /invalid.*input/i,
      /validation.*failed/i,
      /already exists/i,
      /required/i,
      /limit.*reached/i,
    ];

    for (const pattern of safePatterns) {
      if (pattern.test(error.message)) {
        return error.message;
      }
    }
  }

  // Default generic message for production
  return 'An error occurred while processing your request';
}

/**
 * Handle API errors and return appropriate responses
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  // Log the full error internally
  logger.error(
    context || 'API Error',
    error
  );

  // Determine status code
  let statusCode = 500;
  if (error instanceof Error && 'statusCode' in error) {
    statusCode = (error as ApiError).statusCode || 500;
  }

  // Known error types with specific status codes
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('unauthorized')) {
      statusCode = 401;
    } else if (error.message.toLowerCase().includes('forbidden')) {
      statusCode = 403;
    } else if (error.message.toLowerCase().includes('not found')) {
      statusCode = 404;
    } else if (error.message.toLowerCase().includes('validation')) {
      statusCode = 400;
    }
  }

  // Return sanitized error response
  return NextResponse.json(
    {
      error: sanitizeErrorMessage(error),
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.stack : undefined,
      }),
    },
    { status: statusCode }
  );
}

/**
 * Create a standard API error
 */
export class AppError extends Error implements ApiError {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error constructors
 */
export const errors = {
  unauthorized: (message = 'Unauthorized') =>
    new AppError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message = 'Forbidden') =>
    new AppError(message, 403, 'FORBIDDEN'),

  notFound: (message = 'Resource not found') =>
    new AppError(message, 404, 'NOT_FOUND'),

  badRequest: (message = 'Bad request') =>
    new AppError(message, 400, 'BAD_REQUEST'),

  validation: (message = 'Validation failed') =>
    new AppError(message, 400, 'VALIDATION_ERROR'),

  conflict: (message = 'Resource already exists') =>
    new AppError(message, 409, 'CONFLICT'),

  internal: (message = 'Internal server error') =>
    new AppError(message, 500, 'INTERNAL_ERROR'),
};
