import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLayouts } from './use-layouts';
import { layoutsApi } from '../services/layouts.api';

vi.mock('../services/layouts.api', () => ({ layoutsApi: { list: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useLayouts', () => {
  it('calls layoutsApi.list with the given filters', async () => {
    vi.mocked(layoutsApi.list).mockResolvedValue({ data: [], meta: {} } as never);
    const filters = { page: 1, limit: 20 };
    const { result } = renderHook(() => useLayouts(filters), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(layoutsApi.list).toHaveBeenCalledWith(filters);
  });
});
