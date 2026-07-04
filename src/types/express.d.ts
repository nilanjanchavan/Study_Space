import { User } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      /** Populated by `authenticate` middleware. */
      user?: User;
    }
  }
}

export {};
