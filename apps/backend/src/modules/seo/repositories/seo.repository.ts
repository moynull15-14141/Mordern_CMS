import { Injectable } from '@nestjs/common';
import { Prisma, SeoMeta } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

/**
 * Full CRUD for `SeoMeta` — no schema change. Article/Category/Page
 * existence + `seoMetaId` lookups query those tables directly (not via
 * ArticlesModule/CategoriesModule repositories), mirroring how the
 * Comments module validated Article/User existence directly rather than
 * importing those modules — see `49_COMMENTS_ARCHITECTURE.md` "Conflict
 * Resolution" #13, applied identically here.
 */
@Injectable()
export class SeoRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.SeoMetaWhereInput {
    return { deletedAt: null };
  }

  async siteExists(siteId: string): Promise<boolean> {
    const site = await this.prisma.site.findFirst({
      where: { id: siteId, deletedAt: null },
      select: { id: true },
    });
    return site !== null;
  }

  async findById(id: string, includeDeleted = false): Promise<SeoMeta | null> {
    return this.prisma.seoMeta.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
    });
  }

  async exists(id: string): Promise<boolean> {
    const row = await this.prisma.seoMeta.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    return row !== null;
  }

  async create(data: Prisma.SeoMetaCreateInput): Promise<SeoMeta> {
    return this.prisma.seoMeta.create({ data });
  }

  async update(id: string, data: Prisma.SeoMetaUpdateInput): Promise<SeoMeta> {
    return this.prisma.seoMeta.update({ where: { id }, data });
  }

  async softDelete(id: string, actorId: string | null): Promise<SeoMeta> {
    return this.prisma.seoMeta.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<SeoMeta> {
    return this.prisma.seoMeta.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }

  // --- Lookup by owning entity ---
  // `Article`/`Category`/`Page` hold the FK (`seoMetaId`); `SeoMeta` itself
  // has no back-pointer, so these look up the owning entity first.

  async findArticleSeoMetaId(
    articleId: string
  ): Promise<{ found: boolean; seoMetaId: string | null }> {
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
      select: { seoMetaId: true },
    });
    return article
      ? { found: true, seoMetaId: article.seoMetaId }
      : { found: false, seoMetaId: null };
  }

  async findCategorySeoMetaId(
    categoryId: string
  ): Promise<{ found: boolean; seoMetaId: string | null }> {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, deletedAt: null },
      select: { seoMetaId: true },
    });
    return category
      ? { found: true, seoMetaId: category.seoMetaId }
      : { found: false, seoMetaId: null };
  }

  /** No `GET /seo/page/:pageId` endpoint exists in the milestone's API
   * list (see docs/51_SEO_ARCHITECTURE.md "Conflict Resolution"), but the
   * capability is implemented at the repository layer per the brief's
   * Repository section, matching the Comments milestone's precedent of
   * implementing a repository method beyond what any controller route
   * exposes when the brief's sections disagree. */
  async findPageSeoMetaId(pageId: string): Promise<{ found: boolean; seoMetaId: string | null }> {
    const page = await this.prisma.page.findFirst({
      where: { id: pageId, deletedAt: null },
      select: { seoMetaId: true },
    });
    return page ? { found: true, seoMetaId: page.seoMetaId } : { found: false, seoMetaId: null };
  }
}
