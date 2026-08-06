import { createStore } from 'zustand/vanilla';
import type { BlockNode, BlockNodeMeta } from '../types/block.types';
import type { ClipboardEntry, HistoryState } from '../types/editor.types';
import { getBlockDefinition } from '../registry/block-registry';
import { initHistory, pushHistory, redo as redoHistory, undo as undoHistory } from './history';
import { copyToClipboard, duplicateBlock, pasteFromClipboard } from './clipboard';
import {
  areBlockListsEqual,
  findBlock,
  findParentId,
  insertBlock,
  moveBlock,
  removeBlock,
  updateBlock,
} from './block-tree.util';
import { generateId } from '../utils/clone-with-fresh-ids';

export interface EditorStoreState {
  history: HistoryState;
  selectedId: string | null;
  hoveredId: string | null;
  clipboard: ClipboardEntry | null;

  /** Replaces the tree wholesale and resets undo/redo history — used only
   * when the controlled `value` prop changes from *outside* the editor
   * (e.g. switching which article is being edited). A normal in-editor
   * edit always goes through one of the actions below instead, which
   * push onto history rather than resetting it. */
  hydrate: (blocks: BlockNode[]) => void;

  insertBlock: (type: string, parentId: string | null, index: number) => string;
  updateBlockData: (id: string, data: Record<string, unknown>) => void;
  updateBlockMeta: (id: string, meta: BlockNodeMeta) => void;
  /** Replaces one block (wherever it is in the tree, including nested
   * inside a container) with a whole new node — used by "Convert to
   * reusable" (swaps a normal block for a `reusable-block` reference) and
   * "Detach copy" (swaps a reference for its resolved, freshly-cloned
   * content). A normal undo/redo-able tree op, same as every other action
   * here — the async network call (create/get the reusable block) always
   * happens in the calling component *before* this is invoked with the
   * result; the store itself stays synchronous. */
  replaceBlockById: (id: string, node: BlockNode) => void;
  removeBlockById: (id: string) => void;
  moveBlockTo: (id: string, parentId: string | null, index: number) => void;
  duplicateBlockById: (id: string) => void;
  copyBlockById: (id: string) => void;
  pasteClipboard: (parentId: string | null, index: number) => void;
  selectBlock: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
}

/**
 * A fresh store per editor mount — `context/block-editor-provider.tsx`
 * calls this once per `<BlockEditor>` instance and holds the result in a
 * React ref, never a module-level singleton. This is what lets two
 * editors (e.g. a Page editor and a future Homepage Builder) exist on
 * the same screen without their undo stacks/selection/clipboard bleeding
 * into each other — the standard Zustand+Next.js "store per provider"
 * pattern, not the more common single-global-store shape this codebase's
 * other Zustand stores (`ui-store.ts`, `modal-store.ts`) use, because
 * those are genuinely app-singleton (one sidebar, one modal stack) while
 * an editor instance is not.
 */
export function createEditorStore(initialBlocks: BlockNode[]) {
  return createStore<EditorStoreState>((set, get) => ({
    history: initHistory(initialBlocks),
    selectedId: null,
    hoveredId: null,
    clipboard: null,

    // Returning `state` unchanged (rather than a new object) when `blocks`
    // is already what we have is not just an optimization: Zustand's
    // `setState` skips the merge *and* the listener notification entirely
    // when the updater returns the exact same reference (`Object.is`
    // check in zustand/vanilla), so a no-op hydrate never fires the
    // store's `subscribe` callback in `block-editor-provider.tsx` — which
    // is what forwards to the parent's `onChange` and is the step that
    // closes the loop back to a new `value` prop.
    hydrate: (blocks) =>
      set((state) =>
        areBlockListsEqual(state.history.present, blocks)
          ? state
          : { history: initHistory(blocks), selectedId: null, hoveredId: null }
      ),

    insertBlock: (type, parentId, index) => {
      const definition = getBlockDefinition(type);
      const node: BlockNode = {
        id: generateId(),
        type,
        data: definition ? structuredClone(definition.defaultData) : {},
      };
      const { history } = get();
      set({
        history: pushHistory(history, insertBlock(history.present, node, parentId, index)),
        selectedId: node.id,
      });
      return node.id;
    },

    updateBlockData: (id, data) => {
      const { history } = get();
      set({
        history: pushHistory(
          history,
          updateBlock(history.present, id, (node) => ({ ...node, data }))
        ),
      });
    },

    updateBlockMeta: (id, meta) => {
      const { history } = get();
      set({
        history: pushHistory(
          history,
          updateBlock(history.present, id, (node) => ({ ...node, meta }))
        ),
      });
    },

    replaceBlockById: (id, node) => {
      const { history, selectedId } = get();
      set({
        history: pushHistory(
          history,
          updateBlock(history.present, id, () => node)
        ),
        selectedId: selectedId === id ? node.id : selectedId,
      });
    },

    removeBlockById: (id) => {
      const { history, selectedId } = get();
      set({
        history: pushHistory(history, removeBlock(history.present, id)),
        selectedId: selectedId === id ? null : selectedId,
      });
    },

    moveBlockTo: (id, parentId, index) => {
      const { history } = get();
      set({ history: pushHistory(history, moveBlock(history.present, id, parentId, index)) });
    },

    duplicateBlockById: (id) => {
      const { history } = get();
      const node = findBlock(history.present, id);
      if (!node) return;
      const parentId = findParentId(history.present, id);
      const siblings = parentId
        ? (findBlock(history.present, parentId)?.children ?? [])
        : history.present;
      const index = siblings.findIndex((sibling) => sibling.id === id);
      const clone = duplicateBlock(node);
      set({
        history: pushHistory(history, insertBlock(history.present, clone, parentId, index + 1)),
        selectedId: clone.id,
      });
    },

    copyBlockById: (id) => {
      const node = findBlock(get().history.present, id);
      if (!node) return;
      set({ clipboard: copyToClipboard(node) });
    },

    pasteClipboard: (parentId, index) => {
      const { clipboard, history } = get();
      if (!clipboard) return;
      const pasted = pasteFromClipboard(clipboard);
      set({
        history: pushHistory(history, insertBlock(history.present, pasted, parentId, index)),
        selectedId: pasted.id,
      });
    },

    selectBlock: (id) => set({ selectedId: id }),
    setHovered: (id) => set({ hoveredId: id }),

    undo: () => set((state) => ({ history: undoHistory(state.history) })),
    redo: () => set((state) => ({ history: redoHistory(state.history) })),
  }));
}

export type EditorStore = ReturnType<typeof createEditorStore>;
