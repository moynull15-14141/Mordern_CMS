'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { USER_ROUTES } from '@/constants/routes';
import { useUser } from '../hooks/use-user';
import { useDeleteUser } from '../hooks/use-delete-user';
import { useRestoreUser } from '../hooks/use-restore-user';
import { useResetPassword } from '../hooks/use-reset-password';
import { useUserSessions } from '../hooks/use-user-sessions';
import { useTerminateSession } from '../hooks/use-terminate-session';
import { useTerminateAllSessions } from '../hooks/use-terminate-all-sessions';
import { UserAvatar } from './user-avatar';
import { StatusBadge } from './status-badge';
import { SessionTable } from './session-table';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { ResetPasswordDialog } from './reset-password-dialog';
import type { UserSession } from '../types/user';

export interface UserDetailPageContentProps {
  userId: string;
}

/**
 * User Details — profile summary, basic information, status, sessions. No
 * "Roles"/"Permissions summary" section: `UserResponseDto` has no field
 * for either (docs/63_FRONTEND_USERS.md). "Activity" is a read-only
 * placeholder — no durable Audit persistence exists
 * (docs/52_BACKEND_FREEZE_REPORT.md "Known Limitations").
 */
export function UserDetailPageContent({ userId }: UserDetailPageContentProps) {
  const router = useRouter();
  const { data: targetUser, isLoading, error, refetch } = useUser(userId);
  const { data: sessions, isLoading: sessionsLoading, error: sessionsError, refetch: refetchSessions } =
    useUserSessions(userId);

  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();
  const resetPasswordMutation = useResetPassword(userId);
  const terminateSessionMutation = useTerminateSession(userId);
  const terminateAllMutation = useTerminateAllSessions(userId);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState<UserSession | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!targetUser) {
    return <EmptyState title="User not found" />;
  }

  const label = targetUser.displayName ?? targetUser.email;

  return (
    <div className="space-y-6">
      <PageHeader
        title={label}
        description={targetUser.email}
        actions={
          <div className="flex gap-2">
            {targetUser.deletedAt ? (
              <Button variant="outline" onClick={() => setRestoreOpen(true)}>
                Restore
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push(USER_ROUTES.edit(targetUser.id))}>
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setResetPasswordOpen(true)}>
                  Reset password
                </Button>
                <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                  Delete
                </Button>
              </>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <UserAvatar displayName={targetUser.displayName} email={targetUser.email} className="size-14" />
          <div className="space-y-1">
            <CardTitle>{label}</CardTitle>
            <StatusBadge status={targetUser.status} />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Username</dt>
              <dd>{targetUser.username ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last login</dt>
              <dd>{targetUser.lastLoginAt ? new Date(targetUser.lastLoginAt).toLocaleString() : 'Never'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(targetUser.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(targetUser.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sessions</CardTitle>
          {sessions && sessions.length > 0 ? (
            <Button variant="outline" size="sm" onClick={() => terminateAllMutation.mutate()}>
              Terminate all
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <SessionTable
            sessions={sessions ?? []}
            isLoading={sessionsLoading}
            error={sessionsError}
            onRetry={() => refetchSessions()}
            onTerminate={setSessionToTerminate}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Activity log not available"
            description="Durable activity history is not yet implemented on the backend."
          />
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        userLabel={label}
        onConfirm={() => deleteMutation.mutate(targetUser.id)}
      />
      <RestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        userLabel={label}
        onConfirm={() => restoreMutation.mutate(targetUser.id)}
      />
      <ResetPasswordDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
        userLabel={label}
        onSubmit={(input) => resetPasswordMutation.mutate(input, { onSuccess: () => setResetPasswordOpen(false) })}
        isSubmitting={resetPasswordMutation.isPending}
      />
      <ConfirmDialog
        open={Boolean(sessionToTerminate)}
        onOpenChange={(open) => !open && setSessionToTerminate(null)}
        title="Terminate session"
        description={`Terminate the session on "${sessionToTerminate?.deviceName ?? sessionToTerminate?.ipAddress ?? 'this device'}"?`}
        confirmLabel="Terminate"
        variant="destructive"
        onConfirm={() => {
          if (sessionToTerminate) terminateSessionMutation.mutate(sessionToTerminate.id);
        }}
      />
    </div>
  );
}
