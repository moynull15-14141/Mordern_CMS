import { Injectable } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateSlugFromTitle, normalizeSlug, uniquifySlug } from '../../articles/utils/slug.util';
import { PagesRepository, PageWithRelations } from '../repositories/pages.repository';
import { PagesValidator } from '../validators/pages.validator';
import { PagesMapper } from '../mappers/pages.mapper';
import { SLUG_MAX_UNIQUENESS_ATTEMPTS } from '../constants/page.constants';
import { PageQueryOptions } from '../interfaces/page-query.interface';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { PageResponseDto } from '../dto/page-response.dto';
import {
  PageAlreadyDeletedException,
  PageNotDeletedException,
  PageNotFoundException,
  PageSlugConflictException,
} from '../exceptions/page.exceptions';

interface ActingUser {
  id: string;
}

/**
 * Pages backend module. Mirrors `ArticlesService`'s shape, scoped down to
 * what the `Page` model supports — no ownership policy (no `authorId` on
 * `Page`), no revisions (no `PageRevision` model), no scheduling (no
 * `scheduledAt` column). See docs/69_BACKEND_PAGES.md.
 */
@Injectable()
export class PagesService {
  constructor(
    private readonly repository: PagesRepository,
    private readonly validator: PagesValidator,
    private readonly mapper: PagesMapper,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getPageOrThrow(id: string, includeDeleted = false): Promise<PageWithRelations> {
    const page = await this.repository.findById(id, includeDeleted);
    if (!page) {
      throw new PageNotFoundException(id);
    }
    return page;
  }

  private async resolveUniqueSlug(
    requestedSlug: string | undefined,
    title: string,
    siteId: string,
    excludeId?: string
  ): Promise<string> {
    const isTaken = async (candidate: string) =>
      Boolean(await this.repository.findBySlug(candidate, siteId, excludeId));

    if (requestedSlug) {
      const normalized = normalizeSlug(requestedSlug);
      this.validator.validateSlugShape(normalized);
      if (await isTaken(normalized)) {
        throw new PageSlugConflictException(normalized);
      }
      return normalized;
    }

    const base = generateSlugFromTitle(title);
    this.validator.validateSlugShape(base);
    return uniquifySlug(base, isTaken, SLUG_MAX_UNIQUENESS_ATTEMPTS);
  }

  async createPage(dto: CreatePageDto, actor: ActingUser): Promise<PageResponseDto> {
    const site = await this.repository.getDefaultSite();
    const slug = await this.resolveUniqueSlug(dto.slug, dto.title, site.id);

    let seoMetaId: string | undefined;
    if (dto.seo) {
      seoMetaId = await this.repository.upsertSeoMeta(
        null,
        site.id,
        dto.seo as Prisma.SeoMetaCreateInput,
        actor.id
      );
    }

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      title: dto.title,
      slug,
      body: dto.body as Prisma.InputJsonValue,
      seoMeta: seoMetaId ? { connect: { id: seoMetaId } } : undefined,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'page.create',
      resource: 'page',
      resourceId: created.id,
      result: 'success',
    });

    return this.mapper.toResponseDto(created);
  }

  async getPage(id: string): Promise<PageResponseDto> {
    return this.mapper.toResponseDto(await this.getPageOrThrow(id));
  }

  async getPageBySlug(slug: string): Promise<PageResponseDto> {
    const site = await this.repository.getDefaultSite();
    const page = await this.repository.findBySlugWithRelations(slug, site.id);
    if (!page) {
      throw new PageNotFoundException(slug);
    }
    return this.mapper.toResponseDto(page);
  }

  async listPages(options: PageQueryOptions): Promise<PaginatedResult<PageResponseDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    return buildPaginatedResult(
      items.map((item) => this.mapper.toResponseDto(item)),
      options.page,
      options.limit,
      total
    );
  }

  async updatePage(id: string, dto: UpdatePageDto, actor: ActingUser): Promise<PageResponseDto> {
    const existing = await this.getPageOrThrow(id);
    this.validator.assertGenericUpdateStatus(dto.status);

    const site = await this.repository.getDefaultSite();
    const slug =
      dto.slug !== undefined && dto.slug !== existing.slug
        ? await this.resolveUniqueSlug(dto.slug, dto.title ?? existing.title, site.id, id)
        : undefined;

    let seoMetaId: string | undefined;
    if (dto.seo) {
      seoMetaId = await this.repository.upsertSeoMeta(
        existing.seoMeta?.id ?? null,
        site.id,
        dto.seo as Prisma.SeoMetaUpdateInput,
        actor.id
      );
    }

    const updated = await this.repository.update(id, {
      title: dto.title,
      slug,
      body: dto.body as Prisma.InputJsonValue | undefined,
      status: dto.status as ContentStatus | undefined,
      seoMeta: seoMetaId ? { connect: { id: seoMetaId } } : undefined,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'page.update',
      resource: 'page',
      resourceId: id,
      result: 'success',
    });

    return this.mapper.toResponseDto(updated);
  }

  async deletePage(id: string, actor: ActingUser): Promise<PageResponseDto> {
    const existing = await this.getPageOrThrow(id);
    if (existing.deletedAt) {
      throw new PageAlreadyDeletedException(id);
    }
    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'page.delete',
      resource: 'page',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getPageOrThrow(id, true));
  }

  async restorePage(id: string, actor: ActingUser): Promise<PageResponseDto> {
    const existing = await this.getPageOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new PageNotDeletedException(id);
    }
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'page.restore',
      resource: 'page',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getPageOrThrow(id));
  }

  /** No ownership/editorial-tier split like Articles' `article.publish` —
   * Pages has a single `page.manage` permission covering every action. */
  async publishPage(id: string, actor: ActingUser): Promise<PageResponseDto> {
    const existing = await this.getPageOrThrow(id);
    const updated = await this.repository.update(id, {
      status: ContentStatus.PUBLISHED,
      publishedAt: existing.publishedAt ?? new Date(),
      updatedBy: actor.id,
    });
    this.auditLogger.record({
      actorId: actor.id,
      action: 'page.publish',
      resource: 'page',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(updated);
  }
}
