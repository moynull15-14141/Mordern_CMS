import { MediaStatus, MediaType } from '@prisma/client';
import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { MediaRepository } from '../repositories/media.repository';
import { MediaFolderRepository } from '../repositories/media-folder.repository';
import { MediaValidator } from '../validators/media.validator';
import { MediaMapper } from '../mappers/media.mapper';
import {
  MediaAssetAlreadyDeletedException,
  MediaAssetInUseException,
  MediaAssetNotDeletedException,
  MediaAssetNotFoundException,
  MediaFolderNotFoundException,
  StorageKeyConflictException,
} from '../exceptions/media.exceptions';
import { MediaService } from './media.service';

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
    status: MediaStatus.READY,
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
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findById: jest.fn(),
    findByStorageKey: jest.fn().mockResolvedValue(null),
    findMany: jest.fn(),
    findPossibleDuplicates: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    countUserProfileUsage: jest.fn().mockResolvedValue(0),
    countAuthorProfileUsage: jest.fn().mockResolvedValue(0),
    countArticleFeaturedUsage: jest.fn().mockResolvedValue(0),
    countArticleMediaUsage: jest.fn().mockResolvedValue(0),
    findUserProfileUsers: jest.fn().mockResolvedValue([]),
    findAuthorProfileAuthors: jest.fn().mockResolvedValue([]),
    findFeaturedArticles: jest.fn().mockResolvedValue([]),
    findArticleMediaLinks: jest.fn().mockResolvedValue([]),
    findUserProfileUsersForAssets: jest.fn().mockResolvedValue(new Map()),
    findAuthorProfileAuthorsForAssets: jest.fn().mockResolvedValue(new Map()),
    findFeaturedArticlesForAssets: jest.fn().mockResolvedValue(new Map()),
    findArticleMediaLinksForAssets: jest.fn().mockResolvedValue(new Map()),
  } as unknown as MediaRepository;

  const folderRepository = {
    findById: jest.fn().mockResolvedValue({ id: 'folder-1' }),
  } as unknown as MediaFolderRepository;

  const validator = {
    assertStorageKeyShape: jest.fn(),
    assertMimeTypeMatchesType: jest.fn(),
    assertMimeTypeAllowed: jest.fn().mockResolvedValue(undefined),
    assertFilesizeWithinLimit: jest.fn().mockResolvedValue(undefined),
  } as unknown as MediaValidator;

  const authorizationService = {
    resolveEffectiveRoles: jest.fn().mockResolvedValue([SystemRole.SUPER_ADMIN]),
  } as unknown as AuthorizationService;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;

  const service = new MediaService(
    repository,
    folderRepository,
    validator,
    new MediaMapper(),
    authorizationService,
    auditLogger
  );

  return { service, repository, folderRepository, validator, authorizationService };
}

const actor = { id: 'user-1' };

