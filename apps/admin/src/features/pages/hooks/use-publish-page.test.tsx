import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { usePublishPage } from './use-publish-page';
import { pagesApi } from '../services/pages.api';
import { toast } from '@/lib/toast';

vi.mock('../services/pages.api', () => ({ pagesApi: { publish: vi.fn() } }));
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

describe('usePublishPage', () => {
  it('calls pagesApi.publish with id, invalidates detail+list, and toasts success', async () => {
    vi.mocked(pagesApi.publish).mockResolvedValue({ id: 'p1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => usePublishPage(), { wrapper: Wrapper });

    result.current.mutate('p1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pagesApi.publish).toHaveBeenCalledWith('p1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['pages', 'detail', 'p1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['pages', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Page published.');
  });
});
