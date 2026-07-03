import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const app = createApp();

/**
 * Boots the HTTP server after confirming the database is reachable.
 * Falls back to starting anyway in development so the API surface (e.g. /api)
 * is testable even if the DB is temporarily down — /api/health will then
 * report a degraded status.
 */
async function bootstrap(): Promise<void> {
  const port = env.port;

  // Verify DB connectivity before accepting traffic.
  try {
    await prisma.$connect();
    // eslint-disable-next-line no-console
    console.log(`[startup] Connected to PostgreSQL at ${maskUrl(env.databaseUrl)}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      `[startup] Failed to connect to PostgreSQL:`,
      err instanceof Error ? err.message : err,
    );
    if (env.isProduction) {
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.warn('[startup] Continuing in development despite DB error (health endpoint will be degraded).');
  }

  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[startup] Study Workspace API listening on http://localhost:${port} (${env.nodeEnv})`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`\n[shutdown] ${signal} received, closing server...`);
    server.close(async () => {
      await prisma.$disconnect();
      // eslint-disable-next-line no-console
      console.log('[shutdown] HTTP server closed, DB disconnected. Bye.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

/** Hide credentials in the logged connection string. */
function maskUrl(url: string): string {
  if (!url) return '(unset)';
  try {
    return url.replace(/(\/\/)([^:]+):([^@]+)@/, '$1***:***@');
  } catch {
    return '(masked)';
  }
}

void bootstrap();
