import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryCard } from './category-card';
import type { PublicCategoryContent } from '../types/content.types';

describe('CategoryCard', () => {
  it('links to /category/:slug and shows the article count', () => {
    render(
      <CategoryCard
        category={
          {
            type: 'category',
            name: 'Football',
            slug: 'football',
            description: 'All football',
            articleCount: 5,
            seo: null,
          } as PublicCategoryContent
        }
      />
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/category/football');
    expect(screen.getByText('5 articles')).toBeInTheDocument();
    expect(screen.getByText('All football')).toBeInTheDocument();
  });

  it('uses singular "article" for a count of 1', () => {
    render(
      <CategoryCard
        category={
          {
            type: 'category',
            name: 'Golf',
            slug: 'golf',
            description: null,
            articleCount: 1,
            seo: null,
          } as PublicCategoryContent
        }
      />
    );
    expect(screen.getByText('1 article')).toBeInTheDocument();
  });
});
