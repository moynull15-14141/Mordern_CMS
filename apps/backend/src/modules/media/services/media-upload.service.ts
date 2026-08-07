import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { MediaStatus } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import type { JobQueue } from '../../../core/interfaces/job-queue.interface';
import type { StorageProvider } from '../../../core/interfaces/storage-provider.interface';
import { JOB_QUEUE } from '../../../infrastructure/queue/queue.constants';
import { STORAGE_PROVIDER } from '../../../infrastructure/storage/storage.constants';
import { PROCESS_MEDIA_ASSET_JOB } from './media-processor.service';
import { MediaUrlResolverService } from './media-url-resolver.service';
import { MediaRepository } from '../repositories/media.repository';
import { MediaFolderRepository } from '../repositories/media-folder.repository';
import { MediaValidator } from '../validators/media.validator';
import { MediaMapper } from '../mappers/media.mapper';
import { CreateUploadRequestDto } from '../dto/create-upload-request.dto';
import {
  AbortMultipartUploadDto,
  CompleteMultipartUploadDto,
  InitiateMultipartUploadDto,
} from '../dto/initiate-multipart-upload.dto';
import {
  MultipartUploadRequestResponseDto,
  UploadRequestResponseDto,
} from '../dto/upload-request-response.dto';
import { MediaResponseDto } from '../dto/media-response.dto';
import {
  buildStorageKey,
  isDangerousExtension,
  sanitizeFilename,
} from '../utils/filename-sanitizer.util';
import {
  MediaAssetNotFoundException,
  MediaFolderNotFoundException,
  MediaValidationException,
} from '../exceptions/media.exceptions';

interface ActingUser {
  id: string;
}

/**
 * The real upload transport (Milestone 5) — presigned direct-to-R2, the
 * backend never receives file bytes. `MediaController`'s
 * `POST /media` (`CreateMediaAssetDto`) remains for registering an object a
 * caller placed by other means; this service is the browser-upload path.
 * Kept as its own service/controller (not folded into `MediaService`),
 * matching this module's existing "one controller per cohesive concern"
 * split (`MediaController`/`MediaFolderController`).
 */
@Injectable()
export class MediaUploadService {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    @Inject(JOB_QUEUE) private readonly jobQueue: JobQueue,
    private readonly repository: MediaRepository,
    private readonly folderRepository: MediaFolderRepository,
    private readonly validator: MediaValidator,
    private readonly mapper: MediaMapper,
    private readonly urlResolver: MediaUrlResolverService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async assertFolderExists(folderId: string | undefined): Promise<void> {
    if (!folderId) return;
    const folder = await this.folderRepository.findById(folderId);
    if (!folder) {
      throw new MediaFolderNotFoundException(folderId);
    }
  }

  private assertFilenameSafe(filename: string): void {
    if (isDangerousExtension(filename)) {
      throw new MediaValidationException(`File extension is not allowed for "${filename}".`);
    }
  }

  private async toResponseDto(assetId: string): Promise<MediaResponseDto> {
    const asset = await this.repository.findById(assetId, true);
    if (!asset) {
      throw new MediaAssetNotFoundException(assetId);
    }
    const urls = await this.urlResolver.resolveUrls(asset, { includeOriginal: true });
    return this.mapper.toResponseDto(asset, [], urls);
  }

