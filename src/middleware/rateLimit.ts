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
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});
