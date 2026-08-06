'use client';

import type { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { listBlockDefinitions } from '../../registry/block-registry';
import type { BlockFamily } from '../../registry/block-definition.types';

const FAMILY_LABELS: Record<BlockFamily, string> = {
  leaf: 'Text',
  media: 'Media',
  rich: 'Rich content',
  action: 'Actions',
  container: 'Layout',
  reference: 'Reference',
};

const FAMILY_ORDER: BlockFamily[] = ['leaf', 'media', 'rich', 'action', 'container', 'reference'];

/**
 * The generic "Add block" menu — grouped by `BlockDefinition.family`,
 * entirely driven by `listBlockDefinitions()`. A future builder's
 * `registerBlockDefinition` call is enough for its block type to appear
 * here automatically, grouped correctly, no change to this file.
 */
export function BlockTypePicker({
  trigger,
  onSelect,
}: {
  trigger: ReactNode;
  onSelect: (type: string) => void;
}) {
  const definitions = listBlockDefinitions();
  const byFamily = FAMILY_ORDER.map((family) => ({
    family,
    items: definitions.filter((definition) => definition.family === family),
  })).filter((group) => group.items.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
        {byFamily.map((group, index) => (
          <div key={group.family}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuLabel>{FAMILY_LABELS[group.family]}</DropdownMenuLabel>
            {group.items.map((definition) => {
              const Icon = definition.icon;
              return (
                <DropdownMenuItem key={definition.type} onSelect={() => onSelect(definition.type)}>
                  <Icon className="size-4" aria-hidden="true" />
                  {definition.label}
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
