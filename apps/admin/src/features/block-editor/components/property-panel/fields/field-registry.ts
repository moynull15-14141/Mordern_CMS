import type { ComponentType } from 'react';
import type { BlockFieldKind } from '../../../registry/block-definition.types';
import type { FieldProps } from './field.types';
import { TextField } from './text-field';
import { TextareaField } from './textarea-field';
import { NumberField } from './number-field';
import { UrlField } from './url-field';
import { BooleanField } from './boolean-field';
import { SelectField } from './select-field';
import { ColorField } from './color-field';
import { ListField } from './list-field';
import { ReusableBlockRefField } from './reusable-block-ref-field';
import { MediaRefField } from './media-ref-field';

/** `BlockFieldKind -> field component` — the generic property panel's
 * entire dispatch mechanism, mirroring `BLOCK_REGISTRY`'s "registry, not
 * switch statements" rule one level down (fields instead of blocks).
 *
 * `list` is deliberately NOT in this object literal, even though
 * `ListField` is imported the same way every other field component is —
 * `ListField` is the one field component that itself calls back into
 * this registry (via `render-field.tsx`, for its recursive item fields),
 * which makes this file part of an import cycle. Capturing `ListField` in
 * an eagerly-evaluated object literal at module top level reads whatever
 * that binding happens to be *at that point in the circular load*, which
 * bundler-dependent (this reliably reproduced `undefined` under Vite/
 * Vitest's transform, even though the exact same code built and ran fine
 * under Next.js's bundler in earlier milestones' equivalent registries).
 * Reading it inside a function body instead (`getFieldComponent`, called
 * only at actual render time, long after every module has finished
 * loading) reads the live, fully-initialized binding — see this file's
 * test for a regression check.
 */
const FIELD_REGISTRY: Partial<Record<BlockFieldKind, ComponentType<FieldProps>>> = {
  text: TextField,
  textarea: TextareaField,
  richtext: TextareaField,
  number: NumberField,
  url: UrlField,
  boolean: BooleanField,
  select: SelectField,
  color: ColorField,
  'reusable-block-ref': ReusableBlockRefField,
  'media-ref': MediaRefField,
};

export function getFieldComponent(kind: BlockFieldKind): ComponentType<FieldProps> | undefined {
  if (kind === 'list') return ListField;
  return FIELD_REGISTRY[kind];
}
