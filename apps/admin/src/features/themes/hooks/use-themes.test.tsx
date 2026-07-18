import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useThemes } from './use-themes';
import { themesApi } from '../services/themes.api';

vi.mock('../services/themes.api', () => ({ themesApi: { list: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useThemes', () => {
  it('calls themesApi.list with the given filters', async () => {
    vi.mocked(themesApi.list).mockResolvedValue({ data: [], meta: {} } as never);
    const filters = { page: 1, limit: 20 };
    const { result } = renderHook(() => useThemes(filters), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(themesApi.list).toHaveBeenCalledWith(filters);
  });
});
