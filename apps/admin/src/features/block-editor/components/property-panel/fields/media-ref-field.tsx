'use client';

import { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaPickerDialog } from '@/features/media/components/media-picker-dialog';
import { MediaThumbnail } from '@/features/media/components/media-thumbnail';
import { useMedia } from '@/features/media/hooks/use-media';
import type { Media, MediaType } from '@/features/media/types/media';
import type { FieldProps } from './field.types';

/**
 * Opens the shared `MediaPickerDialog` in a Drawer (not a `<Select>`, since
 * the asset catalog can be large — this is exactly why the picker already
 * exists as a paginated/searchable Drawer, same reasoning
 * `reusable-block-ref-field.tsx` gives for reusing `<Select>` where a
 * combobox would've been reinvented). Reads `descriptor.mediaTypeFilter`
 * to restrict the picker (e.g. `image.mediaId` only offers `IMAGE`
 * assets). The Media Library is treated as a shared cross-cutting library
 * here, the same way this feature already depends on `@/components/ui/*` —
 * not a violation of "no coupling to Articles/Pages" (which is about
 * content-type features, not the underlying asset library).
 */
export function MediaRefField({ descriptor, value, onChange }: FieldProps) {
  const [open, setOpen] = useState(false);
  const mediaId = typeof value === 'string' && value.length > 0 ? value : undefined;
  const { data: selected, isLoading } = useMedia(mediaId ?? '');

  function handleSelect(media: Media) {
    onChange(media.id);
  }

  function handleClear() {
    onChange('');
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="h-auto w-full justify-start gap-3 py-2"
        onClick={() => setOpen(true)}
        aria-label={descriptor.label}
      >
        {mediaId && selected ? (
          <>
            <MediaThumbnail type={selected.type} className="size-10 shrink-0" />
            <span className="flex-1 truncate text-left text-sm">{selected.filename}</span>
          </>
        ) : mediaId && isLoading ? (
          <span className="flex-1 truncate text-left text-sm text-muted-foreground">Loading…</span>
        ) : (
          <>
            <ImageIcon className="size-5 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate text-left text-sm text-muted-foreground">
              Choose {descriptor.label.toLowerCase()}…
            </span>
          </>
        )}
      </Button>

      {mediaId ? (
        <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="gap-1.5">
          <X className="size-3.5" />
          Clear
        </Button>
      ) : null}

      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
        typeFilter={descriptor.mediaTypeFilter as MediaType | undefined}
        title={`Choose ${descriptor.label.toLowerCase()}`}
      />
    </div>
  );
}
