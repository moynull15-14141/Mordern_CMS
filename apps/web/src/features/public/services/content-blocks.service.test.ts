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

describe('getReusableBlock', () => {
  beforeEach(() => {
    // Wrapped in React's `cache()`, keyed by the `id` argument — a fresh
    // module instance per test avoids one test's mocked response (and its
    // memoized result) leaking into the next, same reasoning
    // `theme.service.test.ts` documents for `getActiveTheme`.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the reusable block when the real endpoint responds successfully', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: { id: 'block-1', blockType: 'callout', data: { text: 'Subscribe!' } },
      meta: {},
      errors: [],
    });

    const { getReusableBlock } = await import('./content-blocks.service');
    const block = await getReusableBlock('block-1');
    expect(block).toMatchObject({ id: 'block-1', blockType: 'callout' });
  });

  it('returns null for a missing/deleted reference (404) instead of throwing', async () => {
    mockFetchOnce(404, {
      success: false,
      message: 'Reusable block "missing" was not found.',
      data: null,
      meta: {},
      errors: [{ code: 'BUSINESS_NOT_FOUND', message: 'Reusable block "missing" was not found.' }],
    });

    const { getReusableBlock } = await import('./content-blocks.service');
    const block = await getReusableBlock('missing');
    expect(block).toBeNull();
  });

  // `getReusableBlock`'s request-level dedup comes entirely from wrapping
  // it in React's `cache()` (see the doc comment on the export) — a
  // framework guarantee this codebase already trusts without
  // re-verifying per call site (`theme.service.test.ts`'s `getActiveTheme`
  // tests success/404 only, the same shape as above, and doesn't attempt
  // to assert on `cache()`'s internal memoization either). `cache()`'s
  // dedup is scoped to an active React render; invoking the function
  // directly in a plain Vitest test — outside any render — doesn't
  // reliably reproduce that scope, so asserting a specific fetch call
  // count here would test Vitest's environment, not this module's code.
});
