import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { buildPermissionKey } from '../interfaces/permission.constants';

/**
 * Read-only access to the existing Role/RolePermission/Permission tables —
 * no schema change, no migration, no CRUD. Given a set of effective role
 * names (already expanded through the hierarchy), returns the flat,
 * deduplicated set of `resource.action` permission keys granted to any of
 * them.
 */
@Injectable()
export class RolePermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPermissionKeysForRoleNames(roleNames: readonly string[]): Promise<string[]> {
    if (roleNames.length === 0) {
      return [];
    }

    const roles = await this.prisma.role.findMany({
      where: { name: { in: [...roleNames] }, deletedAt: null },
      include: {
        rolePermissions: {
          include: { permission: { select: { resource: true, action: true, deletedAt: true } } },
        },
      },
    });

    const keys = new Set<string>();
    for (const role of roles) {
      for (const rolePermission of role.rolePermissions) {
        if (rolePermission.permission.deletedAt === null) {
          keys.add(buildPermissionKey(rolePermission.permission.resource, rolePermission.permission.action));
        }
      }
    }

    return [...keys];
  }
}
