import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError, z } from 'zod';
import { AppError } from '../utils/AppError';

type ValidationTargets = 'body' | 'query' | 'params';

/**
 * Validate a request target against a Zod schema.
 * On failure, throws a 400 with a structured `details` array of field errors.
 */
export const validate =
  (schema: ZodObject<z.ZodRawShape>, target: ValidationTargets = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);
      // Replace with the parsed (trimmed/transformed) values.
      (req[target] as unknown) = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        return next(
          AppError.badRequest('Validation failed', 'VALIDATION_ERROR', { fields: details }),
        );
      }
      next(err);
    }
  };
