import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AssignmentsPageContent } from './assignments-page-content';
import { layoutAssignmentsApi } from '../services/layout-assignments.api';
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

vi.mock('../services/layout-assignments.api', () => ({
  layoutAssignmentsApi: { list: vi.fn(), unassign: vi.fn(), assign: vi.fn() },
}));
vi.mock('../services/layouts.api', () => ({ layoutsApi: { list: vi.fn() } }));
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

const oneAssignment = {
  id: 'a1',
  layoutId: 'l1',
  contentType: 'HOMEPAGE' as const,
  pageId: null,
  articleId: null,
  categoryId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
  vi.mocked(layoutsApi.list).mockResolvedValue({
    data: [{ id: 'l1', name: 'Sidebar Left' }],
    meta: {},
  } as never);
  vi.mocked(usePages).mockReturnValue({ data: { data: [], meta: {} }, isLoading: false } as never);
  vi.mocked(useArticles).mockReturnValue({
    data: { data: [], meta: {} },
    isLoading: false,
  } as never);
  vi.mocked(useCategoryFlat).mockReturnValue({ data: [], isLoading: false } as never);
});

describe('AssignmentsPageContent', () => {
  it('renders the assignments table', async () => {
    vi.mocked(layoutAssignmentsApi.list).mockResolvedValue([oneAssignment]);
    render(<AssignmentsPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('The homepage')).toBeInTheDocument());
  });

  it('passes the contentType filter from the URL into layoutAssignmentsApi.list', async () => {
    currentSearchParams = new URLSearchParams({ contentType: 'PAGE' });
    vi.mocked(layoutAssignmentsApi.list).mockResolvedValue([]);
    render(<AssignmentsPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(layoutAssignmentsApi.list).toHaveBeenCalledWith('PAGE'));
  });

  it('shows the "Assign layout" button only for a user with layout.manage', async () => {
    vi.mocked(layoutAssignmentsApi.list).mockResolvedValue([]);
    render(<AssignmentsPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(layoutAssignmentsApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Assign layout' })).not.toBeInTheDocument();
  });

  it('opens the unassign confirmation and calls layoutAssignmentsApi.unassign on confirm', async () => {
    vi.mocked(layoutAssignmentsApi.list).mockResolvedValue([oneAssignment]);
    vi.mocked(layoutAssignmentsApi.unassign).mockResolvedValue(oneAssignment);
    const user = userEvent.setup();
    render(<AssignmentsPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('The homepage')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Unassign' }));
    expect(await screen.findByText('Unassign layout')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Unassign' }));
    await waitFor(() => expect(layoutAssignmentsApi.unassign).toHaveBeenCalledWith('a1'));
  });
});
