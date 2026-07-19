import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { LayoutsPageContent } from './layouts-page-content';
import { layoutsApi } from '../services/layouts.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { usePages } from '@/features/pages';
import { useArticles } from '@/features/articles';
import { useCategoryFlat } from '@/features/categories';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/layouts.api', () => ({
  layoutsApi: { list: vi.fn(), remove: vi.fn(), restore: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock('@/features/pages', () => ({ usePages: vi.fn() }));
vi.mock('@/features/articles', () => ({ useArticles: vi.fn() }));
vi.mock('@/features/categories', () => ({ useCategoryFlat: vi.fn() }));

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

const oneLayout = {
  id: 'l1',
  name: 'Blog Sidebar',
  slug: 'sidebar-left',
  status: 'DRAFT' as const,
  layoutPreset: 'sidebar-left',
  themeId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
  vi.mocked(usePages).mockReturnValue({ data: { data: [], meta: {} }, isLoading: false } as never);
  vi.mocked(useArticles).mockReturnValue({
    data: { data: [], meta: {} },
    isLoading: false,
  } as never);
  vi.mocked(useCategoryFlat).mockReturnValue({ data: [], isLoading: false } as never);
});

describe('LayoutsPageContent', () => {
  it('renders the page title and the layouts table', async () => {
    vi.mocked(layoutsApi.list).mockResolvedValue({
      data: [oneLayout],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<LayoutsPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Blog Sidebar')).toBeInTheDocument());
  });

  it('shows the "New layout" button only for a user with layout.manage', async () => {
    vi.mocked(layoutsApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<LayoutsPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(layoutsApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'New layout' })).not.toBeInTheDocument();
  });

  it('navigates to /layouts/new when "New layout" is clicked', async () => {
    vi.mocked(layoutsApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<LayoutsPageContent />, { wrapper: wrapper(['layout.manage']) });

    await user.click(await screen.findByRole('button', { name: 'New layout' }));
    expect(pushMock).toHaveBeenCalledWith('/layouts/new');
  });

  it('navigates to /layouts/assignments when "Assignments" is clicked', async () => {
    vi.mocked(layoutsApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<LayoutsPageContent />, { wrapper: wrapper([]) });

    await user.click(await screen.findByRole('button', { name: 'Assignments' }));
    expect(pushMock).toHaveBeenCalledWith('/layouts/assignments');
  });

  it('opens the delete confirmation and calls layoutsApi.remove on confirm', async () => {
    vi.mocked(layoutsApi.list).mockResolvedValue({
      data: [oneLayout],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(layoutsApi.remove).mockResolvedValue(oneLayout);
    const user = userEvent.setup();
    render(<LayoutsPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Blog Sidebar')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Blog Sidebar' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(await screen.findByText('Delete "Blog Sidebar"?', { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(layoutsApi.remove).toHaveBeenCalledWith('l1'));
  });
});
