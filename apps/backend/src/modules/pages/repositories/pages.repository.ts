import { Injectable } from '@nestjs/common';
import { Page, Prisma, Site } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PageQueryOptions } from '../interfaces/page-query.interface';
import { PageSortField } from '../constants/page.constants';

const SORT_FIELD_MAP: Record<PageSortField, string> = {
  [PageSortField.TITLE]: 'title',
  [PageSortField.CREATED_AT]: 'createdAt',
  [PageSortField.UPDATED_AT]: 'updatedAt',
  [PageSortField.PUBLISHED_AT]: 'publishedAt',
  [PageSortField.STATUS]: 'status',
};

const PAGE_INCLUDE = { seoMeta: true } satisfies Prisma.PageInclude;

export type PageWithRelations = Prisma.PageGetPayload<{ include: typeof PAGE_INCLUDE }>;

/**
 * Full CRUD for `Page` — mirrors `ArticlesRepository`'s shape, scoped down
 * to the fields the `Page` model actually has (no author/category/tags/
 * revisions). See docs/69_BACKEND_PAGES.md.
 */
@Injectable()
export class PagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.PageWhereInput {
    return { deletedAt: null };
  }

  /** V1 is single-site (`40_PRODUCT_PHILOSOPHY.md` Principle 6) — same
   * resolution as ArticlesRepository.getDefaultSite(). */
  async getDefaultSite(): Promise<Site> {
    const site = await this.prisma.site.findFirst({ where: { deletedAt: null } });
    if (!site) {
      throw new Error(
        'No active Site exists — the platform must be seeded with at least one Site.'
      );
    }
    return site;
  }

  async findById(id: string, includeDeleted = false): Promise<PageWithRelations | null> {
    return this.prisma.page.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
      include: PAGE_INCLUDE,
    });
  }

  async findBySlug(slug: string, siteId: string, excludeId?: string): Promise<Page | null> {
    return this.prisma.page.findFirst({
      where: { slug, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  async findBySlugWithRelations(slug: string, siteId: string): Promise<PageWithRelations | null> {
    return this.prisma.page.findFirst({
      where: { slug, siteId, deletedAt: null },
      include: PAGE_INCLUDE,
    });
  }

  private buildWhere(siteId: string, options: PageQueryOptions): Prisma.PageWhereInput {
    const { filters } = options;
    const where: Prisma.PageWhereInput = { siteId, deletedAt: null };

    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }

    return where;
  }

  async findMany(
    siteId: string,
    options: PageQueryOptions
  ): Promise<{ items: PageWithRelations[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        orderBy,
        skip,
        take: options.limit,
        include: PAGE_INCLUDE,
      }),
      this.prisma.page.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: Prisma.PageCreateInput): Promise<PageWithRelations> {
    return this.prisma.page.create({ data, include: PAGE_INCLUDE });
  }

  async update(id: string, data: Prisma.PageUpdateInput): Promise<PageWithRelations> {
    return this.prisma.page.update({ where: { id }, data, include: PAGE_INCLUDE });
  }

  async softDelete(id: string, actorId: string | null): Promise<Page> {
    return this.prisma.page.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<Page> {
    return this.prisma.page.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }

  /** Mirrors `ArticlesRepository.upsertSeoMeta` / `CategoriesRepository`'s
   * equivalent — each content module owns a small copy of this helper
   * rather than sharing code cross-module, matching the established
   * convention (see docs/68_FRONTEND_SEO.md's backend research: Articles
   * and Categories each have their own inline upsert, never a shared
   * cross-module SEO write path). */
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
