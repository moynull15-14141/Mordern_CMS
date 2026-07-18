import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSetting } from './use-setting';
import { settingsApi } from '../services/settings.api';

vi.mock('../services/settings.api', () => ({
  settingsApi: { getByKey: vi.fn() },
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

describe('useSetting', () => {
  it('calls settingsApi.getByKey with the given key', async () => {
    vi.mocked(settingsApi.getByKey).mockResolvedValue({ key: 'general.siteName' } as never);
    const { result } = renderHook(() => useSetting('general.siteName'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(settingsApi.getByKey).toHaveBeenCalledWith('general.siteName');
  });

  it('does not query when key is empty', () => {
    const { result } = renderHook(() => useSetting(''), { wrapper: wrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(settingsApi.getByKey).not.toHaveBeenCalled();
  });
});
