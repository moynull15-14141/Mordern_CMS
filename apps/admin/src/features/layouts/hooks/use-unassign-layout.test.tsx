import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUnassignLayout } from './use-unassign-layout';
import { layoutAssignmentsApi } from '../services/layout-assignments.api';
import { toast } from '@/lib/toast';

vi.mock('../services/layout-assignments.api', () => ({
  layoutAssignmentsApi: { unassign: vi.fn() },
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

describe('useUnassignLayout', () => {
  it('calls layoutAssignmentsApi.unassign with the id and toasts success', async () => {
    vi.mocked(layoutAssignmentsApi.unassign).mockResolvedValue({ id: 'a1' } as never);
    const { result } = renderHook(() => useUnassignLayout(), { wrapper: wrapper() });

    result.current.mutate('a1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(layoutAssignmentsApi.unassign).toHaveBeenCalledWith('a1');
    expect(toast.success).toHaveBeenCalledWith('Layout unassigned.');
  });
});
