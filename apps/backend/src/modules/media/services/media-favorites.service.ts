import { Injectable } from '@nestjs/common';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { MediaEngagementRepository } from '../repositories/media-engagement.repository';
import { MediaRepository } from '../repositories/media.repository';
import { MediaMapper } from '../mappers/media.mapper';
import { MediaUrlResolverService } from './media-url-resolver.service';
import { MediaResponseDto } from '../dto/media-response.dto';
import { MediaAssetNotFoundException } from '../exceptions/media.exceptions';

interface ActingUser {
  id: string;
}

/**
 * Favorites (per-user, `MediaFavorite`) + Recent (per-user, bounded
 * `MediaRecentView` log) + Pinned (global/site-wide, `MediaAsset.pinnedAt`)
 * — three genuinely different features, not one personal-bookmark list
 * wearing three names (see the plan's "Judgment calls" note). Gated on the
 * existing `media.upload`/`media.delete` permissions only — no new
 * permission key, matching this module's frozen vocabulary.
 */
@Injectable()
export class MediaFavoritesService {
  constructor(
    private readonly engagementRepository: MediaEngagementRepository,
    private readonly repository: MediaRepository,
    private readonly mapper: MediaMapper,
    private readonly urlResolver: MediaUrlResolverService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async assetOrThrow(id: string) {
    const asset = await this.repository.findById(id);
    if (!asset) {
      throw new MediaAssetNotFoundException(id);
    }
    return asset;
  }

  private async toResponseDtos(
    assets: Awaited<ReturnType<MediaRepository['findById']>>[]
  ): Promise<MediaResponseDto[]> {
    return Promise.all(
      assets.map(async (asset) => {
        if (!asset) throw new Error('toResponseDtos called with a null media asset');
        const urls = await this.urlResolver.resolveUrls(asset, { includeOriginal: true });
        return this.mapper.toResponseDto(asset, [], urls);
      })
    );
  }

  async addFavorite(mediaAssetId: string, actor: ActingUser): Promise<void> {
    await this.assetOrThrow(mediaAssetId);
    await this.engagementRepository.addFavorite(actor.id, mediaAssetId);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.favorite_add',
      resource: 'media_asset',
      resourceId: mediaAssetId,
      result: 'success',
    });
  }

  async removeFavorite(mediaAssetId: string, actor: ActingUser): Promise<void> {
    await this.engagementRepository.removeFavorite(actor.id, mediaAssetId);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.favorite_remove',
      resource: 'media_asset',
      resourceId: mediaAssetId,
      result: 'success',
    });
  }

  async listFavorites(actor: ActingUser): Promise<MediaResponseDto[]> {
    const assets = await this.engagementRepository.findFavoriteAssets(actor.id);
    return this.toResponseDtos(assets);
  }

  async recordView(mediaAssetId: string, actor: ActingUser): Promise<void> {
    await this.assetOrThrow(mediaAssetId);
    await this.engagementRepository.recordView(actor.id, mediaAssetId);
  }

  async listRecent(actor: ActingUser): Promise<MediaResponseDto[]> {
    const assets = await this.engagementRepository.findRecentAssets(actor.id);
    return this.toResponseDtos(assets);
  }

  async pin(mediaAssetId: string, actor: ActingUser): Promise<MediaResponseDto> {
    await this.assetOrThrow(mediaAssetId);
    const updated = await this.repository.update(mediaAssetId, {
      pinnedAt: new Date(),
      updatedBy: actor.id,
    });
    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.pin',
      resource: 'media_asset',
      resourceId: mediaAssetId,
      result: 'success',
    });
    const urls = await this.urlResolver.resolveUrls(updated, { includeOriginal: true });
    return this.mapper.toResponseDto(updated, [], urls);
  }

  async unpin(mediaAssetId: string, actor: ActingUser): Promise<MediaResponseDto> {
    await this.assetOrThrow(mediaAssetId);
    const updated = await this.repository.update(mediaAssetId, {
      pinnedAt: null,
      updatedBy: actor.id,
    });
    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.unpin',
      resource: 'media_asset',
      resourceId: mediaAssetId,
      result: 'success',
    });
    const urls = await this.urlResolver.resolveUrls(updated, { includeOriginal: true });
    return this.mapper.toResponseDto(updated, [], urls);
  }

  async listPinned(): Promise<MediaResponseDto[]> {
    const site = await this.repository.getDefaultSite();
    const pinned = await this.repository.findPinned(site.id);
    return this.toResponseDtos(pinned);
  }
}
