import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentFilters } from './comment-filters';

describe('CommentFilters', () => {
  it('renders the backend-supported filters', () => {
    render(<CommentFilters value={{}} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Article id')).toBeInTheDocument();
    expect(screen.getByLabelText('Author id')).toBeInTheDocument();
  });

  it('calls onChange when article and author ids change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CommentFilters value={{}} onChange={onChange} />);

    await user.type(screen.getByLabelText('Article id'), 'article-1');
    await user.type(screen.getByLabelText('Author id'), 'user-1');

    expect(onChange).toHaveBeenCalled();
  });

  it('shows a clear button when any filter is active', () => {
    render(<CommentFilters value={{ status: 'APPROVED' }} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });
});
