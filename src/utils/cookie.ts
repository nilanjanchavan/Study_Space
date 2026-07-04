import { CookieOptions } from 'express';
import { env } from '../config/env';

export const REFRESH_COOKIE_NAME = 'rt';

/**
 * Cookie options for the refresh token.
 * - httpOnly: not readable by JS (XSS protection)
 * - secure: HTTPS-only in production
 * - sameSite 'lax': CSRF protection while allowing top-level navigations
 * - path '/api/auth': scoped so only auth endpoints receive it
 */
export function refreshCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: maxAgeMs,
  };
}

/** Cookie options used when clearing the refresh token on logout. */
export const clearRefreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/api/auth',
};
