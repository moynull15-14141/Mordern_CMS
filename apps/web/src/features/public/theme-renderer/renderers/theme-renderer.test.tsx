import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeRenderer } from './theme-renderer';
import type { RenderContext } from '../../types/render-context.types';
import type { PublicTheme } from '../../types/theme.types';

const baseTheme: PublicTheme = {
  id: 't1',
  name: 'Classic',
  slug: 'classic',
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
};

function contextWith(overrides: Partial<RenderContext>): RenderContext {
  return {
    theme: baseTheme,
    menus: { header: null, footer: null, secondary: null },
    settings: [{ key: 'general.siteName', label: 'Site Name', value: 'SportingSpy' }],
    site: null,
    locale: 'en',
    seo: null,
    content: { type: 'page', title: 'Home', slug: 'home', body: {}, publishedAt: null, seo: null },
    layout: { preset: 'default', source: 'system-default' },
    ...overrides,
  };
}

/**
 * As of Milestone 14.1, `ThemeRenderer` never resolves a layout preset
 * itself (that's `LayoutResolver`'s job, tested in
 * `layout-engine/resolve-layout.test.ts`) — it only ever reads
 * `context.layout.preset`, already decided upstream. These tests verify
 * exactly that contract: slot assembly is unconditional, and the rendered
 * layout tracks `context.layout.preset` directly regardless of
 * `context.content.type`/`context.theme` — proving `ThemeRenderer` "never
 * knows Page/Article/Homepage/Category directly" (the milestone brief's
 * own rule).
 */
describe('ThemeRenderer', () => {
  it('always assembles header, content, and footer slots regardless of layout', () => {
    render(<ThemeRenderer context={contextWith({})} />);
    expect(screen.getByRole('link', { name: 'SportingSpy' })).toBeInTheDocument();
    expect(screen.getByTestId('page-renderer')).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`© ${new Date().getFullYear()} SportingSpy`))
    ).toBeInTheDocument();
  });

  it('renders the DefaultLayout for preset "default", regardless of content.type', () => {
    const { container } = render(
      <ThemeRenderer
        context={contextWith({ layout: { preset: 'default', source: 'system-default' } })}
      />
    );
    // BoxedLayout's distinguishing "card" wrapper must NOT appear.
    expect(container.querySelector('.shadow-sm')).toBeNull();
  });

  it('renders the BoxedLayout for preset "boxed", for a "home" content type', () => {
    const { container } = render(
      <ThemeRenderer
        context={contextWith({
          content: { type: 'home', latestArticles: [], featuredArticles: [], categories: [] },
          layout: { preset: 'boxed', source: 'theme-default' },
        })}
      />
    );
    expect(container.querySelector('.border.shadow-sm')).not.toBeNull();
  });

  it('renders the BoxedLayout for preset "boxed", for a "blog-list" content type — proving no content-type switch exists here', () => {
    const { container } = render(
      <ThemeRenderer
        context={contextWith({
          content: {
            type: 'blog-list',
            articles: [],
            pagination: { page: 1, limit: 10, total: 0, hasNext: false, hasPrevious: false },
            search: null,
            sortBy: 'publishedAt',
            sortOrder: 'desc',
          },
          layout: { preset: 'boxed', source: 'explicit' },
        })}
      />
    );
    expect(container.querySelector('.border.shadow-sm')).not.toBeNull();
  });

  it('falls back to the default layout when theme is null, still rendering all slots', () => {
    render(<ThemeRenderer context={contextWith({ theme: null, settings: null })} />);
    expect(screen.getByTestId('page-renderer')).toBeInTheDocument();
  });
});
