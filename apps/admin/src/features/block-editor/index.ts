/**
 * Public API surface — the ONLY module Articles/Pages (or any future
 * builder: Landing Pages, Homepage Builder, Theme Builder, an AI Builder)
 * should import from this feature. Everything else under
 * `features/block-editor/` is an internal implementation detail.
 */
export { BlockEditor } from './components/block-editor';
export type { BlockEditorProps } from './components/block-editor';

// Individual pieces (Provider, canvas, inspector, hooks) — for a consumer
// that needs its own custom layout around them instead of `<BlockEditor>`'s
// fixed toolbar/canvas/inspector grid. The Page Builder (Milestone 7) is
// the first such consumer: same store, same components, different shell.
export { BlockEditorProvider } from './context/block-editor-provider';
export { BlockCanvas } from './components/canvas/block-canvas';
export { PropertyPanel } from './components/property-panel/property-panel';
export { AddBlockButton } from './components/block-picker/add-block-button';
export { BlockTypePicker } from './components/block-picker/block-type-picker';
export { PatternPickerDialog } from './components/block-picker/pattern-picker-dialog';
export { ReusableBlockPickerDialog } from './components/block-picker/reusable-block-picker-dialog';
export {
  useEditorBlocks,
  useEditorActions,
  useSelectedId,
  useHoveredId,
  useCanUndo,
  useCanRedo,
  useHasClipboardEntry,
} from './context/use-block-editor';
export { findBlock, findParentId, getSiblings } from './state/block-tree.util';
export { useEditorKeyboardShortcuts } from './hooks/use-editor-keyboard-shortcuts';

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

export { summarizeBlock } from './utils/summarize-block';
export type { BlockSummary } from './utils/summarize-block';
export { BlockSummaryPreview } from './components/shared/block-summary-preview';

export type {
  BlockNode,
  BlockNodeMeta,
  BlockNodeResponsiveMeta,
  BlockType,
  BuiltInBlockType,
} from './types/block.types';
export type { ValidationIssue, BlockTreeValidator } from './types/editor.types';
