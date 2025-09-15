export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// HTTP error classes
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(400, message, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, message, 'CONFLICT');
  }
}

// File operation errors
export class FileNotFoundError extends NotFoundError {
  constructor(path: string) {
    super(`File not found: ${path}`);
    this.code = 'FILE_NOT_FOUND';
  }
}

export class FileAccessError extends ForbiddenError {
  constructor(path: string) {
    super(`Access denied to file: ${path}`);
    this.code = 'FILE_ACCESS_DENIED';
  }
}

export class FileOperationError extends AppError {
  constructor(message: string) {
    super(500, message, 'FILE_OPERATION_ERROR');
  }
}

// Storage errors
export class StorageError extends AppError {
  constructor(message: string) {
    super(500, message, 'STORAGE_ERROR');
  }
}

// Cache errors
export class CacheError extends AppError {
  constructor(message: string) {
    super(500, message, 'CACHE_ERROR');
  }
}

// Validation errors
export class ValidationError extends BadRequestError {
  constructor(message: string) {
    super(message);
    this.code = 'VALIDATION_ERROR';
  }
}

// Rate limiting error
export class RateLimitError extends AppError {
  constructor() {
    super(429, 'Too many requests', 'RATE_LIMIT');
  }
}

// Helper function to determine if error is operational
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}