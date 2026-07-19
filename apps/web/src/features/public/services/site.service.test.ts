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

describe('getCurrentSite', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls GET /public/site and returns the site as-is', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: { name: 'SportingSpy', locale: 'en', timezone: 'UTC', activeTheme: null },
      meta: {},
      errors: [],
    });

    const { getCurrentSite } = await import('./site.service');
    const result = await getCurrentSite();

    expect(result).toEqual({
      name: 'SportingSpy',
      locale: 'en',
      timezone: 'UTC',
      activeTheme: null,
    });
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain('/public/site');
  });
});
