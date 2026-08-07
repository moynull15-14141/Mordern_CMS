import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { MediaStatus, MediaType, type Prisma } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { ErrorLoggerService } from '../../../core/logger/error-logger.service';
import type { StorageProvider } from '../../../core/interfaces/storage-provider.interface';
import type { JobQueue } from '../../../core/interfaces/job-queue.interface';
import { JOB_QUEUE } from '../../../infrastructure/queue/queue.constants';
import { STORAGE_PROVIDER } from '../../../infrastructure/storage/storage.constants';
import type { MediaAssetMetadata } from '../interfaces/media-metadata.interface';
import { MediaRepository } from '../repositories/media.repository';
import { ImageProcessingService } from './image-processing.service';
import { NoopVirusScanner } from './noop-virus-scanner.service';

export interface ProcessMediaAssetJobPayload {
  mediaAssetId: string;
}

export const PROCESS_MEDIA_ASSET_JOB = 'process-media-asset';

const VARIANT_EXTENSIONS: Record<string, string> = {
  jpeg: 'jpg',
  webp: 'webp',
  avif: 'avif',
};

/**
 * The `process-media-asset` job handler, registered with `JobQueue` on
 * module init. Downloads the original from storage, sniffs its real magic
 * bytes (cross-checked against the declared `mimeType`), runs a virus scan,
 * then branches by `MediaType`: `IMAGE` gets the full `ImageProcessingService`
 * pipeline (variants uploaded to `media-variants/{assetId}/{name}.{ext}`);
 * `VIDEO`/`AUDIO`/`DOCUMENT` get mime+virus checks only (real ffmpeg/poppler
 * work is explicitly deferred — V1 trusts client-declared metadata already
 * collected browser-side). Any failure sets `status: FAILED` with the
 * reason in `metadata.processingError`, never throws back to the caller
 * (the queue driver's own retry loop governs re-attempts).
 */
@Injectable()
export class MediaProcessorService implements OnModuleInit {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    @Inject(JOB_QUEUE) private readonly jobQueue: JobQueue,
    private readonly repository: MediaRepository,
    private readonly imageProcessing: ImageProcessingService,
    private readonly virusScanner: NoopVirusScanner,
    private readonly errorLogger: ErrorLoggerService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  onModuleInit(): void {
    this.jobQueue.register<ProcessMediaAssetJobPayload>(PROCESS_MEDIA_ASSET_JOB, (payload) =>
      this.process(payload)
    );
  }

  async process(payload: ProcessMediaAssetJobPayload): Promise<void> {
    const { mediaAssetId } = payload;
    const asset = await this.repository.findById(mediaAssetId, true);
    if (!asset) {
      this.errorLogger.logError(
        new Error(`MediaAsset "${mediaAssetId}" not found for processing.`),
        {
          code: 'media.process.not_found',
          mediaAssetId,
        }
      );
      return;
    }

    try {
      const buffer = await this.storage.getObjectBuffer(asset.storageKey);

      const sniffedMimeType = await this.sniffMimeType(buffer);
      if (sniffedMimeType && sniffedMimeType !== asset.mimeType) {
        throw new Error(
          `Declared MIME type "${asset.mimeType}" does not match the file's real content ("${sniffedMimeType}").`
        );
      }

      const scanResult = await this.virusScanner.scan(buffer);
      if (!scanResult.clean) {
        throw new Error(`File failed virus scan (threat: ${scanResult.threat ?? 'unknown'}).`);
      }

      if (asset.type === MediaType.IMAGE) {
        await this.processImage(asset.id, buffer);
      } else {
        // VIDEO/AUDIO/DOCUMENT: mime+virus checks only. Real duration
        // re-derivation (ffmpeg) and document thumbnails (poppler) are
        // explicitly deferred — V1 trusts client-declared metadata.
        await this.repository.update(asset.id, { status: MediaStatus.READY });
      }

      this.auditLogger.record({
        actorId: asset.uploadedBy,
        action: 'media.process_complete',
        resource: 'media_asset',
        resourceId: asset.id,
        result: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown processing error';
      this.errorLogger.logError(error, { code: 'media.process.failed', mediaAssetId });

      const metadata: MediaAssetMetadata = {
        ...(asset.metadata as MediaAssetMetadata | null),
        processingError: message,
      };
      await this.repository.update(asset.id, {
        status: MediaStatus.FAILED,
        metadata: metadata as Prisma.InputJsonValue,
      });

      this.auditLogger.record({
        actorId: asset.uploadedBy,
        action: 'media.process_failed',
        resource: 'media_asset',
        resourceId: asset.id,
        result: 'failure',
      });
    }
  }

  private async processImage(assetId: string, buffer: Buffer): Promise<void> {
    const result = await this.imageProcessing.process(buffer);

    const variants: Record<
      string,
      { storageKey: string; width: number; height: number; format: string }
    > = {};
    for (const variant of result.variants) {
      const extension = VARIANT_EXTENSIONS[variant.format] ?? variant.format;
      const key = `media-variants/${assetId}/${variant.name}.${extension}`;
      await this.storage.upload(variant.buffer, { key, contentType: `image/${variant.format}` });
      variants[variant.name] = {
        storageKey: key,
        width: variant.width,
        height: variant.height,
        format: variant.format,
      };
    }

    await this.repository.update(assetId, {
      status: MediaStatus.READY,
      width: result.width,
      height: result.height,
      variants: variants as Prisma.InputJsonValue,
      blurPlaceholder: result.blurPlaceholder,
      dominantColor: result.dominantColor,
      ...(result.exif ? { exif: result.exif as Prisma.InputJsonValue } : {}),
    });
  }

  private async sniffMimeType(buffer: Buffer): Promise<string | undefined> {
    try {
      const { fileTypeFromBuffer } = await import('file-type');
      const detected = await fileTypeFromBuffer(buffer);
      return detected?.mime;
    } catch {
      return undefined;
    }
  }
}
