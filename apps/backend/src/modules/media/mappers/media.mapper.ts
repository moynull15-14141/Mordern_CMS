import { Injectable } from '@nestjs/common';
import { MediaAsset } from '@prisma/client';
import { MediaAssetMetadata } from '../interfaces/media-metadata.interface';
import { MediaUsageReference } from '../interfaces/media-usage.interface';
import { MediaResponseDto } from '../dto/media-response.dto';

@Injectable()
export class MediaMapper {
  private parseMetadata(asset: MediaAsset): MediaAssetMetadata {
    return (asset.metadata as MediaAssetMetadata | null) ?? {};
  }

  toResponseDto(asset: MediaAsset, usages: MediaUsageReference[]): MediaResponseDto {
    const metadata = this.parseMetadata(asset);
    return {
      id: asset.id,
      type: asset.type,
      status: asset.status,
      storageKey: asset.storageKey,
      filename: metadata.filename ?? this.deriveFilenameFromKey(asset.storageKey),
      folderId: metadata.folderId ?? null,
      mimeType: asset.mimeType,
      filesize: asset.filesize.toString(),
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      altText: asset.altText,
      caption: asset.caption,
      credit: asset.credit,
      uploadedBy: asset.uploadedBy,
      usageCount: usages.length,
      usages,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
      deletedAt: asset.deletedAt?.toISOString() ?? null,
    };
  }

  private deriveFilenameFromKey(storageKey: string): string {
    const segments = storageKey.split('/');
    return segments[segments.length - 1] ?? storageKey;
  }
}
