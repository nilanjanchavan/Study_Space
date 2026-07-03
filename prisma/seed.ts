/**
 * Prisma seed entry point.
 *
 * Phase 1 has no models to seed, so this is intentionally a no-op placeholder.
 * It exists so `prisma db seed` works without error and so the hook is ready
 * for future phases (roles, default data, etc.).
 */
async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[seed] Phase 1 — no models to seed. Skipping.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });
