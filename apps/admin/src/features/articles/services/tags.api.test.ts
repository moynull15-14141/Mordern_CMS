import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { tagsApi } from './tags.api';

vi.mock('@/lib/api-client', () => ({ api: { getPaginated: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('tagsApi', () => {
  it('list() calls api.getPaginated with /tags and a search/page/limit params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await tagsApi.list('news');
    expect(api.getPaginated).toHaveBeenCalledWith('/tags', { params: { search: 'news', page: 1, limit: 100 } });
  });
});
