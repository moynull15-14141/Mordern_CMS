import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreatePagePreviewToken } from './use-page-preview-token';
import { pagesApi } from '../services/pages.api';

vi.mock('../services/pages.api', () => ({ pagesApi: { createPreviewToken: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCreatePagePreviewToken', () => {
  it('calls pagesApi.createPreviewToken with id and resolves with the token', async () => {
    vi.mocked(pagesApi.createPreviewToken).mockResolvedValue({ token: 'signed-token' });
    const { result } = renderHook(() => useCreatePagePreviewToken(), { wrapper: wrapper() });

    result.current.mutate('p1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pagesApi.createPreviewToken).toHaveBeenCalledWith('p1');
    expect(result.current.data).toEqual({ token: 'signed-token' });
  });
});
