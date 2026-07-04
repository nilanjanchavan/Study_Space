import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  getUserById,
} from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  clearRefreshCookieOptions,
} from '../utils/cookie';

/** Read request metadata stored alongside issued tokens. */
function reqMeta(req: Request): { userAgent?: string; ipAddress?: string } {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
  };
}

/** Place the refresh token cookie and return the access token + user in JSON. */
function respondWithTokens(
  res: Response,
  data: { user: unknown; accessToken: string; refreshToken: { token: string; expiresAt: Date } },
) {
  const maxAge = data.refreshToken.expiresAt.getTime() - Date.now();
  res.cookie(REFRESH_COOKIE_NAME, data.refreshToken.token, refreshCookieOptions(maxAge));
  return sendSuccess(res, { user: data.user, accessToken: data.accessToken }, 201);
}

// ── POST /api/auth/register ────────────────────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body, reqMeta(req));
  // Reuse 201 (created) even though tokens are issued.
  res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions);
  return respondWithTokens(res, result);
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body, reqMeta(req));
  return respondWithTokens(res, { ...result, refreshToken: result.refreshToken });
});

// ── POST /api/auth/refresh ─────────────────────────────────────────────────
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawToken =
    (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined) || req.body?.refreshToken;
  if (!rawToken) {
    throw AppError.unauthorized('Refresh token is required', 'REFRESH_TOKEN_MISSING');
  }
  const result = await refreshTokens(rawToken);
  const maxAge = result.refreshToken.expiresAt.getTime() - Date.now();
  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken.token, refreshCookieOptions(maxAge));
  return sendSuccess(res, { user: result.user, accessToken: result.accessToken });
});

// ── POST /api/auth/logout ──────────────────────────────────────────────────
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  await logoutUser(rawToken);
  res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions);
  return sendSuccess(res, { message: 'Logged out successfully' });
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  }
  const user = await getUserById(req.user.id);
  return sendSuccess(res, { user });
});
