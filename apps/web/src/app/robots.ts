import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

/**
 * `/robots.txt` — Next.js's native file-convention route (no custom
 * route handler needed). Safe-by-default: only allows crawling when
 * `NODE_ENV === 'production'` AND the explicit `DISALLOW_ROBOTS` escape
 * hatch isn't set — a staging deployment (which still builds/runs with
 * `NODE_ENV=production`, same as prod, so `NODE_ENV` alone can't tell
 * them apart) sets `DISALLOW_ROBOTS=true` to block crawling without
 * risking an accidental block of the real production site. No domain is
 * hardcoded — `env.SITE_URL` is per-environment configuration.
 */
export default function robots(): MetadataRoute.Robots {
  const allowCrawling =
    process.env.NODE_ENV === 'production' && process.env.DISALLOW_ROBOTS !== 'true';

  if (!allowCrawling) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/preview/'] },
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  };
}
