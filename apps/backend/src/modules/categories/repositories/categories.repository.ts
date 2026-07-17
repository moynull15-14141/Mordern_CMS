import { Injectable } from '@nestjs/common';
import { Category, Prisma, SeoMeta, Site } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CategoryQueryOptions } from '../interfaces/category-query.interface';
import { CategorySortField } from '../constants/category.constants';

const SORT_FIELD_MAP: Record<CategorySortField, string> = {
  [CategorySortField.NAME]: 'name',
  [CategorySortField.SLUG]: 'slug',
  [CategorySortField.SORT_ORDER]: 'sortOrder',
  [CategorySortField.CREATED_AT]: 'createdAt',
  [CategorySortField.UPDATED_AT]: 'updatedAt',
};

/** Full CRUD for `Category` — no schema change. See
 * docs/47_CATEGORY_TAG_ARCHITECTURE.md "Reuse & Lookups". */
@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.CategoryWhereInput {
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

  async findAllForSite(siteId: string): Promise<Category[]> {
    return this.prisma.category.findMany({ where: { siteId, deletedAt: null } });
  }

  async findById(id: string, includeDeleted = false): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
    });
  }

  async findBySlug(slug: string, siteId: string, excludeId?: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: { slug, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  async findByName(name: string, siteId: string, excludeId?: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: { name, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  private buildWhere(siteId: string, options: CategoryQueryOptions): Prisma.CategoryWhereInput {
    const { filters } = options;
    const where: Prisma.CategoryWhereInput = { siteId, deletedAt: null };

    if (filters.status) where.status = filters.status;
    if (filters.parentId !== undefined) where.parentId = filters.parentId;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findMany(
    siteId: string,
    options: CategoryQueryOptions
  ): Promise<{ items: Category[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({ where, orderBy, skip, take: options.limit }),
      this.prisma.category.count({ where }),
    ]);

    return { items, total };
  }

  async countArticlesUsingCategory(categoryId: string): Promise<number> {
    return this.prisma.article.count({ where: { primaryCategoryId: categoryId, deletedAt: null } });
  }

  async countActiveChildren(categoryId: string): Promise<number> {
    return this.prisma.category.count({ where: { parentId: categoryId, deletedAt: null } });
  }

  async findSeoMetaById(seoMetaId: string): Promise<SeoMeta | null> {
    return this.prisma.seoMeta.findUnique({ where: { id: seoMetaId } });
  }

  /**
   * Batched siblings of `countArticlesUsingCategory`/`countActiveChildren`/
   * `findSeoMetaById` — one query each instead of one-per-category, used by
   * `CategoriesService`'s list-shaped methods (`listCategories`, `getTree`,
   * `getChildren`, `getDescendants`, `getAncestors`) to close the N+1
   * pattern the Final Backend Architecture Audit flagged. The original
   * single-id methods above are unchanged and still used by every
   * single-category call site (`getCategory`, `createCategory`, etc.) —
   * additive, not a repository redesign.
   */
  async countArticlesUsingCategories(categoryIds: string[]): Promise<Map<string, number>> {
    if (categoryIds.length === 0) return new Map();
    const grouped = await this.prisma.article.groupBy({
      by: ['primaryCategoryId'],
      where: { primaryCategoryId: { in: categoryIds }, deletedAt: null },
      _count: { _all: true },
    });
    const counts = new Map<string, number>();
    for (const row of grouped) {
      if (row.primaryCategoryId) counts.set(row.primaryCategoryId, row._count._all);
    }
    return counts;
  }

  async countActiveChildrenForCategories(categoryIds: string[]): Promise<Map<string, number>> {
    if (categoryIds.length === 0) return new Map();
    const grouped = await this.prisma.category.groupBy({
      by: ['parentId'],
      where: { parentId: { in: categoryIds }, deletedAt: null },
      _count: { _all: true },
    });
    const counts = new Map<string, number>();
    for (const row of grouped) {
      if (row.parentId) counts.set(row.parentId, row._count._all);
    }
    return counts;
  }

  async findSeoMetaByIds(seoMetaIds: string[]): Promise<Map<string, SeoMeta>> {
    if (seoMetaIds.length === 0) return new Map();
    const rows = await this.prisma.seoMeta.findMany({ where: { id: { in: seoMetaIds } } });
    return new Map(rows.map((row) => [row.id, row]));
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  async softDelete(id: string, actorId: string | null): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }

  async upsertSeoMeta(
    existingSeoMetaId: string | null,
    siteId: string,
    data: Prisma.SeoMetaCreateInput | Prisma.SeoMetaUpdateInput,
    actorId: string | null
  ): Promise<string> {
    if (existingSeoMetaId) {
      const updated = await this.prisma.seoMeta.update({
        where: { id: existingSeoMetaId },
        data: { ...data, updatedBy: actorId },
      });
      return updated.id;
    }
    const created = await this.prisma.seoMeta.create({
      data: {
        ...(data as Prisma.SeoMetaCreateInput),
        site: { connect: { id: siteId } },
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
    return created.id;
  }
}
