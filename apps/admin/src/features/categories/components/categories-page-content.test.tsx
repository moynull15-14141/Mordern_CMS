import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CategoriesPageContent } from './categories-page-content';
import { categoriesApi } from '../services/categories.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/categories.api', () => ({
  categoriesApi: { list: vi.fn(), getTree: vi.fn(), remove: vi.fn(), restore: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function wrapper(permissions: string[] = []) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
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

const oneCategory = {
  id: 'c1',
  name: 'News',
  slug: 'news',
  description: null,
  status: 'ACTIVE' as const,
  parentId: null,
  sortOrder: 1,
  articleCount: 5,
  childrenCount: 0,
  seo: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
});

describe('CategoriesPageContent', () => {
  it('renders the page title and the categories table by default (List view)', async () => {
    vi.mocked(categoriesApi.list).mockResolvedValue({
      data: [oneCategory],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<CategoriesPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('News')).toBeInTheDocument());
    expect(categoriesApi.getTree).not.toHaveBeenCalled();
  });

  it('switches to Tree view via the view toggle', async () => {
    currentSearchParams = new URLSearchParams({ view: 'tree' });
    vi.mocked(categoriesApi.getTree).mockResolvedValue([{ ...oneCategory, children: [] }]);
    render(<CategoriesPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('News')).toBeInTheDocument());
    expect(categoriesApi.list).not.toHaveBeenCalled();
  });

  it('shows the "New category" button only for a user with category.create', async () => {
    vi.mocked(categoriesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<CategoriesPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(categoriesApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'New category' })).not.toBeInTheDocument();
  });

  it('navigates to /categories/new when "New category" is clicked', async () => {
    vi.mocked(categoriesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<CategoriesPageContent />, { wrapper: wrapper(['category.create']) });

    await user.click(await screen.findByRole('button', { name: 'New category' }));
    expect(pushMock).toHaveBeenCalledWith('/categories/new');
  });

  it('opens the delete confirmation and calls categoriesApi.remove on confirm', async () => {
    vi.mocked(categoriesApi.list).mockResolvedValue({
      data: [oneCategory],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(categoriesApi.remove).mockResolvedValue(oneCategory);
    const user = userEvent.setup();
    render(<CategoriesPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('News')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for News' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(categoriesApi.remove).toHaveBeenCalledWith('c1'));
  });
});
