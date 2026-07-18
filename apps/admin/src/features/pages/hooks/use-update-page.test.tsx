import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdatePage } from './use-update-page';
import { pagesApi } from '../services/pages.api';
import { toast } from '@/lib/toast';

vi.mock('../services/pages.api', () => ({ pagesApi: { update: vi.fn() } }));
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

describe('useUpdatePage', () => {
  it('calls pagesApi.update with id and input, invalidates detail+list, and toasts success', async () => {
    vi.mocked(pagesApi.update).mockResolvedValue({ id: 'p1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useUpdatePage('p1'), { wrapper: Wrapper });

    const input = { title: 'New Title' };
    result.current.mutate(input as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pagesApi.update).toHaveBeenCalledWith('p1', input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['pages', 'detail', 'p1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['pages', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Page updated.');
  });
});
