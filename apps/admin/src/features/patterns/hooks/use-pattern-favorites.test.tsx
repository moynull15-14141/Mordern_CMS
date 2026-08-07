import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useAddPatternFavorite,
  useFavoritePatterns,
  useRemovePatternFavorite,
} from './use-pattern-favorites';
import { patternsApi } from '../services/patterns.api';

vi.mock('../services/patterns.api', () => ({
  patternsApi: { listFavorites: vi.fn(), addFavorite: vi.fn(), removeFavorite: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  return {
    Wrapper: function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
    invalidateSpy,
  };
}

describe('useFavoritePatterns', () => {
  it('calls patternsApi.listFavorites', async () => {
    vi.mocked(patternsApi.listFavorites).mockResolvedValue([]);
    const { result } = renderHook(() => useFavoritePatterns(), { wrapper: wrapper().Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patternsApi.listFavorites).toHaveBeenCalled();
  });
});

describe('useAddPatternFavorite / useRemovePatternFavorite', () => {
  it('add calls patternsApi.addFavorite and invalidates the favorites list', async () => {
    vi.mocked(patternsApi.addFavorite).mockResolvedValue(undefined);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useAddPatternFavorite(), { wrapper: Wrapper });

    result.current.mutate('pattern-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patternsApi.addFavorite).toHaveBeenCalledWith('pattern-1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['patterns', 'favorites'] });
  });

  it('remove calls patternsApi.removeFavorite and invalidates the favorites list', async () => {
    vi.mocked(patternsApi.removeFavorite).mockResolvedValue(undefined);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useRemovePatternFavorite(), { wrapper: Wrapper });

    result.current.mutate('pattern-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patternsApi.removeFavorite).toHaveBeenCalledWith('pattern-1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['patterns', 'favorites'] });
  });
});
