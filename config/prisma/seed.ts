import { PrismaClient } from '@prisma/client';
import { seedAdminUser } from './seeds/admin-user.seed';
import { seedPermissions } from './seeds/permission.seed';
import { seedSuperAdminRole } from './seeds/role.seed';
import { seedDefaultSite } from './seeds/site.seed';
import { seedDefaultTenant } from './seeds/tenant.seed';

const prisma = new PrismaClient();

/**
 * Seed entry point — development bootstrap data only.
 *
 * Seeds the frozen Milestone 5 permission vocabulary, the Super Admin
 * system role (granted every permission), and exactly one administrator
 * User account, on top of the Milestone 3 Tenant/Site bootstrap — per the
 * "Create Initial Admin Seed User" task. No schema, migration, API, or RBAC
 * engine change; this only writes data into the existing Role/Permission/
 * RolePermission/UserRole tables the authorization engine (Milestone 5)
 * already reads.
 *
 * Idempotent: every seed function either upserts (where a real unique/
 * composite-primary-key constraint exists — RolePermission, UserRole) or
 * does a findFirst + conditional create (where the schema only has a plain
 * index, not a unique constraint — Tenant.slug, Site, Permission, Role,
 * User.email — see docs/52_BACKEND_FREEZE_REPORT.md "Known Limitations"),
 * so re-running is always safe and never creates duplicates.
 */
async function main(): Promise<void> {
  const tenant = await seedDefaultTenant(prisma);
  const site = await seedDefaultSite(prisma, tenant.id);
  const permissions = await seedPermissions(prisma);
  const role = await seedSuperAdminRole(prisma, tenant.id, permissions);
  const admin = await seedAdminUser(prisma, tenant.id, site.id, role.id);

  // eslint-disable-next-line no-console
  console.log(
    `Seed complete: tenant "${tenant.slug}", site "${site.slug}", ${permissions.length} permissions, role "${role.name}", admin user "${admin.email}".`,
  );
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
