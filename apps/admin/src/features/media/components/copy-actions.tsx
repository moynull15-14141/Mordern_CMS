'use client';

import { Copy, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { isApiError } from '@/lib/api-error';
import { mediaApi } from '../services/media.api';
import type { Media } from '../types/media';

export interface CopyActionsProps {
  media: Pick<Media, 'id' | 'filename'> & { urls?: Media['urls'] };
}

/**
 * "Copy URL" (Milestone 5) — uses `media.urls.original` when already
 * resolved (single-asset Detail page); falls back to
 * `GET /media/:id/signed-url` on demand for a list/grid row where a
 * PRIVATE asset's `urls.original` was deliberately omitted (avoid signing
 * 20–50 URLs per page load).
 */
export function CopyActions({ media }: CopyActionsProps) {
  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  }

  async function copyUrl() {
    if (media.urls?.original) {
      await copy(media.urls.original, 'URL');
      return;
    }
    try {
      const { url } = await mediaApi.getSignedUrl(media.id);
      await copy(url, 'URL');
    } catch (error) {
      toast.error(isApiError(error) ? error.message : 'Could not resolve a URL for this asset.');
    }
  }

  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" size="sm" onClick={copyUrl}>
        <LinkIcon className="size-3.5" aria-hidden="true" />
        Copy URL
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => copy(media.filename, 'Filename')}
      >
        <Copy className="size-3.5" aria-hidden="true" />
        Copy filename
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => copy(media.id, 'ID')}>
        <Copy className="size-3.5" aria-hidden="true" />
        Copy ID
      </Button>
    </div>
  );
}
