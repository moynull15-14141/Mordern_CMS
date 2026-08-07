import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { usePattern, usePatterns, usePatternUsages } from './use-patterns';
import { patternsApi } from '../services/patterns.api';

vi.mock('../services/patterns.api', () => ({
  patternsApi: { list: vi.fn(), get: vi.fn(), getUsages: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('usePatterns', () => {
  it('calls patternsApi.list with the given filters', async () => {
    vi.mocked(patternsApi.list).mockResolvedValue({ data: [], meta: {} } as never);
    const filters = { page: 1, limit: 20, search: 'hero' };
    const { result } = renderHook(() => usePatterns(filters), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patternsApi.list).toHaveBeenCalledWith(filters);
  });
});

describe('usePattern', () => {
  it('calls patternsApi.get with the id and is disabled for an empty id', async () => {
    vi.mocked(patternsApi.get).mockResolvedValue({ id: 'pattern-1' } as never);
    const { result } = renderHook(() => usePattern('pattern-1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patternsApi.get).toHaveBeenCalledWith('pattern-1');

    const disabled = renderHook(() => usePattern(''), { wrapper: wrapper() });
    expect(disabled.result.current.fetchStatus).toBe('idle');
  });
});

describe('usePatternUsages', () => {
  it('calls patternsApi.getUsages with the id', async () => {
    vi.mocked(patternsApi.getUsages).mockResolvedValue([]);
    const { result } = renderHook(() => usePatternUsages('pattern-1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patternsApi.getUsages).toHaveBeenCalledWith('pattern-1');
  });
});
