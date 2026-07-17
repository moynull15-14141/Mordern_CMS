'use client';

import { User as UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { initials } from '@/utils/string';

/** Profile Summary — real session data only (from the already-fetched
 * GET /auth/me response via AuthProvider), never fabricated. */
export function ProfileSummaryCard() {
  const { user } = useAuth();

  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary text-base font-medium text-primary-foreground">
          {user?.displayName ? (
            initials(user.displayName)
          ) : (
            <UserIcon className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">
            {user?.displayName ?? user?.username ?? 'Welcome back'}
          </p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </CardContent>
    </Card>
  );
}
