'use client';

import { useEffect } from 'react';

/**
 * Native browser "Unsaved change warning" (build list item 12, distinct
 * from item 11's "dirty form detection", which only drives the in-app
 * cancel-confirmation dialog — see `CategorySettingsPageContent`). Guards
 * tab close / reload / outside-app navigation, which an in-app dialog can
 * never intercept. Pure client-side browser API — no route or backend
 * change involved.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}
