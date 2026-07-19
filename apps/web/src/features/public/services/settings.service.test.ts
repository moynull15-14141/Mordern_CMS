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

describe('getPublicSettings', () => {
  beforeEach(() => {
    // cache()-wrapped with no arguments — a fresh module instance per test
    // avoids one test's mocked response leaking into the next.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls GET /public/settings and returns the array as-is', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: [{ key: 'general.siteName', label: 'Site Name', value: 'SportingSpy' }],
      meta: {},
      errors: [],
    });

    const { getPublicSettings } = await import('./settings.service');
    const result = await getPublicSettings();

    expect(result).toEqual([{ key: 'general.siteName', label: 'Site Name', value: 'SportingSpy' }]);
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain('/public/settings');
  });
});
