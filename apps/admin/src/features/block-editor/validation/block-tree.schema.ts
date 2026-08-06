import { z } from 'zod';
import type { BlockNode } from '../types/block.types';

/**
 * Shape-only zod schema for RHF/`zodResolver` — deliberately shallow (a
 * block is `{id, type, data, children?, meta?}`, `data` is an untyped
 * record). Real per-block-type field validation is
 * `validation-pipeline.ts`'s job (inline UI feedback) and the backend
 * `BlockTreeValidator`'s job (the authoritative boundary) — this schema
 * only exists so the form's `zodResolver` doesn't reject `body` outright
 * as the wrong shape before either of those ever runs.
 */
const blockNodeMetaSchema = z
  .object({
    anchor: z.string().optional(),
    cssClass: z.string().optional(),
    column: z.number().optional(),
    panelId: z.number().optional(),
    tabId: z.number().optional(),
    responsive: z
      .object({
        hideOnMobile: z.boolean().optional(),
        hideOnTablet: z.boolean().optional(),
        hideOnDesktop: z.boolean().optional(),
      })
      .optional(),
  })
  .optional();

export const blockNodeSchema: z.ZodType<BlockNode> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    data: z.record(z.unknown()),
    children: z.array(blockNodeSchema).optional(),
    meta: blockNodeMetaSchema,
  })
);

export const blockTreeSchema = z.array(blockNodeSchema);
