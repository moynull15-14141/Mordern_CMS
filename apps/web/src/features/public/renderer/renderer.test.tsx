import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicRenderer } from './renderer';
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

describe('PublicRenderer', () => {
  it('renders PageRenderer for page content', () => {
    render(
      <PublicRenderer
        context={{
          ...baseContext,
          content: {
            type: 'page',
            title: 'About Us',
            slug: 'about-us',
            body: {},
            publishedAt: null,
            seo: null,
          },
        }}
      />
    );
    expect(screen.getByTestId('page-renderer')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  it('renders ArticleRenderer for article content', () => {
    render(
      <PublicRenderer
        context={{
          ...baseContext,
          content: {
            type: 'article',
            title: 'Match Report',
            subtitle: null,
            slug: 'match-report',
            summary: null,
            publishedAt: null,
            readingTime: null,
            author: { penName: 'Jane' },
            category: null,
            tags: [],
            body: {},
            wordCount: null,
            language: 'en',
            locale: 'en-US',
            canonicalUrl: null,
            seo: null,
          },
        }}
      />
    );
    expect(screen.getByTestId('article-renderer')).toBeInTheDocument();
  });

  it('renders CategoryRenderer for category content', () => {
    render(
      <PublicRenderer
        context={{
          ...baseContext,
          content: {
            type: 'category',
            name: 'Football',
            slug: 'football',
            description: null,
            articleCount: 3,
            seo: null,
          },
        }}
      />
    );
    expect(screen.getByTestId('category-renderer')).toBeInTheDocument();
    expect(screen.getByText('Football')).toBeInTheDocument();
  });

  it('renders HomeRenderer for home content', () => {
    render(
      <PublicRenderer
        context={{
          ...baseContext,
          content: { type: 'home', latestArticles: [], featuredArticles: [], categories: [] },
        }}
      />
    );
    expect(screen.getByTestId('home-renderer')).toBeInTheDocument();
  });

  it('renders BlogListRenderer for blog-list content', () => {
    render(
      <PublicRenderer
        context={{
          ...baseContext,
          content: {
            type: 'blog-list',
            articles: [],
            pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false },
            search: null,
            sortBy: 'publishedAt',
            sortOrder: 'desc',
          },
        }}
      />
    );
    expect(screen.getByTestId('blog-list-renderer')).toBeInTheDocument();
  });

  it('renders NotFoundRenderer for not-found content', () => {
    render(
      <PublicRenderer context={{ ...baseContext, content: { type: 'not-found', path: '/nope' } }} />
    );
    expect(screen.getByTestId('public-not-found')).toBeInTheDocument();
  });
});