describe('MediaService', () => {
  describe('createMediaAsset', () => {
    it('rejects when the given folder does not exist', async () => {
      const { service, folderRepository } = buildService();
      (folderRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.createMediaAsset(
          {
            type: MediaType.IMAGE,
            storageKey: 'k.png',
            mimeType: 'image/png',
            filesize: '1024',
            folderId: 'missing',
          } as never,
          actor
        )
      ).rejects.toThrow(MediaFolderNotFoundException);
    });

    it('rejects a duplicate storageKey', async () => {
      const { service, repository } = buildService();
      (repository.findByStorageKey as jest.Mock).mockResolvedValue(buildAsset());
      await expect(
        service.createMediaAsset(
          {
            type: MediaType.IMAGE,
            storageKey: 'k.png',
            mimeType: 'image/png',
            filesize: '1024',
          } as never,
          actor
        )
      ).rejects.toThrow(StorageKeyConflictException);
    });

    it('runs mime/filesize/storageKey validation before creating', async () => {
      const { service, repository, validator } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildAsset());
      await service.createMediaAsset(
        {
          type: MediaType.IMAGE,
          storageKey: 'k.png',
          mimeType: 'image/png',
          filesize: '1024',
        } as never,
        actor
      );
      expect(validator.assertStorageKeyShape).toHaveBeenCalledWith('k.png');
      expect(validator.assertMimeTypeMatchesType).toHaveBeenCalledWith(
        MediaType.IMAGE,
        'image/png'
      );
      expect(validator.assertMimeTypeAllowed).toHaveBeenCalledWith('image/png');
      expect(validator.assertFilesizeWithinLimit).toHaveBeenCalledWith(1024n);
    });

    it('creates with folderId/filename stored in metadata', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildAsset());
      await service.createMediaAsset(
        {
          type: MediaType.IMAGE,
          storageKey: 'k.png',
          mimeType: 'image/png',
          filesize: '1024',
          folderId: 'folder-1',
          filename: 'My Photo.png',
        } as never,
        actor
      );
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: { filename: 'My Photo.png', folderId: 'folder-1' } })
      );
    });
  });

  describe('getMediaAsset', () => {
    it('throws MediaAssetNotFoundException when missing', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getMediaAsset('missing')).rejects.toThrow(MediaAssetNotFoundException);
    });

    it('maps a found asset with computed usages', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      (repository.findFeaturedArticles as jest.Mock).mockResolvedValue([
        { id: 'article-1', title: 'Hello' },
      ]);
      const result = await service.getMediaAsset('media-1');
      expect(result.usageCount).toBe(1);
      expect(result.usages[0]).toEqual({
        source: 'Article.featuredMedia',
        id: 'article-1',
        label: 'Hello',
      });
    });
  });

  describe('listMediaAssets (stabilization patch — N+1 fix)', () => {
    it('issues exactly one batched usage-lookup call per source, not one per asset', async () => {
      const { service, repository } = buildService();
      const assets = [
        buildAsset({ id: 'media-1' }),
        buildAsset({ id: 'media-2' }),
        buildAsset({ id: 'media-3' }),
      ];
      (repository.findMany as jest.Mock).mockResolvedValue({ items: assets, total: 3 });

      const result = await service.listMediaAssets({
        filters: {},
        sortBy: 'createdAt' as never,
        sortOrder: 'desc' as never,
        page: 1,
        limit: 20,
      });

      expect(result.items).toHaveLength(3);
      expect(repository.findUserProfileUsersForAssets).toHaveBeenCalledTimes(1);
      expect(repository.findUserProfileUsersForAssets).toHaveBeenCalledWith([
        'media-1',
        'media-2',
        'media-3',
      ]);
      expect(repository.findAuthorProfileAuthorsForAssets).toHaveBeenCalledTimes(1);
      expect(repository.findFeaturedArticlesForAssets).toHaveBeenCalledTimes(1);
      expect(repository.findArticleMediaLinksForAssets).toHaveBeenCalledTimes(1);
      expect(repository.findUserProfileUsers).not.toHaveBeenCalled();
      expect(repository.findFeaturedArticles).not.toHaveBeenCalled();
    });
  });

  describe('updateMediaAsset', () => {
    it('denies update when the actor lacks manage access', async () => {
      const { service, repository, authorizationService } = buildService();
      (authorizationService.resolveEffectiveRoles as jest.Mock).mockResolvedValue([
        SystemRole.SUBSCRIBER,
      ]);
      (repository.findById as jest.Mock).mockResolvedValue(
        buildAsset({ uploadedBy: 'someone-else' })
      );
      await expect(
        service.updateMediaAsset('media-1', { altText: 'x' } as never, actor)
      ).rejects.toThrow();
    });

    it('updates when allowed', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      (repository.update as jest.Mock).mockResolvedValue(buildAsset({ altText: 'new alt' }));
      await service.updateMediaAsset('media-1', { altText: 'new alt' } as never, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'media-1',
        expect.objectContaining({ altText: 'new alt' })
      );
    });
  });

  describe('renameMediaAsset', () => {
    it('updates metadata.filename without touching storageKey', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      (repository.update as jest.Mock).mockResolvedValue(
        buildAsset({ metadata: { filename: 'New Name' } })
      );
      await service.renameMediaAsset('media-1', { filename: 'New Name' }, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'media-1',
        expect.objectContaining({ metadata: { filename: 'New Name' } })
      );
    });
  });

  describe('moveMediaAsset', () => {
    it('rejects moving to a non-existent folder', async () => {
      const { service, repository, folderRepository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      (folderRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.moveMediaAsset('media-1', { folderId: 'missing' }, actor)
      ).rejects.toThrow(MediaFolderNotFoundException);
    });

    it('moves to a valid folder, stored in metadata.folderId', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      (repository.update as jest.Mock).mockResolvedValue(
        buildAsset({ metadata: { folderId: 'folder-1' } })
      );
      await service.moveMediaAsset('media-1', { folderId: 'folder-1' }, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'media-1',
        expect.objectContaining({ metadata: { folderId: 'folder-1' } })
      );
    });

    it('moves to root when folderId is null', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(
        buildAsset({ metadata: { folderId: 'old-folder' } })
      );
      (repository.update as jest.Mock).mockResolvedValue(
        buildAsset({ metadata: { folderId: null } })
      );
      await service.moveMediaAsset('media-1', { folderId: null }, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'media-1',
        expect.objectContaining({ metadata: { folderId: null } })
      );
    });
  });

  describe('copyMetadata', () => {
    it('copies altText/caption/credit/filename from source onto target', async () => {
      const { service, repository } = buildService();
      const source = buildAsset({
        id: 'source-1',
        altText: 'Alt',
        caption: 'Cap',
        credit: 'Cred',
        metadata: { filename: 'Src.png' },
      });
      const target = buildAsset({ id: 'target-1' });
      (repository.findById as jest.Mock).mockImplementation((id: string) =>
        Promise.resolve(id === 'source-1' ? source : id === 'target-1' ? target : null)
      );
      (repository.update as jest.Mock).mockResolvedValue(
        buildAsset({ id: 'target-1', altText: 'Alt' })
      );
      await service.copyMetadata('source-1', { targetId: 'target-1' }, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'target-1',
        expect.objectContaining({ altText: 'Alt', caption: 'Cap', credit: 'Cred' })
      );
    });
  });

  describe('deleteMediaAsset', () => {
    it('rejects deleting an already-deleted asset', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset({ deletedAt: new Date() }));
      await expect(service.deleteMediaAsset('media-1', actor)).rejects.toThrow(
        MediaAssetAlreadyDeletedException
      );
    });

    it('rejects deleting an asset still referenced anywhere', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      (repository.findFeaturedArticles as jest.Mock).mockResolvedValue([
        { id: 'article-1', title: 'X' },
      ]);
      await expect(service.deleteMediaAsset('media-1', actor)).rejects.toThrow(
        MediaAssetInUseException
      );
    });

    it('soft-deletes when unused', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      await service.deleteMediaAsset('media-1', actor);
      expect(repository.softDelete).toHaveBeenCalledWith('media-1', 'user-1');
    });
  });

  describe('restoreMediaAsset', () => {
    it('rejects restoring a non-deleted asset', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      await expect(service.restoreMediaAsset('media-1', actor)).rejects.toThrow(
        MediaAssetNotDeletedException
      );
    });

    it('restores a deleted asset', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset({ deletedAt: new Date() }));
      await service.restoreMediaAsset('media-1', actor);
      expect(repository.restore).toHaveBeenCalledWith('media-1', 'user-1');
    });
  });

  describe('getUsages / findDuplicates', () => {
    it('getUsages returns every detected reference', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      (repository.findUserProfileUsers as jest.Mock).mockResolvedValue([
        { id: 'user-2', displayName: 'A', email: 'a@b.com' },
      ]);
      const usages = await service.getUsages('media-1');
      expect(usages).toEqual([{ source: 'User.profileImage', id: 'user-2', label: 'A' }]);
    });

    it('findDuplicates delegates to the repository heuristic', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
      (repository.findPossibleDuplicates as jest.Mock).mockResolvedValue([
        buildAsset({ id: 'media-2' }),
      ]);
      const duplicates = await service.findDuplicates('media-1');
      expect(duplicates).toHaveLength(1);
      expect(repository.findPossibleDuplicates).toHaveBeenCalledWith('image/png', 1024n, 'media-1');
    });
  });
});
