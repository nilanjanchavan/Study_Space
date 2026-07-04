import { randomBytes } from 'crypto';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { hashToken } from './hash';
import { signRefreshToken } from './jwt';

export interface IssuedRefreshToken {
  /** Raw token to return to the client (cookie). Never persisted in cleartext. */
  token: string;
  /** DB row id of the stored hashed token. */
  id: string;
  /** Absolute expiry timestamp for cookie maxAge. */
  expiresAt: Date;
}

/**
 * Generate a new refresh token, persist its SHA-256 hash, and return the raw
 * token + metadata for cookie placement.
 *
 * Token format:  <random>.<userId>   — the random part is the secret; the
 * suffix is a non-secret hint useful for debugging logs only.
 */
export async function issueRefreshToken(
  userId: string,
  meta?: { userAgent?: string; ipAddress?: string },
): Promise<IssuedRefreshToken> {
  const random = randomBytes(40).toString('base64url');
  const token = `${random}.${userId}`;
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000);

  const row = await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      expiresAt,
    },
  });

  return { token, id: row.id, expiresAt };
}
