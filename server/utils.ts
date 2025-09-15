import { ApiResponse, ApiError, PaginationParams } from '@shared/schema';

interface PaginationMetadata extends PaginationParams {
  totalItems: number;
  totalPages: number;
}

/**
 * Creates a success response object
 * @param data The data to return in the response
 * @param metadata Optional metadata (e.g., pagination info)
 */
export function successResponse<T>(data: T, metadata?: Record<string, any>): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(metadata ? { metadata } : {})
  };
}

/**
 * Creates an error response object
 * @param code A machine-readable error code (e.g., 'INVALID_REQUEST')
 * @param message A human-readable error message
 * @param details Additional error details (only in development)
 */
export function errorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiResponse<ApiError> {
  return {
    success: false,
    data: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
}