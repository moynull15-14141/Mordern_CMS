'use client';

import { BlockEditorProvider } from '../context/block-editor-provider';
import { useEditorBlocks } from '../context/use-block-editor';
import { useEditorKeyboardShortcuts } from '../hooks/use-editor-keyboard-shortcuts';
import { runValidation } from '../validation/validation-pipeline';
import { EditorToolbar } from './toolbar/editor-toolbar';
import { BlockCanvas } from './canvas/block-canvas';
import { PropertyPanel } from './property-panel/property-panel';
import type { BlockNode } from '../types/block.types';
import type { BlockTreeValidator } from '../types/editor.types';

export interface BlockEditorProps {
  value: BlockNode[];
  onChange: (blocks: BlockNode[]) => void;
  /** Extra rules run alongside the built-in validation pipeline — a
   * future builder's own constraints, without editing this feature. */
  extraValidators?: BlockTreeValidator[];
}

function BlockEditorShell({ extraValidators }: { extraValidators?: BlockTreeValidator[] }) {
  const shortcutScopeRef = useEditorKeyboardShortcuts<HTMLDivElement>();
  const blocks = useEditorBlocks();
  const issues = runValidation(blocks, extraValidators);

  return (
    <div
      ref={shortcutScopeRef}
      className="rounded-md border border-border"
      data-testid="block-editor"
    >
      <EditorToolbar />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px]">
        <div className="min-h-40 border-b border-border md:border-b-0 md:border-r">
          <BlockCanvas />
        </div>
        <div>
          <PropertyPanel />
        </div>
      </div>
      {issues.length > 0 ? (
        <div
          className="border-t border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive"
          data-testid="validation-issues"
          role="alert"
        >
          <p className="mb-1 font-semibold">
            {issues.length} issue{issues.length === 1 ? '' : 's'} to resolve:
          </p>
          <ul className="space-y-0.5">
            {issues.slice(0, 5).map((issue, index) => (
              <li key={index}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The single public entry point every consumer — Articles, Pages, and
 * every future builder (Landing Pages, Homepage Builder, Theme Builder,
 * an AI Builder) — renders. A controlled `value`/`onChange` component,
 * the same contract `tag-multi-select.tsx` already establishes for a
 * stateful field RHF's `Controller` drives. Everything internal
 * (selection, undo/redo history, clipboard, drag state) lives in a fresh
 * per-mount store (`BlockEditorProvider`) — this component's own
 * responsibility is only: provide that store, wire keyboard shortcuts,
 * lay out toolbar/canvas/property-panel, and surface validation issues
 * inline. It has no knowledge of "article" or "page."
 */
export function BlockEditor({ value, onChange, extraValidators }: BlockEditorProps) {
  return (
    <BlockEditorProvider value={value} onChange={onChange}>
      <BlockEditorShell extraValidators={extraValidators} />
    </BlockEditorProvider>
  );
}
