import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeCard } from './theme-card';

describe('ThemeCard', () => {
  it('renders a plain div when no href is given', () => {
    const { container } = render(<ThemeCard>card content</ThemeCard>);
    expect(container.querySelector('a')).toBeNull();
    expect(screen.getByText('card content')).toBeInTheDocument();
  });

  it('renders a link wrapper when href is given', () => {
    render(<ThemeCard href="/category/football">card content</ThemeCard>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/category/football');
  });
});
