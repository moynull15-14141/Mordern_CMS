import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateTag } from './use-create-tag';
import { useUpdateTag } from './use-update-tag';
import { useDeleteTag } from './use-delete-tag';
import { useRestoreTag } from './use-restore-tag';
import { tagsApi } from '../services/tags.api';
import { toast } from '@/lib/toast';

vi.mock('../services/tags.api', () => ({
  tagsApi: { create: vi.fn(), update: vi.fn(), remove: vi.fn(), restore: vi.fn() },
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

describe('useCreateTag', () => {
  it('calls tagsApi.create with the input and toasts success', async () => {
    vi.mocked(tagsApi.create).mockResolvedValue({ id: 't1' } as never);
    const { result } = renderHook(() => useCreateTag(), { wrapper: wrapper() });

    result.current.mutate({ name: 'Breaking' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(tagsApi.create).toHaveBeenCalledWith({ name: 'Breaking' });
    expect(toast.success).toHaveBeenCalledWith('Tag created.');
  });
});

describe('useUpdateTag', () => {
  it('calls tagsApi.update with the id and input, and toasts success', async () => {
    vi.mocked(tagsApi.update).mockResolvedValue({ id: 't1' } as never);
    const { result } = renderHook(() => useUpdateTag('t1'), { wrapper: wrapper() });

    result.current.mutate({ name: 'New Name' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(tagsApi.update).toHaveBeenCalledWith('t1', { name: 'New Name' });
    expect(toast.success).toHaveBeenCalledWith('Tag updated.');
  });
});

describe('useDeleteTag', () => {
  it('calls tagsApi.remove with the id and toasts success', async () => {
    vi.mocked(tagsApi.remove).mockResolvedValue({ id: 't1' } as never);
    const { result } = renderHook(() => useDeleteTag(), { wrapper: wrapper() });

    result.current.mutate('t1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(tagsApi.remove).toHaveBeenCalledWith('t1');
    expect(toast.success).toHaveBeenCalledWith('Tag deleted.');
  });
});

describe('useRestoreTag', () => {
  it('calls tagsApi.restore with the id and toasts success', async () => {
    vi.mocked(tagsApi.restore).mockResolvedValue({ id: 't1' } as never);
    const { result } = renderHook(() => useRestoreTag(), { wrapper: wrapper() });

    result.current.mutate('t1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(tagsApi.restore).toHaveBeenCalledWith('t1');
    expect(toast.success).toHaveBeenCalledWith('Tag restored.');
  });
});
