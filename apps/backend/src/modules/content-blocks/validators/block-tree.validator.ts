import { Injectable } from '@nestjs/common';
import {
  BLOCK_TYPE_DESCRIPTORS,
  BlockFieldDescriptor,
  MAX_BLOCKS_PER_TREE,
  MAX_BLOCK_TREE_DEPTH,
  isContainerBlockType,
  isKnownBlockType,
} from '../block-schema/block-types';
import { BlockNode } from '../interfaces/block-node.interface';
import { InvalidBlockTreeException } from '../exceptions/content-blocks.exceptions';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Recursive, hand-written tree validator for `Article.body`/`Page.body` —
 * there is no existing precedent in this codebase for validating a
 * polymorphic/discriminated JSON structure via class-validator (grep for
 * `ValidateNested`/`@Type(`/`discriminator` across `apps/backend/src`
 * found only single-shape nested DTOs), so this follows the "dedicated
 * stateless `Validator` class per module" pattern `ArticlesValidator`/
 * `MediaValidator`/`LayoutsValidator` already establish instead of
 * forcing class-validator's discriminator machinery onto a shape it was
 * never used for here.
 *
 * Called from `ArticlesService.createArticle`/`.updateArticle` and
 * `PagesService.createPage`/`.updatePage` before every write — the DTO
 * layer keeps `body: Record<string, unknown>` / `@IsObject()` unchanged
 * (shape checking happens here, not in the DTO, so this validator stays
 * unit-testable independent of class-validator's pipeline).
 */
@Injectable()
export class BlockTreeValidator {
  assertValid(body: unknown): void {
    if (!isPlainObject(body)) {
      throw new InvalidBlockTreeException('body must be an object.');
    }
    if (!('blocks' in body) || !Array.isArray(body.blocks)) {
      throw new InvalidBlockTreeException('body.blocks must be an array.');
    }

    const counter = { count: 0 };
    for (const [index, node] of body.blocks.entries()) {
      this.assertValidNode(node, `blocks[${index}]`, 1, counter);
    }
  }

  private assertValidNode(
    node: unknown,
    path: string,
    depth: number,
    counter: { count: number }
  ): asserts node is BlockNode {
    counter.count += 1;
    if (counter.count > MAX_BLOCKS_PER_TREE) {
      throw new InvalidBlockTreeException(
        `too many blocks — the tree exceeds the ${MAX_BLOCKS_PER_TREE}-block limit.`
      );
    }
    if (depth > MAX_BLOCK_TREE_DEPTH) {
      throw new InvalidBlockTreeException(
        `${path}: nesting too deep — the tree exceeds the ${MAX_BLOCK_TREE_DEPTH}-level limit.`
      );
    }

    if (!isPlainObject(node)) {
      throw new InvalidBlockTreeException(`${path} must be an object.`);
    }
    if (typeof node.id !== 'string' || node.id.length === 0) {
      throw new InvalidBlockTreeException(`${path}.id must be a non-empty string.`);
    }
    if (typeof node.type !== 'string' || !isKnownBlockType(node.type)) {
      throw new InvalidBlockTreeException(
        `${path}.type "${String(node.type)}" is not a known block type.`
      );
    }
    if (!isPlainObject(node.data)) {
      throw new InvalidBlockTreeException(`${path}.data must be an object.`);
    }

    const descriptor = BLOCK_TYPE_DESCRIPTORS[node.type];
    this.assertValidFields(node.data, descriptor.fields, `${path}.data`);

    if (node.children !== undefined) {
      if (!isContainerBlockType(node.type)) {
        throw new InvalidBlockTreeException(
          `${path}: block type "${node.type}" cannot have children (only columns/container/accordion/tabs can).`
        );
      }
      if (!Array.isArray(node.children)) {
        throw new InvalidBlockTreeException(`${path}.children must be an array.`);
      }
      for (const [index, child] of node.children.entries()) {
        this.assertValidNode(child, `${path}.children[${index}]`, depth + 1, counter);
      }
    }

    if (node.meta !== undefined && !isPlainObject(node.meta)) {
      throw new InvalidBlockTreeException(`${path}.meta must be an object.`);
    }
  }

  private assertValidFields(
    data: Record<string, unknown>,
    fields: BlockFieldDescriptor[],
    path: string
  ): void {
    for (const field of fields) {
      const value = data[field.key];
      const fieldPath = `${path}.${field.key}`;

      if (value === undefined || value === null) {
        if (field.required) {
          throw new InvalidBlockTreeException(`${fieldPath} is required.`);
        }
        continue;
      }

      switch (field.kind) {
        case 'text':
        case 'textarea':
        case 'richtext':
        case 'url':
        case 'color':
          if (typeof value !== 'string') {
            throw new InvalidBlockTreeException(`${fieldPath} must be a string.`);
          }
          break;
        case 'number':
          if (typeof value !== 'number' || Number.isNaN(value)) {
            throw new InvalidBlockTreeException(`${fieldPath} must be a number.`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            throw new InvalidBlockTreeException(`${fieldPath} must be a boolean.`);
          }
          break;
        case 'select': {
          if (typeof value !== 'string') {
            throw new InvalidBlockTreeException(`${fieldPath} must be a string.`);
          }
          const allowed = field.options?.map((option) => option.value) ?? [];
          if (allowed.length > 0 && !allowed.includes(value)) {
            throw new InvalidBlockTreeException(
              `${fieldPath} must be one of: ${allowed.join(', ')}.`
            );
          }
          break;
        }
        case 'reusable-block-ref':
        case 'media-ref':
          if (typeof value !== 'string' || value.length === 0) {
            throw new InvalidBlockTreeException(`${fieldPath} must be a non-empty string id.`);
          }
          break;
        case 'list': {
          if (!Array.isArray(value)) {
            throw new InvalidBlockTreeException(`${fieldPath} must be an array.`);
          }
          const itemFields = field.itemFields ?? [];
          value.forEach((item, index) => {
            if (!isPlainObject(item)) {
              throw new InvalidBlockTreeException(`${fieldPath}[${index}] must be an object.`);
            }
            this.assertValidFields(item, itemFields, `${fieldPath}[${index}]`);
          });
          break;
        }
      }
    }
  }
}
