import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeButton } from './theme-button';

describe('ThemeButton', () => {
  it('renders a native button when no href is given', () => {
    render(<ThemeButton>Click me</ThemeButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders a link when href is given', () => {
    render(<ThemeButton href="/blog">Go to blog</ThemeButton>);
    const link = screen.getByRole('link', { name: 'Go to blog' });
    expect(link).toHaveAttribute('href', '/blog');
  });

  it('respects the disabled prop on the button variant', () => {
    render(<ThemeButton disabled>Disabled</ThemeButton>);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  it.each(['primary', 'secondary', 'outline'] as const)(
    'accepts the %s variant without throwing',
    (variant) => {
      render(<ThemeButton variant={variant}>Variant {variant}</ThemeButton>);
      expect(screen.getByRole('button', { name: `Variant ${variant}` })).toBeInTheDocument();
    }
  );
});
