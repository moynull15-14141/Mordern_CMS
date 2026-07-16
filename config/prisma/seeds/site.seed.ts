import type { PrismaClient, Site } from '@prisma/client';

/**
 * Bootstrap site for local development, scoped to the default tenant.
 * Idempotent (upsert on tenantId+slug).
 */
export async function seedDefaultSite(prisma: PrismaClient, tenantId: string): Promise<Site> {
  return prisma.site.upsert({
    where: { tenantId_slug: { tenantId, slug: 'default' } },
    update: {},
    create: {
      tenantId,
      name: 'Default Site',
      slug: 'default',
      domain: 'localhost',
    },
  });
}
