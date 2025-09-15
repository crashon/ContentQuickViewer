import { Request, Response, NextFunction } from 'express';
import { AppError, isOperationalError } from './errors';

// Global error handling middleware
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    isOperational: isOperationalError(err),
  });

  // Handle operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
    });
  }

  // Handle unexpected errors
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });

  // If error is not operational, you might want to perform additional actions
  if (!isOperationalError(err)) {
    // TODO: Log to error monitoring service
    // TODO: Send alert to dev team
  }
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Not found handler
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Path ${req.path} not found`,
  });
}

// Rate limit handler
export function rateLimitHandler(req: Request, res: Response) {
  res.status(429).json({
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Too many requests. Please try again later.',
  });
}