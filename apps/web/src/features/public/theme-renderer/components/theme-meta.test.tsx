import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeMeta } from './theme-meta';

describe('ThemeMeta', () => {
  it('renders only items with non-null/undefined content', () => {
    render(
      <ThemeMeta
        items={[
          { key: 'author', content: 'Jane Doe' },
          { key: 'date', content: null },
          { key: 'reading-time', content: undefined },
        ]}
      />
    );
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('renders nothing when every item is null/undefined', () => {
    const { container } = render(
      <ThemeMeta
        items={[
          { key: 'a', content: null },
          { key: 'b', content: undefined },
        ]}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a separator between visible items', () => {
    const { container } = render(
      <ThemeMeta
        items={[
          { key: 'a', content: 'First' },
          { key: 'b', content: 'Second' },
        ]}
      />
    );
    expect(container.textContent).toContain('·');
  });
});
