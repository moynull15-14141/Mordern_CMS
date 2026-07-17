import { Injectable } from '@nestjs/common';
import { Prisma, Site, Tag } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TagQueryOptions } from '../interfaces/tag-query.interface';
import { TagSortField } from '../constants/category.constants';

const SORT_FIELD_MAP: Record<TagSortField, string> = {
  [TagSortField.NAME]: 'name',
  [TagSortField.SLUG]: 'slug',
  [TagSortField.CREATED_AT]: 'createdAt',
  [TagSortField.UPDATED_AT]: 'updatedAt',
};

/** Full CRUD for `Tag` — no schema change. No `color` field exists on the
 * frozen model (see docs/47_CATEGORY_TAG_ARCHITECTURE.md "Known Gaps") —
 * not implemented. */
@Injectable()
export class TagsRepository {
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

  async findById(id: string, includeDeleted = false): Promise<Tag | null> {
    return this.prisma.tag.findFirst({
      where: { id, ...(includeDeleted ? {} : { deletedAt: null }) },
    });
  }

  async findBySlug(slug: string, siteId: string, excludeId?: string): Promise<Tag | null> {
    return this.prisma.tag.findFirst({
      where: { slug, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  async findByName(name: string, siteId: string, excludeId?: string): Promise<Tag | null> {
    return this.prisma.tag.findFirst({
      where: { name, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  private buildWhere(siteId: string, options: TagQueryOptions): Prisma.TagWhereInput {
    const where: Prisma.TagWhereInput = { siteId, deletedAt: null };
    if (options.filters.search) {
      where.OR = [
        { name: { contains: options.filters.search, mode: 'insensitive' } },
        { description: { contains: options.filters.search, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  async findMany(
    siteId: string,
    options: TagQueryOptions
  ): Promise<{ items: Tag[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.tag.findMany({ where, orderBy, skip, take: options.limit }),
      this.prisma.tag.count({ where }),
    ]);

    return { items, total };
  }

  async countArticlesUsingTag(tagId: string): Promise<number> {
    return this.prisma.articleTag.count({ where: { tagId, article: { deletedAt: null } } });
  }

  async create(data: Prisma.TagCreateInput): Promise<Tag> {
    return this.prisma.tag.create({ data });
  }

  async update(id: string, data: Prisma.TagUpdateInput): Promise<Tag> {
    return this.prisma.tag.update({ where: { id }, data });
  }

  async softDelete(id: string, actorId: string | null): Promise<Tag> {
    return this.prisma.tag.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<Tag> {
    return this.prisma.tag.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }
}
