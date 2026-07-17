/**
 * Foundation only (Milestone 12) — pure interface, zero implementation,
 * zero DI binding, zero endpoint. The milestone brief's "Sitemap Support"
 * is explicitly "Backend helper only... No XML endpoint. Future
 * integration only" — this interface documents the shape a future
 * dedicated Sitemap module (`Sitemap`/`SitemapType`/`SitemapStatus`,
 * already frozen in `36_DATABASE_FREEZE.md`) would need from a `SeoMeta`
 * row, but nothing in this module constructs, returns, or persists one.
 */
export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}
