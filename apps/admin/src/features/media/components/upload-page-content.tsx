'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { UploadDropzone } from './upload-dropzone';
import { UploadQueueItemCard } from './upload-queue-item';
import { useUploadMedia } from '../hooks/use-upload-media';
import { extractFileMetadata } from '../utils/extract-file-metadata';
import type { UploadQueueItem, UploadQueueItemStatus } from './upload-queue.types';

function makeLocalId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

const RESUBMITTABLE_STATUSES: UploadQueueItemStatus[] = ['pending', 'error'];

/**
 * Real presigned-direct-to-R2 upload flow (Milestone 5) — dropping/
 * selecting a file still extracts metadata client-side first
 * (`extractFileMetadata`, unchanged), but now actually transfers the
 * bytes: request a presigned URL → PUT directly to R2 (real progress via
 * `useUploadMedia`) → confirm → poll until the async processor finishes.
 * Reuses the existing `UploadDropzone` and queue-item shell — only the
 * transfer mechanism underneath is new.
 */
export function UploadPageContent() {
  const router = useRouter();
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const { uploadFile } = useUploadMedia();

  async function handleFilesSelected(files: File[]) {
    const newItems = await Promise.all(
      files.map(async (file): Promise<UploadQueueItem> => {
        const metadata = await extractFileMetadata(file);
        return {
          localId: makeLocalId(),
          file,
          previewUrl: metadata.type === 'IMAGE' ? URL.createObjectURL(file) : null,
          metadata,
          mediaAssetId: null,
          folderId: '',
          altText: '',
          caption: '',
          credit: '',
          status: 'pending',
          progress: 0,
          errorMessage: null,
          result: null,
          abortController: null,
        };
      })
    );
    setItems((prev) => [...prev, ...newItems]);
  }

  function updateItem(localId: string, patch: Partial<UploadQueueItem>) {
    setItems((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, ...patch } : item))
    );
  }

  function removeItem(localId: string) {
    setItems((prev) => {
      const target = prev.find((item) => item.localId === localId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.localId !== localId);
    });
  }

  async function submitItem(item: UploadQueueItem) {
    const controller = new AbortController();
    updateItem(item.localId, {
      status: 'requesting',
      progress: 0,
      errorMessage: null,
      abortController: controller,
    });

    try {
      const result = await uploadFile({
        input: {
          type: item.metadata.type,
          filename: item.metadata.filename,
          mimeType: item.metadata.mimeType,
          filesize: item.metadata.filesize,
          width: item.metadata.width,
          height: item.metadata.height,
          duration: item.metadata.duration,
          folderId: item.folderId || undefined,
        },
        file: item.file,
        metadataPatch: {
          altText: item.altText || undefined,
          caption: item.caption || undefined,
          credit: item.credit || undefined,
        },
        signal: controller.signal,
        onStatusChange: (status) => updateItem(item.localId, { status }),
        onProgress: (progress) => updateItem(item.localId, { progress }),
      });
      updateItem(item.localId, {
        status: result.status === 'FAILED' ? 'error' : 'success',
        result,
        mediaAssetId: result.id,
        abortController: null,
        errorMessage:
          result.status === 'FAILED'
            ? 'Processing failed — see the asset detail page for the reason.'
            : null,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        updateItem(item.localId, { status: 'canceled', abortController: null });
        return;
      }
      const message = isApiError(error) ? error.message : 'Upload failed. Please try again.';
      updateItem(item.localId, { status: 'error', errorMessage: message, abortController: null });
    }
  }

  function handleCancel(localId: string) {
    items.find((item) => item.localId === localId)?.abortController?.abort();
  }

  function handleRetry(localId: string) {
    const item = items.find((current) => current.localId === localId);
    if (item) void submitItem(item);
  }

  async function handleUploadAll() {
    const pending = items.filter((item) => RESUBMITTABLE_STATUSES.includes(item.status));
    await Promise.allSettled(pending.map((item) => submitItem(item)));
  }

  const pendingCount = items.filter((item) => RESUBMITTABLE_STATUSES.includes(item.status)).length;
  const isUploading = items.some((item) =>
    (['requesting', 'uploading', 'confirming', 'processing'] as UploadQueueItemStatus[]).includes(
      item.status
    )
  );
  const allDone =
    items.length > 0 && items.every((item) => item.status === 'success' || item.status === 'error');

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Upload media" />

      <UploadDropzone onFilesSelected={handleFilesSelected} disabled={isUploading} />

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <UploadQueueItemCard
              key={item.localId}
              item={item}
              onChange={updateItem}
              onRemove={removeItem}
              onRetry={handleRetry}
              onCancel={handleCancel}
            />
          ))}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleUploadAll}
              disabled={pendingCount === 0 || isUploading}
            >
              Upload {pendingCount} file{pendingCount === 1 ? '' : 's'}
            </Button>
            {allDone ? (
              <Button type="button" variant="outline" onClick={() => router.push(ROUTES.MEDIA)}>
                Done — go to library
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
