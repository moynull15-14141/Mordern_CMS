import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import EditArticlePage from './page';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';
import { articlesApi } from '@/features/articles/services/articles.api';
import { categoriesApi } from '@/features/articles/services/categories.api';
import { tagsApi } from '@/features/articles/services/tags.api';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: vi.fn() }) }));
vi.mock('@/features/articles/services/articles.api', () => ({ articlesApi: { get: vi.fn(), update: vi.fn() } }));
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

const article = {
  id: 'a1',
  title: 'Hello World',
  subtitle: null,
  slug: 'hello-world',
  summary: null,
  body: { text: 'x' },
  status: 'DRAFT' as const,
  publishedAt: null,
  scheduledAt: null,
  visibility: 'PUBLIC' as const,
  language: 'en',
  locale: 'en-US',
  canonicalUrl: null,
  readingTime: null,
  wordCount: null,
  notes: null,
  featuredMediaId: null,
  author: { id: 'au1', penName: 'Jane Author', userId: null },
  category: null,
  tags: [],
  seo: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('EditArticlePage', () => {
  it('renders the edit form for a user with article.update', async () => {
    vi.mocked(articlesApi.get).mockResolvedValue(article);
    vi.mocked(categoriesApi.listFlat).mockResolvedValue([]);
    vi.mocked(tagsApi.list).mockResolvedValue({ data: [], meta: {} });

    const element = await EditArticlePage({ params: Promise.resolve({ id: 'a1' }) });
    render(element, { wrapper: wrapper([PERMISSIONS.ARTICLE_UPDATE]) });

    await waitFor(() => expect(screen.getByLabelText('Title')).toHaveValue('Hello World'));
  });

  it('redirects to /403 for a user without article.update', async () => {
    replaceMock.mockClear();
    const element = await EditArticlePage({ params: Promise.resolve({ id: 'a1' }) });
    render(element, { wrapper: wrapper([]) });
    expect(replaceMock).toHaveBeenCalledWith('/403');
  });
});
