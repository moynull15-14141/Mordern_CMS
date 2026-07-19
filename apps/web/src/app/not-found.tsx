import { loadRenderContext } from '@/features/public/renderer/load-render-context';
import { PublicLayout } from '@/features/public/components/public-layout';

/**
 * Next.js's special `not-found.tsx` — the boundary every `notFound()` call
 * in `app/page/[slug]`/`app/blog/[slug]`/`app/category/[slug]` renders
 * (plus any truly unmatched URL). Still goes through the full pipeline —
 * theme/menus/site/settings are real, loaded exactly like every other
 * route — so a 404 still looks like this site, not a bare error page.
 * Next.js does not expose the unmatched pathname to this file, so
 * `content.path` is empty; `PublicNotFound` already renders a sensible
 * message either way.
 */
export default async function NotFoundPage() {
  const context = await loadRenderContext({ type: 'not-found', path: '' });
  return <PublicLayout context={context} />;
}
