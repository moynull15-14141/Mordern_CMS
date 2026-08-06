'use client';

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useEditorStoreContext } from './block-editor-provider';
import type { EditorStoreState } from '../state/create-editor-store';

export function useEditorBlocks() {
  const store = useEditorStoreContext();
  return useStore(store, (state) => state.history.present);
}

export function useSelectedId() {
  const store = useEditorStoreContext();
  return useStore(store, (state) => state.selectedId);
}

export function useHoveredId() {
  const store = useEditorStoreContext();
  return useStore(store, (state) => state.hoveredId);
}

export function useCanUndo() {
  const store = useEditorStoreContext();
  return useStore(store, (state) => state.history.past.length > 0);
}

export function useCanRedo() {
  const store = useEditorStoreContext();
  return useStore(store, (state) => state.history.future.length > 0);
}

export function useHasClipboardEntry() {
  const store = useEditorStoreContext();
  return useStore(store, (state) => state.clipboard !== null);
}

type EditorActions = Pick<
  EditorStoreState,
  | 'insertBlock'
  | 'updateBlockData'
  | 'updateBlockMeta'
  | 'replaceBlockById'
  | 'removeBlockById'
  | 'moveBlockTo'
  | 'duplicateBlockById'
  | 'copyBlockById'
  | 'pasteClipboard'
  | 'selectBlock'
  | 'setHovered'
  | 'undo'
  | 'redo'
>;

/** Actions are stable function references for the lifetime of the store
 * (defined once at creation), so this selector — combined with
 * `useShallow` — never causes a re-render on its own; it only re-renders
 * when a *different* store instance is provided. */
export function useEditorActions(): EditorActions {
  const store = useEditorStoreContext();
  return useStore(
    store,
    useShallow((state) => ({
      insertBlock: state.insertBlock,
      updateBlockData: state.updateBlockData,
      updateBlockMeta: state.updateBlockMeta,
      replaceBlockById: state.replaceBlockById,
      removeBlockById: state.removeBlockById,
      moveBlockTo: state.moveBlockTo,
      duplicateBlockById: state.duplicateBlockById,
      copyBlockById: state.copyBlockById,
      pasteClipboard: state.pasteClipboard,
      selectBlock: state.selectBlock,
      setHovered: state.setHovered,
      undo: state.undo,
      redo: state.redo,
    }))
  );
}
