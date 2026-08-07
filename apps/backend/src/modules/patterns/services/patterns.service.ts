import { Injectable } from '@nestjs/common';
import { Pattern, PatternStatus, Prisma } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateSlugFromTitle, normalizeSlug, uniquifySlug } from '../../articles/utils/slug.util';
import { SlugShapeValidator } from '../../categories/validators/slug-shape.validator';
import { BlockTreeValidator } from '../../content-blocks/validators/block-tree.validator';
import { BlockTreeSanitizer } from '../../content-blocks/sanitization/block-tree-sanitizer.service';
import { BlockNode } from '../../content-blocks/interfaces/block-node.interface';
import { PatternRepository } from '../repositories/pattern.repository';
import { PatternMapper } from '../mappers/pattern.mapper';
import { PatternQueryOptions } from '../interfaces/pattern-query.interface';
import { PatternUsageReference } from '../interfaces/pattern-usage.interface';
import { collectPatternOriginIds } from '../utils/pattern-origin.util';
import { CreatePatternDto } from '../dto/create-pattern.dto';
import { UpdatePatternDto } from '../dto/update-pattern.dto';
import { PatternResponseDto, PatternSummaryDto } from '../dto/pattern-response.dto';
import {
  PatternAlreadyArchivedException,
  PatternAlreadyDeletedException,
  PatternNotArchivedException,
  PatternNotDeletedException,
  PatternNotFoundException,
  PatternSlugConflictException,
} from '../exceptions/pattern.exceptions';
import { MediaAssetNotFoundException } from '../../media/exceptions/media.exceptions';
import { SLUG_MAX_UNIQUENESS_ATTEMPTS } from '../constants/patterns.constants';

interface ActingUser {
  id: string;
}

function extractBlocks(body: unknown): BlockNode[] {
  return typeof body === 'object' &&
    body !== null &&
    Array.isArray((body as { blocks?: unknown }).blocks)
    ? ((body as { blocks: unknown }).blocks as BlockNode[])
    : [];
}

/**
 * Section & Pattern Library (Milestone 6). NOT a new block system, NOT a
 * new renderer — `body` is `{ blocks: BlockNode[] }`, the identical shape
 * `PagesService`/`ArticlesService` already validate/sanitize via the
 * existing `BlockTreeValidator`/`BlockTreeSanitizer`. Mirrors
 * `ReusableBlocksService`'s exact shape (site-scoped catalog entity, no
 * ownership split, current single-default-site-per-install model —
 * `repository.getDefaultSite()` internally, never threaded in from the
 * controller, matching every other module in this codebase) and gated by
 * the existing `page.manage` permission — see `PatternsController`'s doc
 * comment for why no new permission key was added. Insertion into a page/
 * article is always a client-side detached copy (see the admin Block
 * Editor's `insertClonedNodes`); this service never links a Pattern to
 * inserted content, it only creates/reads/updates/archives/deletes the
 * library entry itself.
 */
@Injectable()
export class PatternsService {
  constructor(
    private readonly repository: PatternRepository,
    private readonly mapper: PatternMapper,
    private readonly slugValidator: SlugShapeValidator,
    private readonly blockTreeValidator: BlockTreeValidator,
    private readonly blockTreeSanitizer: BlockTreeSanitizer,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getPatternOrThrow(id: string, includeDeleted = false): Promise<Pattern> {
    const pattern = await this.repository.findById(id, includeDeleted);
    if (!pattern) {
      throw new PatternNotFoundException(id);
    }
    return pattern;
  }

  private async resolveSlug(
    requestedSlug: string | undefined,
    name: string,
    siteId: string,
    excludeId?: string
  ): Promise<string> {
    const isTaken = async (candidate: string) =>
      Boolean(await this.repository.findBySlug(candidate, siteId, excludeId));

    if (requestedSlug) {
      const normalized = normalizeSlug(requestedSlug);
      this.slugValidator.validateSlugShape(normalized);
      if (await isTaken(normalized)) {
        throw new PatternSlugConflictException(normalized);
      }
      return normalized;
    }

    const base = generateSlugFromTitle(name);
    this.slugValidator.validateSlugShape(base);
    return uniquifySlug(base, isTaken, SLUG_MAX_UNIQUENESS_ATTEMPTS);
  }

  private async assertThumbnailExists(
    thumbnailMediaId: string | undefined,
    siteId: string
  ): Promise<void> {
    if (!thumbnailMediaId) return;
    const exists = await this.repository.mediaAssetExists(thumbnailMediaId, siteId);
    if (!exists) {
      throw new MediaAssetNotFoundException(thumbnailMediaId);
    }
  }

  async createPattern(dto: CreatePatternDto, actor: ActingUser): Promise<PatternResponseDto> {
    const site = await this.repository.getDefaultSite();
    const slug = await this.resolveSlug(dto.slug, dto.name, site.id);
    await this.assertThumbnailExists(dto.thumbnailMediaId, site.id);

    this.blockTreeValidator.assertValid(dto.body);
    const sanitizedBody = this.blockTreeSanitizer.sanitize(dto.body);

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      name: dto.name,
      slug,
      description: dto.description ?? null,
      category: dto.category ?? null,
      tags: dto.tags ?? [],
      thumbnailMedia: dto.thumbnailMediaId ? { connect: { id: dto.thumbnailMediaId } } : undefined,
      body: sanitizedBody as Prisma.InputJsonValue,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'pattern.create',
      resource: 'pattern',
      resourceId: created.id,
      result: 'success',
    });

