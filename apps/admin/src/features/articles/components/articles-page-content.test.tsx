import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ArticlesPageContent } from './articles-page-content';
import { articlesApi } from '../services/articles.api';
import { categoriesApi } from '../services/categories.api';
import { tagsApi } from '../services/tags.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/articles.api', () => ({
  articlesApi: { list: vi.fn(), remove: vi.fn(), restore: vi.fn() },
}));
vi.mock('../services/categories.api', () => ({ categoriesApi: { listFlat: vi.fn() } }));
vi.mock('../services/tags.api', () => ({ tagsApi: { list: vi.fn() } }));
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

const oneArticle = {
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

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
  vi.mocked(categoriesApi.listFlat).mockResolvedValue([]);
  vi.mocked(tagsApi.list).mockResolvedValue({ data: [], meta: {} });
});

describe('ArticlesPageContent', () => {
  it('renders the page title and the articles table', async () => {
    vi.mocked(articlesApi.list).mockResolvedValue({
      data: [oneArticle],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<ArticlesPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Hello World')).toBeInTheDocument());
  });

  it('shows the "New article" button only for a user with article.create', async () => {
    vi.mocked(articlesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<ArticlesPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(articlesApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'New article' })).not.toBeInTheDocument();
  });

  it('navigates to /articles/new when "New article" is clicked', async () => {
    vi.mocked(articlesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<ArticlesPageContent />, { wrapper: wrapper(['article.create']) });

    await user.click(await screen.findByRole('button', { name: 'New article' }));
    expect(pushMock).toHaveBeenCalledWith('/articles/new');
  });

  it('passes page/search/status params from the URL into articlesApi.list', async () => {
    currentSearchParams = new URLSearchParams({ page: '2', search: 'foo', status: 'DRAFT' });
    vi.mocked(articlesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 2, limit: 20, total: 0, hasNext: false, hasPrevious: true } },
    });
    render(<ArticlesPageContent />, { wrapper: wrapper([]) });

    await waitFor(() =>
      expect(articlesApi.list).toHaveBeenCalledWith(expect.objectContaining({ page: 2, search: 'foo', status: 'DRAFT' })),
    );
  });

  it('opens the delete confirmation and calls articlesApi.remove on confirm', async () => {
    vi.mocked(articlesApi.list).mockResolvedValue({
      data: [oneArticle],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(articlesApi.remove).mockResolvedValue(oneArticle);
    const user = userEvent.setup();
    render(<ArticlesPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Hello World')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Hello World' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(await screen.findByText('Delete "Hello World"?', { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(articlesApi.remove).toHaveBeenCalledWith('a1'));
  });
});
