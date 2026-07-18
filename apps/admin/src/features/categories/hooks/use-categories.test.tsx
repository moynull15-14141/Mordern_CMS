import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCategories } from './use-categories';
import { categoriesApi } from '../services/categories.api';

vi.mock('../services/categories.api', () => ({ categoriesApi: { list: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCategories', () => {
  it('calls categoriesApi.list with the given filters', async () => {
    vi.mocked(categoriesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const { result } = renderHook(() => useCategories({ page: 1, limit: 20 }), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.list).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });
});
