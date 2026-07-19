import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleRenderer } from './article-renderer';
import type { RenderContext } from '../types/render-context.types';
import type { PublicArticleContent } from '../types/content.types';

const baseContext: Omit<RenderContext, 'content'> = {
  theme: null,
  menus: { header: null, footer: null, secondary: null },
  site: null,
  settings: null,
  locale: 'en',
  seo: null,
  layout: { preset: 'default', source: 'system-default' },
};

const article: PublicArticleContent = {
  type: 'article',
  title: 'Match Report',
  subtitle: 'A thrilling finish',
  slug: 'match-report',
  summary: null,
  publishedAt: '2026-02-01T00:00:00.000Z',
  readingTime: 5,
  author: { penName: 'Jane Doe' },
  category: { name: 'Football', slug: 'football' },
  tags: [{ name: 'Derby', slug: 'derby', primary: true }],
  body: {},
  wordCount: 900,
  language: 'en',
  locale: 'en-US',
  canonicalUrl: null,
  seo: null,
};

describe('ArticleRenderer', () => {
  it('renders title, subtitle, byline, date, and reading time', () => {
    render(<ArticleRenderer context={{ ...baseContext, content: article }} />);
    expect(screen.getByRole('heading', { name: 'Match Report' })).toBeInTheDocument();
    expect(screen.getByText('A thrilling finish')).toBeInTheDocument();
    expect(screen.getByTestId('article-byline')).toHaveTextContent('Jane Doe');
    expect(screen.getByTestId('article-byline')).toHaveTextContent('February 1, 2026');
    expect(screen.getByTestId('article-byline')).toHaveTextContent('5 min read');
  });

  it('links the category to /category/:slug', () => {
    render(<ArticleRenderer context={{ ...baseContext, content: article }} />);
    expect(screen.getByRole('link', { name: 'Football' })).toHaveAttribute(
      'href',
      '/category/football'
    );
  });

  it('renders tags', () => {
    render(<ArticleRenderer context={{ ...baseContext, content: article }} />);
    expect(screen.getByText('Derby')).toBeInTheDocument();
  });

  it('never renders a cover image element (no such field exists on the public shape)', () => {
    render(<ArticleRenderer context={{ ...baseContext, content: article }} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('omits category link and byline separators gracefully when data is minimal', () => {
    render(
      <ArticleRenderer
        context={{
          ...baseContext,
          content: { ...article, category: null, tags: [], readingTime: null, publishedAt: null },
        }}
      />
    );
    expect(screen.queryByRole('link', { name: 'Football' })).not.toBeInTheDocument();
  });
});
