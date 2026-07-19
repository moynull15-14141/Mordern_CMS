import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeEmptyState } from './theme-empty-state';

describe('ThemeEmptyState', () => {
  it('renders the given message as a status region', () => {
    render(<ThemeEmptyState message="No articles found." />);
    expect(screen.getByRole('status')).toHaveTextContent('No articles found.');
  });
});
