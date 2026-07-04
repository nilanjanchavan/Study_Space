import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/** Hash a plaintext password using bcrypt. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Verify a plaintext password against a stored bcrypt hash. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Hash an arbitrary token string with SHA-256.
 * Used for refresh tokens so only the digest is persisted, never the raw token.
 */
export function hashToken(token: string): string {
  return cryptoHash(token);
}

import { createHash } from 'crypto';
function cryptoHash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
