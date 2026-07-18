'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MediaPickerDialog } from '@/features/media';

export interface FeaturedImageFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Wraps the reusable `MediaPickerDialog` (`features/media`, Frontend
 * Milestone 7) — replaces this milestone's own Frontend-Milestone-5
 * placeholder picker, which is now deleted. Restricted to `typeFilter="IMAGE"`
 * since a featured image is, by definition, an image. Shows the picked
 * asset's real filename now (the fuller `Media` object the shared picker
 * returns) instead of a raw id.
 */
export function FeaturedImageField({ value, onChange }: FeaturedImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
        {value ? 'Change image' : 'Choose image'}
      </Button>
      {value ? (
        <>
          <span className="font-mono text-xs text-muted-foreground">{selectedFilename ?? value}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange('');
              setSelectedFilename(null);
            }}
          >
            Clear
          </Button>
        </>
      ) : (
        <span className="text-sm text-muted-foreground">No image selected</span>
      )}

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(media) => {
          onChange(media.id);
          setSelectedFilename(media.filename);
        }}
        typeFilter="IMAGE"
        title="Choose featured image"
      />
    </div>
  );
}
