import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsageList } from './usage-list';

describe('UsageList', () => {
  it('renders a link per usage, pointing at the right edit route by content type', () => {
    render(
      <UsageList
        usages={[
          { contentType: 'page', id: 'p1', title: 'About', slug: 'about' },
          { contentType: 'article', id: 'a1', title: 'News', slug: 'news' },
        ]}
      />
    );

    const aboutLink = screen.getByRole('link', { name: /About/ });
    expect(aboutLink).toHaveAttribute('href', '/pages/p1/edit');
    const newsLink = screen.getByRole('link', { name: /News/ });
    expect(newsLink).toHaveAttribute('href', '/articles/a1/edit');
  });

  it('renders nothing (an empty list) when there are no usages', () => {
    render(<UsageList usages={[]} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
