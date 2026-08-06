'use client';

import { useEffect, useRef } from 'react';
import { useEditorActions, useHasClipboardEntry, useSelectedId } from '../context/use-block-editor';

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return EDITABLE_TAGS.has(target.tagName) || target.isContentEditable;
}

/**
 * Keyboard shortcuts scoped to the editor's own DOM subtree via the
 * returned ref — never a `document`-level listener, so they can never
 * fire while the user is, say, typing in the admin's global search or
 * another form on the page. Also backs off entirely when focus is on an
 * editable form control (the property panel's own text/textarea/select
 * inputs), so Ctrl+C / Delete / etc. keep their normal text-editing
 * meaning there instead of being hijacked by block-level shortcuts.
 *
 * | Shortcut | Action |
 * |---|---|
 * | Ctrl/Cmd+Z | Undo |
 * | Ctrl/Cmd+Shift+Z, Ctrl/Cmd+Y | Redo |
 * | Ctrl/Cmd+C | Copy the selected block |
 * | Ctrl/Cmd+V | Paste (appends at the end of the top-level list) |
 * | Ctrl/Cmd+D | Duplicate the selected block |
 * | Delete, Backspace | Delete the selected block |
 */
export function useEditorKeyboardShortcuts<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const selectedId = useSelectedId();
  const hasClipboardEntry = useHasClipboardEntry();
  const { undo, redo, copyBlockById, pasteClipboard, duplicateBlockById, removeBlockById } =
    useEditorActions();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;
      const isModifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (isModifier && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (isModifier && key === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      if (isModifier && key === 'c' && selectedId) {
        event.preventDefault();
        copyBlockById(selectedId);
        return;
      }
      if (isModifier && key === 'v' && hasClipboardEntry) {
        event.preventDefault();
        pasteClipboard(null, Number.MAX_SAFE_INTEGER);
        return;
      }
      if (isModifier && key === 'd' && selectedId) {
        event.preventDefault();
        duplicateBlockById(selectedId);
        return;
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
        event.preventDefault();
        removeBlockById(selectedId);
      }
    }

    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedId,
    hasClipboardEntry,
    undo,
    redo,
    copyBlockById,
    pasteClipboard,
    duplicateBlockById,
    removeBlockById,
  ]);

  return ref;
}
