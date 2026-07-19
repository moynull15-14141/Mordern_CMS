import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleListSection } from './article-list-section';
import type { PublicArticleListItem } from '../types/content.types';

const article: PublicArticleListItem = {
  title: 'Match Report',
  subtitle: null,
  slug: 'match-report',
  summary: null,
  publishedAt: null,
  readingTime: null,
  author: { penName: 'Jane' },
  category: null,
  tags: [],
};

describe('ArticleListSection', () => {
  it('renders nothing when there are no articles', () => {
    const { container } = render(<ArticleListSection title="Latest Articles" articles={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the heading and one card per article', () => {
    render(<ArticleListSection title="Latest Articles" articles={[article]} />);
    expect(screen.getByRole('heading', { name: 'Latest Articles' })).toBeInTheDocument();
    expect(screen.getByText('Match Report')).toBeInTheDocument();
  });

  it('renders a "View all" link only when viewAllHref is given', () => {
    const { rerender } = render(
      <ArticleListSection title="Latest Articles" articles={[article]} />
    );
    expect(screen.queryByText('View all →')).not.toBeInTheDocument();

    rerender(
      <ArticleListSection title="Latest Articles" articles={[article]} viewAllHref="/blog" />
    );
    expect(screen.getByText('View all →').closest('a')).toHaveAttribute('href', '/blog');
  });
});
