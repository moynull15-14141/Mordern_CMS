import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommentDetailPage from './page';

vi.mock('@/features/comments', () => ({ CommentDetailPageContent: ({ commentId }: { commentId: string }) => <div>Comment {commentId}</div> }));

describe('CommentDetailPage', () => {
  it('passes the route id into the detail content', async () => {
    const element = await CommentDetailPage({ params: Promise.resolve({ id: 'comment-1' }) });
    render(element);
    expect(screen.getByText('Comment comment-1')).toBeInTheDocument();
  });
});
