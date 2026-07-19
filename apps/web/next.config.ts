import type { NextConfig } from 'next';

/** Milestone 13.1 — Public Rendering Foundation. No custom rewrites/redirects
 * (no invented routes); the two real public endpoints
 * (`/public/theme`, `/public/menus/*`) are called directly via
 * `features/public/services` using `API_BASE_URL`. */
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
