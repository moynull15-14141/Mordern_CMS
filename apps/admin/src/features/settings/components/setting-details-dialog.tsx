'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SettingValueDisplay } from './setting-value-display';
import { SETTING_CATEGORY_LABELS, SETTING_SOURCE_LABELS } from '../constants/settings.constants';
import type { Setting } from '../types/settings';

export interface SettingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: Setting | null;
}

/** Read-only "Setting Details" view (build list item 2) launched from the
 * overview table — no dedicated route exists for it since docs/56 freezes
 * only `/settings` and `/settings/[category]` (docs/64_FRONTEND_SETTINGS.md
 * "Conflicts Discovered"); a client-side dialog surfaces the same
 * information without inventing a third route. */
export function SettingDetailsDialog({ open, onOpenChange, setting }: SettingDetailsDialogProps) {
  if (!setting) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{setting.label}</DialogTitle>
          {setting.description ? <DialogDescription>{setting.description}</DialogDescription> : null}
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Key</dt>
          <dd className="font-mono">{setting.key}</dd>

          <dt className="text-muted-foreground">Category</dt>
          <dd>{SETTING_CATEGORY_LABELS[setting.category]}</dd>

          <dt className="text-muted-foreground">Type</dt>
          <dd>{setting.type}</dd>

          <dt className="text-muted-foreground">Value</dt>
          <dd>
            <SettingValueDisplay setting={setting} />
          </dd>

          <dt className="text-muted-foreground">Source</dt>
          <dd>{SETTING_SOURCE_LABELS[setting.source]}</dd>

          <dt className="text-muted-foreground">Flags</dt>
          <dd className="flex flex-wrap gap-1">
            {setting.isReadOnly ? <Badge variant="outline">Read-only</Badge> : null}
            {setting.isHidden ? <Badge variant="outline">Hidden</Badge> : null}
            {setting.isEncrypted ? <Badge variant="outline">Encrypted</Badge> : null}
            {!setting.isReadOnly && !setting.isHidden && !setting.isEncrypted ? (
              <span className="text-muted-foreground">None</span>
            ) : null}
          </dd>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
