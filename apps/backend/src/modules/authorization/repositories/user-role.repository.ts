import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

/**
 * Read-only access to the existing UserRole/Role tables — no schema
 * change, no migration, no CRUD. Only what AuthorizationService needs to
 * resolve a user's directly-assigned roles.
 */
@Injectable()
export class UserRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRoleNamesForUser(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { select: { name: true, deletedAt: true } } },
    });

    return userRoles
      .filter((userRole) => userRole.role.deletedAt === null)
      .map((userRole) => userRole.role.name);
  }
}
