'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createEditorStore, type EditorStore } from '../state/create-editor-store';
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
 *    emitted array is what distinguishes "the parent echoed our own
 *    change back" (skip) from "the parent gave us new data" (hydrate) —
 *    correct because `onChange` always hands out the store's own
 *    `history.present` array reference, and RHF's `Controller` always
 *    round-trips that exact reference back as `field.value`.
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
    const current = store.getState().history.present;
    if (value !== lastEmittedRef.current && value !== current) {
      store.getState().hydrate(value);
      lastEmittedRef.current = value;
    }
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
