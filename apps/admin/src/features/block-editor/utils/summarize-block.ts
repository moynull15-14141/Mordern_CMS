import { HelpCircle, type LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import { getBlockDefinition } from '../registry/block-registry';

export interface BlockSummary {
  typeLabel: string;
  icon: ComponentType<LucideProps>;
  text: string;
}

const TEXTUAL_FIELD_KINDS = new Set(['text', 'textarea', 'richtext']);
const SUMMARY_TEXT_MAX_LENGTH = 80;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** Admin-side, read-only "what does this block roughly say" summary — not
 * a pixel-accurate render (matches `ThemePreview`'s own precedent: a mock,
 * not a reuse of the real `apps/web` renderer, which lives in a separate
 * app/bundle and can't be imported here). Reads data already in hand — no
 * network call — so it's cheap to render inline in a list row, a picker
 * item, or the reusable-block detail/inspector page. */
export function summarizeBlock(node: {
  type: string;
  data: Record<string, unknown>;
  children?: unknown[] | null;
}): BlockSummary {
  const definition = getBlockDefinition(node.type);
  const icon = definition?.icon ?? HelpCircle;
  const typeLabel = definition?.label ?? node.type;

  if (definition?.container) {
    const count = node.children?.length ?? 0;
    return { typeLabel, icon, text: `${count} block${count === 1 ? '' : 's'}` };
  }

  const textField = definition?.fields.find((field) => {
    const value = node.data[field.key];
    return (
      TEXTUAL_FIELD_KINDS.has(field.kind) && typeof value === 'string' && value.trim().length > 0
    );
  });
  const raw = textField ? (node.data[textField.key] as string) : undefined;
  const text = raw
    ? truncate(raw, SUMMARY_TEXT_MAX_LENGTH)
    : (definition?.description ?? typeLabel);

  return { typeLabel, icon, text };
}
