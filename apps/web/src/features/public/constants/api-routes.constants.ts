/**
 * Path constants for the backend's real public route surface — verified
 * directly against `apps/backend/src/modules/**\/controllers/public-*.controller.ts`
 * (Milestones 13.2/13.2). Every entry here is a route that actually exists
 * and requires no authentication; nothing is invented (Rule Zero).
 * `PUBLIC_API_ROUTES` is the ONLY place a public path string is written —
 * every service imports from here rather than hand-writing a path.
 */
export const PUBLIC_API_ROUTES = {
  THEME: '/public/theme',
  MENU_BY_LOCATION: (location: string) => `/public/menus/${location}`,
  MENU_BY_SLUG: (slug: string) => `/public/menus/slug/${slug}`,
  PAGE_BY_SLUG: (slug: string) => `/public/pages/slug/${slug}`,
  ARTICLES: '/public/articles',
  ARTICLE_BY_SLUG: (slug: string) => `/public/articles/slug/${slug}`,
  CATEGORIES: '/public/categories',
  CATEGORY_BY_SLUG: (slug: string) => `/public/categories/slug/${slug}`,
  SETTINGS: '/public/settings',
  SITE: '/public/site',
  SEO: (entity: 'page' | 'article' | 'category', slug: string) => `/public/seo/${entity}/${slug}`,
  LAYOUT_RESOLVE: (contentType: 'home' | 'page' | 'article' | 'category', slug?: string) => {
    const params = new URLSearchParams({ contentType });
    if (slug) params.set('slug', slug);
    return `/public/layouts/resolve?${params.toString()}`;
  },
} as const;
