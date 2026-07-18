import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateMedia } from './use-create-media';
import { useUpdateMedia } from './use-update-media';
import { useRenameMedia } from './use-rename-media';
import { useMoveMedia } from './use-move-media';
import { useDeleteMedia } from './use-delete-media';
import { useRestoreMedia } from './use-restore-media';
import { mediaApi } from '../services/media.api';
import { toast } from '@/lib/toast';

vi.mock('../services/media.api', () => ({
  mediaApi: { create: vi.fn(), update: vi.fn(), rename: vi.fn(), move: vi.fn(), remove: vi.fn(), restore: vi.fn() },
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

describe('useCreateMedia', () => {
  it('calls mediaApi.create with the input and signal', async () => {
    vi.mocked(mediaApi.create).mockResolvedValue({ id: 'm1' } as never);
    const { result } = renderHook(() => useCreateMedia(), { wrapper: wrapper() });
    const input = { type: 'IMAGE' as const, storageKey: 'a.jpg', mimeType: 'image/jpeg', filesize: '100' };
    const controller = new AbortController();

    result.current.mutate({ input, signal: controller.signal });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaApi.create).toHaveBeenCalledWith(input, controller.signal);
  });

  it('does not toast (per-item UI shows its own status)', async () => {
    vi.mocked(mediaApi.create).mockResolvedValue({ id: 'm1' } as never);
    const { result } = renderHook(() => useCreateMedia(), { wrapper: wrapper() });
    result.current.mutate({ input: { type: 'IMAGE', storageKey: 'a.jpg', mimeType: 'image/jpeg', filesize: '1' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).not.toHaveBeenCalled();
  });
});

describe('useUpdateMedia', () => {
  it('calls mediaApi.update with the id and input, and toasts success', async () => {
    vi.mocked(mediaApi.update).mockResolvedValue({ id: 'm1' } as never);
    const { result } = renderHook(() => useUpdateMedia('m1'), { wrapper: wrapper() });

    result.current.mutate({ altText: 'A photo' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaApi.update).toHaveBeenCalledWith('m1', { altText: 'A photo' });
    expect(toast.success).toHaveBeenCalledWith('Media updated.');
  });
});

describe('useRenameMedia', () => {
  it('calls mediaApi.rename with the id and input, and toasts success', async () => {
    vi.mocked(mediaApi.rename).mockResolvedValue({ id: 'm1' } as never);
    const { result } = renderHook(() => useRenameMedia('m1'), { wrapper: wrapper() });

    result.current.mutate({ filename: 'new.jpg' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaApi.rename).toHaveBeenCalledWith('m1', { filename: 'new.jpg' });
    expect(toast.success).toHaveBeenCalledWith('Media renamed.');
  });
});

describe('useMoveMedia', () => {
  it('calls mediaApi.move with the id and input, and toasts success', async () => {
    vi.mocked(mediaApi.move).mockResolvedValue({ id: 'm1' } as never);
    const { result } = renderHook(() => useMoveMedia('m1'), { wrapper: wrapper() });

    result.current.mutate({ folderId: 'f1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaApi.move).toHaveBeenCalledWith('m1', { folderId: 'f1' });
    expect(toast.success).toHaveBeenCalledWith('Media moved.');
  });
});

describe('useDeleteMedia', () => {
  it('calls mediaApi.remove with the id and toasts success', async () => {
    vi.mocked(mediaApi.remove).mockResolvedValue({ id: 'm1' } as never);
    const { result } = renderHook(() => useDeleteMedia(), { wrapper: wrapper() });

    result.current.mutate('m1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaApi.remove).toHaveBeenCalledWith('m1');
    expect(toast.success).toHaveBeenCalledWith('Media deleted.');
  });
});

describe('useRestoreMedia', () => {
  it('calls mediaApi.restore with the id and toasts success', async () => {
    vi.mocked(mediaApi.restore).mockResolvedValue({ id: 'm1' } as never);
    const { result } = renderHook(() => useRestoreMedia(), { wrapper: wrapper() });

    result.current.mutate('m1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaApi.restore).toHaveBeenCalledWith('m1');
    expect(toast.success).toHaveBeenCalledWith('Media restored.');
  });
});
