import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeFooter } from './theme-footer';
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

describe('ThemeFooter', () => {
  it('renders the site name and tagline from settings', () => {
    render(
      <ThemeFooter
        menus={emptyMenus}
        theme={baseTheme}
        settings={[
          { key: 'general.siteName', label: 'Site Name', value: 'SportingSpy' },
          { key: 'general.siteTagline', label: 'Tagline', value: 'All the scores' },
        ]}
      />
    );
    expect(screen.getByText('SportingSpy')).toBeInTheDocument();
    expect(screen.getByText('All the scores')).toBeInTheDocument();
  });

  it('renders a copyright line with the current year when siteName is present', () => {
    render(
      <ThemeFooter
        menus={emptyMenus}
        theme={baseTheme}
        settings={[{ key: 'general.siteName', label: 'Site Name', value: 'SportingSpy' }]}
      />
    );
    expect(
      screen.getByText(new RegExp(`© ${new Date().getFullYear()} SportingSpy`))
    ).toBeInTheDocument();
  });

  it('renders nothing site-name-related when settings is null', () => {
    const { container } = render(
      <ThemeFooter menus={emptyMenus} theme={baseTheme} settings={null} />
    );
    expect(container.textContent).not.toContain('©');
  });

  it('renders footer menu items via NavMenu', () => {
    render(
      <ThemeFooter
        menus={{
          header: null,
          footer: {
            id: 'm2',
            name: 'Footer',
            slug: 'footer-menu',
            location: 'footer',
            items: [
              {
                id: 'i2',
                label: 'Privacy Policy',
                targetType: 'PAGE',
                url: null,
                resolvedUrl: '/page/privacy-policy',
                isExternal: false,
                targetSlug: null,
                openMode: 'SELF',
                icon: null,
                cssClass: null,
                children: [],
              },
            ],
          },
          secondary: null,
        }}
        theme={baseTheme}
        settings={null}
      />
    );
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/page/privacy-policy'
    );
  });

  it('applies sticky positioning when theme.layout.footer is "fixed"', () => {
    const { container } = render(
      <ThemeFooter
        menus={emptyMenus}
        theme={{ ...baseTheme, layout: { ...baseTheme.layout, footer: 'fixed' } }}
        settings={null}
      />
    );
    expect(container.querySelector('footer')).toHaveClass('sticky');
  });
});
