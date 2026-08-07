import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useBulkArchiveMedia,
  useBulkDeleteMedia,
  useBulkMoveMedia,
  useBulkRestoreMedia,
  useBulkUnarchiveMedia,
  usePermanentDeleteMedia,
} from './use-bulk-media';
import { mediaBulkApi } from '../services/media-bulk.api';
import { toast } from '@/lib/toast';

vi.mock('../services/media-bulk.api', () => ({
  mediaBulkApi: {
    move: vi.fn(),
    archive: vi.fn(),
    unarchive: vi.fn(),
    restore: vi.fn(),
    remove: vi.fn(),
    permanentDelete: vi.fn(),
  },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

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

describe('useBulkMoveMedia', () => {
  it('calls mediaBulkApi.move and toasts success on a full success result', async () => {
    vi.mocked(mediaBulkApi.move).mockResolvedValue({ succeeded: ['m1', 'm2'], failed: [] });
    const { result } = renderHook(() => useBulkMoveMedia(), { wrapper: wrapper() });

    result.current.mutate({ ids: ['m1', 'm2'], folderId: 'folder-1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaBulkApi.move).toHaveBeenCalledWith(['m1', 'm2'], 'folder-1');
    expect(toast.success).toHaveBeenCalledWith('2 assets moved.');
  });

  it('toasts an error-flavored summary on partial success', async () => {
    vi.mocked(mediaBulkApi.move).mockResolvedValue({
      succeeded: ['m1'],
      failed: [{ id: 'm2', reason: 'still referenced' }],
    });
    const { result } = renderHook(() => useBulkMoveMedia(), { wrapper: wrapper() });

    result.current.mutate({ ids: ['m1', 'm2'] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('1 moved, 1 failed.');
  });
});

describe('bulk action hooks delegate to the matching service call', () => {
  it('useBulkArchiveMedia', async () => {
    vi.mocked(mediaBulkApi.archive).mockResolvedValue({ succeeded: ['m1'], failed: [] });
    const { result } = renderHook(() => useBulkArchiveMedia(), { wrapper: wrapper() });
    result.current.mutate(['m1']);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaBulkApi.archive).toHaveBeenCalledWith(['m1']);
  });

  it('useBulkUnarchiveMedia', async () => {
    vi.mocked(mediaBulkApi.unarchive).mockResolvedValue({ succeeded: ['m1'], failed: [] });
    const { result } = renderHook(() => useBulkUnarchiveMedia(), { wrapper: wrapper() });
    result.current.mutate(['m1']);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaBulkApi.unarchive).toHaveBeenCalledWith(['m1']);
  });

  it('useBulkRestoreMedia', async () => {
    vi.mocked(mediaBulkApi.restore).mockResolvedValue({ succeeded: ['m1'], failed: [] });
    const { result } = renderHook(() => useBulkRestoreMedia(), { wrapper: wrapper() });
    result.current.mutate(['m1']);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaBulkApi.restore).toHaveBeenCalledWith(['m1']);
  });

  it('useBulkDeleteMedia', async () => {
    vi.mocked(mediaBulkApi.remove).mockResolvedValue({ succeeded: ['m1'], failed: [] });
    const { result } = renderHook(() => useBulkDeleteMedia(), { wrapper: wrapper() });
    result.current.mutate(['m1']);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaBulkApi.remove).toHaveBeenCalledWith(['m1']);
  });
});

describe('usePermanentDeleteMedia', () => {
  it('calls mediaBulkApi.permanentDelete and toasts success', async () => {
    vi.mocked(mediaBulkApi.permanentDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => usePermanentDeleteMedia(), { wrapper: wrapper() });
    result.current.mutate('m1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mediaBulkApi.permanentDelete).toHaveBeenCalledWith('m1');
    expect(toast.success).toHaveBeenCalledWith('Permanently deleted.');
  });
});
