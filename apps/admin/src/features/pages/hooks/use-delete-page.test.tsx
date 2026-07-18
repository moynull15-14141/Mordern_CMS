import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeletePage } from './use-delete-page';
import { pagesApi } from '../services/pages.api';
import { toast } from '@/lib/toast';

vi.mock('../services/pages.api', () => ({ pagesApi: { remove: vi.fn() } }));
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

describe('useDeletePage', () => {
  it('calls pagesApi.remove with id, invalidates detail+list, and toasts success', async () => {
    vi.mocked(pagesApi.remove).mockResolvedValue({ id: 'p1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useDeletePage(), { wrapper: Wrapper });

    result.current.mutate('p1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pagesApi.remove).toHaveBeenCalledWith('p1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['pages', 'detail', 'p1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['pages', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Page deleted.');
  });
});
