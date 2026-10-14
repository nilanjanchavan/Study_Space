import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Stricter rate limiter for authentication endpoints (login/register/refresh).
 * Mitigates brute-force and credential-stuffing attacks.
 *
 * Default: 10 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.rateLimit.authWindowMs,
  max: env.isDevelopment ? 1000 : env.rateLimit.authMax,
  skipSuccessfulRequests: true,
  skip: (req) => {
    // In development or from localhost, do not lock out developer
    if (env.isDevelopment) return true;
    const ip = req.ip || req.socket.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many failed attempts from this IP, please try again in 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});
