/** Mirrors the backend's `BlockTreeValidator` bounds
 * (`apps/backend/src/modules/content-blocks/block-schema/block-types.ts`)
 * so the editor's inline feedback matches what the server will ultimately
 * accept — this is a UX convenience (fail fast, in the UI), not the
 * security boundary; the backend re-validates and sanitizes on every
 * create/update regardless of what the client sends. */
export const MAX_BLOCK_TREE_DEPTH = 6;
export const MAX_BLOCKS_PER_TREE = 500;
