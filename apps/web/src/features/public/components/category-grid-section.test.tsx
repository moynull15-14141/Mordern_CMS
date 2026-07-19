import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryGridSection } from './category-grid-section';

describe('CategoryGridSection', () => {
  it('renders nothing when there are no categories', () => {
    const { container } = render(<CategoryGridSection categories={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the heading and one card per category', () => {
    render(
      <CategoryGridSection
        categories={[
          {
            type: 'category',
            name: 'Football',
            slug: 'football',
            description: null,
            articleCount: 3,
            seo: null,
          },
        ]}
      />
    );
    expect(screen.getByRole('heading', { name: 'Explore by category' })).toBeInTheDocument();
    expect(screen.getByText('Football')).toBeInTheDocument();
  });
});
