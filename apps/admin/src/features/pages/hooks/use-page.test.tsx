import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { usePage } from './use-page';
import { pagesApi } from '../services/pages.api';

vi.mock('../services/pages.api', () => ({ pagesApi: { get: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('usePage', () => {
  it('calls pagesApi.get with the given id', async () => {
    vi.mocked(pagesApi.get).mockResolvedValue({ id: 'p1' } as never);
    const { result } = renderHook(() => usePage('p1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pagesApi.get).toHaveBeenCalledWith('p1');
  });

  it('does not query when id is empty', () => {
    const { result } = renderHook(() => usePage(''), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(pagesApi.get).not.toHaveBeenCalled();
  });
});
