import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useBulkUpdateCategory } from './use-bulk-update-category';
import { settingsApi } from '../services/settings.api';
import { toast } from '@/lib/toast';

vi.mock('../services/settings.api', () => ({ settingsApi: { bulkUpdateCategory: vi.fn() } }));
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

describe('useBulkUpdateCategory', () => {
  it('calls settingsApi.bulkUpdateCategory with the category and input', async () => {
    vi.mocked(settingsApi.bulkUpdateCategory).mockResolvedValue([]);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useBulkUpdateCategory('seo'), { wrapper: Wrapper });

    const input = { settings: [{ key: 'metaTitle', value: 'New Title' }] };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(settingsApi.bulkUpdateCategory).toHaveBeenCalledWith('seo', input);
  });

  it('invalidates the category and list queries on success', async () => {
    vi.mocked(settingsApi.bulkUpdateCategory).mockResolvedValue([]);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useBulkUpdateCategory('seo'), { wrapper: Wrapper });

    result.current.mutate({ settings: [] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['settings', 'category', 'seo'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['settings', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Settings saved.');
  });
});
