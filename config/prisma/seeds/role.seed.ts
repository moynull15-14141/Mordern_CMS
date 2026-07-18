import type { Permission, PrismaClient, Role } from '@prisma/client';
import { SystemRole } from '../../../apps/backend/src/modules/authorization/interfaces/system-role.enum';

/**
 * Seeds the "Super Admin" system role — the highest-privileged role in the
 * frozen role hierarchy (docs/38_RBAC_ARCHITECTURE.md "Role Hierarchy":
 * Super Admin -> Administrator -> Editor -> Author -> Contributor) — scoped
 * to the given tenant, and grants it every seeded permission directly via
 * RolePermission (rather than relying on hierarchy inheritance from roles
 * that don't exist in the database yet).
 *
 * `Role` has no unique constraint on (tenantId, name) — only a plain
 * `@@index` — so the role lookup uses findFirst + conditional create, same
 * pattern as Tenant/Site/Permission. `RolePermission` DOES have a real
 * composite primary key (`@@id([roleId, permissionId])`), so granting each
 * permission safely uses upsert.
 */
export async function seedSuperAdminRole(
  prisma: PrismaClient,
  tenantId: string,
  permissions: Permission[],
): Promise<Role> {
  let role = await prisma.role.findFirst({ where: { tenantId, name: SystemRole.SUPER_ADMIN } });
  if (!role) {
    role = await prisma.role.create({
      data: {
        tenantId,
        name: SystemRole.SUPER_ADMIN,
        description: 'Full system access — highest-privileged frozen system role.',
      },
    });
  }

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
    });
  }

  return role;
}
