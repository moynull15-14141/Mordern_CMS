import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './loading-spinner';

describe('LoadingSpinner', () => {
  it('has role="status" for screen-reader announcement', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('includes visually-hidden "Loading…" text when no label is given', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows a visible label instead when one is provided', () => {
    render(<LoadingSpinner label="Saving changes…" />);
    expect(screen.getByText('Saving changes…')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });
});
