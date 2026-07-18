'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ParentFolderSelect } from './parent-folder-select';
import type { MoveMediaAssetInput } from '../types/media';

export interface MoveMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFolderId: string | null;
  onSubmit: (input: MoveMediaAssetInput) => void;
  isSubmitting: boolean;
}

/** `POST /media/:id/move` — moves to a folder (`metadata.folderId`, no
 * real FK column exists on `MediaAsset`). */
export function MoveMediaDialog({ open, onOpenChange, currentFolderId, onSubmit, isSubmitting }: MoveMediaDialogProps) {
  const [folderId, setFolderId] = useState(currentFolderId ?? '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to folder</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <Label htmlFor="move-media-folder">Folder</Label>
          <ParentFolderSelect id="move-media-folder" value={folderId} onChange={setFolderId} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit({ folderId: folderId || null })} isLoading={isSubmitting}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
