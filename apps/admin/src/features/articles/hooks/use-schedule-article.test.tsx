import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useScheduleArticle } from './use-schedule-article';
import { articlesApi } from '../services/articles.api';
import { toast } from '@/lib/toast';

vi.mock('../services/articles.api', () => ({ articlesApi: { schedule: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useScheduleArticle', () => {
  it('calls articlesApi.schedule with the id and input, and toasts success', async () => {
    vi.mocked(articlesApi.schedule).mockResolvedValue({ id: 'a1' } as never);
    const { result } = renderHook(() => useScheduleArticle('a1'), { wrapper: wrapper() });

    const input = { scheduledAt: '2026-08-01T00:00:00.000Z' };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(articlesApi.schedule).toHaveBeenCalledWith('a1', input);
    expect(toast.success).toHaveBeenCalledWith('Article scheduled.');
  });
});
