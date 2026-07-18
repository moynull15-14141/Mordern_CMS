import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CommentDetailPageContent } from './comment-detail-page-content';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'user@example.com', username: null, displayName: 'Ava', status: 'ACTIVE' },
    roles: ['Moderator'],
    permissions: ['comment.moderate', 'users.manage'],
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));
vi.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({
    can: (permission: string) => ['comment.moderate', 'users.manage'].includes(permission),
    canAny: (permissions: string[]) => permissions.includes('article.create'),
    canAll: () => false,
    isRole: () => false,
  }),
}));
vi.mock('../hooks/use-comment', () => ({
  useComment: () => ({
    data: {
      id: 'comment-1',
      articleId: 'article-1',
      userId: 'user-1',
      authorName: 'Ava',
      authorEmail: 'ava@example.com',
      parentId: 'parent-1',
      body: 'Comment body',
      status: 'PENDING',
      moderationReason: null,
      votes: 2,
      replyCount: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      deletedAt: null,
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));
vi.mock('../hooks/use-comment-replies', () => ({
  useCommentReplies: () => ({
    data: {
      data: [
        {
          id: 'reply-1',
          articleId: 'article-1',
          userId: 'user-2',
          authorName: 'Ben',
          authorEmail: 'ben@example.com',
          parentId: 'comment-1',
          body: 'Reply body',
          status: 'APPROVED',
          moderationReason: null,
          votes: 0,
          replyCount: 0,
          createdAt: '2026-01-03T00:00:00.000Z',
          updatedAt: '2026-01-03T00:00:00.000Z',
          deletedAt: null,
        },
      ],
      meta: { pagination: { page: 1, limit: 10, total: 1, hasNext: false, hasPrevious: false } },
    },
    isLoading: false,
    error: null,
  }),
}));
vi.mock('@/features/articles/hooks/use-article', () => ({
  useArticle: () => ({ data: { id: 'article-1', title: 'Related article' } }),
}));
vi.mock('@/features/users/hooks/use-user', () => ({
  useUser: () => ({ data: { id: 'user-1', displayName: 'Ava', email: 'ava@example.com' } }),
}));
vi.mock('../hooks/use-create-comment', () => ({ useCreateComment: () => ({ mutateAsync: vi.fn() }) }));
vi.mock('../hooks/use-update-comment', () => ({ useUpdateComment: () => ({ mutateAsync: vi.fn() }) }));
vi.mock('../hooks/use-delete-comment', () => ({ useDeleteComment: () => ({ mutateAsync: vi.fn() }) }));
vi.mock('../hooks/use-restore-comment', () => ({ useRestoreComment: () => ({ mutateAsync: vi.fn() }) }));
vi.mock('../hooks/use-approve-comment', () => ({ useApproveComment: () => ({ mutateAsync: vi.fn() }) }));
vi.mock('../hooks/use-reject-comment', () => ({ useRejectComment: () => ({ mutateAsync: vi.fn() }) }));
vi.mock('../hooks/use-spam-comment', () => ({ useSpamComment: () => ({ mutateAsync: vi.fn() }) }));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('CommentDetailPageContent', () => {
  it('renders the comment, article, author, and reply information', () => {
    render(<CommentDetailPageContent commentId="comment-1" />, { wrapper });

    expect(screen.getByRole('heading', { name: 'Ava' })).toBeInTheDocument();
    expect(screen.getAllByText('Comment body')[0]).toBeInTheDocument();
    expect(screen.getByText('Related article')).toBeInTheDocument();
    expect(screen.getByText('Reply body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reply' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  });
});
