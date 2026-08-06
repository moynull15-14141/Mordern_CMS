import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateReusableBlockFromEditor } from './use-create-reusable-block-from-editor';
import { reusableBlocksApi } from '../api/reusable-blocks.api';

vi.mock('../api/reusable-blocks.api', () => ({ reusableBlocksApi: { create: vi.fn() } }));

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

describe('useCreateReusableBlockFromEditor', () => {
  it('calls reusableBlocksApi.create with the input and invalidates the picker query', async () => {
    vi.mocked(reusableBlocksApi.create).mockResolvedValue({ id: 'rb-1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useCreateReusableBlockFromEditor(), { wrapper: Wrapper });

    const input = { name: 'Newsletter callout', blockType: 'callout', data: { text: 'Hi' } };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reusableBlocksApi.create).toHaveBeenCalledWith(input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['block-editor', 'reusable-blocks'] });
  });

  it('resolves with the created block so the caller can use its id', async () => {
    vi.mocked(reusableBlocksApi.create).mockResolvedValue({ id: 'rb-2', name: 'X' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useCreateReusableBlockFromEditor(), { wrapper: Wrapper });

    const created = await result.current.mutateAsync({
      name: 'X',
      blockType: 'callout',
      data: {},
    });
    expect(created).toEqual({ id: 'rb-2', name: 'X' });
  });
});
