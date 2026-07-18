import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ArticleDetailPageContent } from './article-detail-page-content';
import { articlesApi } from '../services/articles.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/articles.api', () => ({
  articlesApi: { get: vi.fn(), remove: vi.fn(), restore: vi.fn(), publish: vi.fn(), schedule: vi.fn(), listRevisions: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper(permissions: string[] = ['article.update', 'article.delete', 'article.publish']) {
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

const article = {
  id: 'a1',
  title: 'Hello World',
  subtitle: null,
  slug: 'hello-world',
  summary: 'A summary',
  body: { text: 'x' },
  status: 'DRAFT' as const,
  publishedAt: null,
  scheduledAt: null,
  visibility: 'PUBLIC' as const,
  language: 'en',
  locale: 'en-US',
  canonicalUrl: null,
  readingTime: 3,
  wordCount: 500,
  notes: null,
  featuredMediaId: null,
  author: { id: 'au1', penName: 'Jane Author', userId: null },
  category: { id: 'c1', name: 'News', slug: 'news' },
  tags: [],
  seo: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('ArticleDetailPageContent', () => {
  it('renders article metadata', async () => {
    vi.mocked(articlesApi.get).mockResolvedValue(article);
    vi.mocked(articlesApi.listRevisions).mockResolvedValue([]);
    render(<ArticleDetailPageContent articleId="a1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('Hello World').length).toBeGreaterThan(0));
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('Jane Author')).toBeInTheDocument();
  });

  it('shows Publish/Schedule actions for a non-published article and navigates to edit', async () => {
    vi.mocked(articlesApi.get).mockResolvedValue(article);
    vi.mocked(articlesApi.listRevisions).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<ArticleDetailPageContent articleId="a1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Schedule' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(pushMock).toHaveBeenCalledWith('/articles/a1/edit');
  });

  it('does not show Publish/Schedule for an already-published article', async () => {
    vi.mocked(articlesApi.get).mockResolvedValue({ ...article, status: 'PUBLISHED', publishedAt: '2026-01-03T00:00:00.000Z' });
    vi.mocked(articlesApi.listRevisions).mockResolvedValue([]);
    render(<ArticleDetailPageContent articleId="a1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('Published').length).toBeGreaterThan(0));
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
  });

  it('confirms and calls articlesApi.remove on Delete', async () => {
    vi.mocked(articlesApi.get).mockResolvedValue(article);
    vi.mocked(articlesApi.listRevisions).mockResolvedValue([]);
    vi.mocked(articlesApi.remove).mockResolvedValue(article);
    const user = userEvent.setup();
    render(<ArticleDetailPageContent articleId="a1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(articlesApi.remove).toHaveBeenCalledWith('a1'));
  });

  it('shows Restore instead of Edit/Delete for a soft-deleted article', async () => {
    vi.mocked(articlesApi.get).mockResolvedValue({ ...article, deletedAt: '2026-01-05T00:00:00.000Z' });
    vi.mocked(articlesApi.listRevisions).mockResolvedValue([]);
    render(<ArticleDetailPageContent articleId="a1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });
});
