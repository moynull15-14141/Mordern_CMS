import type { ReactNode } from 'react';
import { GuestRoute } from '@/components/guards/guest-route';
import { AuthLayout } from '@/components/layout/auth-layout';
import { SuspenseBoundary } from '@/providers/suspense-boundary';

/** Authentication Layout route group — wraps (auth)/login and future
 * forgot-password/reset-password pages. GuestRoute reads useSearchParams()
 * (for the post-login redirect target), which Next.js's App Router
 * requires to sit inside a Suspense boundary for a statically-prerendered
 * page — without it, `next build` fails prerendering /login. */
export default function AuthRouteGroupLayout({ children }: { children: ReactNode }) {
  return (
    <SuspenseBoundary>
      <GuestRoute>
        <AuthLayout>{children}</AuthLayout>
      </GuestRoute>
    </SuspenseBoundary>
  );
}
