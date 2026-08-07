import { MediaAsset, MediaStatus, MediaType, MediaVisibility } from '@prisma/client';
import { MediaUrlsDto } from '../dto/media-response.dto';
import { MediaMapper } from './media.mapper';

function buildAsset(overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id: 'media-1',
    siteId: 'site-1',
    uploadedBy: 'user-1',
    folderId: null,
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
    visibility: MediaVisibility.PUBLIC,
    variants: null,
    blurPlaceholder: null,
    dominantColor: null,
    exif: null,
    pinnedAt: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-02'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as MediaAsset;
}

const noUrls: MediaUrlsDto = {};

describe('MediaMapper', () => {
  const mapper = new MediaMapper();

  it('maps a bare asset with no metadata, deriving filename from storageKey', () => {
    const result = mapper.toResponseDto(buildAsset(), [], noUrls);
    expect(result.id).toBe('media-1');
    expect(result.filename).toBe('photo.png');
    expect(result.folderId).toBeNull();
    expect(result.usageCount).toBe(0);
    expect(result.filesize).toBe('1024');
  });

  it('uses metadata.filename when present, over the derived name', () => {
    const result = mapper.toResponseDto(
      buildAsset({ metadata: { filename: 'Custom Name.png' } }),
      [],
      noUrls
    );
    expect(result.filename).toBe('Custom Name.png');
  });

  it('prefers the real folderId FK column over the legacy metadata.folderId', () => {
    const result = mapper.toResponseDto(
      buildAsset({ folderId: 'real-folder', metadata: { folderId: 'legacy-folder' } }),
      [],
      noUrls
    );
    expect(result.folderId).toBe('real-folder');
  });

  it('falls back to the legacy metadata.folderId when the real column is null', () => {
    const result = mapper.toResponseDto(
      buildAsset({ folderId: null, metadata: { folderId: 'legacy-folder' } }),
      [],
      noUrls
    );
    expect(result.folderId).toBe('legacy-folder');
  });

  it('maps usages and usageCount', () => {
    const usages = [
      { source: 'Article.featuredMedia' as const, id: 'article-1', label: 'My Article' },
    ];
    const result = mapper.toResponseDto(buildAsset(), usages, noUrls);
    expect(result.usageCount).toBe(1);
    expect(result.usages).toEqual(usages);
  });

  it('maps a deleted asset with a deletedAt timestamp', () => {
    const result = mapper.toResponseDto(
      buildAsset({ deletedAt: new Date('2026-03-01') }),
      [],
      noUrls
    );
    expect(result.deletedAt).toBe('2026-03-01T00:00:00.000Z');
  });

  it('serializes a large BigInt filesize as a string without precision loss', () => {
    const result = mapper.toResponseDto(buildAsset({ filesize: 9007199254740993n }), [], noUrls);
    expect(result.filesize).toBe('9007199254740993');
  });

  it('derives filename from a storageKey with no directory segments', () => {
    const result = mapper.toResponseDto(buildAsset({ storageKey: 'photo.png' }), [], noUrls);
    expect(result.filename).toBe('photo.png');
  });

  it('passes through the resolved urls object unchanged', () => {
    const urls: MediaUrlsDto = {
      original: 'https://cdn.example.com/photo.png',
      thumbnail: 'https://cdn.example.com/t.jpg',
    };
    const result = mapper.toResponseDto(buildAsset(), [], urls);
    expect(result.urls).toEqual(urls);
  });

  it('maps visibility, blurPlaceholder, dominantColor, and pinnedAt', () => {
    const result = mapper.toResponseDto(
      buildAsset({
        visibility: MediaVisibility.PRIVATE,
        blurPlaceholder: 'data:image/jpeg;base64,abc',
        dominantColor: '#c83c28',
        pinnedAt: new Date('2026-02-01'),
      }),
      [],
      noUrls
    );
    expect(result.visibility).toBe(MediaVisibility.PRIVATE);
    expect(result.blurPlaceholder).toBe('data:image/jpeg;base64,abc');
    expect(result.dominantColor).toBe('#c83c28');
    expect(result.pinnedAt).toBe('2026-02-01T00:00:00.000Z');
  });
});
