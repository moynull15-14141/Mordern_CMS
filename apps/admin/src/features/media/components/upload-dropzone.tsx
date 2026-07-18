'use client';

import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

/** Drag & drop + click-to-browse local file selection. Selecting files
 * here never transfers any bytes anywhere — it only queues them for the
 * metadata-registration flow (see docs/67_FRONTEND_MEDIA.md). */
export function UploadDropzone({ onFilesSelected, disabled }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    onFilesSelected(Array.from(fileList));
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        if (!disabled) handleFiles(event.dataTransfer.files);
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border p-10 text-center transition-colors',
        isDragOver && 'border-primary bg-accent',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary',
      )}
    >
      <UploadCloud className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">Drag & drop files here, or click to browse</p>
      <p className="text-xs text-muted-foreground">You can select multiple files at once.</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        disabled={disabled}
        className="sr-only"
        aria-label="Choose files"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}
