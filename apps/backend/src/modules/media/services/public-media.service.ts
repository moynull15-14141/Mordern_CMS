import { Injectable } from '@nestjs/common';
import { MediaStatus, MediaVisibility } from '@prisma/client';
import { MediaRepository } from '../repositories/media.repository';
import { MediaUrlResolverService } from './media-url-resolver.service';
import { PublicMediaResponseDto } from '../dto/public-media-response.dto';
import { MediaAssetNotFoundException } from '../exceptions/media.exceptions';

/**
 * Public read path for resolving a `media-ref` during rendering — mirrors
 * `PublicContentBlocksService`'s exact reasoning: deliberately separate
 * from `MediaService` (never needs `MediaValidator`/ownership policies/
 * `AuditLoggerService`, no writes happen here). Returns 404
 * (`MediaAssetNotFoundException`) for `PRIVATE` or non-`READY` assets —
 * indistinguishable from "doesn't exist" to an unauthenticated caller.
 */
@Injectable()
export class PublicMediaService {
  constructor(
    private readonly repository: MediaRepository,
    private readonly urlResolver: MediaUrlResolverService
  ) {}

  async getMedia(id: string): Promise<PublicMediaResponseDto> {
    const asset = await this.repository.findById(id);
    if (
      !asset ||
      asset.status !== MediaStatus.READY ||
      asset.visibility === MediaVisibility.PRIVATE
    ) {
      throw new MediaAssetNotFoundException(id);
    }

    const urls = await this.urlResolver.resolveUrls(asset, { includeOriginal: true });
    return {
      id: asset.id,
      type: asset.type,
      urls,
      altText: asset.altText,
      caption: asset.caption,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      blurPlaceholder: asset.blurPlaceholder,
      dominantColor: asset.dominantColor,
    };
  }
}
