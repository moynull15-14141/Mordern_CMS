/**
 * Section & Pattern Library (Milestone 6). Mirrors
 * `content-blocks/constants/reusable-block.constants.ts`'s shape.
 */
export enum PatternSortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 2000;
export const CATEGORY_MAX_LENGTH = 100;
export const TAG_MAX_LENGTH = 50;
export const MAX_TAGS = 20;
export const SLUG_MAX_UNIQUENESS_ATTEMPTS = 50;
