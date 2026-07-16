import type { PrismaClient, Tenant } from '@prisma/client';

/**
 * Bootstrap tenant for local development. Idempotent on slug.
 *
 * Not a Prisma `upsert` because `Tenant.slug` has no `@unique` constraint
 * (only `id` does) — the schema doesn't enforce slug uniqueness, so there is
 * no valid `TenantWhereUniqueInput` for it. `findFirst` + conditional
 * `create` achieves the same idempotent bootstrap without requiring a
 * schema/migration change to the frozen Milestone 3.1 database.
 */
export async function seedDefaultTenant(prisma: PrismaClient): Promise<Tenant> {
  const existing = await prisma.tenant.findFirst({ where: { slug: 'default' } });
  if (existing) {
    return existing;
  }
  return prisma.tenant.create({
    data: {
      name: 'Default Tenant',
      slug: 'default',
    },
  });
}
