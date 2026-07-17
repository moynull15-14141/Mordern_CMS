'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

/** Offline handling — docs item 16 "Error Handling: Offline". A persistent
 * banner (not a full-page takeover) since losing connectivity mid-session
 * shouldn't discard whatever the user was looking at. */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm font-medium text-warning-foreground"
    >
      <WifiOff className="size-4" aria-hidden="true" />
      You&apos;re offline. Some features may not work until your connection is restored.
    </div>
  );
}
