'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BlockNode } from '@/features/block-editor';
import { useUpdatePage } from '@/features/pages/hooks/use-update-page';
import type { Page } from '@/features/pages/types/page';

const AUTOSAVE_DEBOUNCE_MS = 2000;

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

/** Mirrors `edit-page-page-content.tsx`'s `bodyToBlocks` exactly — same
 * "malformed/legacy body degrades to an empty list" convention. */
function bodyToBlocks(body: unknown): BlockNode[] {
  if (
    body &&
    typeof body === 'object' &&
    'blocks' in body &&
    Array.isArray((body as { blocks: unknown }).blocks)
  ) {
    return (body as { blocks: unknown[] }).blocks as BlockNode[];
  }
  return [];
}

/**
 * Owns the Page Builder's canvas content and its persistence — the one
 * piece of genuinely new state this milestone needed. Everything about
 * *editing* the tree (selection, undo/redo, clipboard) still lives in the
 * Block Editor's own store (`BlockEditorProvider`); this hook only owns
 * "what's the current `blocks` array, and when does it get PATCHed to
 * `/pages/:id`" — a debounced autosave (one call ~2s after the last
 * edit, not one call per keystroke/drag) plus an explicit `saveNow` for
 * the toolbar's Save button and for "flush before navigating away."
 * Reuses the existing `useUpdatePage` mutation — no competing
 * persistence mechanism, no second draft-storage system.
 */
export function usePageBuilderBlocks(page: Page) {
  const [blocks, setBlocksState] = useState<BlockNode[]>(() => bodyToBlocks(page.body));
  const [status, setStatus] = useState<SaveStatus>('idle');
  const updateMutation = useUpdatePage(page.id);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const saveNow = useCallback(() => {
    clearTimer();
    setStatus('saving');
    updateMutation.mutate(
      { body: { blocks: blocksRef.current } },
      {
        onSuccess: () => setStatus('saved'),
        onError: () => setStatus('error'),
      }
    );
  }, [clearTimer, updateMutation]);

  const setBlocks = useCallback(
    (next: BlockNode[]) => {
      setBlocksState(next);
      setStatus('unsaved');
      clearTimer();
      timerRef.current = setTimeout(saveNow, AUTOSAVE_DEBOUNCE_MS);
    },
    [clearTimer, saveNow]
  );

  // Flush a pending autosave on unmount (navigating away) rather than
  // dropping it — "no lost edits" is an explicit quality gate for this
  // milestone.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        updateMutation.mutate({ body: { blocks: blocksRef.current } });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flush-on-unmount only, deliberately not re-subscribing per render
  }, []);

  return { blocks, setBlocks, status, saveNow };
}
