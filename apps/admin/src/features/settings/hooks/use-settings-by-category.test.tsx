import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSettingsByCategory } from './use-settings-by-category';
import { settingsApi } from '../services/settings.api';

vi.mock('../services/settings.api', () => ({
  settingsApi: { getByCategory: vi.fn() },
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

describe('useSettingsByCategory', () => {
  it('calls settingsApi.getByCategory with the given category', async () => {
    vi.mocked(settingsApi.getByCategory).mockResolvedValue([]);
    const { result } = renderHook(() => useSettingsByCategory('seo'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(settingsApi.getByCategory).toHaveBeenCalledWith('seo');
  });

  it('exposes the resolved settings array for that category', async () => {
    const payload = [{ key: 'seo.metaTitle', category: 'seo' }];
    vi.mocked(settingsApi.getByCategory).mockResolvedValue(payload as never);
    const { result } = renderHook(() => useSettingsByCategory('seo'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.data).toEqual(payload));
  });
});
