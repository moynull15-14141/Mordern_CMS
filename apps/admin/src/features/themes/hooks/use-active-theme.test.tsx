import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useActiveTheme } from './use-active-theme';
import { themesApi } from '../services/themes.api';

vi.mock('../services/themes.api', () => ({ themesApi: { getActive: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useActiveTheme', () => {
  it('calls themesApi.getActive with no arguments', async () => {
    vi.mocked(themesApi.getActive).mockResolvedValue({ id: 't1', isActive: true } as never);
    const { result } = renderHook(() => useActiveTheme(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(themesApi.getActive).toHaveBeenCalledWith();
  });

  it('surfaces a not-found error without retrying', async () => {
    vi.mocked(themesApi.getActive).mockRejectedValue(new Error('not found'));
    const { result } = renderHook(() => useActiveTheme(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(themesApi.getActive).toHaveBeenCalledTimes(1);
  });
});
