import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { LayoutDetailPageContent } from './layout-detail-page-content';
import { layoutsApi } from '../services/layouts.api';
import { layoutAssignmentsApi } from '../services/layout-assignments.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { useThemes } from '@/features/themes';
import { usePages } from '@/features/pages';
import { useArticles } from '@/features/articles';
import { useCategoryFlat } from '@/features/categories';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/layouts.api', () => ({
  layoutsApi: { get: vi.fn(), remove: vi.fn(), restore: vi.fn() },
}));
vi.mock('../services/layout-assignments.api', () => ({
  layoutAssignmentsApi: { list: vi.fn(), unassign: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock('@/features/themes', () => ({ useThemes: vi.fn() }));
vi.mock('@/features/pages', () => ({ usePages: vi.fn() }));
vi.mock('@/features/articles', () => ({ useArticles: vi.fn() }));
vi.mock('@/features/categories', () => ({ useCategoryFlat: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper(permissions: string[] = ['layout.manage']) {
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

const layout = {
  id: 'l1',
  name: 'Sidebar Left',
  slug: 'sidebar-left',
  status: 'DRAFT' as const,
  layoutPreset: 'sidebar-left',
  themeId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

function mockCommonQueries() {
  vi.mocked(useThemes).mockReturnValue({ data: { data: [], meta: {} }, isError: false } as never);
  vi.mocked(usePages).mockReturnValue({ data: { data: [], meta: {} }, isLoading: false } as never);
  vi.mocked(useArticles).mockReturnValue({
    data: { data: [], meta: {} },
    isLoading: false,
  } as never);
  vi.mocked(useCategoryFlat).mockReturnValue({ data: [], isLoading: false } as never);
}

describe('LayoutDetailPageContent', () => {
  it('renders layout metadata', async () => {
    mockCommonQueries();
    vi.mocked(layoutsApi.get).mockResolvedValue(layout);
    vi.mocked(layoutAssignmentsApi.list).mockResolvedValue([]);
    render(<LayoutDetailPageContent layoutId="l1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('Sidebar Left').length).toBeGreaterThan(0));
    expect(screen.getByText('sidebar-left')).toBeInTheDocument();
  });

  it('navigates to edit when Edit is clicked', async () => {
    mockCommonQueries();
    vi.mocked(layoutsApi.get).mockResolvedValue(layout);
    vi.mocked(layoutAssignmentsApi.list).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<LayoutDetailPageContent layoutId="l1" />, { wrapper: wrapper() });

    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    expect(pushMock).toHaveBeenCalledWith('/layouts/l1/edit');
  });

  it('only shows assignments pointing at this specific layout', async () => {
    mockCommonQueries();
    vi.mocked(layoutsApi.get).mockResolvedValue(layout);
    vi.mocked(layoutAssignmentsApi.list).mockResolvedValue([
      {
        id: 'a1',
        layoutId: 'l1',
        contentType: 'HOMEPAGE',
        pageId: null,
        articleId: null,
        categoryId: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        deletedAt: null,
      },
      {
        id: 'a2',
        layoutId: 'l2-different-layout',
        contentType: 'HOMEPAGE',
        pageId: null,
        articleId: null,
        categoryId: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        deletedAt: null,
      },
    ]);
    render(<LayoutDetailPageContent layoutId="l1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('The homepage')).toBeInTheDocument());
    expect(screen.queryByText('No layout assignments yet')).not.toBeInTheDocument();
  });

  it('shows Restore instead of Edit/Delete/Assign for a soft-deleted layout', async () => {
    mockCommonQueries();
    vi.mocked(layoutsApi.get).mockResolvedValue({
      ...layout,
      deletedAt: '2026-01-05T00:00:00.000Z',
    });
    vi.mocked(layoutAssignmentsApi.list).mockResolvedValue([]);
    render(<LayoutDetailPageContent layoutId="l1" />, { wrapper: wrapper() });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument()
    );
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('confirms and calls layoutsApi.remove on Delete', async () => {
    mockCommonQueries();
    vi.mocked(layoutsApi.get).mockResolvedValue(layout);
    vi.mocked(layoutAssignmentsApi.list).mockResolvedValue([]);
    vi.mocked(layoutsApi.remove).mockResolvedValue(layout);
    const user = userEvent.setup();
    render(<LayoutDetailPageContent layoutId="l1" />, { wrapper: wrapper() });

    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(layoutsApi.remove).toHaveBeenCalledWith('l1'));
  });
});
