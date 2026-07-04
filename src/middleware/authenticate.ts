import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/prisma';

/**
 * JWT authentication middleware.
 *
 * Reads the Bearer token from the Authorization header, verifies it, loads the
 * user from the DB (so revoked/inactive accounts are caught here), and attaches
 * `req.user`.
 *
 * Throws 401 if missing/invalid. 403 if the account is deactivated.
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
    }

    const token = header.slice('Bearer '.length).trim();
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      // Intentionally exclude passwordHash from req.user.
      // Prisma cannot exclude at findUnique without a select; use select here.
    });

    if (!user) {
      throw AppError.unauthorized('User no longer exists', 'USER_NOT_FOUND');
    }
    if (!user.isActive) {
      throw AppError.forbidden('Account is deactivated', 'ACCOUNT_INACTIVE');
    }

    req.user = user;
    next();
  } catch (err) {
    // Normalize AppError; unexpected errors pass through.
    next(err instanceof Error && 'status' in err ? err : err);
  }
};
