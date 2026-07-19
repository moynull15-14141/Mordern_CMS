import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './header';
import type { PublicNavigationMenus } from '../types/render-context.types';

const emptyMenus: PublicNavigationMenus = { header: null, footer: null, secondary: null };

describe('Header', () => {
  it('renders the site name (from settings) linking to home when no logo is set', () => {
    render(
      <Header
        menus={emptyMenus}
        theme={null}
        settings={[{ key: 'general.siteName', label: 'Site Name', value: 'SportingSpy' }]}
      />
    );
    const homeLink = screen.getByRole('link', { name: 'SportingSpy' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders the theme logo image when present, instead of text', () => {
    render(
      <Header
        menus={emptyMenus}
        theme={{
          id: 't1',
          name: 'Classic',
          slug: 'classic',
          version: null,
          logo: 'https://example.com/logo.png',
          favicon: null,
          colors: { primary: null, secondary: null },
          typography: null,
          layout: {
            header: null,
            footer: null,
            containerWidth: null,
            borderRadius: null,
            buttonStyle: null,
            homepage: null,
            blog: null,
          },
          customCss: null,
          customJs: null,
        }}
        settings={null}
      />
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('renders header menu items when present', () => {
    render(
      <Header
        menus={{
          header: {
            id: 'm1',
            name: 'Header',
            slug: 'header-menu',
            location: 'header',
            items: [
              {
                id: 'i1',
                label: 'Blog',
                targetType: 'PAGE',
                url: null,
                resolvedUrl: '/blog',
                isExternal: false,
                targetSlug: null,
                openMode: 'SELF',
                icon: null,
                cssClass: null,
                children: [],
              },
            ],
          },
          footer: null,
          secondary: null,
        }}
        theme={null}
        settings={null}
      />
    );
    expect(screen.getAllByRole('link', { name: 'Blog' }).length).toBeGreaterThan(0);
  });

  it('renders a mobile menu disclosure', () => {
    render(<Header menus={emptyMenus} theme={null} settings={null} />);
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });
});
