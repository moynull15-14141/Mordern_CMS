import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTheme } from './use-theme';
import { themesApi } from '../services/themes.api';

vi.mock('../services/themes.api', () => ({ themesApi: { get: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useTheme', () => {
  it('calls themesApi.get with the given id', async () => {
    vi.mocked(themesApi.get).mockResolvedValue({ id: 't1' } as never);
    const { result } = renderHook(() => useTheme('t1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(themesApi.get).toHaveBeenCalledWith('t1');
  });

  it('does not query when id is empty', () => {
    const { result } = renderHook(() => useTheme(''), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(themesApi.get).not.toHaveBeenCalled();
  });
});
