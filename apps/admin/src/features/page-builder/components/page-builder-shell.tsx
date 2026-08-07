'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BlockEditorProvider,
  BlockCanvas,
  PropertyPanel,
  useEditorActions,
  useEditorBlocks,
  useEditorKeyboardShortcuts,
  runValidation,
} from '@/features/block-editor';
import { PAGE_ROUTES } from '@/constants/routes';
import { usePublishPage } from '@/features/pages/hooks/use-publish-page';
import type { Page } from '@/features/pages/types/page';
import { usePageBuilderBlocks, type SaveStatus } from '../hooks/use-page-builder-blocks';
import { useDevicePreview, DEVICE_CANVAS_WIDTHS } from '../hooks/use-device-preview';
import { TopBar } from './top-bar';
import { AddPanel } from './add-panel';
import { StructurePanel } from './structure-panel';
import { PageSettingsDrawer } from './page-settings-drawer';
import { PreviewDialog } from './preview-dialog';
import { CommandPalette, type Command } from './command-palette';

export interface PageBuilderShellProps {
  page: Page;
}

function isMac() {
  return typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
}

interface PageBuilderInnerProps {
  page: Page;
  saveStatus: SaveStatus;
  saveNow: () => void;
}

/** The inner shell — rendered inside `BlockEditorProvider`, so every
 * child here shares one editor store instance (selection, undo/redo,
 * clipboard) with the canvas and inspector, exactly like `<BlockEditor>`
 * itself, just laid out as top bar / left Add panel / center canvas /
 * right inspector / optional Structure panel instead of the fixed
 * toolbar-over-canvas-and-inspector grid. `saveStatus`/`saveNow` are
 * passed in from `PageBuilderShell` (not re-derived here) — there is
 * exactly one `usePageBuilderBlocks` call for the whole tree, since it
 * owns the single `blocks` state the Provider is hydrated from. */
function PageBuilderInner({ page, saveStatus, saveNow }: PageBuilderInnerProps) {
  const router = useRouter();
  const shortcutScopeRef = useEditorKeyboardShortcuts<HTMLDivElement>();
  const blocks = useEditorBlocks();
  const { selectBlock, insertBlock, undo, redo } = useEditorActions();
  const { device, setDevice } = useDevicePreview();
  const publishMutation = usePublishPage();

  const [structureOpen, setStructureOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const issues = runValidation(blocks);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isModifier = event.metaKey || event.ctrlKey;
      if (isModifier && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (event.key === 'Escape') {
        selectBlock(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectBlock]);

  function handlePublish() {
    publishMutation.mutate(page.id);
  }

  const modKey = isMac() ? 'Cmd' : 'Ctrl';
  const commands: Command[] = [
    {
      id: 'add-heading',
      label: 'Add Heading',
      run: () => insertBlock('heading', null, blocks.length),
    },
    {
      id: 'add-paragraph',
      label: 'Add Text',
      run: () => insertBlock('paragraph', null, blocks.length),
    },
    { id: 'add-image', label: 'Add Image', run: () => insertBlock('image', null, blocks.length) },
    {
      id: 'add-button',
      label: 'Add Button',
      run: () => insertBlock('button', null, blocks.length),
    },
    { id: 'undo', label: 'Undo', shortcut: `${modKey}+Z`, run: undo },
    { id: 'redo', label: 'Redo', shortcut: `${modKey}+Shift+Z`, run: redo },
    {
      id: 'structure',
      label: 'Toggle Structure panel',
      run: () => setStructureOpen((open) => !open),
    },
    { id: 'settings', label: 'Open Page Settings', run: () => setSettingsOpen(true) },
    { id: 'preview', label: 'Preview', run: () => setPreviewOpen(true) },
    { id: 'save', label: 'Save', shortcut: `${modKey}+S`, run: saveNow },
    ...(page.status !== 'PUBLISHED'
      ? [{ id: 'publish', label: 'Publish', run: handlePublish } satisfies Command]
      : []),
    {
      id: 'back',
      label: 'Back to page details',
      run: () => router.push(PAGE_ROUTES.detail(page.id)),
    },
  ];

  return (
    <div
      ref={shortcutScopeRef}
      className="flex h-screen flex-col"
      data-testid="page-builder-shell"
      onKeyDownCapture={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
          event.preventDefault();
          saveNow();
        }
      }}
    >
      <TopBar
        page={page}
        saveStatus={saveStatus}
        onSaveNow={saveNow}
        device={device}
        onDeviceChange={setDevice}
        structureOpen={structureOpen}
        onToggleStructure={() => setStructureOpen((open) => !open)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenPreview={() => setPreviewOpen(true)}
        onPublish={handlePublish}
        isPublishing={publishMutation.isPending}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr_320px]">
        <div className="overflow-y-auto border-r border-border">
          {structureOpen ? <StructurePanel /> : <AddPanel />}
        </div>

        <div className="overflow-y-auto bg-muted/20 p-4">
          <div
            className="mx-auto rounded-md border border-border bg-background transition-[width]"
            style={{ width: DEVICE_CANVAS_WIDTHS[device], maxWidth: '100%' }}
          >
            <BlockCanvas />
          </div>
          {issues.length > 0 ? (
            <div
              className="mx-auto mt-3 max-w-2xl rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive"
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

        <div className="overflow-y-auto border-l border-border">
          <PropertyPanel />
        </div>
      </div>

      <PageSettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} page={page} />
      <PreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} pageId={page.id} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} commands={commands} />
    </div>
  );
}

/**
 * Visual Page Builder shell (Milestone 7) — a visual orchestration layer
 * around the existing Block Editor, not a new editor. Same
 * `BlockEditorProvider` store `<BlockEditor>` itself uses; this only
 * arranges its pieces (`BlockCanvas`, `PropertyPanel`) into the
 * top-bar/add-panel/canvas/inspector/structure-panel layout the spec
 * calls for, and adds the genuinely new surface area: device preview,
 * autosave, Page Settings, the real-renderer Preview dialog, Publish,
 * and the command palette.
 *
 * `usePageBuilderBlocks` is called exactly once, here — it owns the
 * `blocks` state the Provider's `value` is hydrated from, so every store
 * mutation flows back through `onChange` into this one instance. Only
 * `saveStatus`/`saveNow` are threaded down into `PageBuilderInner`; there
 * is no second, competing hook instance anywhere in this tree.
 */
export function PageBuilderShell({ page }: PageBuilderShellProps) {
  const { blocks, setBlocks, status, saveNow } = usePageBuilderBlocks(page);
  return (
    <BlockEditorProvider value={blocks} onChange={setBlocks}>
      <PageBuilderInner page={page} saveStatus={status} saveNow={saveNow} />
    </BlockEditorProvider>
  );
}
