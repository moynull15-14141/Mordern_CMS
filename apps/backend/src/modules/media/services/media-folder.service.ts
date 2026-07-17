import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { generateSlugFromTitle, normalizeSlug, uniquifySlug } from '../../articles/utils/slug.util';
import { SlugShapeValidator } from '../../categories/validators/slug-shape.validator';
import { TaxonomyPolicy } from '../../categories/policies/taxonomy.policy';
import {
  buildTree,
  getAncestors,
  getBreadcrumb,
  getChildren,
  getDescendants,
  wouldCreateCycle,
} from '../../categories/utils/category-tree.util';
import { MediaFolderRepository } from '../repositories/media-folder.repository';
import { MediaFolderMapper } from '../mappers/media-folder.mapper';
import { SLUG_MAX_UNIQUENESS_ATTEMPTS } from '../constants/media.constants';
import { MediaFolderQueryOptions } from '../interfaces/media-folder-query.interface';
import { CreateMediaFolderDto } from '../dto/create-media-folder.dto';
import { UpdateMediaFolderDto } from '../dto/update-media-folder.dto';
import { MoveMediaFolderDto } from '../dto/move-media-folder.dto';
import {
  MediaFolderBreadcrumbItemDto,
  MediaFolderResponseDto,
  MediaFolderTreeNodeResponseDto,
} from '../dto/media-folder-response.dto';
import {
  CircularFolderParentException,
  MediaFolderAlreadyDeletedException,
  MediaFolderInUseException,
  MediaFolderNotDeletedException,
  MediaFolderNotFoundException,
  MediaFolderSlugConflictException,
  ParentFolderNotFoundException,
  SelfParentFolderException,
} from '../exceptions/media.exceptions';

interface ActingUser {
  id: string;
}

/**
 * Reuses `TaxonomyPolicy` from the Categories module directly (not
 * duplicated) — `MediaFolder` has no owner concept, exactly like
 * `Category`, so the same role-tier-only policy applies. See
 * docs/48_MEDIA_LIBRARY_ARCHITECTURE.md "Permission Flow".
 */
@Injectable()
export class MediaFolderService {
  constructor(
    private readonly repository: MediaFolderRepository,
    private readonly validator: SlugShapeValidator,
    private readonly mapper: MediaFolderMapper,
    private readonly authorizationService: AuthorizationService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getFolderOrThrow(id: string, includeDeleted = false) {
    const folder = await this.repository.findById(id, includeDeleted);
    if (!folder) {
      throw new MediaFolderNotFoundException(id);
    }
    return folder;
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
      throw new ForbiddenException(`You do not have permission to ${action} media folders.`);
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
        throw new MediaFolderSlugConflictException(normalized);
      }
      return normalized;
    }

