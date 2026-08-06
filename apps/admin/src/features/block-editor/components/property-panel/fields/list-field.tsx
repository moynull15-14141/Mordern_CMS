import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { FieldProps } from './field.types';
import { renderField } from './render-field';

/**
 * Renders each item as a card of its own nested fields (via `renderField`
 * — recursion happens because `field-registry.ts` maps `kind: 'list'`
 * back to this very component). Reorder is move-up/move-down buttons,
 * not drag-and-drop — the canvas-level generic DnD engine
 * (`components/canvas/`) is reserved for reordering *blocks*; a nested
 * list field (e.g. table rows) reordering with simple buttons is a
 * deliberate, smaller-scope choice, not an oversight.
 */
export function ListField({ descriptor, value, onChange }: FieldProps) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const itemFields = descriptor.itemFields ?? [];

  function updateItem(index: number, key: string, itemValue: unknown) {
    const next = items.map((item, i) => (i === index ? { ...item, [key]: itemValue } : item));
    onChange(next);
  }

  function addItem() {
    const blank: Record<string, unknown> = {};
    for (const field of itemFields) {
      blank[field.key] =
        field.defaultValue ?? (field.kind === 'list' ? [] : field.kind === 'boolean' ? false : '');
    }
    onChange([...items, blank]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="space-y-2 rounded-sm border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {descriptor.label} {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => moveItem(index, -1)}
              >
                <ChevronUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Move down"
                disabled={index === items.length - 1}
                onClick={() => moveItem(index, 1)}
              >
                <ChevronDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove item"
                onClick={() => removeItem(index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          {itemFields.map((itemField) => (
            <div key={itemField.key} className="space-y-1">
              <Label htmlFor={`field-${itemField.key}-${index}`}>{itemField.label}</Label>
              {renderField({
                descriptor: itemField,
                value: item[itemField.key],
                onChange: (itemValue) => updateItem(index, itemField.key, itemValue),
              })}
            </div>
          ))}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="size-4" />
        Add {descriptor.label.replace(/s$/, '')}
      </Button>
    </div>
  );
}
