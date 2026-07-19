import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlogListRenderer } from './blog-list-renderer';
import type { RenderContext } from '../types/render-context.types';

const baseContext: Omit<RenderContext, 'content'> = {
  theme: null,
  menus: { header: null, footer: null, secondary: null },
  site: null,
  settings: null,
  locale: 'en',
  seo: null,
  layout: { preset: 'default', source: 'system-default' },
};

describe('BlogListRenderer', () => {
  it('renders an article card per item', () => {
    render(
      <BlogListRenderer
        context={{
          ...baseContext,
          content: {
            type: 'blog-list',
            articles: [
              {
                title: 'Match Report',
                subtitle: null,
                slug: 'match-report',
                summary: null,
                publishedAt: null,
                readingTime: null,
                author: { penName: 'Jane' },
                category: null,
                tags: [],
              },
            ],
            pagination: { page: 1, limit: 12, total: 1, hasNext: false, hasPrevious: false },
            search: null,
            sortBy: 'publishedAt',
            sortOrder: 'desc',
          },
        }}
      />
    );
    expect(screen.getByText('Match Report')).toBeInTheDocument();
  });

  it('renders an empty state with the search term when no articles match', () => {
    render(
      <BlogListRenderer
        context={{
          ...baseContext,
          content: {
            type: 'blog-list',
            articles: [],
            pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false },
            search: 'zzz',
            sortBy: 'publishedAt',
            sortOrder: 'desc',
          },
        }}
      />
    );
    expect(screen.getByTestId('blog-list-empty')).toHaveTextContent('"zzz"');
  });

  it('pre-fills the search form with the current search term', () => {
    render(
      <BlogListRenderer
        context={{
          ...baseContext,
          content: {
            type: 'blog-list',
            articles: [],
            pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false },
            search: 'derby',
            sortBy: 'publishedAt',
            sortOrder: 'desc',
          },
        }}
      />
    );
    expect(screen.getByLabelText('Search articles')).toHaveValue('derby');
  });
});
