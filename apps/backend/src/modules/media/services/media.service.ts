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
import { MediaUrlResolverService } from './media-url-resolver.service';
import {
  collectMediaReferenceIds,
  type MediaRefBlockNodeLike,
} from '../../content-blocks/utils/media-reference-collector.util';
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

function extractBlocks(body: unknown): MediaRefBlockNodeLike[] {
  return typeof body === 'object' &&
    body !== null &&
    Array.isArray((body as { blocks?: unknown }).blocks)
    ? ((body as { blocks: unknown }).blocks as MediaRefBlockNodeLike[])
    : [];
}

@Injectable()
export class MediaService {
  constructor(
    private readonly repository: MediaRepository,
    private readonly folderRepository: MediaFolderRepository,
    private readonly validator: MediaValidator,
    private readonly mapper: MediaMapper,
    private readonly authorizationService: AuthorizationService,
    private readonly auditLogger: AuditLoggerService,
    private readonly urlResolver: MediaUrlResolverService
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

  /**
   * `media-ref` usage detection (Milestone 5) — Page/Article/ReusableBlock
   * have no relational FK to `MediaAsset` for block-tree references, so
   * this walks every active body once (via `collectMediaReferenceIds`) and
   * buckets matches by asset id, batched across all requested
   * `mediaAssetIds` in a single pass — mirrors
   * `ReusableBlocksService.computeUsages`'s identical body-scan shape, and
   * `findUserProfileUsersForAssets`'s N+1-safe batching precedent above.
   */
  private async computeBodyUsagesForAssets(
    mediaAssetIds: string[],
    siteId: string
  ): Promise<Map<string, MediaUsageReference[]>> {
    const map = new Map<string, MediaUsageReference[]>();
    if (mediaAssetIds.length === 0) return map;
    const idSet = new Set(mediaAssetIds);

    const add = (assetId: string, usage: MediaUsageReference) => {
      const bucket = map.get(assetId) ?? [];
      bucket.push(usage);
      map.set(assetId, bucket);
    };

    const [pages, articles, reusableBlocks] = await Promise.all([
      this.repository.findActivePageBodies(siteId),
      this.repository.findActiveArticleBodies(siteId),
      this.repository.findActiveReusableBlockBodies(siteId),
    ]);

    for (const page of pages) {
      for (const mediaId of collectMediaReferenceIds(extractBlocks(page.body))) {
        if (idSet.has(mediaId))
          add(mediaId, { source: 'Page.body', id: page.id, label: page.title });
      }
    }
    for (const article of articles) {
      for (const mediaId of collectMediaReferenceIds(extractBlocks(article.body))) {
        if (idSet.has(mediaId)) {
          add(mediaId, { source: 'Article.body', id: article.id, label: article.title });
        }
      }
    }
    for (const block of reusableBlocks) {
      const node: MediaRefBlockNodeLike = {
        type: block.blockType,
        data: (block.data as Record<string, unknown>) ?? {},
        children: (block.children as unknown as MediaRefBlockNodeLike[] | undefined) ?? undefined,
      };
      for (const mediaId of collectMediaReferenceIds([node])) {
        if (idSet.has(mediaId)) {
          add(mediaId, { source: 'ReusableBlock.body', id: block.id, label: block.name });
        }
      }
    }

    return map;
  }

  private async computeUsages(mediaAssetId: string): Promise<MediaUsageReference[]> {
    const site = await this.repository.getDefaultSite();
    const [users, authors, articles, articleMediaLinks, bodyUsagesByAsset] = await Promise.all([
      this.repository.findUserProfileUsers(mediaAssetId),
      this.repository.findAuthorProfileAuthors(mediaAssetId),
      this.repository.findFeaturedArticles(mediaAssetId),
      this.repository.findArticleMediaLinks(mediaAssetId),
      this.computeBodyUsagesForAssets([mediaAssetId], site.id),
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
    usages.push(...(bodyUsagesByAsset.get(mediaAssetId) ?? []));
    return usages;
  }

  private async toResponseDto(
    asset: Awaited<ReturnType<MediaRepository['findById']>>
  ): Promise<MediaResponseDto> {
    if (!asset) {
      throw new Error('toResponseDto called with a null media asset');
    }
    const [usages, urls] = await Promise.all([
      this.computeUsages(asset.id),
      this.urlResolver.resolveUrls(asset, { includeOriginal: true }),
    ]);
    return this.mapper.toResponseDto(asset, usages, urls);
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
    const [
      usersByAsset,
      authorsByAsset,
      articlesByAsset,
      linksByAsset,
      bodyUsagesByAsset,
      urlsByAsset,
    ] = await Promise.all([
      this.repository.findUserProfileUsersForAssets(ids),
      this.repository.findAuthorProfileAuthorsForAssets(ids),
      this.repository.findFeaturedArticlesForAssets(ids),
      this.repository.findArticleMediaLinksForAssets(ids),
      this.computeBodyUsagesForAssets(ids, assets[0].siteId),
      // includeOriginal: false — avoid signing 20-50 URLs per list page for PRIVATE assets.
      Promise.all(
        assets.map((asset) => this.urlResolver.resolveUrls(asset, { includeOriginal: false }))
      ),
    ]);

    return assets.map((asset, index) => {
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
      usages.push(...(bodyUsagesByAsset.get(asset.id) ?? []));
      return this.mapper.toResponseDto(asset, usages, urlsByAsset[index]);
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

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      uploader: { connect: { id: actor.id } },
      // Real FK column (Milestone 5) — metadata.folderId is legacy-read-only from here on.
      folder: dto.folderId ? { connect: { id: dto.folderId } } : undefined,
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

    const updated = await this.repository.update(id, {
      // Real FK column (Milestone 5) — metadata.folderId is legacy-read-only from here on.
      folder: dto.folderId ? { connect: { id: dto.folderId } } : { disconnect: true },
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

  /** Same as `getUsages` but permits an already soft-deleted asset — the
   * final in-use check `MediaBulkService.permanentDelete` runs
   * immediately before a real hard-delete ("Trash, then Purge"). */
  async getUsagesIncludingDeleted(id: string): Promise<MediaUsageReference[]> {
    await this.getAssetOrThrow(id, true);
    return this.computeUsages(id);
  }

  /** On-demand resolution for a PRIVATE asset whose `urls.original` was
   * omitted from a list response (avoid signing 20–50 URLs per page). */
  async getSignedUrl(id: string): Promise<{ url: string }> {
    const asset = await this.getAssetOrThrow(id);
    const url = await this.urlResolver.resolveSignedUrl(asset.storageKey);
    return { url };
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
