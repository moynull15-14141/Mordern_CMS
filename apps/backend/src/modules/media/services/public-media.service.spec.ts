import { MediaStatus, MediaType, MediaVisibility } from '@prisma/client';
import { PublicMediaService } from './public-media.service';
import { MediaAssetNotFoundException } from '../exceptions/media.exceptions';

function buildAsset(overrides: Record<string, unknown> = {}) {
  return {
    id: 'media-1',
    type: MediaType.IMAGE,
    status: MediaStatus.READY,
    visibility: MediaVisibility.PUBLIC,
    altText: 'A cat',
    caption: null,
    width: 800,
    height: 600,
    duration: null,
    blurPlaceholder: 'data:image/jpeg;base64,abc',
    dominantColor: '#c83c28',
    ...overrides,
  };
}

function buildService() {
  const repository = { findById: jest.fn() };
  const urlResolver = {
    resolveUrls: jest.fn().mockResolvedValue({ original: 'https://cdn.example.com/x' }),
  };
  const service = new PublicMediaService(repository as never, urlResolver as never);
  return { service, repository, urlResolver };
}

describe('PublicMediaService', () => {
  it('returns 404-mapped exception when the asset does not exist', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(null);
    await expect(service.getMedia('missing')).rejects.toThrow(MediaAssetNotFoundException);
  });

  it('returns 404-mapped exception for a PRIVATE asset (indistinguishable from not-found)', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(
      buildAsset({ visibility: MediaVisibility.PRIVATE })
    );
    await expect(service.getMedia('media-1')).rejects.toThrow(MediaAssetNotFoundException);
  });

  it('returns 404-mapped exception for a non-READY asset (still PROCESSING)', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(
      buildAsset({ status: MediaStatus.PROCESSING })
    );
    await expect(service.getMedia('media-1')).rejects.toThrow(MediaAssetNotFoundException);
  });

  it('resolves a rendering-only shape for a READY, PUBLIC asset', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(buildAsset());
    const result = await service.getMedia('media-1');
    expect(result).toEqual({
      id: 'media-1',
      type: MediaType.IMAGE,
      urls: { original: 'https://cdn.example.com/x' },
      altText: 'A cat',
      caption: null,
      width: 800,
      height: 600,
      duration: null,
      blurPlaceholder: 'data:image/jpeg;base64,abc',
      dominantColor: '#c83c28',
    });
  });
});
