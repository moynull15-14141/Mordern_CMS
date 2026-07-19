import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryRenderer } from './category-renderer';
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

describe('CategoryRenderer', () => {
  it('renders the category name, description, and article count', () => {
    render(
      <CategoryRenderer
        context={{
          ...baseContext,
          content: {
            type: 'category',
            name: 'Football',
            slug: 'football',
            description: 'All football news',
            articleCount: 12,
            seo: null,
          },
        }}
      />
    );
    expect(screen.getByRole('heading', { name: 'Football' })).toBeInTheDocument();
    expect(screen.getByText('All football news')).toBeInTheDocument();
    expect(screen.getByText('12 articles in this category')).toBeInTheDocument();
  });

  it('honestly discloses that related articles are unavailable', () => {
    render(
      <CategoryRenderer
        context={{
          ...baseContext,
          content: {
            type: 'category',
            name: 'Football',
            slug: 'football',
            description: null,
            articleCount: 0,
            seo: null,
          },
        }}
      />
    );
    expect(screen.getByTestId('category-related-articles-note')).toBeInTheDocument();
  });
});
