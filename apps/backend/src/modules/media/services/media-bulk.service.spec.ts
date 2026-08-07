import { MediaStatus, MediaType, MediaVisibility } from '@prisma/client';
import { MediaBulkService } from './media-bulk.service';
import {
  MediaAssetInUseException,
  MediaAssetNotDeletedException,
  MediaAssetNotFoundException,
  MediaValidationException,
} from '../exceptions/media.exceptions';

function buildAsset(overrides: Record<string, unknown> = {}) {
  return {
    id: 'media-1',
    siteId: 'site-1',
    uploadedBy: 'user-1',
    folderId: null,
    type: MediaType.IMAGE,
    storageKey: 'uploads/media-1/photo.png',
    mimeType: 'image/png',
    filesize: 1024n,
    metadata: null,
    status: MediaStatus.READY,
    visibility: MediaVisibility.PUBLIC,
    variants: {
      thumbnail: { storageKey: 'media-variants/media-1/thumbnail.jpg' },
      webp: { storageKey: 'media-variants/media-1/webp.webp' },
    },
    blurPlaceholder: null,
    dominantColor: null,
    exif: null,
    pinnedAt: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: new Date('2026-01-02'),
    deletedBy: 'user-1',
    ...overrides,
  };
}

function buildService() {
  const storage = { delete: jest.fn().mockResolvedValue(undefined) };
  const repository = {
    findById: jest.fn(),
    hardDelete: jest.fn().mockResolvedValue(undefined),
  };
  const mediaService = {
    moveMediaAsset: jest.fn().mockResolvedValue({}),
    updateMediaAsset: jest.fn().mockResolvedValue({}),
    restoreMediaAsset: jest.fn().mockResolvedValue({}),
    deleteMediaAsset: jest.fn().mockResolvedValue({}),
    getUsagesIncludingDeleted: jest.fn().mockResolvedValue([]),
  };
  const auditLogger = { record: jest.fn() };

  const service = new MediaBulkService(
    storage as never,
    repository as never,
    mediaService as never,
    auditLogger as never
  );

  return { service, storage, repository, mediaService, auditLogger };
}

const actor = { id: 'user-1' };

describe('MediaBulkService', () => {
  it('bulkDelete reports partial success when one item fails', async () => {
    const { service, mediaService } = buildService();
    (mediaService.deleteMediaAsset as jest.Mock)
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('still referenced'));

    const result = await service.bulkDelete(['media-1', 'media-2'], actor);

    expect(result.succeeded).toEqual(['media-1']);
    expect(result.failed).toEqual([{ id: 'media-2', reason: 'still referenced' }]);
  });

  it('bulkMove calls moveMediaAsset with the target folder for every id', async () => {
    const { service, mediaService } = buildService();
    await service.bulkMove(['media-1', 'media-2'], 'folder-1', actor);
    expect(mediaService.moveMediaAsset).toHaveBeenCalledWith(
      'media-1',
      { folderId: 'folder-1' },
      actor
    );
    expect(mediaService.moveMediaAsset).toHaveBeenCalledWith(
      'media-2',
      { folderId: 'folder-1' },
      actor
    );
  });

  it('bulkArchive sets status ARCHIVED via updateMediaAsset', async () => {
    const { service, mediaService } = buildService();
    await service.bulkArchive(['media-1'], actor);
    expect(mediaService.updateMediaAsset).toHaveBeenCalledWith(
      'media-1',
      { status: MediaStatus.ARCHIVED },
      actor
    );
  });

  describe('permanentDelete', () => {
    it('rejects without confirm: true', async () => {
      const { service } = buildService();
      await expect(service.permanentDelete('media-1', false, actor)).rejects.toThrow(
        MediaValidationException
      );
    });

    it('throws MediaAssetNotFoundException when the asset does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.permanentDelete('missing', true, actor)).rejects.toThrow(
        MediaAssetNotFoundException
      );
    });

    it('rejects purging an asset that is not already soft-deleted ("Trash, then Purge")', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset({ deletedAt: null }));
      await expect(service.permanentDelete('media-1', true, actor)).rejects.toThrow(
        MediaAssetNotDeletedException
      );
    });

    it('rejects when the asset is still in use', async () => {
      const { service, repository, mediaService } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      (mediaService.getUsagesIncludingDeleted as jest.Mock).mockResolvedValue([
        { source: 'Page.body', id: 'page-1', label: 'Home' },
      ]);
      await expect(service.permanentDelete('media-1', true, actor)).rejects.toThrow(
        MediaAssetInUseException
      );
    });

    it('deletes the original and every variant object, then hard-deletes the row', async () => {
      const { service, repository, storage } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());

      await service.permanentDelete('media-1', true, actor);

      expect(storage.delete).toHaveBeenCalledWith('uploads/media-1/photo.png');
      expect(storage.delete).toHaveBeenCalledWith('media-variants/media-1/thumbnail.jpg');
      expect(storage.delete).toHaveBeenCalledWith('media-variants/media-1/webp.webp');
      expect(repository.hardDelete).toHaveBeenCalledWith('media-1');
    });
  });
});
