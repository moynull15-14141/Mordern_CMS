import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeleteLayout } from './use-delete-layout';
import { layoutsApi } from '../services/layouts.api';
import { toast } from '@/lib/toast';

vi.mock('../services/layouts.api', () => ({ layoutsApi: { remove: vi.fn() } }));
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

describe('useDeleteLayout', () => {
  it('calls layoutsApi.remove with the id and toasts success', async () => {
    vi.mocked(layoutsApi.remove).mockResolvedValue({ id: 'l1' } as never);
    const { result } = renderHook(() => useDeleteLayout(), { wrapper: wrapper() });

    result.current.mutate('l1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(layoutsApi.remove).toHaveBeenCalledWith('l1');
    expect(toast.success).toHaveBeenCalledWith('Layout deleted.');
  });
});
