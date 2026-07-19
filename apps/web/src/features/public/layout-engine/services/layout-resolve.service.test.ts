import { afterEach, describe, expect, it, vi } from 'vitest';
import { getLayoutResolution } from './layout-resolve.service';

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

describe('getLayoutResolution', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the real envelope data for contentType "home"', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: { explicitLayoutPreset: 'full-width', contentDefaultLayoutPreset: null },
      meta: {},
      errors: [],
    });

    // Distinct args (not used by any other test) — `cache()`-keyed on
    // primitives, so a distinct (contentType, slug) pair avoids collision
    // with any other call to this same memoized function within the suite.
    const result = await getLayoutResolution('home', undefined);
    expect(result).toEqual({
      explicitLayoutPreset: 'full-width',
      contentDefaultLayoutPreset: null,
    });
  });

  it('calls the real /public/layouts/resolve endpoint with contentType and slug as query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'ok',
      json: async () => ({
        success: true,
        message: 'ok',
        data: { explicitLayoutPreset: null, contentDefaultLayoutPreset: null },
        meta: {},
        errors: [],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await getLayoutResolution('page', 'unique-slug-for-query-param-test');

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/public/layouts/resolve?');
    expect(calledUrl).toContain('contentType=page');
    expect(calledUrl).toContain('slug=unique-slug-for-query-param-test');
  });

  it('propagates a genuine error (e.g. missing slug -> 400) rather than swallowing it', async () => {
    mockFetchOnce(400, {
      success: false,
      message: '"slug" is required when contentType is "category".',
      data: null,
      meta: {},
      errors: [
        {
          code: 'VALIDATION_INVALID_INPUT',
          message: '"slug" is required when contentType is "category".',
        },
      ],
    });

    await expect(getLayoutResolution('category', 'unique-slug-for-error-test')).rejects.toThrow();
  });
});
