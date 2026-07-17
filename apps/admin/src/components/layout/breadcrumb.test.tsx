import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const usePathnameMock = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

import { Breadcrumb } from './breadcrumb';

describe('Breadcrumb', () => {
  it('renders nothing at the root path', () => {
    usePathnameMock.mockReturnValue('/');
    const { container } = render(<Breadcrumb />);
    expect(container).toBeEmptyDOMElement();
  });

  it('always renders a Dashboard root link when there are segments', () => {
    usePathnameMock.mockReturnValue('/articles');
    render(<Breadcrumb />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('resolves a known nav-manifest path to its label', () => {
    usePathnameMock.mockReturnValue('/articles');
    render(<Breadcrumb />);
    expect(screen.getByText('Articles')).toBeInTheDocument();
  });

  it('marks the last crumb as the current page (aria-current)', () => {
    usePathnameMock.mockReturnValue('/articles');
    render(<Breadcrumb />);
    expect(screen.getByText('Articles')).toHaveAttribute('aria-current', 'page');
  });

  it('falls back to the raw decoded path segment for an unknown route', () => {
    usePathnameMock.mockReturnValue('/articles/my-post-slug');
    render(<Breadcrumb />);
    expect(screen.getByText('my-post-slug')).toBeInTheDocument();
  });
});
