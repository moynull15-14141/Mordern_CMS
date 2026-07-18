'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { isApiError } from '@/lib/api-error';
import { useProfile } from '../hooks/use-profile';
import { useUpdateProfile } from '../hooks/use-update-profile';
import { useUpdatePreferences } from '../hooks/use-update-preferences';
import { EditProfileForm } from './edit-profile-form';
import { PreferencesForm } from './preferences-form';

/** Two independent forms/mutations (profile metadata vs. preferences) —
 * `PATCH /users/me/profile` and `PATCH /users/me/preferences` are separate
 * endpoints; combining them into one submit would misrepresent a partial
 * failure as a full one. */
export function EditProfilePageContent() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const updatePreferencesMutation = useUpdatePreferences();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full max-w-lg" />
      </div>
    );
  }

  if (error || !profile) {
    return <ErrorState error={error} />;
  }

  const profileSubmitError = updateProfileMutation.isError
    ? isApiError(updateProfileMutation.error)
      ? updateProfileMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title="Edit profile" />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <EditProfileForm
            defaultValues={{
              firstName: profile.profile?.firstName ?? '',
              lastName: profile.profile?.lastName ?? '',
              bio: profile.profile?.bio ?? '',
              phone: profile.profile?.phone ?? '',
              website: profile.profile?.website ?? '',
              city: profile.profile?.city ?? '',
              country: profile.profile?.country ?? '',
            }}
            onSubmit={(values) => updateProfileMutation.mutate(values)}
            isSubmitting={updateProfileMutation.isPending}
            submitError={profileSubmitError}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <PreferencesForm
            defaultValues={{
              theme: profile.preferences?.theme ?? 'SYSTEM',
              notificationPreference: {
                email: profile.preferences?.notificationPreference?.email ?? true,
                inApp: profile.preferences?.notificationPreference?.inApp ?? true,
              },
            }}
            onSubmit={(values) => updatePreferencesMutation.mutate(values)}
            isSubmitting={updatePreferencesMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
