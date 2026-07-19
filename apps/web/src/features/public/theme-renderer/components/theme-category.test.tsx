import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeCategory } from './theme-category';
import type { PublicCategoryContent } from '../../types/content.types';

const baseCategory: PublicCategoryContent = {
  type: 'category',
  name: 'Football',
  slug: 'football',
  description: 'All things football.',
  articleCount: 5,
  seo: null,
};

describe('ThemeCategory', () => {
  it('links to the category route', () => {
    render(<ThemeCategory category={baseCategory} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/category/football');
  });

  it('renders the article count with plural wording', () => {
    render(<ThemeCategory category={baseCategory} />);
    expect(screen.getByText('5 articles')).toBeInTheDocument();
  });

  it('renders singular wording for exactly one article', () => {
    render(<ThemeCategory category={{ ...baseCategory, articleCount: 1 }} />);
    expect(screen.getByText('1 article')).toBeInTheDocument();
  });

  it('omits the description when null', () => {
    render(<ThemeCategory category={{ ...baseCategory, description: null }} />);
    expect(screen.queryByText('All things football.')).not.toBeInTheDocument();
  });
});
