import { Injectable } from '@nestjs/common';
import { Pattern, PatternStatus, Prisma, Site } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PatternQueryOptions } from '../interfaces/pattern-query.interface';
import { PatternSortField } from '../constants/patterns.constants';

const SORT_FIELD_MAP: Record<PatternSortField, string> = {
  [PatternSortField.NAME]: 'name',
  [PatternSortField.CREATED_AT]: 'createdAt',
  [PatternSortField.UPDATED_AT]: 'updatedAt',
};

/** Full CRUD for `Pattern` — mirrors `ReusableBlockRepository`'s exact
 * shape (a site-scoped catalog entity, no ownership split). */
@Injectable()
export class PatternRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.PatternWhereInput {
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

  async findById(id: string, includeDeleted = false): Promise<Pattern | null> {
    return this.prisma.pattern.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
    });
  }

  async findBySlug(slug: string, siteId: string, excludeId?: string): Promise<Pattern | null> {
    return this.prisma.pattern.findFirst({
      where: { slug, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  async mediaAssetExists(mediaAssetId: string, siteId: string): Promise<boolean> {
    const count = await this.prisma.mediaAsset.count({
      where: { id: mediaAssetId, siteId, deletedAt: null },
    });
    return count > 0;
  }

  private buildWhere(siteId: string, options: PatternQueryOptions): Prisma.PatternWhereInput {
    const { filters } = options;
    const where: Prisma.PatternWhereInput = { siteId, deletedAt: null };

    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.tags && filters.tags.length > 0) where.tags = { hasSome: filters.tags };
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
    options: PatternQueryOptions
  ): Promise<{ items: Pattern[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.pattern.findMany({ where, orderBy, skip, take: options.limit }),
      this.prisma.pattern.count({ where }),
    ]);

    return { items, total };
  }

  async findManyByIds(ids: string[], siteId: string): Promise<Pattern[]> {
    if (ids.length === 0) return [];
    return this.prisma.pattern.findMany({ where: { id: { in: ids }, siteId, deletedAt: null } });
  }

  async create(data: Prisma.PatternCreateInput): Promise<Pattern> {
    return this.prisma.pattern.create({ data });
  }

  async update(id: string, data: Prisma.PatternUpdateInput): Promise<Pattern> {
    return this.prisma.pattern.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: PatternStatus, actorId: string | null): Promise<Pattern> {
    return this.prisma.pattern.update({ where: { id }, data: { status, updatedBy: actorId } });
  }

  async softDelete(id: string, actorId: string | null): Promise<Pattern> {
    return this.prisma.pattern.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<Pattern> {
    return this.prisma.pattern.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }

  // --- Origin scanning (Milestone 6) — mirrors
  // `reusable-block.repository.ts`'s `findActivePageBodies`/
  // `findActiveArticleBodies` exactly, plus a third source
  // (`ReusableBlock`) since a pattern can be inserted inside a reusable
  // block's own body too. Queried directly (bypassing PagesModule/
  // ArticlesModule/ContentBlocksModule) to avoid a circular module
  // dependency — this repository already queries `prisma.site`/
  // `prisma.mediaAsset` directly above for the same reason.

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
}
