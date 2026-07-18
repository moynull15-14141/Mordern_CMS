'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { PROFILE_ROUTES } from '@/constants/routes';
import { useProfile } from '../hooks/use-profile';
import { useRemoveAvatar } from '../hooks/use-remove-avatar';
import { ProfileCard } from './profile-card';

/** Current user's own profile — `GET /users/me`. No Sessions section here:
 * `/users/me/sessions` doesn't exist (session management is admin-only,
 * `/users/:id/sessions` — docs/63_FRONTEND_USERS.md "Sessions"). */
export function ProfilePageContent() {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const removeAvatarMutation = useRemoveAvatar();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full max-w-lg" />
      </div>
    );
  }

  if (error || !profile) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader
        title="Profile"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={PROFILE_ROUTES.edit()}>Edit profile</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={PROFILE_ROUTES.changePassword()}>Change password</Link>
            </Button>
          </div>
        }
      />
      <ProfileCard
        user={profile}
        onRemoveAvatar={() => removeAvatarMutation.mutate()}
        isRemovingAvatar={removeAvatarMutation.isPending}
      />
    </div>
  );
}
