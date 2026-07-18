import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCategoryTree } from './use-category-tree';
import { useCategoryFlat } from './use-category-flat';
import { useCategory } from './use-category';
import { useCategoryDescendants } from './use-category-descendants';
import { useCategoryBreadcrumb } from './use-category-breadcrumb';
import { categoriesApi } from '../services/categories.api';

vi.mock('../services/categories.api', () => ({
  categoriesApi: { getTree: vi.fn(), getFlat: vi.fn(), get: vi.fn(), getDescendants: vi.fn(), getBreadcrumb: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCategoryTree', () => {
  it('calls categoriesApi.getTree with no arguments', async () => {
    vi.mocked(categoriesApi.getTree).mockResolvedValue([]);
    const { result } = renderHook(() => useCategoryTree(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.getTree).toHaveBeenCalledWith();
  });
});

describe('useCategoryFlat', () => {
  it('calls categoriesApi.getFlat with no arguments', async () => {
    vi.mocked(categoriesApi.getFlat).mockResolvedValue([]);
    const { result } = renderHook(() => useCategoryFlat(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.getFlat).toHaveBeenCalledWith();
  });
});

describe('useCategory', () => {
  it('calls categoriesApi.get with the given id', async () => {
    vi.mocked(categoriesApi.get).mockResolvedValue({ id: 'c1' } as never);
    const { result } = renderHook(() => useCategory('c1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.get).toHaveBeenCalledWith('c1');
  });

  it('does not query when id is empty', () => {
    const { result } = renderHook(() => useCategory(''), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(categoriesApi.get).not.toHaveBeenCalled();
  });
});

describe('useCategoryDescendants', () => {
  it('calls categoriesApi.getDescendants with the given id', async () => {
    vi.mocked(categoriesApi.getDescendants).mockResolvedValue([]);
    const { result } = renderHook(() => useCategoryDescendants('c1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.getDescendants).toHaveBeenCalledWith('c1');
  });
});

describe('useCategoryBreadcrumb', () => {
  it('calls categoriesApi.getBreadcrumb with the given id', async () => {
    vi.mocked(categoriesApi.getBreadcrumb).mockResolvedValue([]);
    const { result } = renderHook(() => useCategoryBreadcrumb('c1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.getBreadcrumb).toHaveBeenCalledWith('c1');
  });
});
