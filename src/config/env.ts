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
} as const;

export type Env = typeof env;
