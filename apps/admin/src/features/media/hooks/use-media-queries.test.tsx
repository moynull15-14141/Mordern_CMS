import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useMediaList } from './use-media-list';
import { useMedia } from './use-media';
import { useMediaUsages } from './use-media-usages';
import { useMediaDuplicates } from './use-media-duplicates';
import { useMediaFolderTree } from './use-media-folder-tree';
import { mediaApi } from '../services/media.api';
import { mediaFoldersApi } from '../services/media-folders.api';

vi.mock('../services/media.api', () => ({
  mediaApi: { list: vi.fn(), get: vi.fn(), getUsages: vi.fn(), getDuplicates: vi.fn() },
}));
vi.mock('../services/media-folders.api', () => ({ mediaFoldersApi: { getTree: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useMediaList', () => {
  it('calls mediaApi.list with the given filters', async () => {
    vi.mocked(mediaApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 24, total: 0, hasNext: false, hasPrevious: false } },
    });
    const { result } = renderHook(() => useMediaList({ page: 1, limit: 24 }), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaApi.list).toHaveBeenCalledWith({ page: 1, limit: 24 });
  });
});

describe('useMedia', () => {
  it('calls mediaApi.get with the given id', async () => {
    vi.mocked(mediaApi.get).mockResolvedValue({ id: 'm1' } as never);
    const { result } = renderHook(() => useMedia('m1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaApi.get).toHaveBeenCalledWith('m1');
  });

  it('does not query when id is empty', () => {
    const { result } = renderHook(() => useMedia(''), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mediaApi.get).not.toHaveBeenCalled();
  });
});

describe('useMediaUsages', () => {
  it('calls mediaApi.getUsages with the given id', async () => {
    vi.mocked(mediaApi.getUsages).mockResolvedValue([]);
    const { result } = renderHook(() => useMediaUsages('m1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaApi.getUsages).toHaveBeenCalledWith('m1');
  });
});

describe('useMediaDuplicates', () => {
  it('calls mediaApi.getDuplicates with the given id', async () => {
    vi.mocked(mediaApi.getDuplicates).mockResolvedValue([]);
    const { result } = renderHook(() => useMediaDuplicates('m1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaApi.getDuplicates).toHaveBeenCalledWith('m1');
  });
});

describe('useMediaFolderTree', () => {
  it('calls mediaFoldersApi.getTree with no arguments', async () => {
    vi.mocked(mediaFoldersApi.getTree).mockResolvedValue([]);
    const { result } = renderHook(() => useMediaFolderTree(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaFoldersApi.getTree).toHaveBeenCalledWith();
  });
});
