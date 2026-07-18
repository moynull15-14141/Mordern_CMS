import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCategoryChildren } from './use-category-children';
import { categoriesApi } from '../services/categories.api';

vi.mock('../services/categories.api', () => ({ categoriesApi: { getChildren: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCategoryChildren', () => {
  it('calls categoriesApi.getChildren with the given id', async () => {
    vi.mocked(categoriesApi.getChildren).mockResolvedValue([]);
    const { result } = renderHook(() => useCategoryChildren('c1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.getChildren).toHaveBeenCalledWith('c1');
  });
});
