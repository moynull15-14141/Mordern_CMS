import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadRenderContext } from './load-render-context';
import * as themeService from '../services/theme.service';
import * as navigationService from '../services/navigation.service';
import * as siteService from '../services/site.service';
import * as settingsService from '../services/settings.service';
import * as layoutResolveService from '../layout-engine/services/layout-resolve.service';

const noLayoutAssignment = { explicitLayoutPreset: null, contentDefaultLayoutPreset: null };

describe('loadRenderContext', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('assembles theme/menus/site/settings/content together, using site.locale', async () => {
    vi.spyOn(themeService, 'getActiveTheme').mockResolvedValue(null);
    vi.spyOn(navigationService, 'getMenuByLocation').mockResolvedValue(null);
    vi.spyOn(siteService, 'getCurrentSite').mockResolvedValue({
      name: 'SportingSpy',
      locale: 'fr',
      timezone: 'UTC',
      activeTheme: null,
    });
    vi.spyOn(settingsService, 'getPublicSettings').mockResolvedValue([]);

    const content = { type: 'not-found', path: '/x' } as const;
    const context = await loadRenderContext(content);

    expect(context.locale).toBe('fr');
    expect(context.site?.name).toBe('SportingSpy');
    expect(context.settings).toEqual([]);
    expect(context.content).toEqual(content);
  });

  it('falls back to DEFAULT_LOCALE when site is unavailable', async () => {
    vi.spyOn(themeService, 'getActiveTheme').mockResolvedValue(null);
    vi.spyOn(navigationService, 'getMenuByLocation').mockResolvedValue(null);
    vi.spyOn(siteService, 'getCurrentSite').mockRejectedValue(new Error('network error'));
    vi.spyOn(settingsService, 'getPublicSettings').mockResolvedValue([]);

    const context = await loadRenderContext({ type: 'not-found', path: '/x' });

    expect(context.locale).toBe('en');
    expect(context.site).toBeNull();
  });

  it('resolves settings to null (not throwing) when the settings fetch fails', async () => {
    vi.spyOn(themeService, 'getActiveTheme').mockResolvedValue(null);
    vi.spyOn(navigationService, 'getMenuByLocation').mockResolvedValue(null);
    vi.spyOn(siteService, 'getCurrentSite').mockRejectedValue(new Error('network error'));
    vi.spyOn(settingsService, 'getPublicSettings').mockRejectedValue(new Error('network error'));

    const context = await loadRenderContext({ type: 'not-found', path: '/x' });
    expect(context.settings).toBeNull();
  });

  it('derives seo from content.seo when the content type carries one', async () => {
    vi.spyOn(themeService, 'getActiveTheme').mockResolvedValue(null);
    vi.spyOn(navigationService, 'getMenuByLocation').mockResolvedValue(null);
    vi.spyOn(siteService, 'getCurrentSite').mockResolvedValue({
      name: 'SportingSpy',
      locale: 'en',
      timezone: 'UTC',
      activeTheme: null,
    });
    vi.spyOn(settingsService, 'getPublicSettings').mockResolvedValue([]);
    vi.spyOn(layoutResolveService, 'getLayoutResolution').mockResolvedValue(noLayoutAssignment);

    const context = await loadRenderContext({
      type: 'page',
      title: 'About',
      slug: 'about-us',
      body: {},
      publishedAt: null,
      seo: { title: 'About Us | SEO' },
    });

    expect(context.seo).toEqual({ title: 'About Us | SEO' });
  });

  it('resolves seo to null for a content type with no seo field (home)', async () => {
    vi.spyOn(themeService, 'getActiveTheme').mockResolvedValue(null);
    vi.spyOn(navigationService, 'getMenuByLocation').mockResolvedValue(null);
    vi.spyOn(siteService, 'getCurrentSite').mockResolvedValue({
      name: 'SportingSpy',
      locale: 'en',
      timezone: 'UTC',
      activeTheme: null,
    });
    vi.spyOn(settingsService, 'getPublicSettings').mockResolvedValue([]);
    vi.spyOn(layoutResolveService, 'getLayoutResolution').mockResolvedValue(noLayoutAssignment);

    const context = await loadRenderContext({
      type: 'home',
      latestArticles: [],
      featuredArticles: [],
      categories: [],
    });

    expect(context.seo).toBeNull();
  });

  it('assembles context.layout via the LayoutResolver, using the explicit-tier preset when one is returned', async () => {
    vi.spyOn(themeService, 'getActiveTheme').mockResolvedValue(null);
    vi.spyOn(navigationService, 'getMenuByLocation').mockResolvedValue(null);
    vi.spyOn(siteService, 'getCurrentSite').mockRejectedValue(new Error('network error'));
    vi.spyOn(settingsService, 'getPublicSettings').mockResolvedValue([]);
    vi.spyOn(layoutResolveService, 'getLayoutResolution').mockResolvedValue({
      explicitLayoutPreset: 'sidebar-left',
      contentDefaultLayoutPreset: null,
    });

    const context = await loadRenderContext({
      type: 'page',
      title: 'About',
      slug: 'about-us',
      body: {},
      publishedAt: null,
      seo: null,
    });

    expect(context.layout).toEqual({ preset: 'sidebar-left', source: 'explicit' });
  });

  it('assembles context.layout as system-default for content types with no addressable target (not-found), without any network call', async () => {
    vi.spyOn(themeService, 'getActiveTheme').mockResolvedValue(null);
    vi.spyOn(navigationService, 'getMenuByLocation').mockResolvedValue(null);
    vi.spyOn(siteService, 'getCurrentSite').mockRejectedValue(new Error('network error'));
    vi.spyOn(settingsService, 'getPublicSettings').mockResolvedValue([]);
    const layoutResolutionSpy = vi.spyOn(layoutResolveService, 'getLayoutResolution');

    const context = await loadRenderContext({ type: 'not-found', path: '/x' });

    expect(context.layout).toEqual({ preset: 'default', source: 'system-default' });
    expect(layoutResolutionSpy).not.toHaveBeenCalled();
  });
});
