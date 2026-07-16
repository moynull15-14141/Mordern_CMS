import type { PrismaClient, Site } from '@prisma/client';

/**
 * Bootstrap site for local development, scoped to the default tenant.
 * Idempotent on tenantId+slug.
 *
 * Not a Prisma `upsert` because `Site` only has a plain `@@index([tenantId,
 * slug])`, not a `@@unique` — there is no `tenantId_slug` compound
 * where-unique-input to upsert on. `findFirst` + conditional `create`
 * achieves the same idempotent bootstrap without requiring a
 * schema/migration change to the frozen Milestone 3.1 database.
 */
export async function seedDefaultSite(prisma: PrismaClient, tenantId: string): Promise<Site> {
  const existing = await prisma.site.findFirst({ where: { tenantId, slug: 'default' } });
  if (existing) {
    return existing;
  }
  return prisma.site.create({
    data: {
      tenantId,
      name: 'Default Site',
      slug: 'default',
      domain: 'localhost',
    },
  });
}
