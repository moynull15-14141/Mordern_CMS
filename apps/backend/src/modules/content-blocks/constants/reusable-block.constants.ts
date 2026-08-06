/** Mirrors `layouts/constants/layout.constants.ts`'s shape. */
export enum ReusableBlockSortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 2000;
export const CATEGORY_MAX_LENGTH = 100;

/** Defensive cap on how many distinct reusable blocks
 * `ReusableBlockCycleValidator` will visit while walking a reference chain
 * — a legitimate chain is at most a handful of hops; this only guards
 * against a pathological/corrupt graph turning validation into an
 * unbounded walk. */
export const MAX_CYCLE_WALK_VISITS = 1000;
