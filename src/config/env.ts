import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Centralized environment configuration.
 * All runtime config is read here so the rest of the app imports a single source of truth.
 */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  databaseUrl: process.env.DATABASE_URL ?? '',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  // ── Auth / JWT ──────────────────────────────────────────
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresInDays: parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS ?? '30', 10),
  },

  // ── Rate limiting ───────────────────────────────────────
  rateLimit: {
    authWindowMs: parseInt(process.env.AUTH_RATE_WINDOW_MS ?? String(15 * 60 * 1000), 10),
    authMax: parseInt(process.env.AUTH_RATE_MAX ?? '10', 10),
  },
} as const;

export type Env = typeof env;
