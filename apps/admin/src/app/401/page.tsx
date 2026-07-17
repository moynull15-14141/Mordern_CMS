import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

/** Unauthorized — a static informational page (not the actual redirect
 * target on session expiry, which goes straight to /login per
 * docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Authentication": "clear session,
 * redirect to /login"). Reserved for a future direct link/bookmark to a
 * since-expired session landing here instead of a raw 404. */
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <Lock className="size-12 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Session required</h1>
        <p className="text-sm text-muted-foreground">Please log in to continue.</p>
      </div>
      <Button asChild>
        <Link href={ROUTES.LOGIN}>Go to login</Link>
      </Button>
    </div>
  );
}
