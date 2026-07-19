import { afterEach, describe, expect, it, vi } from 'vitest';
import { publicFetch, publicFetchPaginated } from './public-fetch.service';
import { PublicApiError } from '../utils/errors';

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

describe('publicFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves the unwrapped data on success', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: { hello: 'world' },
      meta: {},
      errors: [],
    });
    await expect(publicFetch('/public/theme')).resolves.toEqual({ hello: 'world' });
  });

  it('throws PublicApiError with the response status on failure', async () => {
    mockFetchOnce(404, {
      success: false,
      message: 'not found',
      data: null,
      meta: {},
      errors: [{ code: 'NOT_FOUND', message: 'not found' }],
    });
    await expect(publicFetch('/public/theme')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });
});

describe('publicFetchPaginated', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves { data, pagination } from the envelope', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: [{ id: 1 }, { id: 2 }],
      meta: { pagination: { page: 1, limit: 20, total: 2, hasNext: false, hasPrevious: false } },
      errors: [],
    });

    const result = await publicFetchPaginated('/public/articles');
    expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      hasNext: false,
      hasPrevious: false,
    });
  });

  it('propagates a PublicApiError on failure, same as publicFetch', async () => {
    mockFetchOnce(500, { success: false, message: 'boom', data: null, meta: {}, errors: [] });
    await expect(publicFetchPaginated('/public/articles')).rejects.toBeInstanceOf(PublicApiError);
  });
});
