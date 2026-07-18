import type { Permission, PrismaClient } from '@prisma/client';
import { PERMISSIONS } from '../../../apps/backend/src/modules/authorization/interfaces/permission.constants';

/**
 * Seeds the frozen Milestone 5 permission vocabulary (21 `resource.action`
 * keys — docs/38_RBAC_ARCHITECTURE.md "Permission Naming Convention") into
 * the `Permission` table. Reuses the `PERMISSIONS` constant directly rather
 * than duplicating the list.
 *
 * `Permission` has no unique constraint on (resource, action) — only a
 * plain `@@index` (see docs/52_BACKEND_FREEZE_REPORT.md "Known
 * Limitations") — so this uses findFirst + conditional create rather than
 * upsert, the same idempotency pattern established for Tenant/Site.
 */
export async function seedPermissions(prisma: PrismaClient): Promise<Permission[]> {
  const permissions: Permission[] = [];

  for (const value of Object.values(PERMISSIONS)) {
    const [resource, action] = value.split('.') as [string, string];
    const existing = await prisma.permission.findFirst({ where: { resource, action } });
    if (existing) {
      permissions.push(existing);
      continue;
    }
    const created = await prisma.permission.create({
      data: { name: value, resource, action, group: resource },
    });
    permissions.push(created);
  }

  return permissions;
}
