'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { UploadDropzone } from './upload-dropzone';
import { UploadQueueItemCard } from './upload-queue-item';
import { useCreateMedia } from '../hooks/use-create-media';
import { extractFileMetadata } from '../utils/extract-file-metadata';
import { createMediaAssetSchema } from '../schemas/create-media-asset.schema';
import type { UploadQueueItem } from './upload-queue.types';

function makeLocalId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/**
 * `POST /media` registers metadata only — no file-transfer/upload engine
 * exists on the backend (`create-media-asset.dto.ts`'s own comment: "NO
 * upload engine"). Drag & drop / click-to-browse here select LOCAL files
 * purely to auto-extract real metadata (filename/mimeType/filesize, plus
 * width/height for images and duration for video/audio, read entirely
 * client-side); nothing is transferred anywhere. `storageKey` — the one
 * field with no local source — must be entered manually, since the
 * backend assumes the file already exists at that path. There is no
 * "upload progress" percentage anywhere in this flow for the same reason;
 * each queued item's real status (pending → submitting → success/error)
 * is the honest substitute. See docs/67_FRONTEND_MEDIA.md.
 */
export function UploadPageContent() {
  const router = useRouter();
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const createMutation = useCreateMedia();

  async function handleFilesSelected(files: File[]) {
    const newItems = await Promise.all(
      files.map(async (file): Promise<UploadQueueItem> => {
        const metadata = await extractFileMetadata(file);
        return {
          localId: makeLocalId(),
          file,
          previewUrl: metadata.type === 'IMAGE' ? URL.createObjectURL(file) : null,
          metadata,
          storageKey: '',
          folderId: '',
          altText: '',
          caption: '',
          credit: '',
          status: 'pending',
          errorMessage: null,
          result: null,
          abortController: null,
        };
      }),
    );
    setItems((prev) => [...prev, ...newItems]);
  }

  function updateItem(localId: string, patch: Partial<UploadQueueItem>) {
    setItems((prev) => prev.map((item) => (item.localId === localId ? { ...item, ...patch } : item)));
  }

  function removeItem(localId: string) {
    setItems((prev) => {
      const target = prev.find((item) => item.localId === localId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.localId !== localId);
    });
  }

  async function submitItem(item: UploadQueueItem) {
    const parsed = createMediaAssetSchema.safeParse({
      type: item.metadata.type,
      storageKey: item.storageKey,
      mimeType: item.metadata.mimeType,
      filesize: item.metadata.filesize,
      width: item.metadata.width,
      height: item.metadata.height,
      duration: item.metadata.duration,
      altText: item.altText || undefined,
      caption: item.caption || undefined,
      credit: item.credit || undefined,
      filename: item.metadata.filename,
      folderId: item.folderId || undefined,
    });

    if (!parsed.success) {
      updateItem(item.localId, {
        status: 'error',
        errorMessage: parsed.error.issues[0]?.message ?? 'Invalid data.',
      });
      return;
    }

    const controller = new AbortController();
    updateItem(item.localId, { status: 'submitting', errorMessage: null, abortController: controller });

    try {
      const result = await createMutation.mutateAsync({ input: parsed.data, signal: controller.signal });
      updateItem(item.localId, { status: 'success', result, abortController: null });
    } catch (error) {
      if (controller.signal.aborted) {
        updateItem(item.localId, { status: 'canceled', abortController: null });
        return;
      }
      const message = isApiError(error) ? error.message : 'Registration failed. Please try again.';
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

  async function handleRegisterAll() {
    const pending = items.filter((item) => item.status === 'pending' || item.status === 'error');
    await Promise.allSettled(pending.map((item) => submitItem(item)));
  }

  const pendingCount = items.filter((item) => item.status === 'pending' || item.status === 'error').length;
  const isSubmitting = items.some((item) => item.status === 'submitting');
  const allDone = items.length > 0 && items.every((item) => item.status === 'success');

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Upload media" />

      <Alert>
        <AlertDescription>
          This registers metadata for a file that already exists in storage — the backend has no file-transfer
          engine, so nothing is actually uploaded here. Pick a file below to auto-fill its metadata, then enter the
          Storage key where it already lives before registering.
        </AlertDescription>
      </Alert>

      <UploadDropzone onFilesSelected={handleFilesSelected} disabled={isSubmitting} />

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
            <Button type="button" onClick={handleRegisterAll} disabled={pendingCount === 0 || isSubmitting}>
              Register {pendingCount} file{pendingCount === 1 ? '' : 's'}
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
