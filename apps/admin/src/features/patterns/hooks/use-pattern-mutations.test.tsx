import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useArchivePattern,
  useCreatePattern,
  useDeletePattern,
  useDuplicatePattern,
  useRestorePattern,
  useUnarchivePattern,
  useUpdatePattern,
} from './use-pattern-mutations';
import { patternsApi } from '../services/patterns.api';
import { toast } from '@/lib/toast';
import { ApiError } from '@/lib/api-error';

vi.mock('../services/patterns.api', () => ({
  patternsApi: {
    create: vi.fn(),
    update: vi.fn(),
    duplicate: vi.fn(),
    archive: vi.fn(),
    unarchive: vi.fn(),
    remove: vi.fn(),
    restore: vi.fn(),
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
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  return {
    Wrapper: function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
    invalidateSpy,
  };
}

describe('useCreatePattern', () => {
  it('calls patternsApi.create, invalidates the list, and toasts success', async () => {
    vi.mocked(patternsApi.create).mockResolvedValue({ id: 'pattern-1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useCreatePattern(), { wrapper: Wrapper });

    result.current.mutate({ name: 'Hero', body: { blocks: [] } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['patterns', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Pattern created.');
  });
});

describe('useUpdatePattern', () => {
  it('calls patternsApi.update with the bound id and invalidates detail+list', async () => {
    vi.mocked(patternsApi.update).mockResolvedValue({ id: 'pattern-1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useUpdatePattern('pattern-1'), { wrapper: Wrapper });

    result.current.mutate({ name: 'New name' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patternsApi.update).toHaveBeenCalledWith('pattern-1', { name: 'New name' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['patterns', 'detail', 'pattern-1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['patterns', 'list'] });
  });
});

describe('useDuplicatePattern', () => {
  it('calls patternsApi.duplicate and toasts success', async () => {
    vi.mocked(patternsApi.duplicate).mockResolvedValue({ id: 'pattern-2' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDuplicatePattern(), { wrapper: Wrapper });

    result.current.mutate('pattern-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patternsApi.duplicate).toHaveBeenCalledWith('pattern-1');
    expect(toast.success).toHaveBeenCalledWith('Pattern duplicated.');
  });

  it('toasts an error on failure', async () => {
    vi.mocked(patternsApi.duplicate).mockRejectedValue(
      new ApiError({ message: 'Could not duplicate.', code: 'INTERNAL', status: 500 })
    );
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDuplicatePattern(), { wrapper: Wrapper });

    result.current.mutate('pattern-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Could not duplicate this pattern.');
  });
});

describe('useArchivePattern / useUnarchivePattern', () => {
  it('archive calls patternsApi.archive and toasts success', async () => {
    vi.mocked(patternsApi.archive).mockResolvedValue({ id: 'pattern-1' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useArchivePattern(), { wrapper: Wrapper });

    result.current.mutate('pattern-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Pattern archived.');
  });

  it('unarchive calls patternsApi.unarchive and toasts success', async () => {
    vi.mocked(patternsApi.unarchive).mockResolvedValue({ id: 'pattern-1' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useUnarchivePattern(), { wrapper: Wrapper });

    result.current.mutate('pattern-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Pattern unarchived.');
  });
});

describe('useDeletePattern / useRestorePattern', () => {
  it('delete calls patternsApi.remove and toasts success', async () => {
    vi.mocked(patternsApi.remove).mockResolvedValue({ id: 'pattern-1' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDeletePattern(), { wrapper: Wrapper });

    result.current.mutate('pattern-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Pattern deleted.');
  });

  it('restore calls patternsApi.restore and toasts success', async () => {
    vi.mocked(patternsApi.restore).mockResolvedValue({ id: 'pattern-1' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useRestorePattern(), { wrapper: Wrapper });

    result.current.mutate('pattern-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Pattern restored.');
  });
});
