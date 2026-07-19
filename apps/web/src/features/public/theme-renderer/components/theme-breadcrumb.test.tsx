import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeBreadcrumb } from './theme-breadcrumb';

describe('ThemeBreadcrumb', () => {
  it('renders nothing for an empty item list', () => {
    const { container } = render(<ThemeBreadcrumb items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders earlier items as links and the last item as plain text with aria-current', () => {
    render(
      <ThemeBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: 'Article Title' },
        ]}
      />
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
    const current = screen.getByText('Article Title');
    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
  });
});
