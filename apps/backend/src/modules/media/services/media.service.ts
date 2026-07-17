import { ForbiddenException, Injectable } from '@nestjs/common';
import { MediaAsset, Prisma } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { MediaRepository } from '../repositories/media.repository';
import { MediaFolderRepository } from '../repositories/media-folder.repository';
import { MediaValidator } from '../validators/media.validator';
import { MediaMapper } from '../mappers/media.mapper';
import { MediaOwnershipPolicy } from '../policies/media-ownership.policy';
import { MediaAssetMetadata } from '../interfaces/media-metadata.interface';
import { MediaUsageReference } from '../interfaces/media-usage.interface';
import { MediaQueryOptions } from '../interfaces/media-query.interface';
import { CreateMediaAssetDto } from '../dto/create-media-asset.dto';
import { UpdateMediaAssetDto } from '../dto/update-media-asset.dto';
import { RenameMediaAssetDto } from '../dto/rename-media-asset.dto';
import { MoveMediaAssetDto } from '../dto/move-media-asset.dto';
import { CopyMediaMetadataDto } from '../dto/copy-media-metadata.dto';
import { MediaResponseDto } from '../dto/media-response.dto';
import {
  MediaAssetAlreadyDeletedException,
  MediaAssetInUseException,
  MediaAssetNotDeletedException,
  MediaAssetNotFoundException,
  MediaFolderNotFoundException,
  StorageKeyConflictException,
} from '../exceptions/media.exceptions';

interface ActingUser {
  id: string;
}

