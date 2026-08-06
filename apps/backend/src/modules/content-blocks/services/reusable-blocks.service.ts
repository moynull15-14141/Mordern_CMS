import { Injectable } from '@nestjs/common';
import { ReusableBlock } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { ReusableBlockRepository } from '../repositories/reusable-block.repository';
import { ReusableBlockMapper } from '../mappers/reusable-block.mapper';
import { BlockTreeValidator } from '../validators/block-tree.validator';
import { BlockTreeSanitizer } from '../sanitization/block-tree-sanitizer.service';
import { ReusableBlockQueryOptions } from '../interfaces/reusable-block-query.interface';
import { CreateReusableBlockDto } from '../dto/create-reusable-block.dto';
import { UpdateReusableBlockDto } from '../dto/update-reusable-block.dto';
import { ReusableBlockResponseDto } from '../dto/reusable-block-response.dto';
import {
  ReusableBlockAlreadyDeletedException,
  ReusableBlockNameConflictException,
  ReusableBlockNotDeletedException,
  ReusableBlockNotFoundException,
} from '../exceptions/content-blocks.exceptions';

interface ActingUser {
  id: string;
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

  /** Validates `{blockType, data}` by wrapping it as a single-node tree —
   * reuses `BlockTreeValidator` rather than duplicating its field-shape
   * checks here. */
  private assertValidBlockShape(blockType: string, data: Record<string, unknown>): void {
    this.blockTreeValidator.assertValid({
      blocks: [{ id: 'reusable-block-validation', type: blockType, data }],
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
    this.assertValidBlockShape(dto.blockType, dto.data);
    const sanitizedData = this.blockTreeSanitizer.sanitizeBlockData(dto.blockType, dto.data);

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      name: dto.name,
      blockType: dto.blockType,
      data: sanitizedData as object,
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
    if (dto.data !== undefined) {
      this.assertValidBlockShape(existing.blockType, dto.data);
      sanitizedData = this.blockTreeSanitizer.sanitizeBlockData(existing.blockType, dto.data);
    }

    const updated = await this.repository.update(id, {
      name: dto.name,
      data: sanitizedData as object | undefined,
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
}
