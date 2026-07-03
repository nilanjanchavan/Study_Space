import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Prisma client singleton.
 *
 * In development, HMR / ts-node-dev can reload modules repeatedly, which would
 * otherwise spawn new PrismaClient instances on every reload and exhaust DB
 * connections. We cache the instance on `globalThis` to avoid that.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDevelopment ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (env.isDevelopment) {
  globalForPrisma.prisma = prisma;
}
