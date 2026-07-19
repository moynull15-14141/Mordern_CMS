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

describe('getActiveTheme', () => {
  beforeEach(() => {
    // `getActiveTheme` is wrapped in React's `cache()`, which memoizes by
    // arguments (none, here) — a fresh module instance per test avoids one
    // test's mocked response leaking into the next via that memoization.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the theme when the real endpoint responds successfully', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: { id: '1', name: 'Default', slug: 'default' },
      meta: {},
      errors: [],
    });

    const { getActiveTheme } = await import('./theme.service');
    const theme = await getActiveTheme();
    expect(theme).toMatchObject({ id: '1', slug: 'default' });
  });

  it('returns null when the backend has no active theme (404)', async () => {
    mockFetchOnce(404, {
      success: false,
      message: 'No active theme is set for this site.',
      data: null,
      meta: {},
      errors: [{ code: 'NOT_FOUND', message: 'No active theme is set for this site.' }],
    });

    const { getActiveTheme } = await import('./theme.service');
    const theme = await getActiveTheme();
    expect(theme).toBeNull();
  });
});
