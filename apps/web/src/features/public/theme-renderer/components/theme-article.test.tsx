import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeArticle } from './theme-article';
import type { PublicArticleListItem } from '../../types/content.types';

const baseArticle: PublicArticleListItem = {
  title: 'Match Report: A Great Game',
  subtitle: null,
  slug: 'match-report-a-great-game',
  summary: 'A summary of the match.',
  publishedAt: '2026-01-15T10:00:00.000Z',
  readingTime: 4,
  author: { penName: 'Jane Doe' },
  category: { name: 'Football', slug: 'football' },
  tags: [],
};

describe('ThemeArticle', () => {
  it('links the title to the article detail route', () => {
    render(<ThemeArticle article={baseArticle} />);
    expect(screen.getByRole('link', { name: baseArticle.title })).toHaveAttribute(
      'href',
      '/blog/match-report-a-great-game'
    );
  });

  it('links the category badge to the category route when a category exists', () => {
    render(<ThemeArticle article={baseArticle} />);
    expect(screen.getByRole('link', { name: 'Football' })).toHaveAttribute(
      'href',
      '/category/football'
    );
  });

  it('omits the category badge when category is null', () => {
    render(<ThemeArticle article={{ ...baseArticle, category: null }} />);
    expect(screen.queryByRole('link', { name: 'Football' })).not.toBeInTheDocument();
  });

  it('renders author, date, and reading time in the meta row', () => {
    render(<ThemeArticle article={baseArticle} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('4 min read')).toBeInTheDocument();
  });

  it('omits reading time when null', () => {
    render(<ThemeArticle article={{ ...baseArticle, readingTime: null }} />);
    expect(screen.queryByText(/min read/)).not.toBeInTheDocument();
  });
});
