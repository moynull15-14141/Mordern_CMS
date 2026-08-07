'use client';

import { useEffect, useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { env } from '@/lib/env';
import { useCreatePagePreviewToken } from '@/features/pages/hooks/use-page-preview-token';
import { DEVICE_CANVAS_WIDTHS, type DeviceMode } from '../hooks/use-device-preview';

export interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
}

/**
 * Preview must "use the existing public rendering architecture. Do NOT
 * create a second preview renderer" (spec Phase 13) — this mints a
 * short-lived token (`POST /pages/:id/preview-token`) and points an
 * `<iframe>` at `apps/web`'s `/preview/pages/[token]` route, the exact
 * same iframe-to-the-real-renderer technique the Pattern Picker's Preview
 * button already established in Milestone 6. A fresh token is minted
 * every time this dialog opens — the current, possibly-unsaved-a-moment-
 * ago canvas content is whatever was last autosaved, since preview always
 * reads from the server, never from in-memory editor state.
 */
export function PreviewDialog({ open, onOpenChange, pageId }: PreviewDialogProps) {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const tokenMutation = useCreatePagePreviewToken();

  useEffect(() => {
    if (open) {
      tokenMutation.mutate(pageId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mint exactly once per dialog open, not on every mutation-object identity change
  }, [open, pageId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-full max-w-5xl flex-col gap-3">
        <DialogHeader className="flex-row items-center justify-between space-y-0">
          <DialogTitle>Preview</DialogTitle>
          <div className="flex items-center gap-1 pr-8" role="group" aria-label="Preview device">
            <Button
              type="button"
              variant={device === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              aria-label="Desktop"
              aria-pressed={device === 'desktop'}
              onClick={() => setDevice('desktop')}
            >
              <Monitor className="size-4" />
            </Button>
            <Button
              type="button"
              variant={device === 'tablet' ? 'secondary' : 'ghost'}
              size="icon"
              aria-label="Tablet"
              aria-pressed={device === 'tablet'}
              onClick={() => setDevice('tablet')}
            >
              <Tablet className="size-4" />
            </Button>
            <Button
              type="button"
              variant={device === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              aria-label="Mobile"
              aria-pressed={device === 'mobile'}
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 items-start justify-center overflow-auto rounded-md border border-border bg-muted/30 p-2">
          {tokenMutation.isPending ? (
            <Skeleton className="h-full w-full" />
          ) : tokenMutation.isError ? (
            <ErrorState error={tokenMutation.error} onRetry={() => tokenMutation.mutate(pageId)} />
          ) : tokenMutation.data ? (
            <iframe
              key={device}
              src={`${env.NEXT_PUBLIC_WEB_URL}/preview/pages/${tokenMutation.data.token}`}
              title="Page preview"
              className="h-full rounded-sm border border-border bg-background"
              style={{ width: DEVICE_CANVAS_WIDTHS[device], maxWidth: '100%' }}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
