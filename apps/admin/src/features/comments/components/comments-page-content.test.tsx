import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CommentsPageContent } from './comments-page-content';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams('page=1&limit=20&search=hello'),
}));
vi.mock('../hooks/use-comments', () => ({
  useComments: () => ({
    data: {
      data: [
        {
          id: 'comment-1',
          articleId: 'article-1',
          userId: 'user-1',
          authorName: 'Ava',
          authorEmail: 'ava@example.com',
          parentId: null,
          body: 'First comment body',
          status: 'APPROVED',
          moderationReason: null,
          votes: 3,
          replyCount: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          deletedAt: null,
        },
      ],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('CommentsPageContent', () => {
  it('renders the comments table and the backend-supported filters', () => {
    render(<CommentsPageContent />, { wrapper });
    expect(screen.getByRole('heading', { name: 'Comments' })).toBeInTheDocument();
    expect(screen.getByText('First comment body')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });
});