@Injectable()
export class MediaService {
  constructor(
    private readonly repository: MediaRepository,
    private readonly folderRepository: MediaFolderRepository,
    private readonly validator: MediaValidator,
    private readonly mapper: MediaMapper,
    private readonly authorizationService: AuthorizationService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getAssetOrThrow(id: string, includeDeleted = false) {
    const asset = await this.repository.findById(id, includeDeleted);
    if (!asset) {
      throw new MediaAssetNotFoundException(id);
    }
    return asset;
  }

  private async assertCanManage(
    actor: ActingUser,
    uploadedBy: string,
    action: 'update' | 'delete'
  ): Promise<void> {
    const effectiveRoles = await this.authorizationService.resolveEffectiveRoles(actor.id);
    const policy = new MediaOwnershipPolicy(actor.id);
    const subject = { uploadedBy };
    const allowed =
      action === 'update'
        ? policy.canUpdate(effectiveRoles, subject)
        : policy.canDelete(effectiveRoles, subject);
    if (!allowed) {
      throw new ForbiddenException(`You do not have permission to ${action} this media asset.`);
    }
  }

  private async assertFolderExists(folderId: string | undefined): Promise<void> {
    if (!folderId) return;
    const folder = await this.folderRepository.findById(folderId);
    if (!folder) {
      throw new MediaFolderNotFoundException(folderId);
    }
  }

  private async computeUsages(mediaAssetId: string): Promise<MediaUsageReference[]> {
    const [users, authors, articles, articleMediaLinks] = await Promise.all([
      this.repository.findUserProfileUsers(mediaAssetId),
      this.repository.findAuthorProfileAuthors(mediaAssetId),
      this.repository.findFeaturedArticles(mediaAssetId),
      this.repository.findArticleMediaLinks(mediaAssetId),
    ]);

    const usages: MediaUsageReference[] = [];
    for (const user of users) {
      usages.push({
        source: 'User.profileImage',
        id: user.id,
        label: user.displayName ?? user.email,
      });
    }
    for (const author of authors) {
      usages.push({ source: 'Author.profileImage', id: author.id, label: author.penName });
    }
    for (const article of articles) {
      usages.push({ source: 'Article.featuredMedia', id: article.id, label: article.title });
    }
    for (const link of articleMediaLinks) {
      usages.push({ source: 'ArticleMedia', id: link.articleId, label: link.article.title });
    }
    return usages;
  }

  private async toResponseDto(
    asset: Awaited<ReturnType<MediaRepository['findById']>>
  ): Promise<MediaResponseDto> {
    if (!asset) {
      throw new Error('toResponseDto called with a null media asset');
    }
    const usages = await this.computeUsages(asset.id);
    return this.mapper.toResponseDto(asset, usages);
  }

  /**
   * Batched sibling of `toResponseDto` for list-shaped results (stabilization
   * patch, post-Final-Backend-Audit — closes the N+1 pattern the audit
   * flagged: 4 queries per asset via `Promise.all(items.map(toResponseDto))`
   * became 4 queries total, regardless of list size). Single-item call sites
   * (`getMediaAsset`, `deleteMediaAsset`, `getUsages`, etc.) are unchanged
   * and still use `computeUsages`/`toResponseDto` above.
   */
  private async toResponseDtos(assets: MediaAsset[]): Promise<MediaResponseDto[]> {
    if (assets.length === 0) return [];
    const ids = assets.map((a) => a.id);
    const [usersByAsset, authorsByAsset, articlesByAsset, linksByAsset] = await Promise.all([
      this.repository.findUserProfileUsersForAssets(ids),
      this.repository.findAuthorProfileAuthorsForAssets(ids),
      this.repository.findFeaturedArticlesForAssets(ids),
      this.repository.findArticleMediaLinksForAssets(ids),
    ]);

    return assets.map((asset) => {
      const usages: MediaUsageReference[] = [];
      for (const user of usersByAsset.get(asset.id) ?? []) {
        usages.push({
          source: 'User.profileImage',
          id: user.id,
          label: user.displayName ?? user.email,
        });
      }
      for (const author of authorsByAsset.get(asset.id) ?? []) {
        usages.push({ source: 'Author.profileImage', id: author.id, label: author.penName });
      }
      for (const article of articlesByAsset.get(asset.id) ?? []) {
        usages.push({ source: 'Article.featuredMedia', id: article.id, label: article.title });
      }
      for (const link of linksByAsset.get(asset.id) ?? []) {
        usages.push({ source: 'ArticleMedia', id: link.articleId, label: link.article.title });
      }
      return this.mapper.toResponseDto(asset, usages);
    });
  }

  private mergeMetadata(
    existing: MediaAssetMetadata,
    patch: Partial<MediaAssetMetadata>
  ): MediaAssetMetadata {
    return { ...existing, ...patch };
  }

  async createMediaAsset(dto: CreateMediaAssetDto, actor: ActingUser): Promise<MediaResponseDto> {
    const site = await this.repository.getDefaultSite();
    const filesize = BigInt(dto.filesize);

    this.validator.assertStorageKeyShape(dto.storageKey);
    this.validator.assertMimeTypeMatchesType(dto.type, dto.mimeType);
    await this.validator.assertMimeTypeAllowed(dto.mimeType);
    await this.validator.assertFilesizeWithinLimit(filesize);
    await this.assertFolderExists(dto.folderId);

    const existing = await this.repository.findByStorageKey(dto.storageKey, site.id);
    if (existing) {
      throw new StorageKeyConflictException(dto.storageKey);
    }

    const metadata: MediaAssetMetadata = {};
    if (dto.filename) metadata.filename = dto.filename;
    if (dto.folderId) metadata.folderId = dto.folderId;

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      uploader: { connect: { id: actor.id } },
      type: dto.type,
      storageKey: dto.storageKey,
      mimeType: dto.mimeType,
      filesize,
      width: dto.width,
      height: dto.height,
      duration: dto.duration,
      altText: dto.altText,
      caption: dto.caption,
      credit: dto.credit,
      metadata:
        Object.keys(metadata).length > 0 ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.create',
      resource: 'media_asset',
      resourceId: created.id,
      result: 'success',
    });
    return this.toResponseDto(created);
  }

  async getMediaAsset(id: string): Promise<MediaResponseDto> {
    const asset = await this.getAssetOrThrow(id);
    return this.toResponseDto(asset);
  }

  async listMediaAssets(options: MediaQueryOptions): Promise<PaginatedResult<MediaResponseDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    const mapped = await this.toResponseDtos(items);
    return buildPaginatedResult(mapped, options.page, options.limit, total);
  }

  async updateMediaAsset(
    id: string,
    dto: UpdateMediaAssetDto,
    actor: ActingUser
  ): Promise<MediaResponseDto> {
    const existing = await this.getAssetOrThrow(id);
    await this.assertCanManage(actor, existing.uploadedBy, 'update');

    const updated = await this.repository.update(id, {
      altText: dto.altText,
      caption: dto.caption,
      credit: dto.credit,
      status: dto.status,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.update',
      resource: 'media_asset',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async renameMediaAsset(
    id: string,
    dto: RenameMediaAssetDto,
    actor: ActingUser
  ): Promise<MediaResponseDto> {
    const existing = await this.getAssetOrThrow(id);
    await this.assertCanManage(actor, existing.uploadedBy, 'update');

    const metadata = this.mergeMetadata((existing.metadata as MediaAssetMetadata | null) ?? {}, {
      filename: dto.filename,
    });
    const updated = await this.repository.update(id, {
      metadata: metadata as Prisma.InputJsonValue,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.rename',
      resource: 'media_asset',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async moveMediaAsset(
    id: string,
    dto: MoveMediaAssetDto,
    actor: ActingUser
  ): Promise<MediaResponseDto> {
    const existing = await this.getAssetOrThrow(id);
    await this.assertCanManage(actor, existing.uploadedBy, 'update');
    await this.assertFolderExists(dto.folderId ?? undefined);

    const metadata = this.mergeMetadata((existing.metadata as MediaAssetMetadata | null) ?? {}, {
      folderId: dto.folderId ?? null,
    });
    const updated = await this.repository.update(id, {
      metadata: metadata as Prisma.InputJsonValue,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.move',
      resource: 'media_asset',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async copyMetadata(
    sourceId: string,
    dto: CopyMediaMetadataDto,
    actor: ActingUser
  ): Promise<MediaResponseDto> {
    const source = await this.getAssetOrThrow(sourceId);
    const target = await this.getAssetOrThrow(dto.targetId);
    await this.assertCanManage(actor, target.uploadedBy, 'update');

    const sourceMetadata = (source.metadata as MediaAssetMetadata | null) ?? {};
    const targetMetadata = this.mergeMetadata(
      (target.metadata as MediaAssetMetadata | null) ?? {},
      {
        filename: sourceMetadata.filename,
      }
    );

    const updated = await this.repository.update(dto.targetId, {
      altText: source.altText,
      caption: source.caption,
      credit: source.credit,
      metadata: targetMetadata as Prisma.InputJsonValue,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.copy_metadata',
      resource: 'media_asset',
      resourceId: dto.targetId,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async deleteMediaAsset(id: string, actor: ActingUser): Promise<MediaResponseDto> {
    const existing = await this.getAssetOrThrow(id);
    if (existing.deletedAt) {
      throw new MediaAssetAlreadyDeletedException(id);
    }
    await this.assertCanManage(actor, existing.uploadedBy, 'delete');

    const usages = await this.computeUsages(id);
    if (usages.length > 0) {
      throw new MediaAssetInUseException(id, usages.length);
    }

    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.delete',
      resource: 'media_asset',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(await this.getAssetOrThrow(id, true));
  }

  async restoreMediaAsset(id: string, actor: ActingUser): Promise<MediaResponseDto> {
    const existing = await this.getAssetOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new MediaAssetNotDeletedException(id);
    }
    await this.assertCanManage(actor, existing.uploadedBy, 'update');
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.restore',
      resource: 'media_asset',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(await this.getAssetOrThrow(id));
  }

  async getUsages(id: string): Promise<MediaUsageReference[]> {
    await this.getAssetOrThrow(id);
    return this.computeUsages(id);
  }

  async findDuplicates(id: string): Promise<MediaResponseDto[]> {
    const asset = await this.getAssetOrThrow(id);
    const duplicates = await this.repository.findPossibleDuplicates(
      asset.mimeType,
      asset.filesize,
      id
    );
    return this.toResponseDtos(duplicates);
  }
}
