import { loadRenderContext } from '@/features/public/renderer/load-render-context';
import { loadHomeContent } from '@/features/public/resolver/load-home-content';
import { PublicLayout } from '@/features/public/components/public-layout';

/**
 * `force-dynamic` — Home fetches real, frequently-changing data (latest
 * articles). Without this, Next.js attempts to prerender `/` at *build*
 * time, which makes `next build` fail outright whenever the backend isn't
 * reachable during the build (verified: a build with the backend down
 * throws `PublicApiError`/`NETWORK_ERROR` and aborts) — a production build
 * should never depend on a live backend connection to succeed. The
 * `revalidate: 60` already set on every `fetch` call
 * (`public-fetch.service.ts`) still caches at the data layer per request.
 */
export const dynamic = 'force-dynamic';

/**
 * `/` — Home. Route → Resolver (`loadHomeContent`) → RenderContext →
 * Renderer (`HomeRenderer`, via `PublicLayout`) → HTML. No metadata export
 * here — `app/layout.tsx`'s `generateMetadata()` already sets the
 * site-wide default title/description/favicon Home just inherits.
 */
export default async function HomePage() {
  const context = await loadRenderContext(loadHomeContent());
  return <PublicLayout context={context} />;
}
