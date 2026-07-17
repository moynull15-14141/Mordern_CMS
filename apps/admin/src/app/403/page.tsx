import Link from 'next/link';
import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

/** Forbidden — reached via ProtectedRoute-adjacent guards when a route's
 * permission requirement isn't met (docs/60_ADMIN_NAVIGATION.md "Route
 * Guards": "redirect to /403 (an in-app 'Forbidden' page, NOT /login —
 * the user IS authenticated)"). docs item 16 "Error Handling: Unauthorized/
 * Forbidden" — this page is the Forbidden (403) case. */
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <Ban className="size-12 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">You don&apos;t have permission</h1>
        <p className="text-sm text-muted-foreground">
          Contact an administrator if you believe this is a mistake.
        </p>
      </div>
      <Button asChild>
        <Link href={ROUTES.DASHBOARD}>Back to dashboard</Link>
      </Button>
    </div>
  );
}
