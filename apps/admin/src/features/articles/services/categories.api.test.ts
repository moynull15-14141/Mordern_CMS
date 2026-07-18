import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { categoriesApi } from './categories.api';

vi.mock('@/lib/api-client', () => ({ api: { get: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('categoriesApi', () => {
  it('listFlat() calls api.get with /categories/flat', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await categoriesApi.listFlat();
    expect(api.get).toHaveBeenCalledWith('/categories/flat');
  });
});
