import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CreateArticlePageContent } from './create-article-page-content';
import { articlesApi } from '../services/articles.api';
import { categoriesApi } from '../services/categories.api';
import { tagsApi } from '../services/tags.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/articles.api', () => ({ articlesApi: { create: vi.fn() } }));
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

describe('CreateArticlePageContent', () => {
  it('submits the form and navigates to the detail page on success', async () => {
    vi.mocked(categoriesApi.listFlat).mockResolvedValue([]);
    vi.mocked(tagsApi.list).mockResolvedValue({ data: [], meta: {} });
    vi.mocked(articlesApi.create).mockResolvedValue({ id: 'a1' } as never);
    const user = userEvent.setup();
    render(<CreateArticlePageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Title'), 'Hello World');
    await user.type(screen.getByLabelText(/Content/), 'Some body text');
    await user.type(screen.getByLabelText('Author id (UUID)'), '11111111-1111-1111-1111-111111111111');
    await user.click(screen.getByRole('button', { name: 'Create article' }));

    await waitFor(() =>
      expect(articlesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Hello World',
          body: { text: 'Some body text' },
          authorId: '11111111-1111-1111-1111-111111111111',
        }),
      ),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/articles/a1'));
  });
});
