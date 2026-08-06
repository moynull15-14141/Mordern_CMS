/**
 * Public API surface — the ONLY module Articles/Pages (or any future
 * builder: Landing Pages, Homepage Builder, Theme Builder, an AI Builder)
 * should import from this feature. Everything else under
 * `features/block-editor/` is an internal implementation detail.
 */
export { BlockEditor } from './components/block-editor';
export type { BlockEditorProps } from './components/block-editor';

export {
  registerBlockDefinition,
  getBlockDefinition,
  listBlockDefinitions,
} from './registry/block-registry';
export type {
  BlockDefinition,
  BlockFieldDescriptor,
  BlockFieldKind,
  BlockFamily,
} from './registry/block-definition.types';

export { runValidation, BUILT_IN_VALIDATORS } from './validation/validation-pipeline';
export { blockTreeSchema, blockNodeSchema } from './validation/block-tree.schema';

export type {
  BlockNode,
  BlockNodeMeta,
  BlockNodeResponsiveMeta,
  BlockType,
  BuiltInBlockType,
} from './types/block.types';
export type { ValidationIssue, BlockTreeValidator } from './types/editor.types';
