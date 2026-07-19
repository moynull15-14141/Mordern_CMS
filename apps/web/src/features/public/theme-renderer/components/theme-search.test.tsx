import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeSearch } from './theme-search';

describe('ThemeSearch', () => {
  it('renders a native GET form pointing at the given action', () => {
    render(<ThemeSearch action="/blog" />);
    expect(screen.getByRole('search')).toHaveAttribute('action', '/blog');
    expect(screen.getByRole('search')).toHaveAttribute('method', 'get');
  });

  it('pre-fills the search input with defaultValue', () => {
    render(<ThemeSearch action="/blog" defaultValue="football" />);
    expect(screen.getByRole('searchbox')).toHaveValue('football');
  });
});
