import { User } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      /** Populated by `authenticate` middleware. */
      user?: User;
      /**
       * Populated by `validate(..., 'query')` middleware.
       * Express 5 exposes `req.query` via a read-only getter that returns a
       * fresh object on each access, so the parsed/validated query is stored
       * here instead of being written back to `req.query`.
       */
      validatedQuery?: Record<string, unknown>;
    }
  }
}

export {};
