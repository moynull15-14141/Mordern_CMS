import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicNotFound } from './public-not-found';

describe('PublicNotFound', () => {
  it('shows the missing path when one is given', () => {
    render(<PublicNotFound path="/blog/missing" />);
    expect(screen.getByText(/Nothing is published at/)).toBeInTheDocument();
    expect(screen.getByText(/\/blog\/missing/)).toBeInTheDocument();
  });

  it('shows a generic message when no path is available (e.g. app/not-found.tsx)', () => {
    render(<PublicNotFound path="" />);
    expect(screen.getByText('This page doesn’t exist.')).toBeInTheDocument();
  });

  it('links back to the home page', () => {
    render(<PublicNotFound path="/x" />);
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  });
});
