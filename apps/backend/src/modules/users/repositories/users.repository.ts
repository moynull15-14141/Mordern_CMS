import { Injectable } from '@nestjs/common';
import { Prisma, User, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { UserQueryOptions } from '../interfaces/user-query.interface';
import { UserSortField } from '../constants/user.constants';

const SORT_FIELD_MAP: Record<UserSortField, string> = {
  [UserSortField.NAME]: 'displayName',
  [UserSortField.EMAIL]: 'email',
  [UserSortField.CREATED_AT]: 'createdAt',
  [UserSortField.UPDATED_AT]: 'updatedAt',
  [UserSortField.LAST_LOGIN]: 'lastLoginAt',
  [UserSortField.STATUS]: 'status',
};

/**
 * Full CRUD for the `User` model — distinct from Identity's
 * `modules/identity/repositories/user.repository.ts`, which is explicitly
 * scoped to auth-only lookups (4 methods, no create/update/list) and is left
 * untouched (`37_IDENTITY_FREEZE.md` is frozen). This repository owns
 * everything the Users module needs instead.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.UserWhereInput {
    return { deletedAt: null };
  }

  async findById(id: string, includeDeleted = false): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
    });
  }

  async findByEmail(email: string, excludeId?: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  async findByUsername(username: string, excludeId?: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { username, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  private buildWhere(options: UserQueryOptions): Prisma.UserWhereInput {
    const { filters } = options;
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (filters.email) where.email = { contains: filters.email, mode: 'insensitive' };
    if (filters.username) where.username = { contains: filters.username, mode: 'insensitive' };
    if (filters.displayName)
      where.displayName = { contains: filters.displayName, mode: 'insensitive' };
    if (filters.status) where.status = filters.status;
    if (filters.role) {
      where.userRoles = { some: { role: { name: filters.role, deletedAt: null } } };
    }
    if (filters.createdFrom || filters.createdTo) {
      where.createdAt = {
        ...(filters.createdFrom ? { gte: filters.createdFrom } : {}),
        ...(filters.createdTo ? { lte: filters.createdTo } : {}),
      };
    }
    if (filters.updatedFrom || filters.updatedTo) {
      where.updatedAt = {
        ...(filters.updatedFrom ? { gte: filters.updatedFrom } : {}),
        ...(filters.updatedTo ? { lte: filters.updatedTo } : {}),
      };
    }
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } },
        { displayName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findMany(options: UserQueryOptions): Promise<{ items: User[]; total: number }> {
    const where = this.buildWhere(options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, orderBy, skip, take: options.limit }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: {
    email: string;
    username?: string | null;
    displayName?: string | null;
    passwordHash?: string | null;
    status?: UserStatus;
    siteId?: string | null;
    tenantId?: string | null;
    metadata?: Prisma.InputJsonValue;
    createdBy: string | null;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username ?? null,
        displayName: data.displayName ?? null,
        passwordHash: data.passwordHash ?? null,
        status: data.status ?? UserStatus.PENDING,
        siteId: data.siteId ?? null,
        tenantId: data.tenantId ?? null,
        metadata: data.metadata ?? Prisma.JsonNull,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      username: string | null;
      displayName: string | null;
      metadata: Prisma.InputJsonValue;
      profileImageId: string | null;
      status: UserStatus;
    }>,
    actorId: string | null
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { ...data, updatedBy: actorId },
    });
  }

  async updatePasswordHash(
    id: string,
    passwordHash: string,
    actorId: string | null
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash, updatedBy: actorId },
    });
  }

  async softDelete(id: string, actorId: string | null): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }

  async findMediaAssetById(mediaAssetId: string): Promise<{ id: string } | null> {
    return this.prisma.mediaAsset.findFirst({
      where: { id: mediaAssetId, deletedAt: null },
      select: { id: true },
    });
  }
}
