'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

/** docs/57_DESIGN_SYSTEM.md "Toast" — success/error/info variants,
 * auto-dismiss except error (requires manual dismissal so a failure is
 * never missed). Theme-aware via next-themes. */
export function ToastProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
      }}
    />
  );
}
