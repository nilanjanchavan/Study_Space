import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './AppError';

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string; // user id
  jti: string; // token id (matches RefreshToken.id)
}

/** Ensure secrets are configured; fail fast at first auth use otherwise. */
function assertSecret(secret: string, name: string): void {
  if (!secret) {
    throw new AppError(`${name} is not configured`, 500, 'JWT_NOT_CONFIGURED');
  }
}

/** Sign a short-lived access token. */
export function signAccessToken(payload: AccessTokenPayload): string {
  assertSecret(env.jwt.accessSecret, 'JWT_ACCESS_SECRET');
  const options: SignOptions = { expiresIn: env.jwt.accessExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.jwt.accessSecret, options);
}

/** Sign a refresh token (long-lived); `jti` is the DB row id. */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  assertSecret(env.jwt.refreshSecret, 'JWT_REFRESH_SECRET');
  // Refresh tokens expire by DB row (expiresAt); JWT exp is a redundant safeguard.
  const options: SignOptions = {
    expiresIn: `${env.jwt.refreshExpiresInDays}d` as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.jwt.refreshSecret, options);
}

/** Verify an access token; throws AppError(401) on any failure. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  assertSecret(env.jwt.accessSecret, 'JWT_ACCESS_SECRET');
  try {
    return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
  } catch {
    throw AppError.unauthorized('Invalid or expired access token', 'INVALID_ACCESS_TOKEN');
  }
}

/** Verify a refresh token; throws AppError(401) on any failure. */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  assertSecret(env.jwt.refreshSecret, 'JWT_REFRESH_SECRET');
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }
}
