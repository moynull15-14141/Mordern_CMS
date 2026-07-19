import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicLayout } from './public-layout';
import type { RenderContext } from '../types/render-context.types';

const context: RenderContext = {
  theme: {
    id: 't1',
    name: 'Default',
    slug: 'default',
    version: null,
    logo: null,
    favicon: null,
    colors: { primary: '#abcdef', secondary: null },
    typography: null,
    layout: {
      header: null,
      footer: null,
      containerWidth: '1100px',
      borderRadius: null,
      buttonStyle: null,
      homepage: null,
      blog: null,
    },
    customCss: null,
    customJs: null,
  },
  menus: { header: null, footer: null, secondary: null },
  site: null,
  settings: null,
  locale: 'en',
  seo: null,
  content: {
    type: 'page',
    title: 'Home',
    slug: 'home',
    body: {},
    publishedAt: null,
    seo: null,
  },
  layout: { preset: 'default', source: 'system-default' },
};

describe('PublicLayout', () => {
  it('applies theme CSS variables and renders the resolved content via PublicRenderer', () => {
    render(<PublicLayout context={context} />);

    const layout = screen.getByTestId('public-layout');
    expect(layout.style.getPropertyValue('--sportingspy-color-primary')).toBe('#abcdef');
    expect(layout.style.getPropertyValue('--sportingspy-container-width')).toBe('1100px');
    expect(screen.getByTestId('page-renderer')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
