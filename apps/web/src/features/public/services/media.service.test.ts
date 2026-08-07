import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function mockFetchOnce(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'status',
    json: async () => body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('getMedia', () => {
  beforeEach(() => {
    // Wrapped in React's `cache()`, keyed by the `id` argument — a fresh
    // module instance per test avoids one test's mocked response (and its
    // memoized result) leaking into the next, same reasoning
    // `content-blocks.service.test.ts` documents for `getReusableBlock`.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the media asset when the real endpoint responds successfully', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: {
        id: 'media-1',
        type: 'IMAGE',
        urls: { original: 'https://cdn.example.com/photo.png' },
        altText: 'A cat',
        caption: null,
        width: 800,
        height: 600,
        duration: null,
        blurPlaceholder: 'data:image/jpeg;base64,abc',
        dominantColor: '#c83c28',
      },
      meta: {},
      errors: [],
    });

    const { getMedia } = await import('./media.service');
    const media = await getMedia('media-1');
    expect(media).toMatchObject({ id: 'media-1', type: 'IMAGE', altText: 'A cat' });
  });

  it('returns null for a missing/private/non-READY asset (404) instead of throwing', async () => {
    mockFetchOnce(404, {
      success: false,
      message: 'Media asset "missing" was not found.',
      data: null,
      meta: {},
      errors: [{ code: 'BUSINESS_NOT_FOUND', message: 'Media asset "missing" was not found.' }],
    });

    const { getMedia } = await import('./media.service');
    const media = await getMedia('missing');
    expect(media).toBeNull();
  });
});
