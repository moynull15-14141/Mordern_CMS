import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSettings } from './use-settings';
import { settingsApi } from '../services/settings.api';

vi.mock('../services/settings.api', () => ({
  settingsApi: { getAll: vi.fn() },
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

describe('useSettings', () => {
  it('calls settingsApi.getAll with no arguments', async () => {
    vi.mocked(settingsApi.getAll).mockResolvedValue([]);
    const { result } = renderHook(() => useSettings(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(settingsApi.getAll).toHaveBeenCalledWith();
  });

  it('exposes the resolved settings array', async () => {
    const payload = [{ key: 'general.siteName', category: 'general' }];
    vi.mocked(settingsApi.getAll).mockResolvedValue(payload as never);
    const { result } = renderHook(() => useSettings(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.data).toEqual(payload));
  });

  it('surfaces a rejected query as isError', async () => {
    vi.mocked(settingsApi.getAll).mockRejectedValue(new Error('nope'));
    const { result } = renderHook(() => useSettings(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
