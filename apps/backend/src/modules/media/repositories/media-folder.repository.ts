import { Injectable } from '@nestjs/common';
import { MediaFolder, Prisma, Site } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { MediaFolderQueryOptions } from '../interfaces/media-folder-query.interface';
import { MediaFolderSortField } from '../constants/media.constants';

const SORT_FIELD_MAP: Record<MediaFolderSortField, string> = {
  [MediaFolderSortField.NAME]: 'name',
  [MediaFolderSortField.SLUG]: 'slug',
  [MediaFolderSortField.CREATED_AT]: 'createdAt',
  [MediaFolderSortField.UPDATED_AT]: 'updatedAt',
};

/** Full CRUD for `MediaFolder` — no schema change. */
@Injectable()
export class MediaFolderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDefaultSite(): Promise<Site> {
    const site = await this.prisma.site.findFirst({ where: { deletedAt: null } });
    if (!site) {
      throw new Error(
        'No active Site exists — the platform must be seeded with at least one Site.'
      );
    }
    return site;
  }

  async findAllForSite(siteId: string): Promise<MediaFolder[]> {
    return this.prisma.mediaFolder.findMany({ where: { siteId, deletedAt: null } });
  }

  async findById(id: string, includeDeleted = false): Promise<MediaFolder | null> {
    return this.prisma.mediaFolder.findFirst({
      where: { id, ...(includeDeleted ? {} : { deletedAt: null }) },
    });
  }

  async findBySlug(slug: string, siteId: string, excludeId?: string): Promise<MediaFolder | null> {
    return this.prisma.mediaFolder.findFirst({
      where: { slug, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  private buildWhere(
    siteId: string,
    options: MediaFolderQueryOptions
  ): Prisma.MediaFolderWhereInput {
    const where: Prisma.MediaFolderWhereInput = { siteId, deletedAt: null };
    if (options.filters.parentId !== undefined) where.parentId = options.filters.parentId;
    if (options.filters.search) {
      where.name = { contains: options.filters.search, mode: 'insensitive' };
    }
    return where;
  }

  async findMany(
    siteId: string,
    options: MediaFolderQueryOptions
  ): Promise<{ items: MediaFolder[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.mediaFolder.findMany({ where, orderBy, skip, take: options.limit }),
      this.prisma.mediaFolder.count({ where }),
    ]);

    return { items, total };
  }

  async countActiveChildren(folderId: string): Promise<number> {
    return this.prisma.mediaFolder.count({ where: { parentId: folderId, deletedAt: null } });
  }

  /** Counts active `MediaAsset` rows whose `metadata.folderId` points at
   * this folder — no real FK exists (see docs/48_MEDIA_LIBRARY_ARCHITECTURE.md
   * "Known Gaps"). */
  async countActiveAssets(folderId: string): Promise<number> {
    return this.prisma.mediaAsset.count({
      where: { deletedAt: null, metadata: { path: ['folderId'], equals: folderId } },
    });
  }

  async create(data: Prisma.MediaFolderCreateInput): Promise<MediaFolder> {
    return this.prisma.mediaFolder.create({ data });
  }

  async update(id: string, data: Prisma.MediaFolderUpdateInput): Promise<MediaFolder> {
    return this.prisma.mediaFolder.update({ where: { id }, data });
  }

  async softDelete(id: string, actorId: string | null): Promise<MediaFolder> {
    return this.prisma.mediaFolder.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<MediaFolder> {
    return this.prisma.mediaFolder.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }
}
