import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useAssignLayout } from './use-assign-layout';
import { layoutAssignmentsApi } from '../services/layout-assignments.api';
import { toast } from '@/lib/toast';

vi.mock('../services/layout-assignments.api', () => ({
  layoutAssignmentsApi: { assign: vi.fn() },
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

describe('useAssignLayout', () => {
  it('calls layoutAssignmentsApi.assign with the input, invalidates assignment lists, and toasts success', async () => {
    vi.mocked(layoutAssignmentsApi.assign).mockResolvedValue({ id: 'a1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useAssignLayout(), { wrapper: Wrapper });

    const input = { layoutId: 'l1', contentType: 'HOMEPAGE' as const };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(layoutAssignmentsApi.assign).toHaveBeenCalledWith(input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['layout-assignments', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Layout assigned.');
  });
});
