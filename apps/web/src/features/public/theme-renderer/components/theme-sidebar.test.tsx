import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeSidebar } from './theme-sidebar';

describe('ThemeSidebar', () => {
  it('renders its children when given', () => {
    render(
      <ThemeSidebar>
        <p>Widget content</p>
      </ThemeSidebar>
    );
    expect(screen.getByText('Widget content')).toBeInTheDocument();
  });

  it('falls back to an empty-state message when no children are given', () => {
    render(<ThemeSidebar />);
    expect(screen.getByText('Nothing to show here yet.')).toBeInTheDocument();
  });

  it('renders as a labeled aside landmark', () => {
    render(<ThemeSidebar />);
    expect(screen.getByRole('complementary', { name: 'Sidebar' })).toBeInTheDocument();
  });
});
