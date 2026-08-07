'use client';

import { useState } from 'react';
import { Image as ImageIcon, LayoutTemplate, Blocks as BlocksIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/layout/search-input';
import { MediaPickerDialog } from '@/features/media';
import {
  useEditorActions,
  useEditorBlocks,
  listBlockDefinitions,
  PatternPickerDialog,
  ReusableBlockPickerDialog,
} from '@/features/block-editor';
import type { BlockFamily, BlockNode } from '@/features/block-editor';
import { SECTION_CATEGORIES } from '../constants/section-categories';

type AddTab = 'blocks' | 'sections' | 'patterns' | 'reusable' | 'media';

const TABS: { id: AddTab; label: string }[] = [
  { id: 'blocks', label: 'Blocks' },
  { id: 'sections', label: 'Sections' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'reusable', label: 'Reusable' },
  { id: 'media', label: 'Media' },
];

const FAMILY_LABELS: Record<BlockFamily, string> = {
  leaf: 'Text',
  media: 'Media',
  rich: 'Rich content',
  action: 'Actions',
  container: 'Layout',
  reference: 'Reference',
};

/**
 * The Page Builder's primary "Add" affordance (spec Phase 2) — five
 * clearly-labeled categories, each a thin front-end onto data/components
 * that already exist: Blocks reads the same block registry
 * `BlockTypePicker` does, Sections/Patterns both reuse `PatternPickerDialog`
 * (Sections is just that dialog pre-filtered to a common category chip),
 * Reusable reuses `ReusableBlockPickerDialog`, Media reuses
 * `MediaPickerDialog`. Nothing here fetches or renders content a second
 * time — this panel only decides *where* a freshly-chosen thing gets
 * inserted (always the end of the top-level canvas; per-block/per-container
 * insertion still happens via each row's own `AddBlockButton`, unchanged).
 */
export function AddPanel() {
  const [tab, setTab] = useState<AddTab>('blocks');
  const [search, setSearch] = useState('');
  const [sectionCategory, setSectionCategory] = useState<string | null>(null);
  const [patternPickerOpen, setPatternPickerOpen] = useState(false);
  const [reusablePickerOpen, setReusablePickerOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const blocks = useEditorBlocks();
  const { insertBlock, insertClonedNodes, updateBlockData } = useEditorActions();
  const insertIndex = blocks.length;

  const definitions = listBlockDefinitions().filter((definition) =>
    definition.label.toLowerCase().includes(search.toLowerCase())
  );
  const byFamily = (Object.keys(FAMILY_LABELS) as BlockFamily[])
    .map((family) => ({ family, items: definitions.filter((d) => d.family === family) }))
    .filter((group) => group.items.length > 0);

  function insertPattern(patternId: string, nodes: BlockNode[]) {
    const stamped: BlockNode[] = nodes.map((node) => ({
      ...node,
      meta: { ...node.meta, patternOrigin: { patternId } },
    }));
    insertClonedNodes(stamped, null, insertIndex);
  }

  return (
    <div className="flex h-full flex-col" data-testid="add-panel">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {TABS.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={tab === item.id ? 'secondary' : 'ghost'}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {tab === 'blocks' ? (
          <div className="space-y-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search blocks…" />
            {byFamily.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No blocks match “{search}”.
              </p>
            ) : (
              byFamily.map((group) => (
                <div key={group.family} className="space-y-1">
                  <p className="px-1 text-xs font-medium text-muted-foreground">
                    {FAMILY_LABELS[group.family]}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {group.items.map((definition) => {
                      const Icon = definition.icon;
                      return (
                        <Button
                          key={definition.type}
                          type="button"
                          variant="outline"
                          className="h-auto flex-col gap-1 py-3"
                          onClick={() => insertBlock(definition.type, null, insertIndex)}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                          <span className="text-xs">{definition.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}

        {tab === 'sections' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ready-made sections from your Pattern Library, grouped by common section type.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SECTION_CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer"
                  onClick={() => {
                    setSectionCategory(category);
                    setPatternPickerOpen(true);
                  }}
                >
                  {category}
                </Badge>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                setSectionCategory(null);
                setPatternPickerOpen(true);
              }}
            >
              <LayoutTemplate className="size-4" aria-hidden="true" />
              Browse all sections
            </Button>
          </div>
        ) : null}

        {tab === 'patterns' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Any saved pattern from your Pattern Library, inserted as an independent, editable
              copy.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                setSectionCategory(null);
                setPatternPickerOpen(true);
              }}
            >
              <LayoutTemplate className="size-4" aria-hidden="true" />
              Browse patterns
            </Button>
          </div>
        ) : null}

        {tab === 'reusable' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Content that stays in sync everywhere it&apos;s used — edit it once in Reusable
              Blocks.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setReusablePickerOpen(true)}
            >
              <BlocksIcon className="size-4" aria-hidden="true" />
              Browse reusable blocks
            </Button>
          </div>
        ) : null}

        {tab === 'media' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Add a picture from your Media Library.</p>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setMediaPickerOpen(true)}
            >
              <ImageIcon className="size-4" aria-hidden="true" />
              Open media library
            </Button>
          </div>
        ) : null}
      </div>

      {patternPickerOpen ? (
        <PatternPickerDialog
          open
          onOpenChange={setPatternPickerOpen}
          initialCategory={sectionCategory ?? undefined}
          onInsert={insertPattern}
        />
      ) : null}

      {reusablePickerOpen ? (
        <ReusableBlockPickerDialog
          open
          onOpenChange={setReusablePickerOpen}
          onInsert={(reusableBlockId) =>
            insertClonedNodes(
              [{ id: 'placeholder', type: 'reusable-block', data: { reusableBlockId } }],
              null,
              insertIndex
            )
          }
        />
      ) : null}

      {mediaPickerOpen ? (
        <MediaPickerDialog
          open
          onOpenChange={setMediaPickerOpen}
          typeFilter="IMAGE"
          onSelect={(media) => {
            const id = insertBlock('image', null, insertIndex);
            updateBlockData(id, { mediaId: media.id, alt: '' });
          }}
        />
      ) : null}
    </div>
  );
}
