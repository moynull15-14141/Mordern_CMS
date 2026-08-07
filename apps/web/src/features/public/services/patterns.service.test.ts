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

describe('getPattern', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the pattern when the real endpoint responds successfully', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: { id: 'pattern-1', name: 'Hero', body: { blocks: [] } },
      meta: {},
      errors: [],
    });

    const { getPattern } = await import('./patterns.service');
    const pattern = await getPattern('pattern-1');
    expect(pattern).toMatchObject({ id: 'pattern-1', name: 'Hero' });
  });

  it('returns null for a missing/deleted pattern (404) instead of throwing', async () => {
    mockFetchOnce(404, {
      success: false,
      message: 'Pattern "missing" was not found.',
      data: null,
      meta: {},
      errors: [{ code: 'BUSINESS_NOT_FOUND', message: 'Pattern "missing" was not found.' }],
    });

    const { getPattern } = await import('./patterns.service');
    const pattern = await getPattern('missing');
    expect(pattern).toBeNull();
  });
});