    return this.mapper.toResponseDto(created);
  }

  async getPattern(id: string): Promise<PatternResponseDto> {
    return this.mapper.toResponseDto(await this.getPatternOrThrow(id));
  }

  async listPatterns(options: PatternQueryOptions): Promise<PaginatedResult<PatternSummaryDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    return buildPaginatedResult(
      items.map((item) => this.mapper.toSummaryDto(item)),
      options.page,
      options.limit,
      total
    );
  }

  async updatePattern(
    id: string,
    dto: UpdatePatternDto,
    actor: ActingUser
  ): Promise<PatternResponseDto> {
    const existing = await this.getPatternOrThrow(id);

    let slug: string | undefined;
    if (dto.slug !== undefined || (dto.name !== undefined && dto.name !== existing.name)) {
      slug = await this.resolveSlug(dto.slug, dto.name ?? existing.name, existing.siteId, id);
    }

    if (dto.thumbnailMediaId !== undefined) {
      await this.assertThumbnailExists(dto.thumbnailMediaId, existing.siteId);
    }

    let sanitizedBody: Record<string, unknown> | undefined;
    if (dto.body !== undefined) {
      this.blockTreeValidator.assertValid(dto.body);
      sanitizedBody = this.blockTreeSanitizer.sanitize(dto.body);
    }

    const updated = await this.repository.update(id, {
      name: dto.name,
      slug,
      description: dto.description,
      category: dto.category,
      tags: dto.tags,
      thumbnailMedia:
        dto.thumbnailMediaId !== undefined
          ? dto.thumbnailMediaId
            ? { connect: { id: dto.thumbnailMediaId } }
            : { disconnect: true }
          : undefined,
      body: sanitizedBody as Prisma.InputJsonValue | undefined,
      version: sanitizedBody !== undefined ? { increment: 1 } : undefined,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'pattern.update',
      resource: 'pattern',
      resourceId: id,
      result: 'success',
    });

    return this.mapper.toResponseDto(updated);
  }

  async duplicatePattern(id: string, actor: ActingUser): Promise<PatternResponseDto> {
    const source = await this.getPatternOrThrow(id);
    const name = `${source.name} (Copy)`;
    const slug = await this.resolveSlug(undefined, name, source.siteId);

    const created = await this.repository.create({
      site: { connect: { id: source.siteId } },
      name,
      slug,
      description: source.description,
      category: source.category,
      tags: source.tags,
      thumbnailMedia: source.thumbnailMediaId
        ? { connect: { id: source.thumbnailMediaId } }
        : undefined,
      body: source.body as Prisma.InputJsonValue,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'pattern.duplicate',
      resource: 'pattern',
      resourceId: created.id,
      result: 'success',
    });

    return this.mapper.toResponseDto(created);
  }

  async archivePattern(id: string, actor: ActingUser): Promise<PatternResponseDto> {
    const existing = await this.getPatternOrThrow(id);
    if (existing.status === PatternStatus.ARCHIVED) {
      throw new PatternAlreadyArchivedException(id);
    }
    const updated = await this.repository.updateStatus(id, PatternStatus.ARCHIVED, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'pattern.archive',
      resource: 'pattern',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(updated);
  }

  async unarchivePattern(id: string, actor: ActingUser): Promise<PatternResponseDto> {
    const existing = await this.getPatternOrThrow(id);
    if (existing.status !== PatternStatus.ARCHIVED) {
      throw new PatternNotArchivedException(id);
    }
    const updated = await this.repository.updateStatus(id, PatternStatus.ACTIVE, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'pattern.unarchive',
      resource: 'pattern',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(updated);
  }

  async deletePattern(id: string, actor: ActingUser): Promise<PatternResponseDto> {
    const existing = await this.getPatternOrThrow(id);
    if (existing.deletedAt) {
      throw new PatternAlreadyDeletedException(id);
    }
    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'pattern.delete',
      resource: 'pattern',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getPatternOrThrow(id, true));
  }

  async restorePattern(id: string, actor: ActingUser): Promise<PatternResponseDto> {
    const existing = await this.getPatternOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new PatternNotDeletedException(id);
    }
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'pattern.restore',
      resource: 'pattern',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getPatternOrThrow(id));
  }

  /** "Inserted From" — always a detached-copy provenance signal, never a
   * live reference (see this class's own doc comment). Scans every active
   * Page/Article/ReusableBlock body once for `meta.patternOrigin.patternId`
   * markers. */
  async getUsages(id: string): Promise<PatternUsageReference[]> {
    const existing = await this.getPatternOrThrow(id);
    const siteId = existing.siteId;

    const [pages, articles, reusableBlocks] = await Promise.all([
      this.repository.findActivePageBodies(siteId),
      this.repository.findActiveArticleBodies(siteId),
      this.repository.findActiveReusableBlockBodies(siteId),
    ]);

    const usages: PatternUsageReference[] = [];
    for (const page of pages) {
      if (collectPatternOriginIds(extractBlocks(page.body)).includes(id)) {
        usages.push({ contentType: 'page', id: page.id, title: page.title, slug: page.slug });
      }
    }
    for (const article of articles) {
      if (collectPatternOriginIds(extractBlocks(article.body)).includes(id)) {
        usages.push({
          contentType: 'article',
          id: article.id,
          title: article.title,
          slug: article.slug,
        });
      }
    }
    for (const block of reusableBlocks) {
      const node = {
        id: block.id,
        type: block.blockType,
        data: (block.data as Record<string, unknown>) ?? {},
        children: (block.children as unknown as BlockNode[] | undefined) ?? undefined,
      };
      if (collectPatternOriginIds([node]).includes(id)) {
        usages.push({ contentType: 'reusable-block', id: block.id, title: block.name });
      }
    }

    return usages;
  }
}
