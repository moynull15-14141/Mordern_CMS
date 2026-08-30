import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRedirectForPath } from './redirects.service';

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

describe('getRedirectForPath', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the redirect when the real endpoint responds successfully', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: { destinationUrl: '/about', redirectType: 301 },
      meta: {},
      errors: [],
    });

    const result = await getRedirectForPath('/old-about');
    expect(result).toEqual({ destinationUrl: '/about', redirectType: 301 });
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain(
      '/public/redirects/lookup?path=%2Fold-about'
    );
  });

  it('returns null (not a throw) when no redirect exists (404)', async () => {
    mockFetchOnce(404, {
      success: false,
      message: 'No redirect exists for "/nothing".',
      data: null,
      meta: {},
      errors: [{ code: 'NOT_FOUND', message: 'No redirect exists for "/nothing".' }],
    });

    const result = await getRedirectForPath('/nothing');
    expect(result).toBeNull();
  });

  it('propagates a real network/5xx failure rather than swallowing it', async () => {
    mockFetchOnce(500, {
      success: false,
      message: 'Internal server error',
      data: null,
      meta: {},
      errors: [{ code: 'UNKNOWN_ERROR', message: 'Internal server error' }],
    });

    await expect(getRedirectForPath('/old-about')).rejects.toThrow();
  });
});
