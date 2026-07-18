import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import ArticlesPage from './page';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';
import { articlesApi } from '@/features/articles/services/articles.api';
import { categoriesApi } from '@/features/articles/services/categories.api';
import { tagsApi } from '@/features/articles/services/tags.api';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/features/articles/services/articles.api', () => ({ articlesApi: { list: vi.fn() } }));
vi.mock('@/features/articles/services/categories.api', () => ({ categoriesApi: { listFlat: vi.fn() } }));
vi.mock('@/features/articles/services/tags.api', () => ({ tagsApi: { list: vi.fn() } }));

function wrapper(permissions: string[]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authValue: AuthContextValue = {
    user: { id: '1', email: 'a@b.com', username: null, displayName: null, status: 'ACTIVE' },
    roles: [],
    permissions,
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
  };
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
        <AuthContext.Provider value={authValue}>
          <PermissionContext.Provider value={permissionValue}>{children}</PermissionContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}

describe('ArticlesPage', () => {
  it('renders the Articles list for a user holding any relevant permission', () => {
    vi.mocked(articlesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(categoriesApi.listFlat).mockResolvedValue([]);
    vi.mocked(tagsApi.list).mockResolvedValue({ data: [], meta: {} });
    render(<ArticlesPage />, { wrapper: wrapper([PERMISSIONS.ARTICLE_CREATE]) });
    expect(screen.getByRole('heading', { name: 'Articles' })).toBeInTheDocument();
  });

  it('redirects to /403 for a user with none of the article permissions', () => {
    replaceMock.mockClear();
    render(<ArticlesPage />, { wrapper: wrapper([]) });
    expect(replaceMock).toHaveBeenCalledWith('/403');
  });
});
