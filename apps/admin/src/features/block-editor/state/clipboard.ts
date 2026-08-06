import type { BlockNode } from '../types/block.types';
import type { ClipboardEntry } from '../types/editor.types';
import { cloneWithFreshIds } from '../utils/clone-with-fresh-ids';

/**
 * Internal, in-memory clipboard (source of truth) — not bridged to the OS
 * clipboard (see the plan's "Decisions" section: `navigator.clipboard`
 * needs permissions/HTTPS and adds flakiness for uncertain benefit; noted
 * as a possible future enhancement, not built now). Pure helpers, kept
 * separate from the Zustand store so copy/paste/duplicate logic is
 * independently testable.
 */
export function copyToClipboard(block: BlockNode): ClipboardEntry {
  return { block };
}

/** Always returns a fresh clone with regenerated ids — pasting the same
 * clipboard entry twice must never produce two blocks sharing an id. */
export function pasteFromClipboard(entry: ClipboardEntry): BlockNode {
  return cloneWithFreshIds(entry.block);
}

/** `duplicate` is "copy immediately followed by paste" as a single
 * action — same fresh-id guarantee, no intermediate clipboard write. */
export function duplicateBlock(block: BlockNode): BlockNode {
  return cloneWithFreshIds(block);
}
