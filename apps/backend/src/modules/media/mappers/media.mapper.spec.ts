import { MediaAsset, MediaStatus, MediaType } from '@prisma/client';
import { MediaMapper } from './media.mapper';

function buildAsset(overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id: 'media-1',
    siteId: 'site-1',
    uploadedBy: 'user-1',
    type: MediaType.IMAGE,
    storageKey: 'uploads/2026/photo.png',
    mimeType: 'image/png',
    filesize: 1024n,
    width: 800,
    height: 600,
    duration: null,
    altText: null,
    caption: null,
    credit: null,
    metadata: null,
    status: MediaStatus.READY,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-02'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as MediaAsset;
}

describe('MediaMapper', () => {
  const mapper = new MediaMapper();

  it('maps a bare asset with no metadata, deriving filename from storageKey', () => {
    const result = mapper.toResponseDto(buildAsset(), []);
    expect(result.id).toBe('media-1');
    expect(result.filename).toBe('photo.png');
    expect(result.folderId).toBeNull();
    expect(result.usageCount).toBe(0);
    expect(result.filesize).toBe('1024');
  });

  it('uses metadata.filename when present, over the derived name', () => {
    const result = mapper.toResponseDto(
      buildAsset({ metadata: { filename: 'Custom Name.png' } }),
      []
    );
    expect(result.filename).toBe('Custom Name.png');
  });

  it('maps metadata.folderId when present', () => {
    const result = mapper.toResponseDto(buildAsset({ metadata: { folderId: 'folder-1' } }), []);
    expect(result.folderId).toBe('folder-1');
  });

  it('maps usages and usageCount', () => {
    const usages = [
      { source: 'Article.featuredMedia' as const, id: 'article-1', label: 'My Article' },
    ];
    const result = mapper.toResponseDto(buildAsset(), usages);
    expect(result.usageCount).toBe(1);
    expect(result.usages).toEqual(usages);
  });

  it('maps a deleted asset with a deletedAt timestamp', () => {
    const result = mapper.toResponseDto(buildAsset({ deletedAt: new Date('2026-03-01') }), []);
    expect(result.deletedAt).toBe('2026-03-01T00:00:00.000Z');
  });

  it('serializes a large BigInt filesize as a string without precision loss', () => {
    const result = mapper.toResponseDto(buildAsset({ filesize: 9007199254740993n }), []);
    expect(result.filesize).toBe('9007199254740993');
  });

  it('derives filename from a storageKey with no directory segments', () => {
    const result = mapper.toResponseDto(buildAsset({ storageKey: 'photo.png' }), []);
    expect(result.filename).toBe('photo.png');
  });
});
