import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreatePatternFromEditor } from './use-create-pattern-from-editor';
import { patternsApi } from '../services/patterns.api';

vi.mock('../services/patterns.api', () => ({ patternsApi: { create: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  return {
    Wrapper: function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
    invalidateSpy,
  };
}

describe('useCreatePatternFromEditor', () => {
  it('calls patternsApi.create with the input and invalidates the pattern list', async () => {
    vi.mocked(patternsApi.create).mockResolvedValue({ id: 'pattern-1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useCreatePatternFromEditor(), { wrapper: Wrapper });

    const input = { name: 'Hero', body: { blocks: [{ id: 'a', type: 'paragraph', data: {} }] } };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patternsApi.create).toHaveBeenCalledWith(input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['patterns', 'list'] });
  });

  it('resolves with the created pattern so the caller can use its id', async () => {
    vi.mocked(patternsApi.create).mockResolvedValue({ id: 'pattern-2', name: 'X' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useCreatePatternFromEditor(), { wrapper: Wrapper });

    const created = await result.current.mutateAsync({ name: 'X', body: { blocks: [] } });
    expect(created).toEqual({ id: 'pattern-2', name: 'X' });
  });
});
