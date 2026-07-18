import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EditArticlePageContent } from './edit-article-page-content';
import { articlesApi } from '../services/articles.api';
import { categoriesApi } from '../services/categories.api';
import { tagsApi } from '../services/tags.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/articles.api', () => ({ articlesApi: { get: vi.fn(), update: vi.fn() } }));
vi.mock('../services/categories.api', () => ({ categoriesApi: { listFlat: vi.fn() } }));
vi.mock('../services/tags.api', () => ({ tagsApi: { list: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const targetArticle = {
  id: 'a1',
  title: 'Hello World',
  subtitle: null,
  slug: 'hello-world',
  summary: null,
  body: { text: 'Original content' },
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

describe('EditArticlePageContent', () => {
  it('loads the article by id and pre-fills the form', async () => {
    vi.mocked(articlesApi.get).mockResolvedValue(targetArticle);
    vi.mocked(categoriesApi.listFlat).mockResolvedValue([]);
    vi.mocked(tagsApi.list).mockResolvedValue({ data: [], meta: {} });
    render(<EditArticlePageContent articleId="a1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Title')).toHaveValue('Hello World'));
    expect(screen.getByLabelText(/Content/)).toHaveValue('Original content');
    expect(articlesApi.get).toHaveBeenCalledWith('a1');
  });

  it('navigates to the detail page without a confirm dialog when Cancel is clicked and the form is clean', async () => {
    vi.mocked(articlesApi.get).mockResolvedValue(targetArticle);
    vi.mocked(categoriesApi.listFlat).mockResolvedValue([]);
    vi.mocked(tagsApi.list).mockResolvedValue({ data: [], meta: {} });
    const user = userEvent.setup();
    render(<EditArticlePageContent articleId="a1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Title')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(pushMock).toHaveBeenCalledWith('/articles/a1');
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  it('shows a discard-changes confirmation when Cancel is clicked with unsaved edits', async () => {
    vi.mocked(articlesApi.get).mockResolvedValue(targetArticle);
    vi.mocked(categoriesApi.listFlat).mockResolvedValue([]);
    vi.mocked(tagsApi.list).mockResolvedValue({ data: [], meta: {} });
    const user = userEvent.setup();
    render(<EditArticlePageContent articleId="a1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Title')).toBeInTheDocument());
    await user.type(screen.getByLabelText('Title'), '!');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText('Discard changes?')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalledWith('/articles/a1');
  });

  it('saves changes and navigates to the detail page on success', async () => {
    vi.mocked(articlesApi.get).mockResolvedValue(targetArticle);
    vi.mocked(articlesApi.update).mockResolvedValue({ ...targetArticle, title: 'New Title' });
    vi.mocked(categoriesApi.listFlat).mockResolvedValue([]);
    vi.mocked(tagsApi.list).mockResolvedValue({ data: [], meta: {} });
    const user = userEvent.setup();
    render(<EditArticlePageContent articleId="a1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Title')).toBeInTheDocument());
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'New Title');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(articlesApi.update).toHaveBeenCalledWith('a1', expect.objectContaining({ title: 'New Title' })),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/articles/a1'));
  });
});
