import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { mediaFoldersApi } from './media-folders.api';

vi.mock('@/lib/api-client', () => ({ api: { get: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('mediaFoldersApi', () => {
  it('getTree() calls api.get with /media-folders/tree', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await mediaFoldersApi.getTree();
    expect(api.get).toHaveBeenCalledWith('/media-folders/tree');
  });
});
