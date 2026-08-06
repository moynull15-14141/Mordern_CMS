import { Injectable } from '@nestjs/common';
import { ReusableBlock } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { ReusableBlockRepository } from '../repositories/reusable-block.repository';
import { ReusableBlockMapper } from '../mappers/reusable-block.mapper';
import { BlockTreeValidator } from '../validators/block-tree.validator';
import { BlockTreeSanitizer } from '../sanitization/block-tree-sanitizer.service';
import { ReusableBlockCycleValidator } from '../validators/reusable-block-cycle.validator';
import { ReusableBlockQueryOptions } from '../interfaces/reusable-block-query.interface';
import { ReusableBlockUsageReference } from '../interfaces/reusable-block-usage.interface';
import { BlockNode } from '../interfaces/block-node.interface';
import { collectReusableBlockReferenceIds } from '../utils/block-tree-references.util';
import { CreateReusableBlockDto } from '../dto/create-reusable-block.dto';
import { UpdateReusableBlockDto } from '../dto/update-reusable-block.dto';
import { ReusableBlockResponseDto } from '../dto/reusable-block-response.dto';
import {
  ReusableBlockAlreadyDeletedException,
  ReusableBlockInUseException,
  ReusableBlockNameConflictException,
  ReusableBlockNotDeletedException,
  ReusableBlockNotFoundException,
} from '../exceptions/content-blocks.exceptions';

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
 * Reusable Blocks CRUD (Rich Content Engine, Phase 1 / Step 1). Mirrors
 * `LayoutsService`'s shape — a site-scoped catalog entity, no ownership
 * split, gated by the existing `page.manage` permission at the controller
 * (see `ReusableBlocksController`'s doc comment for why a new permission
 * key wasn't added to the frozen 21-entry `PERMISSIONS` vocabulary).
 */
@Injectable()
export class ReusableBlocksService {
  constructor(
    private readonly repository: ReusableBlockRepository,
    private readonly mapper: ReusableBlockMapper,
    private readonly blockTreeValidator: BlockTreeValidator,
    private readonly blockTreeSanitizer: BlockTreeSanitizer,
    private readonly cycleValidator: ReusableBlockCycleValidator,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getReusableBlockOrThrow(
    id: string,
    includeDeleted = false
  ): Promise<ReusableBlock> {
    const block = await this.repository.findById(id, includeDeleted);
    if (!block) {
      throw new ReusableBlockNotFoundException(id);
    }
    return block;
  }

  /** Validates `{blockType, data, children}` by wrapping it as a
   * single-node tree — reuses `BlockTreeValidator` rather than duplicating
   * its field-shape/nesting checks here. */
  private assertValidBlockShape(
    blockType: string,
    data: Record<string, unknown>,
    children: BlockNode[] | undefined
  ): void {
    this.blockTreeValidator.assertValid({
      blocks: [{ id: 'reusable-block-validation', type: blockType, data, children }],
    });
  }

  private async assertNameAvailable(
    name: string,
    siteId: string,
    excludeId?: string
  ): Promise<void> {
    const existing = await this.repository.findByName(name, siteId, excludeId);
    if (existing) {
      throw new ReusableBlockNameConflictException(name);
    }
  }

  async createReusableBlock(
    dto: CreateReusableBlockDto,
    actor: ActingUser
  ): Promise<ReusableBlockResponseDto> {
    const site = await this.repository.getDefaultSite();
    await this.assertNameAvailable(dto.name, site.id);
    const children = dto.children as BlockNode[] | undefined;
    this.assertValidBlockShape(dto.blockType, dto.data, children);
    await this.cycleValidator.assertNoCycle(undefined, dto.name, dto.blockType, dto.data, children);
    const sanitized = this.blockTreeSanitizer.sanitizeBlockData(dto.blockType, dto.data, children);

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      name: dto.name,
      description: dto.description ?? null,
      category: dto.category ?? null,
      blockType: dto.blockType,
      data: sanitized.data as object,
      children: sanitized.children as object[] | undefined,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'reusable-block.create',
      resource: 'reusable-block',
      resourceId: created.id,
      result: 'success',
    });

    return this.mapper.toResponseDto(created);
  }

  async getReusableBlock(id: string): Promise<ReusableBlockResponseDto> {
    return this.mapper.toResponseDto(await this.getReusableBlockOrThrow(id));
  }

  async listReusableBlocks(
    options: ReusableBlockQueryOptions
  ): Promise<PaginatedResult<ReusableBlockResponseDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    return buildPaginatedResult(
      items.map((item) => this.mapper.toResponseDto(item)),
      options.page,
      options.limit,
      total
    );
  }

  async updateReusableBlock(
    id: string,
    dto: UpdateReusableBlockDto,
    actor: ActingUser
  ): Promise<ReusableBlockResponseDto> {
    const existing = await this.getReusableBlockOrThrow(id);
    const site = await this.repository.getDefaultSite();

    if (dto.name !== undefined && dto.name !== existing.name) {
      await this.assertNameAvailable(dto.name, site.id, id);
    }

    let sanitizedData: Record<string, unknown> | undefined;
    let sanitizedChildren: unknown[] | undefined;
    if (dto.data !== undefined || dto.children !== undefined) {
      const effectiveData = dto.data ?? (existing.data as Record<string, unknown>);
      // Prisma returns `null` (not `undefined`) for an empty `children Json?`
      // column — `BlockTreeValidator` treats "children: null" as "children
      // present but this type can't have any," so it must be normalized to
      // `undefined` ("no children key at all") here.
      const effectiveChildren =
        dto.children !== undefined
          ? (dto.children as unknown as BlockNode[])
          : ((existing.children as unknown as BlockNode[] | null) ?? undefined);

      this.assertValidBlockShape(existing.blockType, effectiveData, effectiveChildren);
      await this.cycleValidator.assertNoCycle(
        id,
        dto.name ?? existing.name,
        existing.blockType,
        effectiveData,
        effectiveChildren
      );

      const sanitized = this.blockTreeSanitizer.sanitizeBlockData(
        existing.blockType,
        effectiveData,
        effectiveChildren
      );
      sanitizedData = sanitized.data;
      sanitizedChildren = sanitized.children;
    }

    const updated = await this.repository.update(id, {
      name: dto.name,
      description: dto.description,
      category: dto.category,
      data: sanitizedData as object | undefined,
      children: sanitizedChildren as object[] | undefined,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'reusable-block.update',
      resource: 'reusable-block',
      resourceId: id,
      result: 'success',
    });

    return this.mapper.toResponseDto(updated);
  }

  async deleteReusableBlock(id: string, actor: ActingUser): Promise<ReusableBlockResponseDto> {
    const existing = await this.getReusableBlockOrThrow(id);
    if (existing.deletedAt) {
      throw new ReusableBlockAlreadyDeletedException(id);
    }
    const usages = await this.computeUsages(id, existing.siteId);
    if (usages.length > 0) {
      throw new ReusableBlockInUseException(id, usages.length);
    }
    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'reusable-block.delete',
      resource: 'reusable-block',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getReusableBlockOrThrow(id, true));
  }

  async restoreReusableBlock(id: string, actor: ActingUser): Promise<ReusableBlockResponseDto> {
    const existing = await this.getReusableBlockOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new ReusableBlockNotDeletedException(id);
    }
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'reusable-block.restore',
      resource: 'reusable-block',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getReusableBlockOrThrow(id));
  }

  /** Every active Page/Article whose body references this reusable block,
   * anywhere in its block tree. `Page.body`/`Article.body` are opaque JSON
   * with no relational FK to `ReusableBlock`, so this is a scan, not an
   * indexed join — acceptable because it only ever runs on-demand (the
   * Delete flow, and the admin Detail/Inspector's "Used By" panel), never
   * as part of a list response (see `ReusableBlocksController`/the admin
   * hooks — usages are fetched lazily, one block at a time). "Landing
   * Pages"/"Templates" aren't real content types in this codebase — only
   * Page and Article exist, so those are the only two scanned. */
  async getUsages(id: string): Promise<ReusableBlockUsageReference[]> {
    const existing = await this.getReusableBlockOrThrow(id);
    return this.computeUsages(id, existing.siteId);
  }

  private async computeUsages(
    reusableBlockId: string,
    siteId: string
  ): Promise<ReusableBlockUsageReference[]> {
    const [pages, articles] = await Promise.all([
      this.repository.findActivePageBodies(siteId),
      this.repository.findActiveArticleBodies(siteId),
    ]);

    const usages: ReusableBlockUsageReference[] = [];
    for (const page of pages) {
      if (collectReusableBlockReferenceIds(extractBlocks(page.body)).includes(reusableBlockId)) {
        usages.push({ contentType: 'page', id: page.id, title: page.title, slug: page.slug });
      }
    }
    for (const article of articles) {
      if (collectReusableBlockReferenceIds(extractBlocks(article.body)).includes(reusableBlockId)) {
        usages.push({
          contentType: 'article',
          id: article.id,
          title: article.title,
          slug: article.slug,
        });
      }
    }
    return usages;
  }
}
