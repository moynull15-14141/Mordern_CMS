import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavMenu } from './nav-menu';
import type { PublicMenuItem } from '../types/navigation.types';

function buildItem(overrides: Partial<PublicMenuItem> = {}): PublicMenuItem {
  return {
    id: 'item-1',
    label: 'Home',
    targetType: 'PAGE',
    url: null,
    resolvedUrl: '/',
    isExternal: false,
    targetSlug: null,
    openMode: 'SELF',
    icon: null,
    cssClass: null,
    children: [],
    ...overrides,
  };
}

describe('NavMenu', () => {
  it('returns null (renders nothing) for an empty item list', () => {
    const { container } = render(<NavMenu items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a link for each top-level item using resolvedUrl', () => {
    render(
      <NavMenu
        items={[
          buildItem({ id: '1', label: 'Home', resolvedUrl: '/' }),
          buildItem({ id: '2', label: 'Blog', resolvedUrl: '/blog' }),
        ]}
      />
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
  });

  it('opens external items in a new tab with rel=noopener noreferrer', () => {
    render(
      <NavMenu
        items={[
          buildItem({
            label: 'External',
            resolvedUrl: 'https://example.com',
            isExternal: true,
            openMode: 'BLANK',
          }),
        ]}
      />
    );
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not set target/rel for a SELF-opening item', () => {
    render(<NavMenu items={[buildItem({ label: 'Internal', openMode: 'SELF' })]} />);
    const link = screen.getByRole('link', { name: 'Internal' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('renders unlimited nested depth recursively', () => {
    const deepTree = buildItem({
      id: 'level-1',
      label: 'Level 1',
      children: [
        buildItem({
          id: 'level-2',
          label: 'Level 2',
          children: [
            buildItem({
              id: 'level-3',
              label: 'Level 3',
              children: [buildItem({ id: 'level-4', label: 'Level 4' })],
            }),
          ],
        }),
      ],
    });

    render(<NavMenu items={[deepTree]} />);

    expect(screen.getByRole('link', { name: 'Level 1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Level 2' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Level 3' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Level 4' })).toBeInTheDocument();
  });

  it('renders a dropdown indicator only for items with children', () => {
    render(
      <NavMenu
        items={[
          buildItem({ label: 'Parent', children: [buildItem({ id: 'child', label: 'Child' })] }),
          buildItem({ id: 'leaf', label: 'Leaf' }),
        ]}
      />
    );
    // "Parent" has a nested <ul role="menu">, "Leaf" does not.
    const parentLink = screen.getByRole('link', { name: /Parent/ });
    expect(parentLink.closest('li')!.querySelector('ul[role="menu"]')).not.toBeNull();
    const leafLink = screen.getByRole('link', { name: 'Leaf' });
    expect(leafLink.closest('li')!.querySelector('ul[role="menu"]')).toBeNull();
  });
});
