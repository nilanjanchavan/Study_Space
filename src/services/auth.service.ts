import { prisma } from '../config/prisma';
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
