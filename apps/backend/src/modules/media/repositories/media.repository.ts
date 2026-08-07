import { Injectable } from '@nestjs/common';
import { MediaAsset, Prisma, Site } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { MediaQueryOptions } from '../interfaces/media-query.interface';
import { MediaSortField } from '../constants/media.constants';

const SORT_FIELD_MAP: Record<MediaSortField, string> = {
  [MediaSortField.FILENAME]: 'storageKey',
  [MediaSortField.MIME_TYPE]: 'mimeType',
  [MediaSortField.FILESIZE]: 'filesize',
  [MediaSortField.CREATED_AT]: 'createdAt',
  [MediaSortField.UPDATED_AT]: 'updatedAt',
};

/**
 * Full CRUD for `MediaAsset`. `folderId` filtering reads the real
 * `MediaAsset.folderId` FK column (Milestone 5) — the legacy
 * `metadata.folderId` JSON hack documented in
 * docs/48_MEDIA_LIBRARY_ARCHITECTURE.md is now read-only/inert, backfilled
 * into the real column by that milestone's migration.
 */
@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.MediaAssetWhereInput {
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

  async findById(id: string, includeDeleted = false): Promise<MediaAsset | null> {
    return this.prisma.mediaAsset.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
    });
  }

  async findByStorageKey(
    storageKey: string,
    siteId: string,
    excludeId?: string
  ): Promise<MediaAsset | null> {
    return this.prisma.mediaAsset.findFirst({
      where: {
        storageKey,
        siteId,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  private buildWhere(siteId: string, options: MediaQueryOptions): Prisma.MediaAssetWhereInput {
    const { filters } = options;
    const where: Prisma.MediaAssetWhereInput = { siteId, deletedAt: null };

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.uploadedBy) where.uploadedBy = filters.uploadedBy;
    if (filters.mimeType) where.mimeType = { contains: filters.mimeType, mode: 'insensitive' };
    if (filters.extension) where.storageKey = { endsWith: filters.extension, mode: 'insensitive' };
    if (filters.filename) {
      where.OR = [
        ...(where.OR ?? []),
        { storageKey: { contains: filters.filename, mode: 'insensitive' } },
        { metadata: { path: ['filename'], string_contains: filters.filename } },
      ];
    }
    if (filters.folderId !== undefined && filters.folderId !== null) {
      where.folderId = filters.folderId;
    }
    if (filters.createdFrom || filters.createdTo) {
      where.createdAt = {
        ...(filters.createdFrom ? { gte: filters.createdFrom } : {}),
        ...(filters.createdTo ? { lte: filters.createdTo } : {}),
      };
    }
    if (filters.search) {
      where.OR = [
        ...(where.OR ?? []),
        { storageKey: { contains: filters.search, mode: 'insensitive' } },
        { altText: { contains: filters.search, mode: 'insensitive' } },
        { caption: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findMany(
    siteId: string,
    options: MediaQueryOptions
  ): Promise<{ items: MediaAsset[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({ where, orderBy, skip, take: options.limit }),
      this.prisma.mediaAsset.count({ where }),
    ]);

    return { items, total };
  }

  /** Global/site-wide pinned assets (`MediaAsset.pinnedAt`) — distinct from per-user `MediaFavorite`. */
  async findPinned(siteId: string): Promise<MediaAsset[]> {
    return this.prisma.mediaAsset.findMany({
      where: { siteId, deletedAt: null, pinnedAt: { not: null } },
      orderBy: { pinnedAt: 'desc' },
    });
  }

  /** Heuristic duplicate detection — no content-hash column exists (see
   * docs/48_MEDIA_LIBRARY_ARCHITECTURE.md "Known Gaps"): matches on
   * (mimeType, filesize) among active rows, excluding the asset itself. */
  async findPossibleDuplicates(
    mimeType: string,
    filesize: bigint,
    excludeId: string
  ): Promise<MediaAsset[]> {
    return this.prisma.mediaAsset.findMany({
      where: { mimeType, filesize, deletedAt: null, id: { not: excludeId } },
    });
  }

  async create(data: Prisma.MediaAssetCreateInput): Promise<MediaAsset> {
    return this.prisma.mediaAsset.create({ data });
  }

  async update(id: string, data: Prisma.MediaAssetUpdateInput): Promise<MediaAsset> {
    return this.prisma.mediaAsset.update({ where: { id }, data });
  }

  async softDelete(id: string, actorId: string | null): Promise<MediaAsset> {
    return this.prisma.mediaAsset.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<MediaAsset> {
    return this.prisma.mediaAsset.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }

  /** The first real hard-delete in this codebase (Milestone 5,
   * `MediaBulkService.permanentDelete`) — every prior "delete" everywhere
   * else is a soft-delete. `MediaFavorite`/`MediaRecentView` use
   * `onDelete: Cascade` specifically because of this method. */
  async hardDelete(id: string): Promise<void> {
    await this.prisma.mediaAsset.delete({ where: { id } });
  }

  // --- Usage / reference detection ---

  async countUserProfileUsage(mediaAssetId: string): Promise<number> {
    return this.prisma.user.count({ where: { profileImageId: mediaAssetId, deletedAt: null } });
  }

  async countAuthorProfileUsage(mediaAssetId: string): Promise<number> {
    return this.prisma.author.count({ where: { profileImageId: mediaAssetId, deletedAt: null } });
  }

  async countArticleFeaturedUsage(mediaAssetId: string): Promise<number> {
    return this.prisma.article.count({ where: { featuredMediaId: mediaAssetId, deletedAt: null } });
  }

  async countArticleMediaUsage(mediaAssetId: string): Promise<number> {
    return this.prisma.articleMedia.count({
      where: { mediaAssetId, article: { deletedAt: null } },
    });
  }

  async findUserProfileUsers(
    mediaAssetId: string
  ): Promise<{ id: string; displayName: string | null; email: string }[]> {
    return this.prisma.user.findMany({
      where: { profileImageId: mediaAssetId, deletedAt: null },
      select: { id: true, displayName: true, email: true },
    });
  }

  async findAuthorProfileAuthors(mediaAssetId: string): Promise<{ id: string; penName: string }[]> {
    return this.prisma.author.findMany({
      where: { profileImageId: mediaAssetId, deletedAt: null },
      select: { id: true, penName: true },
    });
  }

  async findFeaturedArticles(mediaAssetId: string): Promise<{ id: string; title: string }[]> {
    return this.prisma.article.findMany({
      where: { featuredMediaId: mediaAssetId, deletedAt: null },
      select: { id: true, title: true },
    });
  }

  async findArticleMediaLinks(
    mediaAssetId: string
  ): Promise<{ articleId: string; article: { title: string } }[]> {
    return this.prisma.articleMedia.findMany({
      where: { mediaAssetId, article: { deletedAt: null } },
      select: { articleId: true, article: { select: { title: true } } },
    });
  }

  /**
   * Batched siblings of the four `find*` usage-lookup methods above — one
   * query each (filtered by `{ in: mediaAssetIds }`) instead of one per
   * asset, used by `MediaService.listMediaAssets()` to close the N+1
   * pattern the Final Backend Architecture Audit flagged. Each returns a
   * `Map<mediaAssetId, T[]>`; the single-id methods above are unchanged
   * and still used by every single-asset call site (`getUsages`,
   * `deleteMediaAsset`, etc.) — additive, not a repository redesign.
   */
  async findUserProfileUsersForAssets(
    mediaAssetIds: string[]
  ): Promise<Map<string, { id: string; displayName: string | null; email: string }[]>> {
    if (mediaAssetIds.length === 0) return new Map();
    const rows = await this.prisma.user.findMany({
      where: { profileImageId: { in: mediaAssetIds }, deletedAt: null },
      select: { id: true, displayName: true, email: true, profileImageId: true },
    });
    return this.groupByAssetId(rows, (row) => row.profileImageId);
  }

  async findAuthorProfileAuthorsForAssets(
    mediaAssetIds: string[]
  ): Promise<Map<string, { id: string; penName: string }[]>> {
    if (mediaAssetIds.length === 0) return new Map();
    const rows = await this.prisma.author.findMany({
      where: { profileImageId: { in: mediaAssetIds }, deletedAt: null },
      select: { id: true, penName: true, profileImageId: true },
    });
    return this.groupByAssetId(rows, (row) => row.profileImageId);
  }

  async findFeaturedArticlesForAssets(
    mediaAssetIds: string[]
  ): Promise<Map<string, { id: string; title: string }[]>> {
    if (mediaAssetIds.length === 0) return new Map();
    const rows = await this.prisma.article.findMany({
      where: { featuredMediaId: { in: mediaAssetIds }, deletedAt: null },
      select: { id: true, title: true, featuredMediaId: true },
    });
    return this.groupByAssetId(rows, (row) => row.featuredMediaId);
  }

  async findArticleMediaLinksForAssets(
    mediaAssetIds: string[]
  ): Promise<Map<string, { articleId: string; article: { title: string } }[]>> {
    if (mediaAssetIds.length === 0) return new Map();
    const rows = await this.prisma.articleMedia.findMany({
      where: { mediaAssetId: { in: mediaAssetIds }, article: { deletedAt: null } },
      select: { articleId: true, mediaAssetId: true, article: { select: { title: true } } },
    });
    return this.groupByAssetId(rows, (row) => row.mediaAssetId);
  }

  // --- Body-scan usage detection (Milestone 5, media-ref block field) ---

  /** For `media-ref` usage scanning — Page/Article/ReusableBlock have no
   * relational FK for block-tree media references, so the caller walks
   * `body.blocks` itself (`collectMediaReferenceIds`). Queried directly
   * (bypassing `PagesModule`/`ArticlesModule`/`ContentBlocksModule`) to
   * avoid a circular module dependency — mirrors
   * `reusable-block.repository.ts`'s `findActivePageBodies`/
   * `findActiveArticleBodies` for the identical reason. */
  async findActivePageBodies(
    siteId: string
  ): Promise<{ id: string; title: string; slug: string; body: Prisma.JsonValue }[]> {
    return this.prisma.page.findMany({
      where: { siteId, deletedAt: null },
      select: { id: true, title: true, slug: true, body: true },
    });
  }

  async findActiveArticleBodies(
    siteId: string
  ): Promise<{ id: string; title: string; slug: string; body: Prisma.JsonValue }[]> {
    return this.prisma.article.findMany({
      where: { siteId, deletedAt: null },
      select: { id: true, title: true, slug: true, body: true },
    });
  }

  /** `ReusableBlock` stores one `{blockType, data, children}` node, not a
   * `{blocks: BlockNode[]}` tree like Page/Article — selected as its raw
   * parts so the caller can assemble a single synthetic `BlockNode` for
   * the same `collectMediaReferenceIds` walk. */
  async findActiveReusableBlockBodies(siteId: string): Promise<
    {
      id: string;
      name: string;
      blockType: string;
      data: Prisma.JsonValue;
      children: Prisma.JsonValue;
    }[]
  > {
    return this.prisma.reusableBlock.findMany({
      where: { siteId, deletedAt: null },
      select: { id: true, name: true, blockType: true, data: true, children: true },
    });
  }

  private groupByAssetId<T extends { [key: string]: unknown }>(
    rows: T[],
    keyOf: (row: T) => string | null
  ): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const row of rows) {
      const key = keyOf(row);
      if (!key) continue;
      const bucket = map.get(key) ?? [];
      bucket.push(row);
      map.set(key, bucket);
    }
    return map;
  }
}
