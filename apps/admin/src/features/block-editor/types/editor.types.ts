import type { BlockNode } from './block.types';

export interface ValidationIssue {
  blockId: string;
  path: string;
  message: string;
}

/** A pure function over the current tree — the "generic validation
 * pipeline" the brief asks for. Built-ins live in `validation/validators/`;
 * a future builder passes additional ones into `BlockEditor`'s
 * `extraValidators` prop without touching this feature's files. */
export type BlockTreeValidator = (blocks: BlockNode[]) => ValidationIssue[];

/** Snapshot-stack undo/redo — `present` is the live tree, `past`/`future`
 * are prior/undone snapshots. Simpler and provably correct at this scale
 * (backend caps trees at 500 blocks / depth 6) than per-field command
 * objects — see the plan's "Decisions" section. */
export interface HistoryState {
  past: BlockNode[][];
  present: BlockNode[];
  future: BlockNode[][];
}

/** What copy/duplicate puts on the (internal, not OS-bridged) clipboard —
 * a single block subtree, ready to be pasted with fresh ids. */
export interface ClipboardEntry {
  block: BlockNode;
}

export interface EditorSelectionState {
  selectedId: string | null;
  hoveredId: string | null;
}
