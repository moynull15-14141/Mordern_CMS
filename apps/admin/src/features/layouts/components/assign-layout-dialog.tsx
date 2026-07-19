'use client';

import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LayoutSelect } from './layout-select';
import { AssignmentEntityPicker } from './assignment-entity-picker';
import { useAssignLayout } from '../hooks/use-assign-layout';
import type { AssignLayoutInput, LayoutAssignmentContentType } from '../types/layout-assignment';

export interface AssignLayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Preselect a layout (opened from that Layout's own Detail page "Assign
   * to…" action) — the Layout select is hidden when given. */
  layoutId?: string;
}

const FK_FIELD: Record<
  Exclude<LayoutAssignmentContentType, 'HOMEPAGE'>,
  keyof AssignLayoutInput
> = {
  PAGE: 'pageId',
  ARTICLE: 'articleId',
  CATEGORY: 'categoryId',
};

/**
 * Assign (or re-assign) a Layout to Homepage / a specific Page-Article-
 * Category / a content-type-wide default — `POST /layout-assignments`
 * (upsert). Two independent choices: which Layout, and which target;
 * `contentType: 'HOMEPAGE'` has no target to pick (exactly one per site).
 *
 * The stateful form itself lives in `AssignLayoutDialogForm`, mounted only
 * while `open` — a fresh instance every time the dialog opens, so its
 * `useState` initial values (`layoutId ?? ''`, etc.) are naturally correct
 * for a brand-new open/re-open without an effect resetting them (avoids
 * the "setState synchronously within an effect" anti-pattern for what is
 * really just "start this state fresh on mount").
 */
export function AssignLayoutDialog({ open, onOpenChange, layoutId }: AssignLayoutDialogProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full max-w-2xl gap-4">
        <DrawerHeader>
          <DrawerTitle>Assign layout</DrawerTitle>
        </DrawerHeader>

        {open ? (
          <AssignLayoutDialogForm layoutId={layoutId} onDone={() => onOpenChange(false)} />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function AssignLayoutDialogForm({ layoutId, onDone }: { layoutId?: string; onDone: () => void }) {
  const assignMutation = useAssignLayout();

  const [selectedLayoutId, setSelectedLayoutId] = useState(layoutId ?? '');
  const [contentType, setContentType] = useState<LayoutAssignmentContentType>('PAGE');
  const [isDefault, setIsDefault] = useState(false);
  const [entityId, setEntityId] = useState<string | undefined>();
  const [entityLabel, setEntityLabel] = useState<string | undefined>();

  function handleContentTypeChange(next: LayoutAssignmentContentType) {
    setContentType(next);
    setIsDefault(next === 'HOMEPAGE');
    setEntityId(undefined);
    setEntityLabel(undefined);
  }

  const canAssign =
    Boolean(selectedLayoutId) && (contentType === 'HOMEPAGE' || isDefault || Boolean(entityId));

  function handleAssign() {
    if (!canAssign) return;

    const input: AssignLayoutInput = {
      layoutId: selectedLayoutId,
      contentType,
      ...(contentType !== 'HOMEPAGE' && !isDefault && entityId
        ? { [FK_FIELD[contentType]]: entityId }
        : {}),
    };

    assignMutation.mutate(input, { onSuccess: onDone });
  }

  return (
    <>
      <div className="space-y-4">
        {layoutId ? null : (
          <div className="space-y-1">
            <Label>Layout</Label>
            <LayoutSelect value={selectedLayoutId} onChange={setSelectedLayoutId} />
          </div>
        )}

        <div className="space-y-1">
          <Label>Assign to</Label>
          <Tabs
            value={contentType}
            onValueChange={(v) => handleContentTypeChange(v as LayoutAssignmentContentType)}
          >
            <TabsList>
              <TabsTrigger value="HOMEPAGE">Homepage</TabsTrigger>
              <TabsTrigger value="PAGE">Page</TabsTrigger>
              <TabsTrigger value="ARTICLE">Article</TabsTrigger>
              <TabsTrigger value="CATEGORY">Category</TabsTrigger>
            </TabsList>

            <TabsContent value="HOMEPAGE" className="mt-3 text-sm text-muted-foreground">
              There is exactly one homepage per site — no item to choose.
            </TabsContent>

            {(['PAGE', 'ARTICLE', 'CATEGORY'] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-3 space-y-3">
                <Button
                  type="button"
                  variant={isDefault ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setIsDefault(true);
                    setEntityId(undefined);
                    setEntityLabel(undefined);
                  }}
                >
                  Use as the default for every {tab.toLowerCase()}
                </Button>

                {!isDefault && entityLabel ? (
                  <p className="text-sm">
                    Selected: <span className="font-medium">{entityLabel}</span>
                  </p>
                ) : null}

                {isDefault ? null : (
                  <AssignmentEntityPicker
                    contentType={tab}
                    onSelect={(id, label) => {
                      setIsDefault(false);
                      setEntityId(id);
                      setEntityLabel(label);
                    }}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={handleAssign} disabled={!canAssign || assignMutation.isPending}>
          Assign
        </Button>
      </div>
    </>
  );
}
