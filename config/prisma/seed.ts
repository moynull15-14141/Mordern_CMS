import { PrismaClient } from '@prisma/client';
import { seedDefaultSite } from './seeds/site.seed';
import { seedDefaultTenant } from './seeds/tenant.seed';

const prisma = new PrismaClient();

/**
 * Seed entry point — development bootstrap data only.
 *
 * Deliberately does NOT seed Roles, Permissions, or an admin User account:
 * that requires a confirmed RBAC taxonomy and password hashing, which belong
 * to the Auth/Users/Roles business modules (out of scope for this
 * database-foundation milestone — see STRICTLY DO NOT IMPLEMENT). Add
 * `seeds/role.seed.ts`, `seeds/permission.seed.ts`, `seeds/admin-user.seed.ts`
 * here once those modules exist, following this same per-entity file pattern.
 *
 * Idempotent: every seed function upserts, so re-running is always safe.
 */
async function main(): Promise<void> {
  const tenant = await seedDefaultTenant(prisma);
  const site = await seedDefaultSite(prisma, tenant.id);

  // eslint-disable-next-line no-console
  console.log(`Seed complete: tenant "${tenant.slug}", site "${site.slug}".`);
}

main()
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
