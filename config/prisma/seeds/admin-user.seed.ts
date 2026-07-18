import type { PrismaClient, User } from '@prisma/client';
import { PasswordService } from '../../../apps/backend/src/modules/identity/services/password.service';

const ADMIN_EMAIL = 'moynulhasan4044@gmail.com';
const ADMIN_PASSWORD = '123456';

const passwordService = new PasswordService();

/**
 * Seeds exactly one administrator account for local development, per the
 * "Create Initial Admin Seed User" task. Reuses Identity's PasswordService
 * (bcrypt, 12 salt rounds — docs/37_IDENTITY_FREEZE.md "Password Policy")
 * directly rather than duplicating the hashing call. Created with
 * `status: 'ACTIVE'` directly (skipping PENDING) since AuthService rejects
 * any non-ACTIVE user at login (`auth.service.ts` checks
 * `user.status !== 'ACTIVE'`) — this is this schema's actual "verified and
 * usable" state; there is no separate boolean verification flag on `User`.
 *
 * NOTE: `123456` does not satisfy `PASSWORD_POLICY_REGEX`
 * (`modules/identity/policies/password.policy.ts`, enforced on
 * `CreateUserDto`/reset-password). Seeding writes directly via Prisma and
 * intentionally bypasses that DTO-level validation, exactly as every other
 * seed in this file bypasses its domain's business-rule layer — flagged
 * here per RULE_ZERO rather than silently accepted. This is local
 * development seed data, explicitly requested as-is.
 *
 * `User.email` has no unique constraint (see
 * docs/52_BACKEND_FREEZE_REPORT.md "Known Limitations") — only an
 * `@@index([siteId, email])` — so this uses findFirst + conditional create,
 * same pattern as Tenant/Site/Role/Permission. `UserRole` DOES have a real
 * composite primary key (`@@id([userId, roleId])`), so the role assignment
 * safely uses upsert. Re-running never resets an already-created user's
 * password hash.
 */
export async function seedAdminUser(
  prisma: PrismaClient,
  tenantId: string,
  siteId: string,
  roleId: string,
): Promise<User> {
  let user = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } });

  if (!user) {
    const passwordHash = await passwordService.hash(ADMIN_PASSWORD);
    user = await prisma.user.create({
      data: {
        tenantId,
        siteId,
        email: ADMIN_EMAIL,
        displayName: 'Moynul Hasan',
        passwordHash,
        status: 'ACTIVE',
      },
    });
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId } },
    update: {},
    create: { userId: user.id, roleId },
  });

  return user;
}
