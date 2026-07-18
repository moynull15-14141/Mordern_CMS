import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateCategory } from './use-create-category';
import { useUpdateCategory } from './use-update-category';
import { useMoveCategory } from './use-move-category';
import { useDeleteCategory } from './use-delete-category';
import { useRestoreCategory } from './use-restore-category';
import { categoriesApi } from '../services/categories.api';
import { toast } from '@/lib/toast';

vi.mock('../services/categories.api', () => ({
  categoriesApi: { create: vi.fn(), update: vi.fn(), move: vi.fn(), remove: vi.fn(), restore: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCreateCategory', () => {
  it('calls categoriesApi.create with the input and toasts success', async () => {
    vi.mocked(categoriesApi.create).mockResolvedValue({ id: 'c1' } as never);
    const { result } = renderHook(() => useCreateCategory(), { wrapper: wrapper() });

    result.current.mutate({ name: 'News' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.create).toHaveBeenCalledWith({ name: 'News' });
    expect(toast.success).toHaveBeenCalledWith('Category created.');
  });
});

describe('useUpdateCategory', () => {
  it('calls categoriesApi.update with the id and input, and toasts success', async () => {
    vi.mocked(categoriesApi.update).mockResolvedValue({ id: 'c1' } as never);
    const { result } = renderHook(() => useUpdateCategory('c1'), { wrapper: wrapper() });

    result.current.mutate({ name: 'New Name' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.update).toHaveBeenCalledWith('c1', { name: 'New Name' });
    expect(toast.success).toHaveBeenCalledWith('Category updated.');
  });
});

describe('useMoveCategory', () => {
  it('calls categoriesApi.move with the id and input, and toasts success', async () => {
    vi.mocked(categoriesApi.move).mockResolvedValue({ id: 'c1' } as never);
    const { result } = renderHook(() => useMoveCategory(), { wrapper: wrapper() });

    result.current.mutate({ id: 'c1', input: { parentId: 'c2' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.move).toHaveBeenCalledWith('c1', { parentId: 'c2' });
    expect(toast.success).toHaveBeenCalledWith('Category moved.');
  });
});

describe('useDeleteCategory', () => {
  it('calls categoriesApi.remove with the id and toasts success', async () => {
    vi.mocked(categoriesApi.remove).mockResolvedValue({ id: 'c1' } as never);
    const { result } = renderHook(() => useDeleteCategory(), { wrapper: wrapper() });

    result.current.mutate('c1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.remove).toHaveBeenCalledWith('c1');
    expect(toast.success).toHaveBeenCalledWith('Category deleted.');
  });
});

describe('useRestoreCategory', () => {
  it('calls categoriesApi.restore with the id and toasts success', async () => {
    vi.mocked(categoriesApi.restore).mockResolvedValue({ id: 'c1' } as never);
    const { result } = renderHook(() => useRestoreCategory(), { wrapper: wrapper() });

    result.current.mutate('c1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.restore).toHaveBeenCalledWith('c1');
    expect(toast.success).toHaveBeenCalledWith('Category restored.');
  });
});
