import { Injectable } from '@nestjs/common';
import { Prisma, Redirect, Site } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { RedirectQueryOptions } from '../interfaces/redirect-query.interface';
import { RedirectSortField } from '../constants/redirect.constants';

const SORT_FIELD_MAP: Record<RedirectSortField, string> = {
  [RedirectSortField.SOURCE_PATH]: 'sourcePath',
  [RedirectSortField.CREATED_AT]: 'createdAt',
  [RedirectSortField.UPDATED_AT]: 'updatedAt',
};

@Injectable()
export class RedirectsRepository {
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

  async findById(id: string, includeDeleted = false): Promise<Redirect | null> {
    return this.prisma.redirect.findFirst({
      where: { id, ...(includeDeleted ? {} : { deletedAt: null }) },
    });
  }

  /** The one lookup the public resolver actually needs — only ACTIVE,
   * non-deleted redirects are ever followed. */
  async findActiveBySourcePath(sourcePath: string, siteId: string): Promise<Redirect | null> {
    return this.prisma.redirect.findFirst({
      where: { sourcePath, siteId, status: 'ACTIVE', deletedAt: null },
    });
  }

  /** Used for duplicate-source protection at create/update time —
   * deliberately NOT status-filtered (an INACTIVE redirect still owns its
   * source path; re-activating it, not creating a second one, is the
   * correct fix — mirrors `TagsRepository.findByName`'s exact reasoning). */
  async findBySourcePath(
    sourcePath: string,
    siteId: string,
    excludeId?: string
  ): Promise<Redirect | null> {
    return this.prisma.redirect.findFirst({
      where: {
        sourcePath,
        siteId,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  private buildWhere(siteId: string, options: RedirectQueryOptions): Prisma.RedirectWhereInput {
    const where: Prisma.RedirectWhereInput = { siteId, deletedAt: null };
    if (options.filters.status) {
      where.status = options.filters.status;
    }
    if (options.filters.search) {
      where.OR = [
        { sourcePath: { contains: options.filters.search, mode: 'insensitive' } },
        { destinationUrl: { contains: options.filters.search, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  async findMany(
    siteId: string,
    options: RedirectQueryOptions
  ): Promise<{ items: Redirect[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.redirect.findMany({ where, orderBy, skip, take: options.limit }),
      this.prisma.redirect.count({ where }),
    ]);

    return { items, total };
  }

  /** Every ACTIVE redirect for the site, for `RedirectsService`'s in-memory
   * chain walk (loop detection) — a site realistically has a small number
   * of redirects, so one bulk fetch is simpler and cheaper than N
   * sequential lookups while walking a chain. */
  async findAllActive(siteId: string): Promise<Redirect[]> {
    return this.prisma.redirect.findMany({
      where: { siteId, status: 'ACTIVE', deletedAt: null },
    });
  }

  async create(data: Prisma.RedirectCreateInput): Promise<Redirect> {
    return this.prisma.redirect.create({ data });
  }

  async update(id: string, data: Prisma.RedirectUpdateInput): Promise<Redirect> {
    return this.prisma.redirect.update({ where: { id }, data });
  }

  async softDelete(id: string, actorId: string | null): Promise<Redirect> {
    return this.prisma.redirect.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<Redirect> {
    return this.prisma.redirect.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }
}
