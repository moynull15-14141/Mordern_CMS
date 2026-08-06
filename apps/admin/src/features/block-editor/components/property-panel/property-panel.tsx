'use client';

import { Label } from '@/components/ui/label';
import { getBlockDefinition } from '../../registry/block-registry';
import { useEditorActions, useEditorBlocks, useSelectedId } from '../../context/use-block-editor';
import { findBlock } from '../../state/block-tree.util';
import { renderField } from './fields/render-field';
import { ResponsiveVisibilityFields } from './responsive-visibility-fields';

/**
 * Generic property panel — renders whatever `BlockDefinition.fields` the
 * selected block's registered definition declares, via `renderField`'s
 * kind-based dispatch. Zero knowledge of any specific block type; adding
 * a 26th block type (built-in or a future builder's own) needs no change
 * here.
 */
export function PropertyPanel() {
  const blocks = useEditorBlocks();
  const selectedId = useSelectedId();
  const { updateBlockData, updateBlockMeta } = useEditorActions();

  const selectedBlock = selectedId ? findBlock(blocks, selectedId) : null;

  if (!selectedBlock) {
    return (
      <div className="p-4 text-sm text-muted-foreground" data-testid="property-panel-empty">
        Select a block to edit its properties.
      </div>
    );
  }

  const definition = getBlockDefinition(selectedBlock.type);

  if (!definition) {
    return (
      <div className="p-4 text-sm text-destructive" data-testid="property-panel-unknown-type">
        Unknown block type &quot;{selectedBlock.type}&quot;.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4" aria-label={`${definition.label} properties`}>
      <h3 className="text-sm font-semibold">{definition.label}</h3>
      {definition.fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">This block has no editable properties.</p>
      ) : (
        <div className="space-y-3">
          {definition.fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label htmlFor={`field-${field.key}`}>
                {field.label}
                {field.required ? ' *' : ''}
              </Label>
              {renderField({
                descriptor: field,
                value: selectedBlock.data[field.key],
                onChange: (value) =>
                  updateBlockData(selectedBlock.id, { ...selectedBlock.data, [field.key]: value }),
              })}
            </div>
          ))}
        </div>
      )}
      <ResponsiveVisibilityFields
        value={selectedBlock.meta?.responsive}
        onChange={(responsive) =>
          updateBlockMeta(selectedBlock.id, { ...selectedBlock.meta, responsive })
        }
      />
    </div>
  );
}
