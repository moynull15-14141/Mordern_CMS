import { MediaVisibility } from '@prisma/client';
import { MediaUrlResolverService } from './media-url-resolver.service';

function buildResolver(options: { cdnUrl?: string } = {}) {
  const cdnUrl = 'cdnUrl' in options ? options.cdnUrl : 'https://cdn.example.com';
  const storage = {
    getSignedUrl: jest.fn().mockResolvedValue('https://signed.example.com/key?sig=abc'),
  };
  const config = {
    cdn: { url: cdnUrl, signedUrlTtlSeconds: 900 },
  };
  const resolver = new MediaUrlResolverService(storage as never, config as never);
  return { resolver, storage, config };
}

describe('MediaUrlResolverService', () => {
  it('joins CDN_URL directly for a PUBLIC asset (no signing)', async () => {
    const { resolver, storage } = buildResolver();
    const urls = await resolver.resolveUrls({
      storageKey: 'uploads/a.png',
      visibility: MediaVisibility.PUBLIC,
      variants: null,
    });
    expect(urls.original).toBe('https://cdn.example.com/uploads/a.png');
    expect(storage.getSignedUrl).not.toHaveBeenCalled();
  });

  it('strips a trailing slash from CDN_URL before joining', async () => {
    const { resolver } = buildResolver({ cdnUrl: 'https://cdn.example.com/' });
    const urls = await resolver.resolveUrls({
      storageKey: 'uploads/a.png',
      visibility: MediaVisibility.PUBLIC,
      variants: null,
    });
    expect(urls.original).toBe('https://cdn.example.com/uploads/a.png');
  });

  it('always signs a PRIVATE asset, ignoring CDN_URL', async () => {
    const { resolver, storage } = buildResolver();
    const urls = await resolver.resolveUrls({
      storageKey: 'uploads/a.png',
      visibility: MediaVisibility.PRIVATE,
      variants: null,
    });
    expect(storage.getSignedUrl).toHaveBeenCalledWith('uploads/a.png', 900);
    expect(urls.original).toBe('https://signed.example.com/key?sig=abc');
  });

  it('falls back to a signed URL for a PUBLIC asset when no CDN_URL is configured', async () => {
    const { resolver, storage } = buildResolver({ cdnUrl: undefined });
    await resolver.resolveUrls({
      storageKey: 'uploads/a.png',
      visibility: MediaVisibility.PUBLIC,
      variants: null,
    });
    expect(storage.getSignedUrl).toHaveBeenCalledWith('uploads/a.png', 900);
  });

  it('omits original when includeOriginal is false', async () => {
    const { resolver } = buildResolver();
    const urls = await resolver.resolveUrls(
      { storageKey: 'uploads/a.png', visibility: MediaVisibility.PUBLIC, variants: null },
      { includeOriginal: false }
    );
    expect(urls.original).toBeUndefined();
  });

  it('resolves every present variant key', async () => {
    const { resolver } = buildResolver();
    const urls = await resolver.resolveUrls({
      storageKey: 'uploads/a.png',
      visibility: MediaVisibility.PUBLIC,
      variants: {
        thumbnail: { storageKey: 'media-variants/a/thumbnail.jpg' },
        webp: { storageKey: 'media-variants/a/webp.webp' },
      },
    });
    expect(urls.thumbnail).toBe('https://cdn.example.com/media-variants/a/thumbnail.jpg');
    expect(urls.webp).toBe('https://cdn.example.com/media-variants/a/webp.webp');
    expect(urls.small).toBeUndefined();
  });

  it('resolveSignedUrl always signs regardless of visibility', async () => {
    const { resolver, storage } = buildResolver();
    const url = await resolver.resolveSignedUrl('uploads/a.png');
    expect(storage.getSignedUrl).toHaveBeenCalledWith('uploads/a.png', 900);
    expect(url).toBe('https://signed.example.com/key?sig=abc');
  });
});
