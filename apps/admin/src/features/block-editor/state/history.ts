import type { BlockNode } from '../types/block.types';
import type { HistoryState } from '../types/editor.types';

/**
 * Pure snapshot-stack undo/redo helpers — see the plan's "Decisions"
 * section for why a full-tree snapshot stack was chosen over per-field
 * command objects (simpler, provably correct, cheap at the backend's
 * 500-block/depth-6 cap).
 */
export function initHistory(initial: BlockNode[]): HistoryState {
  return { past: [], present: initial, future: [] };
}

/** Records `next` as the new present, pushing the current present onto
 * `past` and clearing `future` (a new edit after an undo discards the
 * redo branch — standard undo/redo semantics). */
export function pushHistory(state: HistoryState, next: BlockNode[]): HistoryState {
  return { past: [...state.past, state.present], present: next, future: [] };
}

export function undo(state: HistoryState): HistoryState {
  if (state.past.length === 0) return state;
  const previous = state.past[state.past.length - 1];
  return {
    past: state.past.slice(0, -1),
    present: previous,
    future: [state.present, ...state.future],
  };
}

export function redo(state: HistoryState): HistoryState {
  if (state.future.length === 0) return state;
  const [next, ...rest] = state.future;
  return { past: [...state.past, state.present], present: next, future: rest };
}

export function canUndo(state: HistoryState): boolean {
  return state.past.length > 0;
}

export function canRedo(state: HistoryState): boolean {
  return state.future.length > 0;
}
