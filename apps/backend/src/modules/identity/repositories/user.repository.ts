import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

/**
 * Read/write access scoped to exactly what the Identity module needs.
 * NOT a full User CRUD repository — that belongs to the future Users module.
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  findActiveById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  updateLastLogin(id: string): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  }

  updatePasswordHash(id: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  /** No-op if the user isn't PENDING — updateMany accepts non-unique filters, unlike update(). */
  async activateIfPending(id: string): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id, status: 'PENDING' },
      data: { status: 'ACTIVE' },
    });
  }
}
