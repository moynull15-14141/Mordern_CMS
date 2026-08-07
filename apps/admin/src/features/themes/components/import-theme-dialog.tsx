'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useCreateTheme } from '../hooks/use-create-theme';
import { parseThemeImport } from '../utils/theme-export';
import type { CreateThemeInput } from '../types/theme';

export interface ImportThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (created: { id: string }) => void;
}

/**
 * Theme import (Milestone 8 Phase 12) — reads the uploaded file entirely
 * client-side (`FileReader`, never sent anywhere raw), validates it with
 * `parseThemeImport`'s real schema, then calls the existing
 * `POST /themes` (`useCreateTheme`) with the parsed result — no separate
 * "import" endpoint, no bypassing the normal create validation/permission
 * path. Rejects the same way any other bad input does: an inline error,
 * never a silent partial import.
 */
export function ImportThemeDialog({ open, onOpenChange, onImported }: ImportThemeDialogProps) {
  const [parsed, setParsed] = useState<CreateThemeInput | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const createMutation = useCreateTheme();

  function handleFile(file: File) {
    setFileError(null);
    setParsed(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const result = parseThemeImport(text);
      if (!result.success) {
        setFileError(result.error);
        return;
      }
      setParsed(result.input);
    };
    reader.onerror = () => setFileError('Could not read this file.');
    reader.readAsText(file);
  }

  function handleImport() {
    if (!parsed) return;
    createMutation.mutate(parsed, {
      onSuccess: (created) => {
        setParsed(null);
        onOpenChange(false);
        onImported(created);
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setParsed(null);
          setFileError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import theme</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Choose a theme design-system file exported from this admin (or another site running this
          CMS). It becomes a new Draft theme — nothing is overwritten.
        </p>

        <Input
          type="file"
          accept="application/json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {fileError ? (
          <Alert variant="destructive">
            <AlertDescription>{fileError}</AlertDescription>
          </Alert>
        ) : null}

        {parsed ? (
          <Alert>
            <AlertDescription>Ready to import &quot;{parsed.name}&quot;.</AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!parsed || createMutation.isPending}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
