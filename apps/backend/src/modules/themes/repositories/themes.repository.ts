import { Injectable } from '@nestjs/common';
import { Prisma, Site, Theme } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ThemeQueryOptions } from '../interfaces/theme-query.interface';
import { ThemeSortField } from '../constants/theme.constants';

const SORT_FIELD_MAP: Record<ThemeSortField, string> = {
  [ThemeSortField.NAME]: 'name',
  [ThemeSortField.CREATED_AT]: 'createdAt',
  [ThemeSortField.UPDATED_AT]: 'updatedAt',
  [ThemeSortField.STATUS]: 'status',
};

/**
 * Full CRUD for `Theme`, mirroring `PagesRepository`/`MenusRepository`'s
 * shape. See docs/72_BACKEND_THEMES.md.
 */
@Injectable()
export class ThemesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.ThemeWhereInput {
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

  async findById(id: string, includeDeleted = false): Promise<Theme | null> {
    return this.prisma.theme.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
    });
  }

  async findBySlug(slug: string, siteId: string, excludeId?: string): Promise<Theme | null> {
    return this.prisma.theme.findFirst({
      where: { slug, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  /** Only ever returns a non-deleted row — a soft-deleted theme's
   * `isActive: true` (if it was active at the moment of deletion) never
   * makes it "active" again from this method's point of view, so no
   * separate rule is needed to handle "the active theme got deleted"
   * (see docs/72_BACKEND_THEMES.md "Known Limitations"). */
  async findActive(siteId: string): Promise<Theme | null> {
    return this.prisma.theme.findFirst({ where: { siteId, isActive: true, deletedAt: null } });
  }

  private buildWhere(siteId: string, options: ThemeQueryOptions): Prisma.ThemeWhereInput {
    const { filters } = options;
    const where: Prisma.ThemeWhereInput = { siteId, deletedAt: null };

    if (filters.status) where.status = filters.status;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    return where;
  }

  async findMany(
    siteId: string,
    options: ThemeQueryOptions
  ): Promise<{ items: Theme[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.theme.findMany({ where, orderBy, skip, take: options.limit }),
      this.prisma.theme.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: Prisma.ThemeCreateInput): Promise<Theme> {
    return this.prisma.theme.create({ data });
  }

  async update(id: string, data: Prisma.ThemeUpdateInput): Promise<Theme> {
    return this.prisma.theme.update({ where: { id }, data });
  }

  async softDelete(id: string, actorId: string | null): Promise<Theme> {
    return this.prisma.theme.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<Theme> {
    return this.prisma.theme.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }

  /** "Only one active theme per Site. Activation must automatically
   * deactivate the previous one" — both writes run inside one
   * transaction so the site is never left with zero or two active themes
   * mid-request, mirroring the atomicity reasoning
   * `MenusRepository.reorderItems` documents for its own multi-row
   * update. */
  async activate(id: string, siteId: string, actorId: string | null): Promise<Theme> {
    const [, activated] = await this.prisma.$transaction([
      this.prisma.theme.updateMany({
        where: { siteId, isActive: true, id: { not: id } },
        data: { isActive: false, updatedBy: actorId },
      }),
      this.prisma.theme.update({
        where: { id },
        data: { isActive: true, updatedBy: actorId },
      }),
    ]);
    return activated;
  }
}
