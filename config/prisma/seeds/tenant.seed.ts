import type { PrismaClient, Tenant } from '@prisma/client';

/**
 * Bootstrap tenant for local development. Idempotent (upsert on slug).
 */
export async function seedDefaultTenant(prisma: PrismaClient): Promise<Tenant> {
  return prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Tenant',
      slug: 'default',
    },
  });
}
