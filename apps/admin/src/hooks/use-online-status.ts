'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

/** Server snapshot is always "online" — avoids a hydration mismatch (SSR
 * has no `navigator`); the real value takes over immediately after
 * hydration via useSyncExternalStore's subscription, with no synchronous
 * setState-in-effect (see components/feedback/offline-banner.tsx). */
function getServerSnapshot(): boolean {
  return true;
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
