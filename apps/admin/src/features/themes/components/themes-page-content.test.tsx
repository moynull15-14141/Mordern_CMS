import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ThemesPageContent } from './themes-page-content';
import { themesApi } from '../services/themes.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/themes.api', () => ({
  themesApi: { list: vi.fn(), remove: vi.fn(), restore: vi.fn(), activate: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function wrapper(permissions: string[] = []) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const permissionValue: PermissionContextValue = {
    permissions,
    roles: [],
    can: (p) => permissions.includes(p),
    canAny: (required) => required.some((p) => permissions.includes(p)),
    canAll: (required) => required.every((p) => permissions.includes(p)),
    isRole: () => false,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <PermissionContext.Provider value={permissionValue}>{children}</PermissionContext.Provider>
      </QueryClientProvider>
    );
  };
}

const oneTheme = {
  id: 't1',
  name: 'Classic',
  slug: 'classic',
  version: null,
  author: null,
  description: null,
  thumbnail: null,
  status: 'DRAFT' as const,
  isActive: false,
  settings: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
});

describe('ThemesPageContent', () => {
  it('renders the page title and the themes table', async () => {
    vi.mocked(themesApi.list).mockResolvedValue({
      data: [oneTheme],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<ThemesPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Classic')).toBeInTheDocument());
  });

  it('shows the "New theme" button only for a user with theme.manage', async () => {
    vi.mocked(themesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<ThemesPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(themesApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'New theme' })).not.toBeInTheDocument();
  });

  it('navigates to /themes/new when "New theme" is clicked', async () => {
    vi.mocked(themesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<ThemesPageContent />, { wrapper: wrapper(['theme.manage']) });

    await user.click(await screen.findByRole('button', { name: 'New theme' }));
    expect(pushMock).toHaveBeenCalledWith('/themes/new');
  });

  it('passes page/search/status params from the URL into themesApi.list', async () => {
    currentSearchParams = new URLSearchParams({ page: '2', search: 'foo', status: 'DRAFT' });
    vi.mocked(themesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 2, limit: 20, total: 0, hasNext: false, hasPrevious: true } },
    });
    render(<ThemesPageContent />, { wrapper: wrapper([]) });

    await waitFor(() =>
      expect(themesApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, search: 'foo', status: 'DRAFT' })
      )
    );
  });

  it('opens the delete confirmation and calls themesApi.remove on confirm', async () => {
    vi.mocked(themesApi.list).mockResolvedValue({
      data: [oneTheme],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(themesApi.remove).mockResolvedValue(oneTheme);
    const user = userEvent.setup();
    render(<ThemesPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Classic')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Classic' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(await screen.findByText('Delete "Classic"?', { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(themesApi.remove).toHaveBeenCalledWith('t1'));
  });

  it('opens the activate confirmation and calls themesApi.activate on confirm', async () => {
    vi.mocked(themesApi.list).mockResolvedValue({
      data: [oneTheme],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(themesApi.activate).mockResolvedValue({ ...oneTheme, isActive: true });
    const user = userEvent.setup();
    render(<ThemesPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Classic')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Classic' }));
    await user.click(screen.getByRole('menuitem', { name: 'Activate' }));
    expect(await screen.findByText('Activate "Classic"?', { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Activate' }));
    await waitFor(() => expect(themesApi.activate).toHaveBeenCalledWith('t1'));
  });
});
