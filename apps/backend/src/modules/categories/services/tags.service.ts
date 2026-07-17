import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { generateSlugFromTitle, normalizeSlug, uniquifySlug } from '../../articles/utils/slug.util';
import { TagsRepository } from '../repositories/tags.repository';
import { SlugShapeValidator } from '../validators/slug-shape.validator';
import { TagsMapper } from '../mappers/tags.mapper';
import { TaxonomyPolicy } from '../policies/taxonomy.policy';
import { SLUG_MAX_UNIQUENESS_ATTEMPTS } from '../constants/category.constants';
import { TagQueryOptions } from '../interfaces/tag-query.interface';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { TagResponseDto } from '../dto/tag-response.dto';
import {
  TagAlreadyDeletedException,
  TagInUseException,
  TagNameConflictException,
  TagNotDeletedException,
  TagNotFoundException,
  TagSlugConflictException,
} from '../exceptions/category.exceptions';

interface ActingUser {
  id: string;
}

@Injectable()
export class TagsService {
  constructor(
    private readonly repository: TagsRepository,
    private readonly validator: SlugShapeValidator,
    private readonly mapper: TagsMapper,
    private readonly authorizationService: AuthorizationService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getTagOrThrow(id: string, includeDeleted = false) {
    const tag = await this.repository.findById(id, includeDeleted);
    if (!tag) {
      throw new TagNotFoundException(id);
    }
    return tag;
  }

  private async assertCanManage(
    actor: ActingUser,
    action: 'create' | 'update' | 'delete'
  ): Promise<void> {
    const effectiveRoles = await this.authorizationService.resolveEffectiveRoles(actor.id);
    const policy = new TaxonomyPolicy();
    const subject = { siteId: '' };
    const allowed =
      action === 'create'
        ? policy.canCreate(effectiveRoles)
        : action === 'update'
          ? policy.canUpdate(effectiveRoles, subject)
          : policy.canDelete(effectiveRoles, subject);
    if (!allowed) {
      throw new ForbiddenException(`You do not have permission to ${action} tags.`);
    }
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
        throw new TagSlugConflictException(normalized);
      }
      return normalized;
    }

    const base = generateSlugFromTitle(name);
    this.validator.validateSlugShape(base);
    return uniquifySlug(base, isTaken, SLUG_MAX_UNIQUENESS_ATTEMPTS);
  }

  private async assertNameAvailable(
    name: string,
    siteId: string,
    excludeId?: string
  ): Promise<void> {
    const existing = await this.repository.findByName(name, siteId, excludeId);
    if (existing) {
      throw new TagNameConflictException(name);
    }
  }

  private async toResponseDto(
    tag: Awaited<ReturnType<TagsRepository['findById']>>
  ): Promise<TagResponseDto> {
    if (!tag) {
      throw new Error('toResponseDto called with a null tag');
    }
    const usageCount = await this.repository.countArticlesUsingTag(tag.id);
    return this.mapper.toResponseDto(tag, usageCount);
  }

  async createTag(dto: CreateTagDto, actor: ActingUser): Promise<TagResponseDto> {
    const site = await this.repository.getDefaultSite();
    await this.assertCanManage(actor, 'create');
    await this.assertNameAvailable(dto.name, site.id);
    const slug = await this.resolveUniqueSlug(dto.slug, dto.name, site.id);

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      name: dto.name,
      slug,
      description: dto.description,
      synonyms: dto.synonyms,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'tag.create',
      resource: 'tag',
      resourceId: created.id,
      result: 'success',
    });
    return this.toResponseDto(created);
  }

  async getTag(id: string): Promise<TagResponseDto> {
    const tag = await this.getTagOrThrow(id);
    return this.toResponseDto(tag);
  }

  async getTagBySlug(slug: string): Promise<TagResponseDto> {
    const site = await this.repository.getDefaultSite();
    const tag = await this.repository.findBySlug(slug, site.id);
    if (!tag) throw new TagNotFoundException(slug);
    return this.toResponseDto(tag);
  }

  async listTags(options: TagQueryOptions): Promise<PaginatedResult<TagResponseDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    const mapped = await Promise.all(items.map((item) => this.toResponseDto(item)));
    return buildPaginatedResult(mapped, options.page, options.limit, total);
  }

  async updateTag(id: string, dto: UpdateTagDto, actor: ActingUser): Promise<TagResponseDto> {
    const existing = await this.getTagOrThrow(id);
    await this.assertCanManage(actor, 'update');

    if (dto.name && dto.name !== existing.name) {
      await this.assertNameAvailable(dto.name, existing.siteId, id);
    }

    const slug =
      dto.slug !== undefined && dto.slug !== existing.slug
        ? await this.resolveUniqueSlug(dto.slug, dto.name ?? existing.name, existing.siteId, id)
        : undefined;

    const updated = await this.repository.update(id, {
      name: dto.name,
      slug,
      description: dto.description,
      synonyms: dto.synonyms,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'tag.update',
      resource: 'tag',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async deleteTag(id: string, actor: ActingUser): Promise<TagResponseDto> {
    const existing = await this.getTagOrThrow(id);
    if (existing.deletedAt) {
      throw new TagAlreadyDeletedException(id);
    }
    await this.assertCanManage(actor, 'delete');

    const usageCount = await this.repository.countArticlesUsingTag(id);
    if (usageCount > 0) {
      throw new TagInUseException(id);
    }

    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'tag.delete',
      resource: 'tag',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(await this.getTagOrThrow(id, true));
  }

  async restoreTag(id: string, actor: ActingUser): Promise<TagResponseDto> {
    const existing = await this.getTagOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new TagNotDeletedException(id);
    }
    await this.assertCanManage(actor, 'update');
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'tag.restore',
      resource: 'tag',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(await this.getTagOrThrow(id));
  }
}
