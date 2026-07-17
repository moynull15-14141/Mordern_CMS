import { Injectable } from '@nestjs/common';
import { Article, ArticleRevision, Author, Category, Prisma, Site, Tag } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ArticleQueryOptions } from '../interfaces/article-query.interface';
import { ArticleSortField } from '../constants/article.constants';

const SORT_FIELD_MAP: Record<ArticleSortField, string> = {
  [ArticleSortField.TITLE]: 'title',
  [ArticleSortField.CREATED_AT]: 'createdAt',
  [ArticleSortField.UPDATED_AT]: 'updatedAt',
  [ArticleSortField.PUBLISHED_AT]: 'publishedAt',
  [ArticleSortField.STATUS]: 'status',
};

const ARTICLE_INCLUDE = {
  author: true,
  primaryCategory: true,
  seoMeta: true,
  tags: { include: { tag: true } },
} satisfies Prisma.ArticleInclude;

export type ArticleWithRelations = Prisma.ArticleGetPayload<{ include: typeof ARTICLE_INCLUDE }>;

/**
 * Full CRUD for `Article` + read access to the models it references
 * (Author, Category, Tag, Site, SeoMeta, MediaAsset) — no schema change, no
 * migration. See docs/46_ARTICLES_ARCHITECTURE.md "Reuse & Lookups".
 */
@Injectable()
export class ArticlesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.ArticleWhereInput {
    return { deletedAt: null };
  }

  /** V1 is single-site (`40_PRODUCT_PHILOSOPHY.md` Principle 6) — no
   * "current site" resolution utility exists anywhere yet, so this module
   * resolves the one seeded Site directly rather than inventing multi-site
   * routing. */
  async getDefaultSite(): Promise<Site> {
    const site = await this.prisma.site.findFirst({ where: { deletedAt: null } });
    if (!site) {
      throw new Error(
        'No active Site exists — the platform must be seeded with at least one Site.'
      );
    }
    return site;
  }

  async findAuthorById(authorId: string): Promise<Author | null> {
    return this.prisma.author.findFirst({ where: { id: authorId, deletedAt: null } });
  }

  async findCategoryById(categoryId: string): Promise<Category | null> {
    return this.prisma.category.findFirst({ where: { id: categoryId, deletedAt: null } });
  }

  async findTagsByIds(tagIds: string[]): Promise<Tag[]> {
    if (tagIds.length === 0) return [];
    return this.prisma.tag.findMany({ where: { id: { in: tagIds }, deletedAt: null } });
  }

  async findMediaAssetById(mediaAssetId: string): Promise<{ id: string } | null> {
    return this.prisma.mediaAsset.findFirst({
      where: { id: mediaAssetId, deletedAt: null },
      select: { id: true },
    });
  }

  async findById(id: string, includeDeleted = false): Promise<ArticleWithRelations | null> {
    return this.prisma.article.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
      include: ARTICLE_INCLUDE,
    });
  }

  async findBySlug(slug: string, siteId: string, excludeId?: string): Promise<Article | null> {
    return this.prisma.article.findFirst({
      where: { slug, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  async findBySlugWithRelations(
    slug: string,
    siteId: string
  ): Promise<ArticleWithRelations | null> {
    return this.prisma.article.findFirst({
      where: { slug, siteId, deletedAt: null },
      include: ARTICLE_INCLUDE,
    });
  }

  private buildWhere(siteId: string, options: ArticleQueryOptions): Prisma.ArticleWhereInput {
    const { filters } = options;
    const where: Prisma.ArticleWhereInput = { siteId, deletedAt: null };

    if (filters.status) where.status = filters.status;
    if (filters.visibility) where.visibility = filters.visibility;
    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.categoryId) where.primaryCategoryId = filters.categoryId;
    if (filters.tagId) where.tags = { some: { tagId: filters.tagId } };
    if (filters.publishedFrom || filters.publishedTo) {
      where.publishedAt = {
        ...(filters.publishedFrom ? { gte: filters.publishedFrom } : {}),
        ...(filters.publishedTo ? { lte: filters.publishedTo } : {}),
      };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { subtitle: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findMany(
    siteId: string,
    options: ArticleQueryOptions
  ): Promise<{ items: ArticleWithRelations[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy,
        skip,
        take: options.limit,
        include: ARTICLE_INCLUDE,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { items, total };
  }

  /** Runs `fn` inside a single Prisma interactive transaction — used by
   * `ArticlesService.createArticle()` (stabilization patch, post-Final-
   * Backend-Audit) so create + tag assignment + initial revision either
   * all commit or all roll back together, closing the partial-failure
   * window the audit flagged. Every method below accepts an optional
   * trailing `tx` (defaulting to `this.prisma`) so existing call sites
   * outside a transaction are unaffected. */
  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  async create(
    data: Prisma.ArticleCreateInput,
    tx: Prisma.TransactionClient | PrismaService = this.prisma
  ): Promise<ArticleWithRelations> {
    return tx.article.create({ data, include: ARTICLE_INCLUDE });
  }

  async update(id: string, data: Prisma.ArticleUpdateInput): Promise<ArticleWithRelations> {
    return this.prisma.article.update({ where: { id }, data, include: ARTICLE_INCLUDE });
  }

  async softDelete(id: string, actorId: string | null): Promise<Article> {
    return this.prisma.article.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<Article> {
    return this.prisma.article.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }

  /** Replaces the full tag set for an article. `primary` marks at most one
   * tag as the article's primary tag (mirrors `Article.primaryCategoryId`'s
   * single-primary pattern, applied to the M:N ArticleTag join). */
  async setTags(
    articleId: string,
    tagIds: string[],
    primaryTagId?: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma
  ): Promise<void> {
    if (tx === this.prisma) {
      // Standalone call (no outer transaction) — keep delete+create atomic
      // exactly as before this patch, via array-form $transaction.
      await this.prisma.$transaction([
        this.prisma.articleTag.deleteMany({ where: { articleId } }),
        ...(tagIds.length > 0
          ? [
              this.prisma.articleTag.createMany({
                data: tagIds.map((tagId) => ({
                  articleId,
                  tagId,
                  primary: tagId === primaryTagId,
                })),
              }),
            ]
          : []),
      ]);
      return;
    }
    // Already running inside ArticlesRepository.transaction()'s callback —
    // sequential awaits on the same `tx` still commit/roll back together
    // as part of that outer transaction (Prisma's TransactionClient has no
    // nested $transaction method by design).
    await tx.articleTag.deleteMany({ where: { articleId } });
    if (tagIds.length > 0) {
      await tx.articleTag.createMany({
        data: tagIds.map((tagId) => ({ articleId, tagId, primary: tagId === primaryTagId })),
      });
    }
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

  // --- Revisions ---

  async getMaxRevisionVersion(
    articleId: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma
  ): Promise<number> {
    const latest = await tx.articleRevision.findFirst({
      where: { articleId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    return latest?.version ?? 0;
  }

  async createRevision(
    data: Prisma.ArticleRevisionCreateInput,
    tx: Prisma.TransactionClient | PrismaService = this.prisma
  ): Promise<ArticleRevision> {
    return tx.articleRevision.create({ data });
  }

  async findRevisions(articleId: string): Promise<ArticleRevision[]> {
    return this.prisma.articleRevision.findMany({
      where: { articleId },
      orderBy: { version: 'desc' },
    });
  }

  async findRevision(articleId: string, version: number): Promise<ArticleRevision | null> {
    return this.prisma.articleRevision.findFirst({ where: { articleId, version } });
  }
}
