import { Injectable } from '@nestjs/common';
import { Layout, Prisma, Site } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { LayoutQueryOptions } from '../interfaces/layout-query.interface';
import { LayoutSortField } from '../constants/layout.constants';

const SORT_FIELD_MAP: Record<LayoutSortField, string> = {
  [LayoutSortField.NAME]: 'name',
  [LayoutSortField.CREATED_AT]: 'createdAt',
  [LayoutSortField.UPDATED_AT]: 'updatedAt',
  [LayoutSortField.STATUS]: 'status',
};

/**
 * Full CRUD for `Layout`, mirroring `ThemesRepository`'s shape (Layout is
 * a site-scoped catalog entity with no ownership split, same as Theme).
 */
@Injectable()
export class LayoutsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.LayoutWhereInput {
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

  async findById(id: string, includeDeleted = false): Promise<Layout | null> {
    return this.prisma.layout.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
    });
  }

  async findBySlug(slug: string, siteId: string, excludeId?: string): Promise<Layout | null> {
    return this.prisma.layout.findFirst({
      where: { slug, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  private buildWhere(siteId: string, options: LayoutQueryOptions): Prisma.LayoutWhereInput {
    const { filters } = options;
    const where: Prisma.LayoutWhereInput = { siteId, deletedAt: null };

    if (filters.status) where.status = filters.status;
    if (filters.themeId) where.themeId = filters.themeId;
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    return where;
  }

  async findMany(
    siteId: string,
    options: LayoutQueryOptions
  ): Promise<{ items: Layout[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.layout.findMany({ where, orderBy, skip, take: options.limit }),
      this.prisma.layout.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: Prisma.LayoutCreateInput): Promise<Layout> {
    return this.prisma.layout.create({ data });
  }

  async update(id: string, data: Prisma.LayoutUpdateInput): Promise<Layout> {
    return this.prisma.layout.update({ where: { id }, data });
  }

  async softDelete(id: string, actorId: string | null): Promise<Layout> {
    return this.prisma.layout.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<Layout> {
    return this.prisma.layout.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }
}
