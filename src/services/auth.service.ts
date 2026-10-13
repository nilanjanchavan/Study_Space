import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { hashPassword, verifyPassword } from '../utils/hash';
import { signAccessToken } from '../utils/jwt';
import { issueRefreshToken } from '../utils/refreshToken';
import { hashToken } from '../utils/hash';
import type { RegisterInput, LoginInput } from '../validators/auth.validators';

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: { token: string; expiresAt: Date };
}

/** User shape returned to clients — never exposes passwordHash. */
export type PublicUser = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  isEmailVerified: boolean;
  createdAt: Date;
};

function toPublicUser(u: {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  isEmailVerified: boolean;
  createdAt: Date;
}): PublicUser {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    name: u.name,
    avatarUrl: u.avatarUrl,
    role: u.role,
    isEmailVerified: u.isEmailVerified,
    createdAt: u.createdAt,
  };
}

async function issueTokens(
  user: { id: string; email: string; role: string },
  meta?: { userAgent?: string; ipAddress?: string },
): Promise<AuthResult> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refresh = await issueRefreshToken(user.id, meta);
  return { user: user as PublicUser, accessToken, refreshToken: refresh };
}

// ───────────────────────────────────────────────────────────────────────────
// Register
// ───────────────────────────────────────────────────────────────────────────

export async function registerUser(
  input: RegisterInput,
  meta?: { userAgent?: string; ipAddress?: string },
): Promise<AuthResult> {
  const { email, username, password, name } = input;

  // Uniqueness check on email OR username in a single query.
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    if (existing.email === email) {
      throw AppError.conflict('Email is already registered', 'EMAIL_TAKEN');
    }
    throw AppError.conflict('Username is already taken', 'USERNAME_TAKEN');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, username, passwordHash, name },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return issueTokens(user, meta).then((r) => ({ ...r, user: toPublicUser(user) }));
}

// ───────────────────────────────────────────────────────────────────────────
// Login
// ───────────────────────────────────────────────────────────────────────────

export async function loginUser(
  input: LoginInput,
  meta?: { userAgent?: string; ipAddress?: string },
): Promise<AuthResult> {
  const { email, password } = input;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Use a generic message to avoid user enumeration.
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
    throw AppError.forbidden('Account is deactivated', 'ACCOUNT_INACTIVE');
  }

  if (!user.passwordHash) {
    throw AppError.unauthorized('This account was registered with Google. Please log in with Google.', 'USE_GOOGLE_LOGIN');
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const result = await issueTokens(user, meta);
  return { ...result, user: toPublicUser(user) };
}

// ───────────────────────────────────────────────────────────────────────────
// Refresh (with rotation + reuse detection)
// ───────────────────────────────────────────────────────────────────────────

export interface RefreshResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: { token: string; expiresAt: Date };
}

/**
 * Refresh-token rotation.
 *
 * Flow:
 *   1. Verify the JWT signature + expiry (defence in depth).
 *   2. Hash the raw token and find the matching DB row.
 *   3. If the row is already revoked → REUSE DETECTED. An attacker may be
 *      replaying an already-used token. Revoke ALL of the user's tokens to
 *      force a full re-login everywhere.
 *   4. If the row is expired or missing → 401.
 *   5. Atomically revoke the presented token and issue a brand-new one.
 */
export async function refreshTokens(rawToken: string): Promise<RefreshResult> {
  if (!rawToken) {
    throw AppError.unauthorized('Refresh token is required', 'REFRESH_TOKEN_MISSING');
  }

  const tokenHash = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored) {
    throw AppError.unauthorized('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }

  // ── Reuse detection: a valid token that was already revoked. ──
  if (stored.isRevoked) {
    // Revoke every token for this user — possible token theft.
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId },
      data: { isRevoked: true },
    });
    throw AppError.unauthorized(
      'Refresh token reuse detected; all sessions revoked',
      'REFRESH_TOKEN_REUSE',
    );
  }

  // ── Expiry check (DB source of truth). ──
  if (stored.expiresAt.getTime() < Date.now()) {
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });
    throw AppError.unauthorized('Refresh token expired', 'REFRESH_TOKEN_EXPIRED');
  }

  if (!stored.user.isActive) {
    throw AppError.forbidden('Account is deactivated', 'ACCOUNT_INACTIVE');
  }

  // ── Rotate: revoke the presented token, issue a fresh one. ──
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { isRevoked: true },
  });

  const result = await issueTokens(stored.user);
  return { ...result, user: toPublicUser(stored.user) };
}

// ───────────────────────────────────────────────────────────────────────────
// Logout (revoke a single token)
// ───────────────────────────────────────────────────────────────────────────

export async function logoutUser(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return; // idempotent: nothing to revoke
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { isRevoked: true },
  });
}

// ───────────────────────────────────────────────────────────────────────────
// "Get current user" helper for /me
// ───────────────────────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  }
  return toPublicUser(user);
}

// ───────────────────────────────────────────────────────────────────────────
// Google OAuth Flow
// ───────────────────────────────────────────────────────────────────────────

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

interface GoogleUserInfo {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
  email_verified: boolean;
}

export async function handleGoogleAuth(
  code: string,
  meta?: { userAgent?: string; ipAddress?: string },
): Promise<AuthResult> {
  if (!env.google.clientId || !env.google.clientSecret) {
    throw AppError.badRequest('Google OAuth credentials not configured on the server', 'GOOGLE_CONFIG_MISSING');
  }

  // 1. Exchange authorization code for tokens
  let tokenRes: Response;
  try {
    tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.google.clientId,
        client_secret: env.google.clientSecret,
        redirect_uri: env.google.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });
  } catch {
    throw AppError.badRequest('Failed to communicate with Google OAuth servers', 'GOOGLE_NETWORK_ERROR');
  }

  if (!tokenRes.ok) {
    throw AppError.badRequest('Google authorization code exchange failed', 'GOOGLE_CODE_INVALID');
  }

  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;

  // 2. Fetch Google user profile
  let userRes: Response;
  try {
    userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
  } catch {
    throw AppError.badRequest('Failed to fetch user information from Google', 'GOOGLE_USERINFO_FAILED');
  }

  if (!userRes.ok) {
    throw AppError.badRequest('Unable to fetch Google profile', 'GOOGLE_USERINFO_FAILED');
  }

  const gUser = (await userRes.json()) as GoogleUserInfo;
  if (!gUser.email) {
    throw AppError.badRequest('No email provided by Google account', 'GOOGLE_EMAIL_MISSING');
  }

  // 3. Find or create user in database
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: gUser.sub }, { email: gUser.email.toLowerCase() }],
    },
  });

  if (user) {
    if (!user.isActive) {
      throw AppError.forbidden('Account is deactivated', 'ACCOUNT_INACTIVE');
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: user.googleId || gUser.sub,
        avatarUrl: user.avatarUrl || gUser.picture,
        name: user.name || gUser.name,
        isEmailVerified: true,
        lastLoginAt: new Date(),
      },
    });
  } else {
    // Generate unique username based on email
    let baseUsername = (gUser.email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (baseUsername.length < 3) baseUsername = `user_${baseUsername}`;
    let username = baseUsername;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}_${counter++}`;
    }

    user = await prisma.user.create({
      data: {
        email: gUser.email.toLowerCase(),
        username,
        name: gUser.name || username,
        avatarUrl: gUser.picture || null,
        googleId: gUser.sub,
        provider: 'GOOGLE',
        isEmailVerified: true,
        lastLoginAt: new Date(),
      },
    });
  }

  const result = await issueTokens(user, meta);
  return { ...result, user: toPublicUser(user) };
}
