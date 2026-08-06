import type { ReactNode } from 'react';
import type { FieldProps } from './field.types';
import { getFieldComponent } from './field-registry';

/** The single call site every field is rendered through — used by
 * `PropertyPanel` for a block's top-level fields and by `ListField` for
 * each item's nested fields (recursively), so a "list of lists" like
 * `table`'s `rows[].cells[]` renders correctly without either module
 * hardcoding the other's shape. Kept separate from `field-registry.ts`
 * (which `ListField` is registered into) specifically so `ListField`
 * importing this file — not `field-registry.ts` directly — turns the
 * inevitable registry↔component cycle into the same three-module shape
 * `render-block-list.tsx` already uses successfully on the public-web
 * side (`apps/web/src/features/public/block-renderer/`), rather than a
 * direct two-file cycle. */
export function renderField(props: FieldProps): ReactNode {
  const Component = getFieldComponent(props.descriptor.kind);
  if (!Component) return null;
  return <Component {...props} />;
}
