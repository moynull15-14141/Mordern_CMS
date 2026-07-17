import type { NextConfig } from 'next';

/** Frontend Milestone 1 — Core Foundation. No custom rewrites/redirects are
 * configured here (no invented API routes); the backend's frozen /api/v1
 * surface (docs/53_API_FREEZE.md) is called directly via the Axios client
 * in lib/api-client.ts using NEXT_PUBLIC_API_BASE_URL. */
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
