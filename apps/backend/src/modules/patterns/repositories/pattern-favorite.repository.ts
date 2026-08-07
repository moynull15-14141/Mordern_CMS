import { Injectable } from '@nestjs/common';
import { Pattern } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

/** `PatternFavorite` CRUD — mirrors
 * `media-engagement.repository.ts`'s favorite half exactly, applied to a
 * new entity (not a duplicate mechanism; Recent Use is deliberately
 * client-only for Patterns — see `pattern-recency.ts` on the admin side —
 * so there is no recent-view counterpart here). */
@Injectable()
export class PatternFavoriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async isFavorite(userId: string, patternId: string): Promise<boolean> {
    const favorite = await this.prisma.patternFavorite.findUnique({
      where: { userId_patternId: { userId, patternId } },
    });
    return favorite !== null;
  }

  async addFavorite(userId: string, patternId: string): Promise<void> {
    await this.prisma.patternFavorite.upsert({
      where: { userId_patternId: { userId, patternId } },
      create: { userId, patternId },
      update: {},
    });
  }

  async removeFavorite(userId: string, patternId: string): Promise<void> {
    await this.prisma.patternFavorite.deleteMany({ where: { userId, patternId } });
  }

  async findFavoritePatterns(userId: string, siteId: string): Promise<Pattern[]> {
    const favorites = await this.prisma.patternFavorite.findMany({
      where: { userId, pattern: { siteId, deletedAt: null } },
      include: { pattern: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((favorite) => favorite.pattern);
  }
}
