'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createEditorStore, type EditorStore } from '../state/create-editor-store';
import { areBlockListsEqual } from '../state/block-tree.util';
import type { BlockNode } from '../types/block.types';

const BlockEditorStoreContext = createContext<EditorStore | null>(null);

export interface BlockEditorProviderProps {
  value: BlockNode[];
  onChange: (blocks: BlockNode[]) => void;
  children: ReactNode;
}

/**
 * Instantiates one `EditorStore` per mount (via `useState`'s lazy
 * initializer, never a module-level singleton — see
 * `create-editor-store.ts`'s doc comment) and bridges it to a controlled
 * `value`/`onChange` pair, the same
 * contract `tag-multi-select.tsx` already establishes for a stateful
 * field RHF's `Controller` drives. Two directions of sync:
 *
 * 1. Internal edits (insert/update/move/undo/…) → `onChange(blocks)`,
 *    so the parent form's state (and eventually the backend) stays in
 *    sync with every edit.
 * 2. An external `value` change that did NOT originate from this
 *    editor's own last `onChange` call (e.g. the surrounding form loads
 *    a different article) → `hydrate`, which replaces the tree and
 *    resets undo/redo history. Reference-equality against the last
 *    emitted array is the fast path for distinguishing "the parent
 *    echoed our own change back" (skip) from "the parent gave us new
 *    data" (hydrate) — correct in the common case because `onChange`
 *    always hands out the store's own `history.present` array reference,
 *    and a well-behaved controlled parent (RHF's `Controller` included)
 *    round-trips that exact reference back as `field.value`.
 *
 *    That fast path alone is not enough to hydrate on, though: nothing
 *    guarantees every render hands back the *exact* same reference for
 *    unchanged content, and treating any reference change as "new data"
 *    reset the tree, which re-fired `onChange`, which produced another
 *    new-but-equal `value` on the next render — an infinite
 *    hydrate → setState → re-render → hydrate loop ("Maximum update
 *    depth exceeded"). `areBlockListsEqual` is the second gate: only a
 *    reference change AND a content change actually hydrates. `hydrate`
 *    itself (`create-editor-store.ts`) carries the same guard, so even a
 *    caller other than this effect can't reintroduce the loop.
 */
export function BlockEditorProvider({ value, onChange, children }: BlockEditorProviderProps) {
  const [store] = useState<EditorStore>(() => createEditorStore(value));
  const lastEmittedRef = useRef<BlockNode[]>(value);

  // Holds the latest `onChange` without making it an effect dependency —
  // avoids both a stale closure (if `onChange` isn't referentially
  // stable across renders) and unnecessary resubscribing on every render.
  // Updated in an effect (not during render) so reading/writing `.current`
  // never happens in the render phase.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (value === lastEmittedRef.current) return;

    const current = store.getState().history.present;
    if (value !== current && !areBlockListsEqual(value, current)) {
      store.getState().hydrate(value);
    }
    // Either way, this exact `value` reference has now been considered —
    // record it so an unchanged prop on a later render (a re-render that
    // doesn't touch `body` at all, for instance) takes the cheap
    // reference-equality skip above instead of re-running the content
    // check every time.
    lastEmittedRef.current = value;
  }, [value, store]);

  useEffect(() => {
    return store.subscribe((state, previousState) => {
      if (state.history.present !== previousState.history.present) {
        lastEmittedRef.current = state.history.present;
        onChangeRef.current(state.history.present);
      }
    });
  }, [store]);

  return (
    <BlockEditorStoreContext.Provider value={store}>{children}</BlockEditorStoreContext.Provider>
  );
}

export function useEditorStoreContext(): EditorStore {
  const store = useContext(BlockEditorStoreContext);
  if (!store) {
    throw new Error('useEditorStoreContext must be used within a <BlockEditorProvider>.');
  }
  return store;
}
