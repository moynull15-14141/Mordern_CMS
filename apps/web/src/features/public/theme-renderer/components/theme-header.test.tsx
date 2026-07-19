import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeHeader } from './theme-header';
import type { PublicNavigationMenus } from '../../types/render-context.types';
import type { PublicTheme } from '../../types/theme.types';

const emptyMenus: PublicNavigationMenus = { header: null, footer: null, secondary: null };

const baseTheme: PublicTheme = {
  id: 't1',
  name: 'Classic',
  slug: 'classic',
  version: null,
  logo: null,
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
};

describe('ThemeHeader', () => {
  it('renders the site name from settings, linking home, when no logo is set', () => {
    render(
      <ThemeHeader
        menus={emptyMenus}
        theme={null}
        settings={[{ key: 'general.siteName', label: 'Site Name', value: 'SportingSpy' }]}
      />
    );
    expect(screen.getByRole('link', { name: 'SportingSpy' })).toHaveAttribute('href', '/');
  });

  it('falls back to the theme name when settings has no site name', () => {
    render(<ThemeHeader menus={emptyMenus} theme={baseTheme} settings={null} />);
    expect(screen.getByText('Classic')).toBeInTheDocument();
  });

  it('renders the theme logo image instead of text when present', () => {
    render(
      <ThemeHeader
        menus={emptyMenus}
        theme={{ ...baseTheme, logo: 'https://example.com/logo.png' }}
        settings={null}
      />
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('renders header menu items via NavMenu', () => {
    render(
      <ThemeHeader
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

  it('applies sticky positioning when theme.layout.header is "fixed"', () => {
    const { container } = render(
      <ThemeHeader
        menus={emptyMenus}
        theme={{ ...baseTheme, layout: { ...baseTheme.layout, header: 'fixed' } }}
        settings={null}
      />
    );
    expect(container.querySelector('header')).toHaveClass('sticky');
  });

  it('does not apply sticky positioning by default', () => {
    const { container } = render(
      <ThemeHeader menus={emptyMenus} theme={baseTheme} settings={null} />
    );
    expect(container.querySelector('header')).not.toHaveClass('sticky');
  });
});
