'use client';

import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import type { Media } from '../types/media';

export interface CopyActionsProps {
  media: Pick<Media, 'id' | 'filename'>;
}

/**
 * "Copy URL" is deliberately not offered — `MediaResponseDto` has no URL
 * field at all (no upload/storage engine exists). Only Copy Filename/Copy
 * ID are real, since both fields genuinely exist on every asset.
 */
export function CopyActions({ media }: CopyActionsProps) {
  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  }

  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => copy(media.filename, 'Filename')}>
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
