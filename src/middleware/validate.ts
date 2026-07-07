import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { AppError } from '../utils/AppError';

type ValidationTargets = 'body' | 'query' | 'params';

/**
 * Validate a request target against a Zod schema.
 * Accepts any Zod type (object, default-wrapped, optional, etc.) so that
 * schemas like `z.object({...}).optional().default({})` work seamlessly.
 * On failure, throws a 400 with a structured `details` array of field errors.
 *
 * Note: In Express 5 / Node 24, `req.query` is exposed via a read-only
 * getter that returns a fresh object on each access, so it cannot be
 * reassigned or mutated. For the `query` target the parsed result is stored
 * on `req.validatedQuery` instead.
 */
export const validate =
  (schema: z.ZodTypeAny, target: ValidationTargets = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);

      if (target === 'query') {
        req.validatedQuery = parsed as Record<string, unknown>;
      } else {
        (req[target] as unknown) = parsed;
      }
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
