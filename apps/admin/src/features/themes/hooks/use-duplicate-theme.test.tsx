import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDuplicateTheme } from './use-duplicate-theme';
import { themesApi } from '../services/themes.api';
import { toast } from '@/lib/toast';
import type { Theme } from '../types/theme';

vi.mock('../services/themes.api', () => ({ themesApi: { create: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

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

const source: Theme = {
  id: 'theme-1',
  name: 'Classic',
  slug: 'classic',
  version: '1.0.0',
  author: 'Acme',
  description: 'A classic theme.',
  thumbnail: null,
  status: 'PUBLISHED',
  isActive: true,
  settings: { primaryColor: '#111827' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('useDuplicateTheme', () => {
  it('composes a create() call with "(Copy)" appended to the name, never copying status/isActive', async () => {
    vi.mocked(themesApi.create).mockResolvedValue({
      ...source,
      id: 'theme-2',
      name: 'Classic (Copy)',
    });
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useDuplicateTheme(), { wrapper: Wrapper });

    result.current.mutate(source);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(themesApi.create).toHaveBeenCalledWith({
      name: 'Classic (Copy)',
      version: '1.0.0',
      author: 'Acme',
      description: 'A classic theme.',
      thumbnail: undefined,
      settings: { primaryColor: '#111827' },
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['themes', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Theme duplicated.');
  });

  it('toasts an error on failure', async () => {
    vi.mocked(themesApi.create).mockRejectedValue(new Error('boom'));
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDuplicateTheme(), { wrapper: Wrapper });

    result.current.mutate(source);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Could not duplicate this theme.');
  });
});
