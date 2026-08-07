import { MediaStatus, MediaType } from '@prisma/client';
import { MediaProcessorService, PROCESS_MEDIA_ASSET_JOB } from './media-processor.service';

function buildAsset(overrides: Record<string, unknown> = {}) {
  return {
    id: 'media-1',
    siteId: 'site-1',
    uploadedBy: 'user-1',
    type: MediaType.IMAGE,
    storageKey: 'uploads/photo.png',
    mimeType: 'image/png',
    filesize: 1024n,
    width: null,
    height: null,
    duration: null,
    altText: null,
    caption: null,
    credit: null,
    metadata: null,
    status: MediaStatus.PROCESSING,
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
    upload: jest.fn().mockResolvedValue({ key: 'k', url: 'https://example.com/k' }),
    delete: jest.fn(),
    getSignedUrl: jest.fn(),
    createPresignedUploadUrl: jest.fn(),
    initiateMultipartUpload: jest.fn(),
    getMultipartPartUrls: jest.fn(),
    completeMultipartUpload: jest.fn(),
    abortMultipartUpload: jest.fn(),
    getObjectBuffer: jest.fn(),
    headObject: jest.fn(),
  };
  const jobQueue = {
    register: jest.fn(),
    enqueue: jest.fn(),
  };
  const repository = {
    findById: jest.fn(),
    update: jest.fn(),
  };
  const imageProcessing = {
    process: jest.fn(),
  };
  const virusScanner = {
    scan: jest.fn().mockResolvedValue({ clean: true }),
  };
  const errorLogger = {
    logError: jest.fn(),
  };
  const auditLogger = {
    record: jest.fn(),
  };

  const service = new MediaProcessorService(
    storage as never,
    jobQueue as never,
    repository as never,
    imageProcessing as never,
    virusScanner as never,
    errorLogger as never,
    auditLogger as never
  );

  return {
    service,
    storage,
    jobQueue,
    repository,
    imageProcessing,
    virusScanner,
    errorLogger,
    auditLogger,
  };
}

describe('MediaProcessorService', () => {
  it('registers the process-media-asset job handler on module init', () => {
    const { service, jobQueue } = buildService();
    service.onModuleInit();
    expect(jobQueue.register).toHaveBeenCalledWith(PROCESS_MEDIA_ASSET_JOB, expect.any(Function));
  });

  it('logs and returns early when the asset no longer exists', async () => {
    const { service, repository, errorLogger, storage } = buildService();
    repository.findById.mockResolvedValue(null);

    await service.process({ mediaAssetId: 'missing' });

    expect(errorLogger.logError).toHaveBeenCalled();
    expect(storage.getObjectBuffer).not.toHaveBeenCalled();
  });

  it('runs the full image pipeline and persists variants + status READY', async () => {
    const { service, repository, storage, imageProcessing, auditLogger } = buildService();
    const asset = buildAsset();
    repository.findById.mockResolvedValue(asset);
    storage.getObjectBuffer.mockResolvedValue(Buffer.from('fake-image-bytes'));
    imageProcessing.process.mockResolvedValue({
      width: 800,
      height: 600,
      variants: [
        { name: 'thumbnail', buffer: Buffer.from('t'), format: 'jpeg', width: 200, height: 150 },
        { name: 'webp', buffer: Buffer.from('w'), format: 'webp', width: 1920, height: 1440 },
      ],
      blurPlaceholder: 'data:image/jpeg;base64,abc',
      dominantColor: '#c83c28',
      exif: { Make: 'Canon' },
    });

    await service.process({ mediaAssetId: asset.id });

    expect(storage.upload).toHaveBeenCalledTimes(2);
    expect(storage.upload).toHaveBeenCalledWith(
      Buffer.from('t'),
      expect.objectContaining({
        key: `media-variants/${asset.id}/thumbnail.jpg`,
        contentType: 'image/jpeg',
      })
    );
    expect(repository.update).toHaveBeenCalledWith(
      asset.id,
      expect.objectContaining({
        status: MediaStatus.READY,
        width: 800,
        height: 600,
        blurPlaceholder: 'data:image/jpeg;base64,abc',
        dominantColor: '#c83c28',
        exif: { Make: 'Canon' },
      })
    );
    expect(auditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'media.process_complete', result: 'success' })
    );
  });

  it('skips the image pipeline for non-image types and just marks READY', async () => {
    const { service, repository, storage, imageProcessing } = buildService();
    const asset = buildAsset({ type: MediaType.VIDEO, mimeType: 'video/mp4' });
    repository.findById.mockResolvedValue(asset);
    storage.getObjectBuffer.mockResolvedValue(Buffer.from('fake-video-bytes'));

    await service.process({ mediaAssetId: asset.id });

    expect(imageProcessing.process).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(asset.id, { status: MediaStatus.READY });
  });

  it('marks the asset FAILED with a reason when the virus scan reports unclean', async () => {
    const { service, repository, storage, virusScanner, auditLogger } = buildService();
    const asset = buildAsset();
    repository.findById.mockResolvedValue(asset);
    storage.getObjectBuffer.mockResolvedValue(Buffer.from('bytes'));
    virusScanner.scan.mockResolvedValue({ clean: false, threat: 'EICAR-Test' });

    await service.process({ mediaAssetId: asset.id });

    expect(repository.update).toHaveBeenCalledWith(
      asset.id,
      expect.objectContaining({
        status: MediaStatus.FAILED,
        metadata: expect.objectContaining({
          processingError: expect.stringContaining('EICAR-Test'),
        }),
      })
    );
    expect(auditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'media.process_failed', result: 'failure' })
    );
  });

  it('marks the asset FAILED when storage retrieval throws', async () => {
    const { service, repository, storage } = buildService();
    const asset = buildAsset();
    repository.findById.mockResolvedValue(asset);
    storage.getObjectBuffer.mockRejectedValue(new Error('object not found in bucket'));

    await service.process({ mediaAssetId: asset.id });

    expect(repository.update).toHaveBeenCalledWith(
      asset.id,
      expect.objectContaining({
        status: MediaStatus.FAILED,
        metadata: expect.objectContaining({ processingError: 'object not found in bucket' }),
      })
    );
  });

  it('preserves existing metadata keys when recording a processing failure', async () => {
    const { service, repository, storage } = buildService();
    const asset = buildAsset({ metadata: { filename: 'photo.png' } });
    repository.findById.mockResolvedValue(asset);
    storage.getObjectBuffer.mockRejectedValue(new Error('boom'));

    await service.process({ mediaAssetId: asset.id });

    expect(repository.update).toHaveBeenCalledWith(
      asset.id,
      expect.objectContaining({
        metadata: { filename: 'photo.png', processingError: 'boom' },
      })
    );
  });
});
