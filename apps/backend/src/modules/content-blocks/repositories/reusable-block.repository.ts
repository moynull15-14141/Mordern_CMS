import { Injectable } from '@nestjs/common';
import { Prisma, ReusableBlock, Site } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ReusableBlockQueryOptions } from '../interfaces/reusable-block-query.interface';
import { ReusableBlockSortField } from '../constants/reusable-block.constants';

const SORT_FIELD_MAP: Record<ReusableBlockSortField, string> = {
  [ReusableBlockSortField.NAME]: 'name',
  [ReusableBlockSortField.CREATED_AT]: 'createdAt',
  [ReusableBlockSortField.UPDATED_AT]: 'updatedAt',
};

/** Full CRUD for `ReusableBlock`, mirroring `LayoutsRepository`'s shape
 * (a site-scoped catalog entity with no ownership split). */
@Injectable()
export class ReusableBlockRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.ReusableBlockWhereInput {
    return { deletedAt: null };
  }

  async getDefaultSite(): Promise<Site> {
    const site = await this.prisma.site.findFirst({ where: { deletedAt: null } });
    if (!site) {
      throw new Error(
        'No active Site exists — the platform must be seeded with at least one Site.'
      );
    }
    return site;
  }

  async findById(id: string, includeDeleted = false): Promise<ReusableBlock | null> {
    return this.prisma.reusableBlock.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
    });
  }

  async findByName(
    name: string,
    siteId: string,
    excludeId?: string
  ): Promise<ReusableBlock | null> {
    return this.prisma.reusableBlock.findFirst({
      where: { name, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  private buildWhere(
    siteId: string,
    options: ReusableBlockQueryOptions
  ): Prisma.ReusableBlockWhereInput {
    const { filters } = options;
    const where: Prisma.ReusableBlockWhereInput = { siteId, deletedAt: null };

    if (filters.blockType) where.blockType = filters.blockType;
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    return where;
  }

  async findMany(
    siteId: string,
    options: ReusableBlockQueryOptions
  ): Promise<{ items: ReusableBlock[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.reusableBlock.findMany({ where, orderBy, skip, take: options.limit }),
      this.prisma.reusableBlock.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: Prisma.ReusableBlockCreateInput): Promise<ReusableBlock> {
    return this.prisma.reusableBlock.create({ data });
  }

  async update(id: string, data: Prisma.ReusableBlockUpdateInput): Promise<ReusableBlock> {
    return this.prisma.reusableBlock.update({ where: { id }, data });
  }

  async softDelete(id: string, actorId: string | null): Promise<ReusableBlock> {
    return this.prisma.reusableBlock.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<ReusableBlock> {
    return this.prisma.reusableBlock.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }
}
