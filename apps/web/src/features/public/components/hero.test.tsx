import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './hero';

describe('Hero', () => {
  it('renders the site name and tagline', () => {
    render(<Hero siteName="SportingSpy" tagline="All the scores" highlightArticle={null} />);
    expect(screen.getByRole('heading', { name: 'SportingSpy' })).toBeInTheDocument();
    expect(screen.getByText('All the scores')).toBeInTheDocument();
  });

  it('omits the tagline paragraph when none is given', () => {
    render(<Hero siteName="SportingSpy" highlightArticle={null} />);
    expect(screen.queryByText('All the scores')).not.toBeInTheDocument();
  });

  it('renders the highlight article linking to /blog/:slug when present', () => {
    render(
      <Hero
        siteName="SportingSpy"
        highlightArticle={{
          title: 'Match Report',
          subtitle: null,
          slug: 'match-report',
          summary: 'City won.',
          publishedAt: null,
          readingTime: null,
          author: { penName: 'Jane' },
          category: null,
          tags: [],
        }}
      />
    );
    expect(screen.getByRole('link', { name: 'Match Report' })).toHaveAttribute(
      'href',
      '/blog/match-report'
    );
  });

  it('omits the highlight block entirely when there is no article', () => {
    render(<Hero siteName="SportingSpy" highlightArticle={null} />);
    expect(screen.queryByText('Latest')).not.toBeInTheDocument();
  });
});
