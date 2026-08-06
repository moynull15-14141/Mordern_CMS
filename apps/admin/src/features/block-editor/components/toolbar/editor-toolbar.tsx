'use client';

import { Clipboard, Copy, Plus, Redo2, Trash2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useCanRedo,
  useCanUndo,
  useEditorActions,
  useEditorBlocks,
  useHasClipboardEntry,
  useSelectedId,
} from '../../context/use-block-editor';
import { BlockTypePicker } from '../block-picker/block-type-picker';

/**
 * Generic toolbar — every action reads only from the editor context
 * (`useEditorActions`/selectors), never anything article/page-specific.
 * Copy/paste/duplicate/delete act on the current selection; paste always
 * inserts at the end of the top-level list (the keyboard-shortcut
 * equivalent, `use-editor-keyboard-shortcuts.ts`, does the same — a
 * precise "paste at cursor position" needs a canvas-level insertion
 * point this structured (non-WYSIWYG) editing surface doesn't have yet).
 */
export function EditorToolbar() {
  const blocks = useEditorBlocks();
  const selectedId = useSelectedId();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const hasClipboardEntry = useHasClipboardEntry();
  const {
    undo,
    redo,
    insertBlock,
    copyBlockById,
    pasteClipboard,
    duplicateBlockById,
    removeBlockById,
  } = useEditorActions();

  return (
    <div
      className="flex items-center gap-1 border-b border-border p-2"
      role="toolbar"
      aria-label="Block editor toolbar"
    >
      <BlockTypePicker
        trigger={
          <Button type="button" variant="outline" size="sm">
            <Plus className="size-4" />
            Add block
          </Button>
        }
        onSelect={(type) => insertBlock(type, null, blocks.length)}
      />

      <div className="mx-1 h-5 w-px bg-border" role="separator" aria-orientation="vertical" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Undo"
        disabled={!canUndo}
        onClick={undo}
      >
        <Undo2 className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Redo"
        disabled={!canRedo}
        onClick={redo}
      >
        <Redo2 className="size-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-border" role="separator" aria-orientation="vertical" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Copy selected block"
        disabled={!selectedId}
        onClick={() => selectedId && copyBlockById(selectedId)}
      >
        <Copy className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Paste"
        disabled={!hasClipboardEntry}
        onClick={() => pasteClipboard(null, blocks.length)}
      >
        <Clipboard className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Duplicate selected block"
        disabled={!selectedId}
        onClick={() => selectedId && duplicateBlockById(selectedId)}
      >
        <Copy className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Delete selected block"
        disabled={!selectedId}
        onClick={() => selectedId && removeBlockById(selectedId)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
