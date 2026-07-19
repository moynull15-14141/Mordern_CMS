import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchForm } from './search-form';

describe('SearchForm', () => {
  it('renders a native GET form targeting the given action', () => {
    render(<SearchForm action="/blog" />);
    const form = screen.getByRole('search');
    expect(form).toHaveAttribute('method', 'get');
    expect(form).toHaveAttribute('action', '/blog');
  });

  it('pre-fills the search input with defaultValue', () => {
    render(<SearchForm action="/blog" defaultValue="derby" />);
    expect(screen.getByLabelText('Search articles')).toHaveValue('derby');
  });

  it('names the input "search" so it becomes a query param on submit', () => {
    render(<SearchForm action="/blog" />);
    expect(screen.getByLabelText('Search articles')).toHaveAttribute('name', 'search');
  });
});
