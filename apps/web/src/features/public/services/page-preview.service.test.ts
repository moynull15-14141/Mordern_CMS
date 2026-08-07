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

describe('getPageForPreview', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the page when the token resolves successfully', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: {
        title: 'About Us',
        slug: 'about-us',
        body: { blocks: [] },
        publishedAt: null,
        seo: null,
      },
      meta: {},
      errors: [],
    });

    const { getPageForPreview } = await import('./page-preview.service');
    const page = await getPageForPreview('a-valid-token');
    expect(page).toMatchObject({ title: 'About Us', slug: 'about-us' });
  });

  it('returns null for an expired/invalid token (401) instead of throwing', async () => {
    mockFetchOnce(401, {
      success: false,
      message: 'This preview link has expired or is invalid.',
      data: null,
      meta: {},
      errors: [{ code: 'UNAUTHORIZED', message: 'This preview link has expired or is invalid.' }],
    });

    const { getPageForPreview } = await import('./page-preview.service');
    const page = await getPageForPreview('bad-token');
    expect(page).toBeNull();
  });

  it('returns null for a missing page (404) instead of throwing', async () => {
    mockFetchOnce(404, {
      success: false,
      message: 'Page "missing" was not found.',
      data: null,
      meta: {},
      errors: [{ code: 'BUSINESS_NOT_FOUND', message: 'Page "missing" was not found.' }],
    });

    const { getPageForPreview } = await import('./page-preview.service');
    const page = await getPageForPreview('token-for-deleted-page');
    expect(page).toBeNull();
  });
});
