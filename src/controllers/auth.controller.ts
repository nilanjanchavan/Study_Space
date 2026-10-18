import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  getUserById,
  handleGoogleAuth,
} from '../services/auth.service';
import { env } from '../config/env';
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
  return sendSuccess(
    res,
    { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken.token },
    201,
  );
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
  return sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken.token,
  });
});

// ── POST /api/auth/logout ──────────────────────────────────────────────────
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken =
    (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined) || req.body?.refreshToken;
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

function getFrontendRedirectUrl(req: Request): string {
  // If FRONTEND_URL is explicitly set to a production domain, prefer it
  if (env.frontendUrl && !env.frontendUrl.includes('localhost')) {
    return env.frontendUrl;
  }

  // Otherwise fallback to Referer or Origin header so deployed clients aren't sent to localhost
  const referer = req.headers.referer || (req.headers.origin as string | undefined);
  if (referer && typeof referer === 'string') {
    try {
      const url = new URL(referer);
      if (url.origin && (url.protocol === 'http:' || url.protocol === 'https:')) {
        return url.origin;
      }
    } catch {
      // ignore parse error
    }
  }

  return env.frontendUrl;
}

// ── GET /api/auth/google ───────────────────────────────────────────────────
export const googleRedirect = asyncHandler(async (req: Request, res: Response) => {
  const targetFrontend = getFrontendRedirectUrl(req);

  if (!env.google.clientId) {
    return res.redirect(`${targetFrontend}/login?error=GOOGLE_NOT_CONFIGURED`);
  }

  const statePayload = Buffer.from(JSON.stringify({ returnTo: targetFrontend })).toString('base64url');

  const params = new URLSearchParams({
    client_id: env.google.clientId,
    redirect_uri: env.google.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: statePayload,
  });
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// ── GET /api/auth/google/callback ──────────────────────────────────────────
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const error = req.query.error as string | undefined;
  const state = req.query.state as string | undefined;

  let targetFrontend = env.frontendUrl;
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (parsed.returnTo && typeof parsed.returnTo === 'string') {
        const url = new URL(parsed.returnTo);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          targetFrontend = url.origin;
        }
      }
    } catch {
      // fallback
    }
  }

  if (error || !code) {
    return res.redirect(`${targetFrontend}/login?error=${encodeURIComponent(error || 'ACCESS_DENIED')}`);
  }

  try {
    const result = await handleGoogleAuth(code, reqMeta(req));
    const maxAge = result.refreshToken.expiresAt.getTime() - Date.now();
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken.token, refreshCookieOptions(maxAge));
    return res.redirect(
      `${targetFrontend}/login/callback?token=${encodeURIComponent(result.accessToken)}&refreshToken=${encodeURIComponent(result.refreshToken.token)}`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return res.redirect(`${targetFrontend}/login?error=${encodeURIComponent(message)}`);
  }
});
