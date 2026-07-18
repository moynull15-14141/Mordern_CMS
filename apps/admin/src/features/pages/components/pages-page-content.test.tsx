import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { PagesPageContent } from './pages-page-content';
import { pagesApi } from '../services/pages.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/pages.api', () => ({
  pagesApi: { list: vi.fn(), remove: vi.fn(), restore: vi.fn() },
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

const onePage = {
  id: 'p1',
  title: 'About Us',
  slug: 'about-us',
  body: { text: 'x' },
  status: 'DRAFT' as const,
  publishedAt: null,
  seo: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
});

describe('PagesPageContent', () => {
  it('renders the page title and the pages table', async () => {
    vi.mocked(pagesApi.list).mockResolvedValue({
      data: [onePage],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<PagesPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('About Us')).toBeInTheDocument());
  });

  it('shows the "New page" button only for a user with page.manage', async () => {
    vi.mocked(pagesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<PagesPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(pagesApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'New page' })).not.toBeInTheDocument();
  });

  it('navigates to /pages/new when "New page" is clicked', async () => {
    vi.mocked(pagesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<PagesPageContent />, { wrapper: wrapper(['page.manage']) });

    await user.click(await screen.findByRole('button', { name: 'New page' }));
    expect(pushMock).toHaveBeenCalledWith('/pages/new');
  });

  it('passes page/search/status params from the URL into pagesApi.list', async () => {
    currentSearchParams = new URLSearchParams({ page: '2', search: 'foo', status: 'DRAFT' });
    vi.mocked(pagesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 2, limit: 20, total: 0, hasNext: false, hasPrevious: true } },
    });
    render(<PagesPageContent />, { wrapper: wrapper([]) });

    await waitFor(() =>
      expect(pagesApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, search: 'foo', status: 'DRAFT' })
      )
    );
  });

  it('opens the delete confirmation and calls pagesApi.remove on confirm', async () => {
    vi.mocked(pagesApi.list).mockResolvedValue({
      data: [onePage],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(pagesApi.remove).mockResolvedValue(onePage);
    const user = userEvent.setup();
    render(<PagesPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('About Us')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for About Us' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(await screen.findByText('Delete "About Us"?', { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(pagesApi.remove).toHaveBeenCalledWith('p1'));
  });
});
