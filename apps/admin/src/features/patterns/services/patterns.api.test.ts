import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { patternsApi } from './patterns.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('patternsApi', () => {
  it('list() calls api.getPaginated with the root path and filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await patternsApi.list({ page: 1, limit: 20, search: 'hero' });
    expect(api.getPaginated).toHaveBeenCalledWith('/patterns', {
      params: { page: 1, limit: 20, search: 'hero' },
    });
  });

  it('get() calls api.get with /patterns/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await patternsApi.get('pattern-1');
    expect(api.get).toHaveBeenCalledWith('/patterns/pattern-1');
  });

  it('create() calls api.post with the root path and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { name: 'Hero', body: { blocks: [] } };
    await patternsApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/patterns', input);
  });

  it('update() calls api.patch with /patterns/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { name: 'New name' };
    await patternsApi.update('pattern-1', input);
    expect(api.patch).toHaveBeenCalledWith('/patterns/pattern-1', input);
  });

  it('duplicate() calls api.post with /patterns/:id/duplicate — a real endpoint, unlike reusableBlocksApi.duplicate', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await patternsApi.duplicate('pattern-1');
    expect(api.post).toHaveBeenCalledWith('/patterns/pattern-1/duplicate');
  });

  it('archive() calls api.post with /patterns/:id/archive', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await patternsApi.archive('pattern-1');
    expect(api.post).toHaveBeenCalledWith('/patterns/pattern-1/archive');
  });

  it('unarchive() calls api.post with /patterns/:id/unarchive', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await patternsApi.unarchive('pattern-1');
    expect(api.post).toHaveBeenCalledWith('/patterns/pattern-1/unarchive');
  });

  it('remove() calls api.delete with /patterns/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await patternsApi.remove('pattern-1');
    expect(api.delete).toHaveBeenCalledWith('/patterns/pattern-1');
  });

  it('restore() calls api.post with /patterns/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await patternsApi.restore('pattern-1');
    expect(api.post).toHaveBeenCalledWith('/patterns/pattern-1/restore');
  });

  it('getUsages() calls api.get with /patterns/:id/usages', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await patternsApi.getUsages('pattern-1');
    expect(api.get).toHaveBeenCalledWith('/patterns/pattern-1/usages');
  });

  it('listFavorites() calls api.get with /patterns/favorites', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await patternsApi.listFavorites();
    expect(api.get).toHaveBeenCalledWith('/patterns/favorites');
  });

  it('addFavorite() calls api.post with /patterns/:id/favorite', async () => {
    vi.mocked(api.post).mockResolvedValue(undefined);
    await patternsApi.addFavorite('pattern-1');
    expect(api.post).toHaveBeenCalledWith('/patterns/pattern-1/favorite');
  });

  it('removeFavorite() calls api.delete with /patterns/:id/favorite', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined);
    await patternsApi.removeFavorite('pattern-1');
    expect(api.delete).toHaveBeenCalledWith('/patterns/pattern-1/favorite');
  });
});
