import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommentsPage from './page';

vi.mock('@/features/comments', () => ({ CommentsPageContent: () => <div>Comments list</div> }));

describe('CommentsPage', () => {
  it('renders the list page content', () => {
    render(<CommentsPage />);
    expect(screen.getByText('Comments list')).toBeInTheDocument();
  });
});
