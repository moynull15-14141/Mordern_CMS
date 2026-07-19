import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeRenderer } from './home-renderer';
import type { RenderContext } from '../types/render-context.types';
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

const baseContext: Omit<RenderContext, 'content'> = {
  theme: null,
  menus: { header: null, footer: null, secondary: null },
  site: null,
  settings: [
    { key: 'general.siteName', label: 'Site Name', value: 'SportingSpy' },
    { key: 'general.siteTagline', label: 'Tagline', value: 'All the scores' },
  ],
  locale: 'en',
  seo: null,
  layout: { preset: 'default', source: 'system-default' },
};

describe('HomeRenderer', () => {
  it('renders the Hero using settings-provided site name/tagline', () => {
    render(
      <HomeRenderer
        context={{
          ...baseContext,
          content: { type: 'home', latestArticles: [], featuredArticles: [], categories: [] },
        }}
      />
    );
    expect(screen.getByRole('heading', { name: 'SportingSpy' })).toBeInTheDocument();
    expect(screen.getByText('All the scores')).toBeInTheDocument();
  });

  it('renders Latest Articles and Featured Articles sections when populated', () => {
    render(
      <HomeRenderer
        context={{
          ...baseContext,
          content: {
            type: 'home',
            latestArticles: [article],
            featuredArticles: [{ ...article, slug: 'featured-article', title: 'Featured Piece' }],
            categories: [],
          },
        }}
      />
    );
    expect(screen.getByRole('heading', { name: 'Latest Articles' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Featured Articles' })).toBeInTheDocument();
    expect(screen.getByText('Featured Piece')).toBeInTheDocument();
  });

  it('renders the Category Highlights section when categories are present', () => {
    render(
      <HomeRenderer
        context={{
          ...baseContext,
          content: {
            type: 'home',
            latestArticles: [],
            featuredArticles: [],
            categories: [
              {
                type: 'category',
                name: 'Football',
                slug: 'football',
                description: null,
                articleCount: 2,
                seo: null,
              },
            ],
          },
        }}
      />
    );
    expect(screen.getByRole('heading', { name: 'Explore by category' })).toBeInTheDocument();
  });

  it('always renders the Newsletter CTA and Footer CTA sections', () => {
    render(
      <HomeRenderer
        context={{
          ...baseContext,
          content: { type: 'home', latestArticles: [], featuredArticles: [], categories: [] },
        }}
      />
    );
    expect(screen.getByRole('heading', { name: 'Stay in the loop' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Visit the blog' })).toBeInTheDocument();
  });
});
