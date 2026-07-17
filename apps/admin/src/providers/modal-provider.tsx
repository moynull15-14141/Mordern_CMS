'use client';

import { Fragment, type ReactNode } from 'react';
import { useModalStore } from '@/stores/modal-store';

/**
 * Modal Provider — renders every entry in the imperative modal stack
 * (stores/modal-store.ts). A caller opens a modal via `useModal().open(id,
 * <SomeDialog .../>)` from anywhere (not just a route's own JSX tree),
 * useful for e.g. a confirm dialog triggered from a toast action. Distinct
 * from the plain `<Dialog>` component (components/ui/dialog.tsx), which
 * most feature code should prefer for co-located, route-local dialogs.
 */
export function ModalProvider({ children }: { children: ReactNode }) {
  const stack = useModalStore((state) => state.stack);

  return (
    <>
      {children}
      {stack.map((entry) => (
        <Fragment key={entry.id}>{entry.content}</Fragment>
      ))}
    </>
  );
}