  async createUploadRequest(
    dto: CreateUploadRequestDto,
    actor: ActingUser
  ): Promise<UploadRequestResponseDto> {
    this.assertFilenameSafe(dto.filename);
    const filesize = BigInt(dto.filesize);
    this.validator.assertMimeTypeMatchesType(dto.type, dto.mimeType);
    await this.validator.assertMimeTypeAllowed(dto.mimeType);
    await this.validator.assertFilesizeWithinLimit(filesize);
    await this.assertFolderExists(dto.folderId);

    const site = await this.repository.getDefaultSite();
    const assetId = randomUUID();
    const sanitizedFilename = sanitizeFilename(dto.filename);
    const storageKey = buildStorageKey(site.id, assetId, sanitizedFilename);

    const created = await this.repository.create({
      id: assetId,
      site: { connect: { id: site.id } },
      uploader: { connect: { id: actor.id } },
      folder: dto.folderId ? { connect: { id: dto.folderId } } : undefined,
      type: dto.type,
      storageKey,
      mimeType: dto.mimeType,
      filesize,
      width: dto.width,
      height: dto.height,
      duration: dto.duration,
      metadata: { filename: sanitizedFilename },
      status: MediaStatus.PROCESSING,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    const presigned = await this.storage.createPresignedUploadUrl(storageKey, {
      contentType: dto.mimeType,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.upload_request',
      resource: 'media_asset',
      resourceId: created.id,
      result: 'success',
    });

    return {
      mediaAssetId: created.id,
      uploadUrl: presigned.url,
      expiresAt: presigned.expiresAt.toISOString(),
      storageKey,
    };
  }

  async initiateMultipartUpload(
    dto: InitiateMultipartUploadDto,
    actor: ActingUser
  ): Promise<MultipartUploadRequestResponseDto> {
    this.assertFilenameSafe(dto.filename);
    const filesize = BigInt(dto.filesize);
    this.validator.assertMimeTypeMatchesType(dto.type, dto.mimeType);
    await this.validator.assertMimeTypeAllowed(dto.mimeType);
    await this.validator.assertFilesizeWithinLimit(filesize);
    await this.assertFolderExists(dto.folderId);

    const site = await this.repository.getDefaultSite();
    const assetId = randomUUID();
    const sanitizedFilename = sanitizeFilename(dto.filename);
    const storageKey = buildStorageKey(site.id, assetId, sanitizedFilename);

    const created = await this.repository.create({
      id: assetId,
      site: { connect: { id: site.id } },
      uploader: { connect: { id: actor.id } },
      folder: dto.folderId ? { connect: { id: dto.folderId } } : undefined,
      type: dto.type,
      storageKey,
      mimeType: dto.mimeType,
      filesize,
      metadata: { filename: sanitizedFilename },
      status: MediaStatus.PROCESSING,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    const { uploadId } = await this.storage.initiateMultipartUpload(storageKey, {
      contentType: dto.mimeType,
    });
    const partNumbers = Array.from({ length: dto.partCount }, (_, index) => index + 1);
    const parts = await this.storage.getMultipartPartUrls(storageKey, uploadId, partNumbers);

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.upload_request_multipart',
      resource: 'media_asset',
      resourceId: created.id,
      result: 'success',
    });

    return { mediaAssetId: created.id, uploadId, storageKey, parts };
  }

  async completeMultipartUpload(
    mediaAssetId: string,
    dto: CompleteMultipartUploadDto,
    actor: ActingUser
  ): Promise<MediaResponseDto> {
    const asset = await this.repository.findById(mediaAssetId, true);
    if (!asset) {
      throw new MediaAssetNotFoundException(mediaAssetId);
    }
    await this.storage.completeMultipartUpload(
      asset.storageKey,
      dto.uploadId,
      dto.parts.map((part) => ({ partNumber: part.partNumber, etag: part.etag }))
    );

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.upload_complete_multipart',
      resource: 'media_asset',
      resourceId: asset.id,
      result: 'success',
    });
    return this.toResponseDto(asset.id);
  }

  async abortMultipartUpload(
    mediaAssetId: string,
    dto: AbortMultipartUploadDto,
    actor: ActingUser
  ): Promise<void> {
    const asset = await this.repository.findById(mediaAssetId, true);
    if (!asset) {
      throw new MediaAssetNotFoundException(mediaAssetId);
    }
    await this.storage.abortMultipartUpload(asset.storageKey, dto.uploadId);
    await this.repository.softDelete(asset.id, actor.id);

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.upload_abort_multipart',
      resource: 'media_asset',
      resourceId: asset.id,
      result: 'success',
    });
  }

  async confirmUpload(mediaAssetId: string, actor: ActingUser): Promise<MediaResponseDto> {
    const asset = await this.repository.findById(mediaAssetId, true);
    if (!asset) {
      throw new MediaAssetNotFoundException(mediaAssetId);
    }

    const head = await this.storage.headObject(asset.storageKey);
    if (!head.exists) {
      this.auditLogger.record({
        actorId: actor.id,
        action: 'media.upload_confirm',
        resource: 'media_asset',
        resourceId: asset.id,
        result: 'failure',
      });
      throw new MediaValidationException(
        `No object found at "${asset.storageKey}" — the upload may have failed or not completed yet.`
      );
    }

    await this.jobQueue.enqueue(PROCESS_MEDIA_ASSET_JOB, { mediaAssetId: asset.id });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.upload_confirm',
      resource: 'media_asset',
      resourceId: asset.id,
      result: 'success',
    });
    return this.toResponseDto(asset.id);
  }
}
