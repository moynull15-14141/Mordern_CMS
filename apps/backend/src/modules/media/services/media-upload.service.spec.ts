import { MediaStatus, MediaType, MediaVisibility } from '@prisma/client';
import { MediaUploadService } from './media-upload.service';
import {
  MediaAssetNotFoundException,
  MediaFolderNotFoundException,
  MediaValidationException,
} from '../exceptions/media.exceptions';

function buildAsset(overrides: Record<string, unknown> = {}) {
  return {
    id: 'media-1',
    siteId: 'site-1',
    uploadedBy: 'user-1',
    folderId: null,
    type: MediaType.IMAGE,
    storageKey: 'uploads/site-1/media-1/photo.png',
    mimeType: 'image/png',
    filesize: 1024n,
    width: null,
    height: null,
    duration: null,
    altText: null,
    caption: null,
    credit: null,
    metadata: { filename: 'photo.png' },
    status: MediaStatus.PROCESSING,
    visibility: MediaVisibility.PUBLIC,
    variants: null,
    blurPlaceholder: null,
    dominantColor: null,
    exif: null,
    pinnedAt: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

function buildService() {
  const storage = {
    upload: jest.fn(),
    delete: jest.fn(),
    getSignedUrl: jest.fn().mockResolvedValue('https://signed.example.com/x'),
    createPresignedUploadUrl: jest.fn().mockResolvedValue({
      url: 'https://r2.example.com/put',
      expiresAt: new Date('2026-01-01T00:15:00.000Z'),
    }),
    initiateMultipartUpload: jest.fn().mockResolvedValue({ uploadId: 'upload-1' }),
    getMultipartPartUrls: jest
      .fn()
      .mockResolvedValue([{ partNumber: 1, url: 'https://r2.example.com/part1' }]),
    completeMultipartUpload: jest.fn().mockResolvedValue(undefined),
    abortMultipartUpload: jest.fn().mockResolvedValue(undefined),
    getObjectBuffer: jest.fn(),
    headObject: jest.fn().mockResolvedValue({ exists: true, contentLength: 1024 }),
  };
  const jobQueue = { register: jest.fn(), enqueue: jest.fn().mockResolvedValue(undefined) };
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findById: jest.fn(),
    create: jest.fn(),
    softDelete: jest.fn(),
  };
  const folderRepository = { findById: jest.fn().mockResolvedValue({ id: 'folder-1' }) };
  const validator = {
    assertMimeTypeMatchesType: jest.fn(),
    assertMimeTypeAllowed: jest.fn().mockResolvedValue(undefined),
    assertFilesizeWithinLimit: jest.fn().mockResolvedValue(undefined),
  };
  const mapper = {
    toResponseDto: jest.fn((asset, usages, urls) => ({ id: asset.id, urls, usages })),
  };
  const urlResolver = {
    resolveUrls: jest.fn().mockResolvedValue({ original: 'https://cdn.example.com/x' }),
  };
  const auditLogger = { record: jest.fn() };

  const service = new MediaUploadService(
    storage as never,
    jobQueue as never,
    repository as never,
    folderRepository as never,
    validator as never,
    mapper as never,
    urlResolver as never,
    auditLogger as never
  );

  return {
    service,
    storage,
    jobQueue,
    repository,
    folderRepository,
    validator,
    mapper,
    urlResolver,
    auditLogger,
  };
}

const actor = { id: 'user-1' };

describe('MediaUploadService', () => {
  describe('createUploadRequest', () => {
    it('rejects a dangerous file extension before creating anything', async () => {
      const { service, repository } = buildService();
      await expect(
        service.createUploadRequest(
          {
            type: MediaType.DOCUMENT,
            filename: 'virus.exe',
            mimeType: 'application/octet-stream',
            filesize: '10',
          } as never,
          actor
        )
      ).rejects.toThrow(MediaValidationException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('rejects when the given folder does not exist', async () => {
      const { service, folderRepository } = buildService();
      (folderRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.createUploadRequest(
          {
            type: MediaType.IMAGE,
            filename: 'a.png',
            mimeType: 'image/png',
            filesize: '10',
            folderId: 'missing',
          } as never,
          actor
        )
      ).rejects.toThrow(MediaFolderNotFoundException);
    });

    it('creates a PROCESSING asset with a server-generated storageKey and returns a presigned PUT URL', async () => {
      const { service, repository, storage } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildAsset());

      const result = await service.createUploadRequest(
        {
          type: MediaType.IMAGE,
          filename: 'My Photo.png',
          mimeType: 'image/png',
          filesize: '1024',
        } as never,
        actor
      );

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: MediaStatus.PROCESSING, mimeType: 'image/png' })
      );
      expect(storage.createPresignedUploadUrl).toHaveBeenCalled();
      expect(result.uploadUrl).toBe('https://r2.example.com/put');
      expect(result.storageKey).toContain('site-1');
      expect(result.storageKey).toContain('My Photo.png');
    });
  });

  describe('confirmUpload', () => {
    it('throws MediaAssetNotFoundException when the asset does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.confirmUpload('missing', actor)).rejects.toThrow(
        MediaAssetNotFoundException
      );
    });

    it('rejects when the object never landed in storage', async () => {
      const { service, repository, storage, jobQueue } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      (storage.headObject as jest.Mock).mockResolvedValue({ exists: false });

      await expect(service.confirmUpload('media-1', actor)).rejects.toThrow(
        MediaValidationException
      );
      expect(jobQueue.enqueue).not.toHaveBeenCalled();
    });

    it('enqueues process-media-asset once the PUT is confirmed', async () => {
      const { service, repository, jobQueue } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());

      await service.confirmUpload('media-1', actor);

      expect(jobQueue.enqueue).toHaveBeenCalledWith('process-media-asset', {
        mediaAssetId: 'media-1',
      });
    });
  });

  describe('multipart', () => {
    it('initiates a multipart upload and returns one presigned URL per part', async () => {
      const { service, repository, storage } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildAsset());

      const result = await service.initiateMultipartUpload(
        {
          type: MediaType.VIDEO,
          filename: 'movie.mp4',
          mimeType: 'video/mp4',
          filesize: '5000000',
          partCount: 1,
        } as never,
        actor
      );

      expect(storage.initiateMultipartUpload).toHaveBeenCalled();
      expect(result.uploadId).toBe('upload-1');
      expect(result.parts).toHaveLength(1);
    });

    it('completes a multipart upload by forwarding parts to StorageProvider', async () => {
      const { service, repository, storage } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());

      await service.completeMultipartUpload(
        'media-1',
        { uploadId: 'upload-1', parts: [{ partNumber: 1, etag: 'etag-1' }] } as never,
        actor
      );

      expect(storage.completeMultipartUpload).toHaveBeenCalledWith(
        'uploads/site-1/media-1/photo.png',
        'upload-1',
        [{ partNumber: 1, etag: 'etag-1' }]
      );
    });

    it('aborts a multipart upload and soft-deletes the placeholder asset', async () => {
      const { service, repository, storage } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());

      await service.abortMultipartUpload('media-1', { uploadId: 'upload-1' } as never, actor);

      expect(storage.abortMultipartUpload).toHaveBeenCalledWith(
        'uploads/site-1/media-1/photo.png',
        'upload-1'
      );
      expect(repository.softDelete).toHaveBeenCalledWith('media-1', 'user-1');
    });
  });
});
