'use client';

import type { ReactNode } from 'react';
import { useLoadingStore } from '@/stores/loading-store';
import { cn } from '@/utils/cn';

/** Global Loader — a thin top-of-viewport progress bar, driven by
 * stores/loading-store.ts. docs/56_ADMIN_FRONTEND_ARCHITECTURE.md
 * "Loading" / Milestone-1 item 17 "Global loader". */
export function LoadingProvider({ children }: { children: ReactNode }) {
  const isLoading = useLoadingStore((state) => state.isLoading);

  return (
    <>
      <div
        role="progressbar"
        aria-hidden={!isLoading}
        className={cn(
          'fixed inset-x-0 top-0 z-[100] h-0.5 bg-primary transition-opacity duration-200',
          isLoading ? 'opacity-100 animate-pulse' : 'opacity-0'
        )}
      />
      {children}
    </>
  );
}