    const base = generateSlugFromTitle(name);
    this.validator.validateSlugShape(base);
    return uniquifySlug(base, isTaken, SLUG_MAX_UNIQUENESS_ATTEMPTS);
  }

  private async toResponseDto(
    folder: Awaited<ReturnType<MediaFolderRepository['findById']>>
  ): Promise<MediaFolderResponseDto> {
    if (!folder) {
      throw new Error('toResponseDto called with a null folder');
    }
    const [childrenCount, assetCount] = await Promise.all([
      this.repository.countActiveChildren(folder.id),
      this.repository.countActiveAssets(folder.id),
    ]);
    return this.mapper.toResponseDto(folder, { childrenCount, assetCount });
  }

  async createFolder(
    dto: CreateMediaFolderDto,
    actor: ActingUser
  ): Promise<MediaFolderResponseDto> {
    const site = await this.repository.getDefaultSite();
    await this.assertCanManage(actor, 'create');

    if (dto.parentId) {
      const parent = await this.repository.findById(dto.parentId);
      if (!parent) throw new ParentFolderNotFoundException(dto.parentId);
    }

    const slug = await this.resolveUniqueSlug(dto.slug, dto.name, site.id);

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
      name: dto.name,
      slug,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media_folder.create',
      resource: 'media_folder',
      resourceId: created.id,
      result: 'success',
    });
    return this.toResponseDto(created);
  }

  async getFolder(id: string): Promise<MediaFolderResponseDto> {
    const folder = await this.getFolderOrThrow(id);
    return this.toResponseDto(folder);
  }

  async listFolders(
    options: MediaFolderQueryOptions
  ): Promise<PaginatedResult<MediaFolderResponseDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    const mapped = await Promise.all(items.map((item) => this.toResponseDto(item)));
    return buildPaginatedResult(mapped, options.page, options.limit, total);
  }

  async updateFolder(
    id: string,
    dto: UpdateMediaFolderDto,
    actor: ActingUser
  ): Promise<MediaFolderResponseDto> {
    const existing = await this.getFolderOrThrow(id);
    await this.assertCanManage(actor, 'update');

    const slug =
      dto.slug !== undefined && dto.slug !== existing.slug
        ? await this.resolveUniqueSlug(dto.slug, dto.name ?? existing.name, existing.siteId, id)
        : undefined;

    const updated = await this.repository.update(id, { name: dto.name, slug, updatedBy: actor.id });
    this.auditLogger.record({
      actorId: actor.id,
      action: 'media_folder.update',
      resource: 'media_folder',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async deleteFolder(id: string, actor: ActingUser): Promise<MediaFolderResponseDto> {
    const existing = await this.getFolderOrThrow(id);
    if (existing.deletedAt) {
      throw new MediaFolderAlreadyDeletedException(id);
    }
    await this.assertCanManage(actor, 'delete');

    const assetCount = await this.repository.countActiveAssets(id);
    if (assetCount > 0) {
      throw new MediaFolderInUseException(id, 'assets');
    }
    const childrenCount = await this.repository.countActiveChildren(id);
    if (childrenCount > 0) {
      throw new MediaFolderInUseException(id, 'children');
    }

    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'media_folder.delete',
      resource: 'media_folder',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(await this.getFolderOrThrow(id, true));
  }

  async restoreFolder(id: string, actor: ActingUser): Promise<MediaFolderResponseDto> {
    const existing = await this.getFolderOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new MediaFolderNotDeletedException(id);
    }
    await this.assertCanManage(actor, 'update');
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'media_folder.restore',
      resource: 'media_folder',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(await this.getFolderOrThrow(id));
  }

  async moveFolder(
    id: string,
    dto: MoveMediaFolderDto,
    actor: ActingUser
  ): Promise<MediaFolderResponseDto> {
    const existing = await this.getFolderOrThrow(id);
    await this.assertCanManage(actor, 'update');

    const newParentId = dto.parentId ?? null;

    if (newParentId) {
      if (newParentId === id) {
        throw new SelfParentFolderException(id);
      }
      const parent = await this.repository.findById(newParentId);
      if (!parent) {
        throw new ParentFolderNotFoundException(newParentId);
      }
      const allFolders = await this.repository.findAllForSite(existing.siteId);
      if (wouldCreateCycle(allFolders, id, newParentId)) {
        throw new CircularFolderParentException(id, newParentId);
      }
    }

    const updated = await this.repository.update(id, {
      parent: newParentId ? { connect: { id: newParentId } } : { disconnect: true },
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media_folder.move',
      resource: 'media_folder',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async getTree(): Promise<MediaFolderTreeNodeResponseDto[]> {
    const site = await this.repository.getDefaultSite();
    const folders = await this.repository.findAllForSite(site.id);
    const tree = buildTree(folders);
    return tree.map((node) => this.mapper.toTreeNodeDto(node));
  }

  async getChildren(id: string): Promise<MediaFolderResponseDto[]> {
    const existing = await this.getFolderOrThrow(id);
    const allFolders = await this.repository.findAllForSite(existing.siteId);
    const children = getChildren(allFolders, id);
    return Promise.all(children.map((child) => this.toResponseDto(child)));
  }

  async getDescendants(id: string): Promise<MediaFolderResponseDto[]> {
    const existing = await this.getFolderOrThrow(id);
    const allFolders = await this.repository.findAllForSite(existing.siteId);
    const descendants = getDescendants(allFolders, id);
    return Promise.all(descendants.map((descendant) => this.toResponseDto(descendant)));
  }

  async getAncestors(id: string): Promise<MediaFolderResponseDto[]> {
    const existing = await this.getFolderOrThrow(id);
    const allFolders = await this.repository.findAllForSite(existing.siteId);
    const ancestors = getAncestors(allFolders, id);
    return Promise.all(ancestors.map((ancestor) => this.toResponseDto(ancestor)));
  }

  async getBreadcrumb(id: string): Promise<MediaFolderBreadcrumbItemDto[]> {
    const existing = await this.getFolderOrThrow(id);
    const allFolders = await this.repository.findAllForSite(existing.siteId);
    return getBreadcrumb(allFolders, id);
  }
}
