import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar, StatusBadge, type User } from '@/features/users';

export interface ProfileCardProps {
  user: User;
  onRemoveAvatar?: () => void;
  isRemovingAvatar?: boolean;
}

/** Current-user profile summary — `GET /users/me`. Reuses `UserAvatar`
 * (initials-only, no upload — approved decision 3) and `StatusBadge` from
 * the Users feature rather than duplicating them. */
export function ProfileCard({ user, onRemoveAvatar, isRemovingAvatar }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <UserAvatar displayName={user.displayName} email={user.email} className="size-16 text-lg" />
        <div className="space-y-1">
          <CardTitle>{user.displayName ?? user.username ?? user.email}</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <StatusBadge status={user.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Username</dt>
            <dd>{user.username ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Last login</dt>
            <dd>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</dd>
          </div>
          {user.profile?.phone ? (
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{user.profile.phone}</dd>
            </div>
          ) : null}
          {user.profile?.website ? (
            <div>
              <dt className="text-muted-foreground">Website</dt>
              <dd>{user.profile.website}</dd>
            </div>
          ) : null}
          {user.profile?.city || user.profile?.country ? (
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd>{[user.profile?.city, user.profile?.country].filter(Boolean).join(', ')}</dd>
            </div>
          ) : null}
        </dl>
        {user.profile?.bio ? <p className="text-sm">{user.profile.bio}</p> : null}

        {onRemoveAvatar ? (
          <Button variant="outline" size="sm" onClick={onRemoveAvatar} isLoading={isRemovingAvatar}>
            Remove avatar
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
