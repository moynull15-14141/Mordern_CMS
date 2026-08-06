import type { BlockFieldDescriptor } from '../../../registry/block-definition.types';

/** The uniform prop contract every field component implements — the
 * generic property panel dispatches to one of these by `descriptor.kind`
 * (`field-registry.ts`), never a hardcoded per-field-kind branch. */
export interface FieldProps {
  descriptor: BlockFieldDescriptor;
  value: unknown;
  onChange: (value: unknown) => void;
}
