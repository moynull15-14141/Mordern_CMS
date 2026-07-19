import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicContentProvider } from './public-content-provider';
import { useTheme } from '../hooks/use-theme';
import { useNavigation } from '../hooks/use-navigation';
import { usePublicContent } from '../hooks/use-public-content';
import { useLayout } from '../layout-engine/layout-context';
import type { RenderContext } from '../types/render-context.types';

const context: RenderContext = {
  theme: {
    id: 't1',
    name: 'Default',
    slug: 'default',
    version: null,
    logo: null,
    favicon: null,
    colors: { primary: '#123456', secondary: null },
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
  },
  menus: {
    header: { id: 'm1', name: 'Header', slug: 'header-menu', location: 'header', items: [] },
    footer: null,
    secondary: null,
  },
  site: null,
  settings: null,
  locale: 'en',
  seo: null,
  content: { type: 'not-found', path: '/x' },
  layout: { preset: 'sidebar-left', source: 'explicit' },
};

function Consumer() {
  const { theme, cssVariables } = useTheme();
  const menus = useNavigation();
  const { locale } = usePublicContent();
  const layout = useLayout();
  return (
    <div>
      <span data-testid="theme-slug">{theme?.slug}</span>
      <span data-testid="css-var">{cssVariables['--sportingspy-color-primary']}</span>
      <span data-testid="header-menu">{menus.header?.name}</span>
      <span data-testid="locale">{locale}</span>
      <span data-testid="layout-preset">{layout.preset}</span>
    </div>
  );
}

describe('PublicContentProvider', () => {
  it('provides theme, menu, content-slice, and layout data to descendants via hooks', () => {
    render(
      <PublicContentProvider context={context}>
        <Consumer />
      </PublicContentProvider>
    );

    expect(screen.getByTestId('theme-slug')).toHaveTextContent('default');
    expect(screen.getByTestId('css-var')).toHaveTextContent('#123456');
    expect(screen.getByTestId('header-menu')).toHaveTextContent('Header');
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('layout-preset')).toHaveTextContent('sidebar-left');
  });

  it('throws a clear error when a hook is used outside its provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(/must be used within/);
    consoleError.mockRestore();
  });
});
