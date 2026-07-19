import { Injectable } from '@nestjs/common';
import { Layout, Prisma } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateSlugFromTitle, normalizeSlug, uniquifySlug } from '../../articles/utils/slug.util';
import { LayoutsRepository } from '../repositories/layouts.repository';
import { LayoutsValidator } from '../validators/layouts.validator';
import { LayoutsMapper } from '../mappers/layouts.mapper';
import { SLUG_MAX_UNIQUENESS_ATTEMPTS } from '../constants/layout.constants';
import { LayoutQueryOptions } from '../interfaces/layout-query.interface';
import { CreateLayoutDto } from '../dto/create-layout.dto';
import { UpdateLayoutDto } from '../dto/update-layout.dto';
import { LayoutResponseDto } from '../dto/layout-response.dto';
import {
  LayoutAlreadyDeletedException,
  LayoutNotDeletedException,
  LayoutNotFoundException,
  LayoutSlugConflictException,
} from '../exceptions/layout.exceptions';

interface ActingUser {
  id: string;
}

/**
 * Layouts backend module (Backend Milestone 14.1). Mirrors `ThemesService`'s
 * shape for CRUD/soft-delete/restore — no `activate` flow, unlike Theme:
 * a Layout has no singleton "currently live" flag, multiple Layouts can be
 * PUBLISHED and in use (via `LayoutAssignment`) simultaneously. See
 * docs/78_LAYOUT_ENGINE.md.
 */
@Injectable()
export class LayoutsService {
  constructor(
    private readonly repository: LayoutsRepository,
    private readonly validator: LayoutsValidator,
    private readonly mapper: LayoutsMapper,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getLayoutOrThrow(id: string, includeDeleted = false): Promise<Layout> {
    const layout = await this.repository.findById(id, includeDeleted);
    if (!layout) {
      throw new LayoutNotFoundException(id);
    }
    return layout;
  }

  private async resolveUniqueSlug(
    requestedSlug: string | undefined,
    name: string,
    siteId: string,
    excludeId?: string
  ): Promise<string> {
    const isTaken = async (candidate: string) =>
      Boolean(await this.repository.findBySlug(candidate, siteId, excludeId));

    if (requestedSlug) {
      const normalized = normalizeSlug(requestedSlug);
      this.validator.validateSlugShape(normalized);
      if (await isTaken(normalized)) {
        throw new LayoutSlugConflictException(normalized);
      }
      return normalized;
    }

    const base = generateSlugFromTitle(name);
    this.validator.validateSlugShape(base);
    return uniquifySlug(base, isTaken, SLUG_MAX_UNIQUENESS_ATTEMPTS);
  }

  async createLayout(dto: CreateLayoutDto, actor: ActingUser): Promise<LayoutResponseDto> {
    const site = await this.repository.getDefaultSite();
    const slug = await this.resolveUniqueSlug(dto.slug, dto.name, site.id);
    this.validator.validateLayoutPreset(dto.layoutPreset);

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      ...(dto.themeId ? { theme: { connect: { id: dto.themeId } } } : {}),
      name: dto.name,
      slug,
      layoutPreset: dto.layoutPreset,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'layout.create',
      resource: 'layout',
      resourceId: created.id,
      result: 'success',
    });

    return this.mapper.toResponseDto(created);
  }

  async getLayout(id: string): Promise<LayoutResponseDto> {
    return this.mapper.toResponseDto(await this.getLayoutOrThrow(id));
  }

  async listLayouts(options: LayoutQueryOptions): Promise<PaginatedResult<LayoutResponseDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    return buildPaginatedResult(
      items.map((item) => this.mapper.toResponseDto(item)),
      options.page,
      options.limit,
      total
    );
  }

  async updateLayout(
    id: string,
    dto: UpdateLayoutDto,
    actor: ActingUser
  ): Promise<LayoutResponseDto> {
    const existing = await this.getLayoutOrThrow(id);
    const site = await this.repository.getDefaultSite();
    const slug =
      dto.slug !== undefined && dto.slug !== existing.slug
        ? await this.resolveUniqueSlug(dto.slug, dto.name ?? existing.name, site.id, id)
        : undefined;

    if (dto.layoutPreset !== undefined) {
      this.validator.validateLayoutPreset(dto.layoutPreset);
    }

    const data: Prisma.LayoutUpdateInput = {
      name: dto.name,
      slug,
      layoutPreset: dto.layoutPreset,
      status: dto.status,
      updatedBy: actor.id,
    };
    if (dto.themeId !== undefined) {
      data.theme = dto.themeId ? { connect: { id: dto.themeId } } : { disconnect: true };
    }

    const updated = await this.repository.update(id, data);

    this.auditLogger.record({
      actorId: actor.id,
      action: 'layout.update',
      resource: 'layout',
      resourceId: id,
      result: 'success',
    });

    return this.mapper.toResponseDto(updated);
  }

  async deleteLayout(id: string, actor: ActingUser): Promise<LayoutResponseDto> {
    const existing = await this.getLayoutOrThrow(id);
    if (existing.deletedAt) {
      throw new LayoutAlreadyDeletedException(id);
    }
    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'layout.delete',
      resource: 'layout',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getLayoutOrThrow(id, true));
  }

  async restoreLayout(id: string, actor: ActingUser): Promise<LayoutResponseDto> {
    const existing = await this.getLayoutOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new LayoutNotDeletedException(id);
    }
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'layout.restore',
      resource: 'layout',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getLayoutOrThrow(id));
  }
}
