import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useAddFavorite,
  useFavoriteMediaList,
  usePinMedia,
  usePinnedMediaList,
  useRecentMediaList,
  useRecordMediaView,
  useRemoveFavorite,
  useUnpinMedia,
} from './use-media-engagement';
import { mediaFavoritesApi } from '../services/media-favorites.api';

vi.mock('../services/media-favorites.api', () => ({
  mediaFavoritesApi: {
    listFavorites: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    listRecent: vi.fn(),
    recordView: vi.fn(),
    listPinned: vi.fn(),
    pin: vi.fn(),
    unpin: vi.fn(),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useFavoriteMediaList / useRecentMediaList / usePinnedMediaList', () => {
  it('fetch from their respective real endpoints', async () => {
    vi.mocked(mediaFavoritesApi.listFavorites).mockResolvedValue([{ id: 'm1' } as never]);
    vi.mocked(mediaFavoritesApi.listRecent).mockResolvedValue([{ id: 'm2' } as never]);
    vi.mocked(mediaFavoritesApi.listPinned).mockResolvedValue([{ id: 'm3' } as never]);

    const favorites = renderHook(() => useFavoriteMediaList(), { wrapper: wrapper() });
    const recent = renderHook(() => useRecentMediaList(), { wrapper: wrapper() });
    const pinned = renderHook(() => usePinnedMediaList(), { wrapper: wrapper() });

    await waitFor(() => expect(favorites.result.current.data?.[0].id).toBe('m1'));
    await waitFor(() => expect(recent.result.current.data?.[0].id).toBe('m2'));
    await waitFor(() => expect(pinned.result.current.data?.[0].id).toBe('m3'));
  });
});

describe('favorite mutations', () => {
  it('useAddFavorite calls addFavorite', async () => {
    vi.mocked(mediaFavoritesApi.addFavorite).mockResolvedValue(undefined);
    const { result } = renderHook(() => useAddFavorite(), { wrapper: wrapper() });
    result.current.mutate('m1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaFavoritesApi.addFavorite).toHaveBeenCalledWith('m1');
  });

  it('useRemoveFavorite calls removeFavorite', async () => {
    vi.mocked(mediaFavoritesApi.removeFavorite).mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoveFavorite(), { wrapper: wrapper() });
    result.current.mutate('m1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaFavoritesApi.removeFavorite).toHaveBeenCalledWith('m1');
  });

  it('useRecordMediaView calls recordView', async () => {
    vi.mocked(mediaFavoritesApi.recordView).mockResolvedValue(undefined);
    const { result } = renderHook(() => useRecordMediaView(), { wrapper: wrapper() });
    result.current.mutate('m1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaFavoritesApi.recordView).toHaveBeenCalledWith('m1');
  });

  it('usePinMedia / useUnpinMedia call pin/unpin', async () => {
    vi.mocked(mediaFavoritesApi.pin).mockResolvedValue({ id: 'm1' } as never);
    vi.mocked(mediaFavoritesApi.unpin).mockResolvedValue({ id: 'm1' } as never);
    const pin = renderHook(() => usePinMedia(), { wrapper: wrapper() });
    pin.result.current.mutate('m1');
    await waitFor(() => expect(pin.result.current.isSuccess).toBe(true));
    expect(mediaFavoritesApi.pin).toHaveBeenCalledWith('m1');

    const unpin = renderHook(() => useUnpinMedia(), { wrapper: wrapper() });
    unpin.result.current.mutate('m1');
    await waitFor(() => expect(unpin.result.current.isSuccess).toBe(true));
    expect(mediaFavoritesApi.unpin).toHaveBeenCalledWith('m1');
  });
});
