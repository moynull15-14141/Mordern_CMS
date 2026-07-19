import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemePagination } from './theme-pagination';
import type { PaginationMeta } from '../../types/api-envelope.types';

const pagination = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
  page: 2,
  limit: 10,
  total: 35,
  hasNext: true,
  hasPrevious: true,
  ...overrides,
});

describe('ThemePagination', () => {
  it('renders nothing when total fits within a single page', () => {
    const { container } = render(
      <ThemePagination
        basePath="/blog"
        pagination={pagination({ total: 5, hasNext: false, hasPrevious: false })}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders both Previous and Next links when both are available', () => {
    render(<ThemePagination basePath="/blog" pagination={pagination()} />);
    // page 1 needs no explicit query param — it's the canonical URL.
    expect(screen.getByRole('link', { name: /Previous/ })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: /Next/ })).toHaveAttribute('href', '/blog?page=3');
  });

  it('disables Previous on the first page', () => {
    render(
      <ThemePagination basePath="/blog" pagination={pagination({ page: 1, hasPrevious: false })} />
    );
    expect(screen.queryByRole('link', { name: /Previous/ })).not.toBeInTheDocument();
  });

  it('disables Next on the last page', () => {
    render(
      <ThemePagination basePath="/blog" pagination={pagination({ page: 4, hasNext: false })} />
    );
    expect(screen.queryByRole('link', { name: /Next/ })).not.toBeInTheDocument();
  });

  it('includes extraParams (e.g. search) in generated links', () => {
    render(
      <ThemePagination
        basePath="/blog"
        pagination={pagination()}
        extraParams={{ search: 'football' }}
      />
    );
    const href = screen.getByRole('link', { name: /Next/ }).getAttribute('href')!;
    expect(href).toContain('search=football');
    expect(href).toContain('page=3');
  });
});
