import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../errors';

// Helper function to create validation middleware
export function validate<T>(schema: z.Schema<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request properties with validated data
      req.body = validated.body;
      req.query = validated.query;
      req.params = validated.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError(error.errors.map(e => e.message).join(', ')));
      } else {
        next(error);
      }
    }
  };
}

// Path traversal protection middleware
export function preventPathTraversal(req: Request, res: Response, next: NextFunction) {
  const path = req.query.path as string || req.body.path;
  if (path) {
    // Normalize path and check for traversal attempts
    const normalizedPath = path.replace(/\\/g, '/').replace(/\.{2,}/g, '.');
    if (normalizedPath !== path || path.includes('..')) {
      return next(new ValidationError('Invalid path: Path traversal not allowed'));
    }
  }
  next();
}

// File type validation middleware
export function validateFileType(allowedTypes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.files || !Array.isArray(req.files)) {
      return next();
    }

    const invalidFiles = (req.files as Express.Multer.File[]).filter(
      file => !allowedTypes.includes(file.mimetype)
    );

    if (invalidFiles.length > 0) {
      return next(
        new ValidationError(
          `Invalid file type(s): ${invalidFiles
            .map(f => f.originalname)
            .join(', ')}. Allowed types: ${allowedTypes.join(', ')}`
        )
      );
    }

    next();
  };
}

// File size validation middleware
export function validateFileSize(maxSize: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.files || !Array.isArray(req.files)) {
      return next();
    }

    const oversizedFiles = (req.files as Express.Multer.File[]).filter(
      file => file.size > maxSize
    );

    if (oversizedFiles.length > 0) {
      return next(
        new ValidationError(
          `File(s) too large: ${oversizedFiles
            .map(f => f.originalname)
            .join(', ')}. Maximum size: ${maxSize} bytes`
        )
      );
    }

    next();
  };
}