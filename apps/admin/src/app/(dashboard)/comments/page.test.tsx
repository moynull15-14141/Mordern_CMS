import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommentsPage from './page';

describe('CommentsPage', () => {
  it('renders without requiring any permission (authenticated-only)', () => {
    render(<CommentsPage />);
    expect(screen.getByRole('heading', { name: 'Comments' })).toBeInTheDocument();
    expect(screen.getByText("Comments isn't available yet")).toBeInTheDocument();
  });
});
