import { MediaFavoritesService } from './media-favorites.service';
import { MediaAssetNotFoundException } from '../exceptions/media.exceptions';

function buildAsset(overrides: Record<string, unknown> = {}) {
  return { id: 'media-1', pinnedAt: null, ...overrides };
}

function buildService() {
  const engagementRepository = {
    addFavorite: jest.fn().mockResolvedValue(undefined),
    removeFavorite: jest.fn().mockResolvedValue(undefined),
    findFavoriteAssets: jest.fn().mockResolvedValue([]),
    recordView: jest.fn().mockResolvedValue(undefined),
    findRecentAssets: jest.fn().mockResolvedValue([]),
  };
  const repository = {
    findById: jest.fn(),
    update: jest.fn(),
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findPinned: jest.fn().mockResolvedValue([]),
  };
  const mapper = { toResponseDto: jest.fn((asset) => ({ id: asset.id })) };
  const urlResolver = { resolveUrls: jest.fn().mockResolvedValue({}) };
  const auditLogger = { record: jest.fn() };

  const service = new MediaFavoritesService(
    engagementRepository as never,
    repository as never,
    mapper as never,
    urlResolver as never,
    auditLogger as never
  );

  return { service, engagementRepository, repository, mapper, urlResolver, auditLogger };
}

const actor = { id: 'user-1' };

describe('MediaFavoritesService', () => {
  it('addFavorite throws when the asset does not exist', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(null);
    await expect(service.addFavorite('missing', actor)).rejects.toThrow(
      MediaAssetNotFoundException
    );
  });

  it('addFavorite records the favorite and an audit log entry', async () => {
    const { service, repository, engagementRepository, auditLogger } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(buildAsset());

    await service.addFavorite('media-1', actor);

    expect(engagementRepository.addFavorite).toHaveBeenCalledWith('user-1', 'media-1');
    expect(auditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'media.favorite_add', result: 'success' })
    );
  });

  it('removeFavorite delegates to the repository without requiring the asset to still exist', async () => {
    const { service, engagementRepository } = buildService();
    await service.removeFavorite('media-1', actor);
    expect(engagementRepository.removeFavorite).toHaveBeenCalledWith('user-1', 'media-1');
  });

  it('recordView upserts a bounded recent-view row', async () => {
    const { service, repository, engagementRepository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
    await service.recordView('media-1', actor);
    expect(engagementRepository.recordView).toHaveBeenCalledWith('user-1', 'media-1');
  });

  it('pin sets pinnedAt and unpin clears it', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
    (repository.update as jest.Mock).mockResolvedValue(
      buildAsset({ pinnedAt: new Date('2026-02-01') })
    );

    await service.pin('media-1', actor);
    expect(repository.update).toHaveBeenCalledWith(
      'media-1',
      expect.objectContaining({ pinnedAt: expect.any(Date), updatedBy: 'user-1' })
    );

    (repository.update as jest.Mock).mockResolvedValue(buildAsset({ pinnedAt: null }));
    await service.unpin('media-1', actor);
    expect(repository.update).toHaveBeenLastCalledWith(
      'media-1',
      expect.objectContaining({ pinnedAt: null, updatedBy: 'user-1' })
    );
  });

  it('listPinned reads the global/site-wide pinned assets, not per-user favorites', async () => {
    const { service, repository } = buildService();
    (repository.findPinned as jest.Mock).mockResolvedValue([buildAsset({ id: 'media-9' })]);
    const result = await service.listPinned();
    expect(repository.findPinned).toHaveBeenCalledWith('site-1');
    expect(result).toEqual([{ id: 'media-9' }]);
  });
});
