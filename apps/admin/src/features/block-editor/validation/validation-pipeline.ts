import type { BlockNode } from '../types/block.types';
import type { ValidationIssue, BlockTreeValidator } from '../types/editor.types';
import { validateUnknownTypes } from './validators/unknown-type.validator';
import { validateRequiredFields } from './validators/required-fields.validator';
import { validateContainerChildren } from './validators/container-children.validator';
import { validateMaxDepth } from './validators/max-depth.validator';
import { validateMaxCount } from './validators/max-count.validator';

/** The built-in rule set — order doesn't matter, every validator runs
 * over the whole tree and results are concatenated. */
export const BUILT_IN_VALIDATORS: BlockTreeValidator[] = [
  validateUnknownTypes,
  validateRequiredFields,
  validateContainerChildren,
  validateMaxDepth,
  validateMaxCount,
];

/**
 * The "generic validation pipeline" the brief asks for — an array of pure
 * `(blocks) => ValidationIssue[]` functions, not one hardcoded function. A
 * future builder passes its own rules via `extraValidators` (e.g.
 * `<BlockEditor extraValidators={[myThemeBuilderRule]} />`) without
 * touching any file in this feature. Non-fatal by design — the property
 * panel/toolbar surface `ValidationIssue[]` inline; nothing here throws
 * (throwing is the backend's `BlockTreeValidator`'s job, the authoritative
 * boundary — this is UX, not security).
 */
export function runValidation(
  blocks: BlockNode[],
  extraValidators: BlockTreeValidator[] = []
): ValidationIssue[] {
  return [...BUILT_IN_VALIDATORS, ...extraValidators].flatMap((validate) => validate(blocks));
}
