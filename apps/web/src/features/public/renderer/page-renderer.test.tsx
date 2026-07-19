import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageRenderer } from './page-renderer';
import type { RenderContext } from '../types/render-context.types';

const baseContext: Omit<RenderContext, 'content'> = {
  theme: null,
  menus: { header: null, footer: null, secondary: null },
  site: null,
  settings: null,
  locale: 'en',
  seo: null,
  layout: { preset: 'default', source: 'system-default' },
};

describe('PageRenderer', () => {
  it('renders the page title', () => {
    render(
      <PageRenderer
        context={{
          ...baseContext,
          content: {
            type: 'page',
            title: 'About Us',
            slug: 'about-us',
            body: {},
            publishedAt: null,
            seo: null,
          },
        }}
      />
    );
    expect(screen.getByRole('heading', { name: 'About Us' })).toBeInTheDocument();
  });

  it('renders the SEO description as a subheading when present', () => {
    render(
      <PageRenderer
        context={{
          ...baseContext,
          content: {
            type: 'page',
            title: 'About Us',
            slug: 'about-us',
            body: {},
            publishedAt: null,
            seo: { description: 'Learn about us' },
          },
        }}
      />
    );
    expect(screen.getByText('Learn about us')).toBeInTheDocument();
  });

  it('never renders id/status (neither field exists on the public shape)', () => {
    render(
      <PageRenderer
        context={{
          ...baseContext,
          content: {
            type: 'page',
            title: 'About Us',
            slug: 'about-us',
            body: {},
            publishedAt: null,
            seo: null,
          },
        }}
      />
    );
    expect(screen.queryByText('PUBLISHED')).not.toBeInTheDocument();
  });
});
