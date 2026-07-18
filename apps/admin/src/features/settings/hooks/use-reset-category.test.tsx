import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useResetCategory } from './use-reset-category';
import { settingsApi } from '../services/settings.api';
import { toast } from '@/lib/toast';

vi.mock('../services/settings.api', () => ({ settingsApi: { resetCategory: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  return {
    Wrapper: function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
    invalidateSpy,
  };
}

describe('useResetCategory', () => {
  it('calls settingsApi.resetCategory with the category', async () => {
    vi.mocked(settingsApi.resetCategory).mockResolvedValue({ resetCount: 2 });
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useResetCategory(), { wrapper: Wrapper });

    result.current.mutate('seo');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(settingsApi.resetCategory).toHaveBeenCalledWith('seo');
  });

  it('invalidates the category and list queries and shows a success toast', async () => {
    vi.mocked(settingsApi.resetCategory).mockResolvedValue({ resetCount: 2 });
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useResetCategory(), { wrapper: Wrapper });

    result.current.mutate('seo');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['settings', 'category', 'seo'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['settings', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Category reset to defaults.');
  });
});
