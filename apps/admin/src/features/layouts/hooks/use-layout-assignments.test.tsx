import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLayoutAssignments } from './use-layout-assignments';
import { layoutAssignmentsApi } from '../services/layout-assignments.api';

vi.mock('../services/layout-assignments.api', () => ({ layoutAssignmentsApi: { list: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useLayoutAssignments', () => {
  it('calls layoutAssignmentsApi.list with the given contentType', async () => {
    vi.mocked(layoutAssignmentsApi.list).mockResolvedValue([]);
    const { result } = renderHook(() => useLayoutAssignments('PAGE'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(layoutAssignmentsApi.list).toHaveBeenCalledWith('PAGE');
  });

  it('calls layoutAssignmentsApi.list with undefined when no contentType is given', async () => {
    vi.mocked(layoutAssignmentsApi.list).mockResolvedValue([]);
    const { result } = renderHook(() => useLayoutAssignments(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(layoutAssignmentsApi.list).toHaveBeenCalledWith(undefined);
  });
});
