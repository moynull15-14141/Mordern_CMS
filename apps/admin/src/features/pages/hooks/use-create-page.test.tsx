import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreatePage } from './use-create-page';
import { pagesApi } from '../services/pages.api';
import { toast } from '@/lib/toast';

vi.mock('../services/pages.api', () => ({ pagesApi: { create: vi.fn() } }));
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

describe('useCreatePage', () => {
  it('calls pagesApi.create with the input, invalidates the list, and toasts success', async () => {
    vi.mocked(pagesApi.create).mockResolvedValue({ id: 'p1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useCreatePage(), { wrapper: Wrapper });

    const input = { title: 'About Us', body: { text: 'x' } };
    result.current.mutate(input as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pagesApi.create).toHaveBeenCalledWith(input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['pages', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Page created.');
  });
});
