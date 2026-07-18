import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { usePages } from './use-pages';
import { pagesApi } from '../services/pages.api';

vi.mock('../services/pages.api', () => ({ pagesApi: { list: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('usePages', () => {
  it('calls pagesApi.list with the given filters', async () => {
    vi.mocked(pagesApi.list).mockResolvedValue({ data: [], meta: {} } as never);
    const filters = { page: 1, limit: 20 };
    const { result } = renderHook(() => usePages(filters), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pagesApi.list).toHaveBeenCalledWith(filters);
  });
});
