import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveLayout } from './resolve-layout';
import * as layoutResolveService from './services/layout-resolve.service';
import type { PublicTheme } from '../types/theme.types';
import type { ResolvedPublicContent } from '../types/content.types';

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

const pageContent: ResolvedPublicContent = {
  type: 'page',
  title: 'About',
  slug: 'about-us',
  body: {},
  publishedAt: null,
  seo: null,
};

const homeContent: ResolvedPublicContent = {
  type: 'home',
  latestArticles: [],
  featuredArticles: [],
  categories: [],
};

const blogListContent: ResolvedPublicContent = {
  type: 'blog-list',
  articles: [],
  pagination: { page: 1, limit: 10, total: 0, hasNext: false, hasPrevious: false },
  search: null,
  sortBy: 'publishedAt',
  sortOrder: 'desc',
};

const notFoundContent: ResolvedPublicContent = { type: 'not-found', path: '/x' };

function mockResolution(
  explicitLayoutPreset: string | null,
  contentDefaultLayoutPreset: string | null
) {
  return vi
    .spyOn(layoutResolveService, 'getLayoutResolution')
    .mockResolvedValue({ explicitLayoutPreset, contentDefaultLayoutPreset });
}

describe('resolveLayout (LayoutResolver)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('tier 1: prefers the explicit-assignment preset when it is a known preset', async () => {
    mockResolution('sidebar-left', 'boxed');
    const result = await resolveLayout(pageContent, baseTheme);
    expect(result).toEqual({ preset: 'sidebar-left', source: 'explicit' });
  });

  it('tier 2: falls back to the content-default preset when no explicit assignment exists', async () => {
    mockResolution(null, 'boxed');
    const result = await resolveLayout(pageContent, baseTheme);
    expect(result).toEqual({ preset: 'boxed', source: 'content-default' });
  });

  it('tier 3: falls back to the real theme.layout field when neither backend tier has a result', async () => {
    mockResolution(null, null);
    const theme = { ...baseTheme, layout: { ...baseTheme.layout, homepage: 'centered' } };
    const result = await resolveLayout(homeContent, theme);
    expect(result).toEqual({ preset: 'centered', source: 'theme-default' });
  });

  it('tier 4: falls back to "default" when nothing else resolved', async () => {
    mockResolution(null, null);
    const result = await resolveLayout(pageContent, baseTheme);
    expect(result).toEqual({ preset: 'default', source: 'system-default' });
  });

  it('treats an unrecognized explicit-tier preset as "not fired", falling through to content-default', async () => {
    mockResolution('some-future-preset-not-yet-registered', 'boxed');
    const result = await resolveLayout(pageContent, baseTheme);
    expect(result).toEqual({ preset: 'boxed', source: 'content-default' });
  });

  it('never calls the backend for "blog-list" (no addressable LayoutAssignment content type exists for it)', async () => {
    const spy = mockResolution('boxed', null);
    const theme = { ...baseTheme, layout: { ...baseTheme.layout, blog: 'centered' } };
    const result = await resolveLayout(blogListContent, theme);
    expect(spy).not.toHaveBeenCalled();
    expect(result).toEqual({ preset: 'centered', source: 'theme-default' });
  });

  it('never calls the backend for "not-found"', async () => {
    const spy = mockResolution('boxed', null);
    const result = await resolveLayout(notFoundContent, baseTheme);
    expect(spy).not.toHaveBeenCalled();
    expect(result).toEqual({ preset: 'default', source: 'system-default' });
  });

  it('calls the backend with contentType "home" and no slug', async () => {
    const spy = mockResolution(null, null);
    await resolveLayout(homeContent, baseTheme);
    expect(spy).toHaveBeenCalledWith('home', undefined);
  });

  it('calls the backend with the real slug for "page"/"article"/"category"', async () => {
    const spy = mockResolution(null, null);
    await resolveLayout(pageContent, baseTheme);
    expect(spy).toHaveBeenCalledWith('page', 'about-us');
  });
});
