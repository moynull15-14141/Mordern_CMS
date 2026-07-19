import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleCard } from './article-card';
import type { PublicArticleListItem } from '../types/content.types';

const article: PublicArticleListItem = {
  title: 'Match Report',
  subtitle: null,
  slug: 'match-report',
  summary: 'City won 2-1.',
  publishedAt: '2026-01-15T00:00:00.000Z',
  readingTime: 4,
  author: { penName: 'Jane Doe' },
  category: { name: 'Football', slug: 'football' },
  tags: [],
};

describe('ArticleCard', () => {
  it('renders the title linking to /blog/:slug', () => {
    render(<ArticleCard article={article} />);
    const link = screen.getByRole('link', { name: 'Match Report' });
    expect(link).toHaveAttribute('href', '/blog/match-report');
  });

  it('renders the category link to /category/:slug', () => {
    render(<ArticleCard article={article} />);
    const link = screen.getByRole('link', { name: 'Football' });
    expect(link).toHaveAttribute('href', '/category/football');
  });

  it('renders author, formatted date, and reading time', () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('4 min read')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2026')).toBeInTheDocument();
  });

  it('omits the category link when category is null', () => {
    render(<ArticleCard article={{ ...article, category: null }} />);
    expect(screen.queryByRole('link', { name: 'Football' })).not.toBeInTheDocument();
  });

  it('omits the summary paragraph when summary is null', () => {
    render(<ArticleCard article={{ ...article, summary: null }} />);
    expect(screen.queryByText('City won 2-1.')).not.toBeInTheDocument();
  });
});
