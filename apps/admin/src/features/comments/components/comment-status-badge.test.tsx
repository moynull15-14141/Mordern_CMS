import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentStatusBadge } from './comment-status-badge';

describe('CommentStatusBadge', () => {
  it.each([
    ['PENDING', 'Pending'],
    ['APPROVED', 'Approved'],
    ['REJECTED', 'Rejected'],
    ['SPAM', 'Spam'],
  ] as const)('renders %s as %s', (status, label) => {
    render(<CommentStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
