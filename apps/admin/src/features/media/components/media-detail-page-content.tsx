'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { PermissionGate } from '@/components/guards/permission-gate';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { PERMISSIONS } from '@/constants/permissions';
import { useMedia } from '../hooks/use-media';
import { useMediaUsages } from '../hooks/use-media-usages';
import { useMediaDuplicates } from '../hooks/use-media-duplicates';
import { useUpdateMedia } from '../hooks/use-update-media';
import { useRenameMedia } from '../hooks/use-rename-media';
import { useMoveMedia } from '../hooks/use-move-media';
import { useDeleteMedia } from '../hooks/use-delete-media';
import { useRestoreMedia } from '../hooks/use-restore-media';
import { MediaThumbnail } from './media-thumbnail';
import { StatusBadge } from './status-badge';
import { CopyActions } from './copy-actions';
import { EditMetadataDialog } from './edit-metadata-dialog';
import { RenameDialog } from './rename-dialog';
import { MoveMediaDialog } from './move-media-dialog';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { formatFileSize } from '../utils/format-filesize';
import { TYPE_LABELS } from '../constants/media.constants';

export interface MediaDetailPageContentProps {
  mediaId: string;
}

/**
 * Media Details — every field `MediaResponseDto` returns, plus real
 * derived actions (Edit metadata, Rename, Move, Delete/Restore, Copy
 * filename/id, usage info, possible duplicates). No preview and no
 * download action — `MediaResponseDto` has no URL field and no
 * download/streaming endpoint exists anywhere on the backend (the
 * `create-media-asset.dto.ts` comment: "NO upload engine" — the same
 * absence applies to the read direction). Metadata editing happens here,
 * inline — there is no separate `/media/[id]/edit` route.
 */
export function MediaDetailPageContent({ mediaId }: MediaDetailPageContentProps) {
  const { data: media, isLoading, error, refetch } = useMedia(mediaId);
  const { data: usages, isLoading: usagesLoading } = useMediaUsages(mediaId);
  const { data: duplicates } = useMediaDuplicates(mediaId);

  const updateMutation = useUpdateMedia(mediaId);
  const renameMutation = useRenameMedia(mediaId);
  const moveMutation = useMoveMedia(mediaId);
  const deleteMutation = useDeleteMedia();
  const restoreMutation = useRestoreMedia();

  const [editOpen, setEditOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!media) {
    return <EmptyState title="Media not found" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={media.filename}
        actions={
          <div className="flex flex-wrap gap-2">
            {media.deletedAt ? (
              <PermissionGate permissions={PERMISSIONS.MEDIA_DELETE}>
                <Button variant="outline" onClick={() => setRestoreOpen(true)}>
                  Restore
                </Button>
              </PermissionGate>
            ) : (
              <>
                <PermissionGate permissions={PERMISSIONS.MEDIA_UPLOAD}>
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    Edit metadata
                  </Button>
                  <Button variant="outline" onClick={() => setRenameOpen(true)}>
                    Rename
                  </Button>
                  <Button variant="outline" onClick={() => setMoveOpen(true)}>
                    Move
                  </Button>
                </PermissionGate>
                <PermissionGate permissions={PERMISSIONS.MEDIA_DELETE}>
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                    Delete
                  </Button>
                </PermissionGate>
              </>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <MediaThumbnail type={media.type} className="size-16 shrink-0" />
          <div className="space-y-1">
            <CardTitle>{media.filename}</CardTitle>
            <StatusBadge status={media.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No preview or download is available — the backend has no file-serving endpoint (metadata-only catalog).
          </p>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Type</dt>
              <dd>{TYPE_LABELS[media.type]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">MIME type</dt>
              <dd className="font-mono">{media.mimeType}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Storage key</dt>
              <dd className="break-all font-mono">{media.storageKey}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Size</dt>
              <dd>{formatFileSize(media.filesize)}</dd>
            </div>
            {media.width && media.height ? (
              <div>
                <dt className="text-muted-foreground">Dimensions</dt>
                <dd>
                  {media.width}×{media.height}
                </dd>
              </div>
            ) : null}
            {media.duration ? (
              <div>
                <dt className="text-muted-foreground">Duration</dt>
                <dd>{media.duration}s</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground">Uploaded by</dt>
              <dd className="font-mono">{media.uploadedBy}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(media.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(media.updatedAt).toLocaleString()}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Alt text</dt>
              <dd>{media.altText ?? '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Caption</dt>
              <dd>{media.caption ?? '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Credit</dt>
              <dd>{media.credit ?? '—'}</dd>
            </div>
          </dl>

          <CopyActions media={media} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage ({media.usageCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {usagesLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : !usages || usages.length === 0 ? (
            <EmptyState title="Not used anywhere" />
          ) : (
            <ul className="space-y-2 text-sm">
              {usages.map((usage) => (
                <li key={`${usage.source}-${usage.id}`} className="flex items-center justify-between border-b border-border pb-2">
                  <span>{usage.label}</span>
                  <span className="text-xs text-muted-foreground">{usage.source}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {duplicates && duplicates.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Possible duplicates</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {duplicates.map((duplicate) => (
                <li key={duplicate.id} className="flex items-center justify-between border-b border-border pb-2">
                  <span>{duplicate.filename}</span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(duplicate.filesize)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <EditMetadataDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        defaultValues={{
          altText: media.altText ?? '',
          caption: media.caption ?? '',
          credit: media.credit ?? '',
          status: media.status,
        }}
        onSubmit={(input) => updateMutation.mutate(input, { onSuccess: () => setEditOpen(false) })}
        isSubmitting={updateMutation.isPending}
      />
      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentFilename={media.filename}
        onSubmit={(input) => renameMutation.mutate(input, { onSuccess: () => setRenameOpen(false) })}
        isSubmitting={renameMutation.isPending}
      />
      <MoveMediaDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        currentFolderId={media.folderId}
        onSubmit={(input) => moveMutation.mutate(input, { onSuccess: () => setMoveOpen(false) })}
        isSubmitting={moveMutation.isPending}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        filename={media.filename}
        onConfirm={() => deleteMutation.mutate(media.id)}
      />
      <RestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        filename={media.filename}
        onConfirm={() => restoreMutation.mutate(media.id)}
      />
    </div>
  );
}
