import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { env } from '../config/env';

/**
 * GET /api/health
 *
 * Liveness + readiness check. Verifies:
 *  - HTTP server is up
 *  - Process info (uptime, environment)
 *  - Database connectivity via a lightweight `$queryRaw`
 */
export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  const startedAt = Date.now();
  let dbStatus: 'ok' | 'error' = 'ok';
  let dbLatencyMs: number | null = null;

  try {
    const t = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t;
  } catch (err) {
    dbStatus = 'error';
    // eslint-disable-next-line no-console
    console.error('[health] DB connection failed:', err instanceof Error ? err.message : err);
  }

  res.status(dbStatus === 'ok' ? 200 : 503).json({
    success: true,
    data: {
      status: dbStatus === 'ok' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      environment: env.nodeEnv,
      db: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      checkMs: Date.now() - startedAt,
    },
  });
};
