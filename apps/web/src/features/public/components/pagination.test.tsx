import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pagination } from './pagination';

describe('Pagination', () => {
  it('renders nothing when total fits within one page', () => {
    const { container } = render(
      <Pagination
        basePath="/blog"
        pagination={{ page: 1, limit: 12, total: 5, hasNext: false, hasPrevious: false }}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a working Next link when hasNext is true', () => {
    render(
      <Pagination
        basePath="/blog"
        pagination={{ page: 1, limit: 12, total: 30, hasNext: true, hasPrevious: false }}
      />
    );
    const next = screen.getByRole('link', { name: /next/i });
    expect(next).toHaveAttribute('href', '/blog?page=2');
  });

  it('renders a working Previous link when hasPrevious is true, and omits the link at page 1', () => {
    const { rerender } = render(
      <Pagination
        basePath="/blog"
        pagination={{ page: 2, limit: 12, total: 30, hasNext: true, hasPrevious: true }}
      />
    );
    expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute('href', '/blog');

    rerender(
      <Pagination
        basePath="/blog"
        pagination={{ page: 1, limit: 12, total: 30, hasNext: true, hasPrevious: false }}
      />
    );
    expect(screen.queryByRole('link', { name: /previous/i })).not.toBeInTheDocument();
  });

  it('preserves extraParams (e.g. search) across page links', () => {
    render(
      <Pagination
        basePath="/blog"
        pagination={{ page: 1, limit: 12, total: 30, hasNext: true, hasPrevious: false }}
        extraParams={{ search: 'derby' }}
      />
    );
    const next = screen.getByRole('link', { name: /next/i });
    expect(next.getAttribute('href')).toContain('search=derby');
    expect(next.getAttribute('href')).toContain('page=2');
  });
});
