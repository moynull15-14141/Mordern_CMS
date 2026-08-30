import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { RedirectsPageContent } from './redirects-page-content';
import { redirectsApi } from '../services/redirects.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/redirects.api', () => ({
  redirectsApi: { list: vi.fn(), remove: vi.fn(), restore: vi.fn() },
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

const oneRedirect = {
  id: 'r1',
  sourcePath: '/old-about',
  destinationUrl: '/about',
  redirectType: 301,
  status: 'ACTIVE' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
});

describe('RedirectsPageContent', () => {
  it('renders the page title and the redirect row', async () => {
    vi.mocked(redirectsApi.list).mockResolvedValue({
      data: [oneRedirect],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<RedirectsPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('/old-about')).toBeInTheDocument());
    expect(screen.getByText('/about')).toBeInTheDocument();
  });

  it('shows the empty state copy when there are no redirects yet', async () => {
    vi.mocked(redirectsApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<RedirectsPageContent />, { wrapper: wrapper([]) });
    expect(await screen.findByText('No redirects yet')).toBeInTheDocument();
  });

  it('shows the "New redirect" button only for a user with page.manage', async () => {
    vi.mocked(redirectsApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<RedirectsPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(redirectsApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'New redirect' })).not.toBeInTheDocument();
  });

  it('navigates to /redirects/new when "New redirect" is clicked', async () => {
    vi.mocked(redirectsApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<RedirectsPageContent />, { wrapper: wrapper(['page.manage']) });

    await user.click(await screen.findByRole('button', { name: 'New redirect' }));
    expect(pushMock).toHaveBeenCalledWith('/redirects/new');
  });

  it('opens the delete confirmation and calls redirectsApi.remove on confirm', async () => {
    vi.mocked(redirectsApi.list).mockResolvedValue({
      data: [oneRedirect],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(redirectsApi.remove).mockResolvedValue(oneRedirect);
    const user = userEvent.setup();
    render(<RedirectsPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('/old-about')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for /old-about' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(await screen.findByRole('button', { name: 'Delete' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(redirectsApi.remove).toHaveBeenCalledWith('r1'));
  });
});
