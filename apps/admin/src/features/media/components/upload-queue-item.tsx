'use client';

import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MediaThumbnail } from './media-thumbnail';
import { ParentFolderSelect } from './parent-folder-select';
import { formatFileSize } from '../utils/format-filesize';
import { TYPE_LABELS } from '../constants/media.constants';
import type { UploadQueueItem, UploadQueueItemStatus } from './upload-queue.types';

export interface UploadQueueItemCardProps {
  item: UploadQueueItem;
  onChange: (localId: string, patch: Partial<UploadQueueItem>) => void;
  onRemove: (localId: string) => void;
  onRetry: (localId: string) => void;
  onCancel: (localId: string) => void;
}

const IN_FLIGHT_STATUSES: UploadQueueItemStatus[] = [
  'requesting',
  'uploading',
  'confirming',
  'processing',
];
const EDITABLE_STATUSES: UploadQueueItemStatus[] = ['pending', 'error'];

/**
 * One queued file (Milestone 5 — real upload). No `storageKey` field
 * anymore — it's server-generated from the sanitized filename. `progress`
 * (real byte-level percentage from `XMLHttpRequest.upload.onprogress`)
 * renders during `uploading`. `previewUrl` (a local `URL.createObjectURL`)
 * remains a purely client-side pre-upload preview, unrelated to the real
 * transfer.
 */
export function UploadQueueItemCard({
  item,
  onChange,
  onRemove,
  onRetry,
  onCancel,
}: UploadQueueItemCardProps) {
  const isEditable = EDITABLE_STATUSES.includes(item.status);
  const isInFlight = IN_FLIGHT_STATUSES.includes(item.status);

  return (
    <div className="flex gap-4 rounded-md border border-border p-4">
      {item.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- local blob: preview only, never a remote/optimizable URL
        <img
          src={item.previewUrl}
          alt=""
          className="size-20 shrink-0 rounded-md border border-border object-cover"
        />
      ) : (
        <MediaThumbnail type={item.metadata.type} className="size-20 shrink-0" />
      )}

      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{item.metadata.filename}</p>
            <p className="text-xs text-muted-foreground">
              {TYPE_LABELS[item.metadata.type]} · {item.metadata.mimeType} ·{' '}
              {formatFileSize(item.metadata.filesize)}
              {item.metadata.width && item.metadata.height
                ? ` · ${item.metadata.width}×${item.metadata.height}`
                : ''}
              {item.metadata.duration ? ` · ${item.metadata.duration}s` : ''}
            </p>
          </div>
          <StatusIndicator item={item} />
        </div>

        {item.status === 'uploading' ? (
          <div
            role="progressbar"
            aria-valuenow={item.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Upload progress"
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor={`alt-text-${item.localId}`}>Alt text</Label>
            <Input
              id={`alt-text-${item.localId}`}
              value={item.altText}
              disabled={!isEditable}
              onChange={(event) => onChange(item.localId, { altText: event.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`credit-${item.localId}`}>Credit</Label>
            <Input
              id={`credit-${item.localId}`}
              value={item.credit}
              disabled={!isEditable}
              onChange={(event) => onChange(item.localId, { credit: event.target.value })}
            />
          </div>

          <div className="col-span-2 space-y-1">
            <Label htmlFor={`folder-${item.localId}`}>Folder</Label>
            <ParentFolderSelect
              id={`folder-${item.localId}`}
              value={item.folderId}
              onChange={(value) => onChange(item.localId, { folderId: value })}
              disabled={!isEditable}
            />
          </div>
        </div>

        {item.errorMessage ? <p className="text-sm text-destructive">{item.errorMessage}</p> : null}

        <div className="flex gap-2">
          {item.status === 'error' ? (
            <Button type="button" size="sm" variant="outline" onClick={() => onRetry(item.localId)}>
              Retry
            </Button>
          ) : null}
          {isInFlight ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onCancel(item.localId)}
            >
              Cancel
            </Button>
          ) : null}
          {!isInFlight ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => onRemove(item.localId)}>
              <X className="size-3.5" aria-hidden="true" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ item }: { item: UploadQueueItem }) {
  switch (item.status) {
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'requesting':
      return (
        <Badge variant="info" className="gap-1">
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          Preparing…
        </Badge>
      );
    case 'uploading':
      return (
        <Badge variant="info" className="gap-1">
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          Uploading {item.progress}%
        </Badge>
      );
    case 'confirming':
      return (
        <Badge variant="info" className="gap-1">
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          Confirming…
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="info" className="gap-1">
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          Processing…
        </Badge>
      );
    case 'success':
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="size-3" aria-hidden="true" />
          Uploaded
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="size-3" aria-hidden="true" />
          Failed
        </Badge>
      );
    case 'canceled':
      return <Badge variant="secondary">Canceled</Badge>;
    default:
      return null;
  }
}
