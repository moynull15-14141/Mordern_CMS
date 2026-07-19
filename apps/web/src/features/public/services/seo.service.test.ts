import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: 'status',
      json: async () => body,
    })
  );
}

describe('getSeoForEntity', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls GET /public/seo/:entity/:slug with the given entity and slug', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: {
        title: 'About',
        description: null,
        keywords: [],
        canonicalUrl: null,
        openGraph: null,
        twitterCard: null,
        schemaJson: null,
        robots: null,
      },
      meta: {},
      errors: [],
    });

    const { getSeoForEntity } = await import('./seo.service');
    const result = await getSeoForEntity('page', 'about-us');

    expect(result.title).toBe('About');
    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/public/seo/page/about-us');
  });
});
