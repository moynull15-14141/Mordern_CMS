import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLayout } from './use-layout';
import { layoutsApi } from '../services/layouts.api';

vi.mock('../services/layouts.api', () => ({ layoutsApi: { get: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useLayout', () => {
  it('calls layoutsApi.get with the given id', async () => {
    vi.mocked(layoutsApi.get).mockResolvedValue({ id: 'l1' } as never);
    const { result } = renderHook(() => useLayout('l1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(layoutsApi.get).toHaveBeenCalledWith('l1');
  });

  it('is disabled when id is empty', () => {
    const { result } = renderHook(() => useLayout(''), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(layoutsApi.get).not.toHaveBeenCalled();
  });
});
