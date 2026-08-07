import { Injectable } from '@nestjs/common';
import { MediaAsset } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

const RECENT_VIEWS_LIMIT = 50;

/**
 * `MediaFavorite` (per-user bookmark) + `MediaRecentView` (bounded
 * upsert-on-view log) CRUD — kept out of `MediaRepository` since neither
 * model is `MediaAsset` itself, mirroring this codebase's "one repository
 * per Prisma model" convention elsewhere (`MediaRepository`/
 * `MediaFolderRepository` are already split the same way).
 */
@Injectable()
export class MediaEngagementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async isFavorite(userId: string, mediaAssetId: string): Promise<boolean> {
    const favorite = await this.prisma.mediaFavorite.findUnique({
      where: { userId_mediaAssetId: { userId, mediaAssetId } },
    });
    return favorite !== null;
  }

  async addFavorite(userId: string, mediaAssetId: string): Promise<void> {
    await this.prisma.mediaFavorite.upsert({
      where: { userId_mediaAssetId: { userId, mediaAssetId } },
      create: { userId, mediaAssetId },
      update: {},
    });
  }

  async removeFavorite(userId: string, mediaAssetId: string): Promise<void> {
    await this.prisma.mediaFavorite.deleteMany({ where: { userId, mediaAssetId } });
  }

  async findFavoriteAssets(userId: string): Promise<MediaAsset[]> {
    const favorites = await this.prisma.mediaFavorite.findMany({
      where: { userId, mediaAsset: { deletedAt: null } },
      include: { mediaAsset: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((favorite) => favorite.mediaAsset);
  }

  /** Upsert-on-view, bounded to the most recent `RECENT_VIEWS_LIMIT` rows
   * per user (not an unbounded log). */
  async recordView(userId: string, mediaAssetId: string): Promise<void> {
    await this.prisma.mediaRecentView.upsert({
      where: { userId_mediaAssetId: { userId, mediaAssetId } },
      create: { userId, mediaAssetId },
      update: { viewedAt: new Date() },
    });

    const overflow = await this.prisma.mediaRecentView.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      skip: RECENT_VIEWS_LIMIT,
      select: { id: true },
    });
    if (overflow.length > 0) {
      await this.prisma.mediaRecentView.deleteMany({
        where: { id: { in: overflow.map((row) => row.id) } },
      });
    }
  }

  async findRecentAssets(userId: string): Promise<MediaAsset[]> {
    const views = await this.prisma.mediaRecentView.findMany({
      where: { userId, mediaAsset: { deletedAt: null } },
      include: { mediaAsset: true },
      orderBy: { viewedAt: 'desc' },
      take: RECENT_VIEWS_LIMIT,
    });
    return views.map((view) => view.mediaAsset);
  }
}
