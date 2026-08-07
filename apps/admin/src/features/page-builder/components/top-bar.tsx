'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ListTree,
  Monitor,
  Redo2,
  Settings,
  Smartphone,
  Tablet,
  Undo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { PAGE_ROUTES } from '@/constants/routes';
import { useCanRedo, useCanUndo, useEditorActions } from '@/features/block-editor';
import type { Page } from '@/features/pages/types/page';
import type { DeviceMode } from '../hooks/use-device-preview';
import type { SaveStatus } from '../hooks/use-page-builder-blocks';

const SAVE_STATUS_LABEL: Record<SaveStatus, string> = {
  idle: '',
  unsaved: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Save failed',
};

export interface TopBarProps {
  page: Page;
  saveStatus: SaveStatus;
  onSaveNow: () => void;
  device: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
  structureOpen: boolean;
  onToggleStructure: () => void;
  onOpenSettings: () => void;
  onOpenPreview: () => void;
  onPublish: () => void;
  isPublishing: boolean;
}

/**
 * The Page Builder's top bar (spec Phase 1) — page name/back link, undo/
 * redo (the existing editor store's own history, nothing new), device
 * toggle, save status, Page Settings, Preview, Publish. Every action here
 * either reads the Block Editor's existing store (`useEditorActions`) or
 * calls a prop the shell (`page-builder-shell.tsx`) wires to the real
 * `useUpdatePage`/`usePublishPage`/preview-token mutations — this
 * component owns no persistence logic itself.
 */
export function TopBar({
  page,
  saveStatus,
  onSaveNow,
  device,
  onDeviceChange,
  structureOpen,
  onToggleStructure,
  onOpenSettings,
  onOpenPreview,
  onPublish,
  isPublishing,
}: TopBarProps) {
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const { undo, redo } = useEditorActions();

  return (
    <div
      className="flex items-center gap-2 border-b border-border px-3 py-2"
      role="toolbar"
      aria-label="Page Builder toolbar"
    >
      <Button variant="ghost" size="icon" aria-label="Back to page details" asChild>
        <Link href={PAGE_ROUTES.detail(page.id)}>
          <ArrowLeft className="size-4" />
        </Link>
      </Button>

      <span className="max-w-48 truncate text-sm font-medium">{page.title}</span>

      <div className="mx-1 h-5 w-px bg-border" role="separator" aria-orientation="vertical" />

      <Button variant="ghost" size="icon" aria-label="Undo" disabled={!canUndo} onClick={undo}>
        <Undo2 className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Redo" disabled={!canRedo} onClick={redo}>
        <Redo2 className="size-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-border" role="separator" aria-orientation="vertical" />

      <div className="flex items-center gap-1" role="group" aria-label="Preview device">
        <Button
          type="button"
          variant={device === 'desktop' ? 'secondary' : 'ghost'}
          size="icon"
          aria-label="Desktop"
          aria-pressed={device === 'desktop'}
          onClick={() => onDeviceChange('desktop')}
        >
          <Monitor className="size-4" />
        </Button>
        <Button
          type="button"
          variant={device === 'tablet' ? 'secondary' : 'ghost'}
          size="icon"
          aria-label="Tablet"
          aria-pressed={device === 'tablet'}
          onClick={() => onDeviceChange('tablet')}
        >
          <Tablet className="size-4" />
        </Button>
        <Button
          type="button"
          variant={device === 'mobile' ? 'secondary' : 'ghost'}
          size="icon"
          aria-label="Mobile"
          aria-pressed={device === 'mobile'}
          onClick={() => onDeviceChange('mobile')}
        >
          <Smartphone className="size-4" />
        </Button>
      </div>

      <Button
        type="button"
        variant={structureOpen ? 'secondary' : 'ghost'}
        size="icon"
        aria-label="Structure"
        aria-pressed={structureOpen}
        onClick={onToggleStructure}
      >
        <ListTree className="size-4" />
      </Button>

      <div className="flex-1" />

      <span
        className="text-xs text-muted-foreground"
        role="status"
        aria-live="polite"
        data-testid="save-status"
      >
        {SAVE_STATUS_LABEL[saveStatus]}
      </span>
      {saveStatus === 'unsaved' || saveStatus === 'error' ? (
        <Button type="button" variant="outline" size="sm" onClick={onSaveNow}>
          Save
        </Button>
      ) : null}

      <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Page settings"
          onClick={onOpenSettings}
        >
          <Settings className="size-4" />
        </Button>
      </PermissionGate>

      <Button type="button" variant="outline" size="sm" onClick={onOpenPreview}>
        Preview
      </Button>

      {page.status !== 'PUBLISHED' ? (
        <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
          <Button type="button" size="sm" onClick={onPublish} disabled={isPublishing}>
            Publish
          </Button>
        </PermissionGate>
      ) : null}
    </div>
  );
}
