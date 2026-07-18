'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import type { UserSession } from '../types/user';

export interface SessionTableProps {
  sessions: UserSession[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onTerminate: (session: UserSession) => void;
}

/**
 * Admin-only session view (`GET /users/:id/sessions`) — no self-service
 * `/users/me/sessions` exists. No "current session" badge: neither the
 * login response nor `SessionResponseDto` carries any field that could
 * identify which row is the browser's own session — inventing one would
 * be fabricated data (see docs/63_FRONTEND_USERS.md "Sessions"). Not
 * paginated — a bounded, small per-user list (`53_API_FREEZE.md`).
 */
export function SessionTable({ sessions, isLoading, error, onRetry, onTerminate }: SessionTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (sessions.length === 0) {
    return <EmptyState title="No active sessions" description="This user has no active sessions." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Device</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>Last seen</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell>{session.deviceName ?? session.userAgent ?? 'Unknown device'}</TableCell>
            <TableCell>{session.ipAddress ?? '—'}</TableCell>
            <TableCell>{new Date(session.lastSeenAt).toLocaleString()}</TableCell>
            <TableCell>{new Date(session.expiresAt).toLocaleString()}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" onClick={() => onTerminate(session)}>
                Terminate
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
