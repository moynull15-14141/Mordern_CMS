import type { ReactNode } from 'react';
import { APP_CONFIG } from '@/constants/app';

/** Authentication Layout — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Layout
 * System": "Centered card shell... no sidebar." */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 p-4">
      <span className="text-lg font-semibold">{APP_CONFIG.NAME}</span>
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
