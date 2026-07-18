import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CategoryDetailPageContent } from './category-detail-page-content';
import { categoriesApi } from '../services/categories.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/categories.api', () => ({
  categoriesApi: {
    get: vi.fn(),
    getBreadcrumb: vi.fn(),
    getChildren: vi.fn(),
    remove: vi.fn(),
    restore: vi.fn(),
    getFlat: vi.fn(),
    getDescendants: vi.fn(),
  },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper(permissions: string[] = ['category.create']) {
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

const category = {
  id: 'c1',
  name: 'News',
  slug: 'news',
  description: 'All the news',
  status: 'ACTIVE' as const,
  parentId: null,
  sortOrder: 1,
  articleCount: 5,
  childrenCount: 1,
  seo: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('CategoryDetailPageContent', () => {
  it('renders category metadata and breadcrumb', async () => {
    vi.mocked(categoriesApi.get).mockResolvedValue(category);
    vi.mocked(categoriesApi.getBreadcrumb).mockResolvedValue([{ id: 'c1', name: 'News', slug: 'news' }]);
    vi.mocked(categoriesApi.getChildren).mockResolvedValue([]);
    render(<CategoryDetailPageContent categoryId="c1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('News').length).toBeGreaterThan(0));
    expect(screen.getByText('All the news')).toBeInTheDocument();
  });

  it('navigates to edit when Edit is clicked', async () => {
    vi.mocked(categoriesApi.get).mockResolvedValue(category);
    vi.mocked(categoriesApi.getBreadcrumb).mockResolvedValue([]);
    vi.mocked(categoriesApi.getChildren).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<CategoryDetailPageContent categoryId="c1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(pushMock).toHaveBeenCalledWith('/categories/c1/edit');
  });

  it('shows Restore instead of Edit/Move/Delete for a soft-deleted category', async () => {
    vi.mocked(categoriesApi.get).mockResolvedValue({ ...category, deletedAt: '2026-01-05T00:00:00.000Z' });
    vi.mocked(categoriesApi.getBreadcrumb).mockResolvedValue([]);
    vi.mocked(categoriesApi.getChildren).mockResolvedValue([]);
    render(<CategoryDetailPageContent categoryId="c1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Move' })).not.toBeInTheDocument();
  });

  it('renders direct children with a status badge', async () => {
    vi.mocked(categoriesApi.get).mockResolvedValue(category);
    vi.mocked(categoriesApi.getBreadcrumb).mockResolvedValue([]);
    vi.mocked(categoriesApi.getChildren).mockResolvedValue([
      { ...category, id: 'c2', name: 'Sports', status: 'INACTIVE' },
    ]);
    render(<CategoryDetailPageContent categoryId="c1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Sports')).toBeInTheDocument());
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});
