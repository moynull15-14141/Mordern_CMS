import type { ReactNode } from 'react';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { PermissionProvider } from '@/providers/permission-provider';
import { SettingsProvider } from '@/providers/settings-provider';
import { ModalProvider } from '@/providers/modal-provider';
import { LoadingProvider } from '@/providers/loading-provider';
import { ErrorBoundary } from '@/providers/error-boundary';
import { ToastProvider } from '@/providers/toast-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * Composes every global provider into one — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md
 * "Layout System — Root Layout". Order matters: ErrorBoundary outermost
 * (catches errors from everything below it, including provider bootstrap
 * errors); ThemeProvider before ToastProvider (sonner needs the resolved
 * theme); QueryProvider before AuthProvider (AuthProvider uses
 * useQuery/useQueryClient); PermissionProvider after AuthProvider (reads
 * its data).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <PermissionProvider>
              <SettingsProvider>
                <LoadingProvider>
                  <ModalProvider>
                    <TooltipProvider>{children}</TooltipProvider>
                    <ToastProvider />
                  </ModalProvider>
                </LoadingProvider>
              </SettingsProvider>
            </PermissionProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
