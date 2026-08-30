import { z } from 'zod';
import { isUnsafeUrlScheme } from '../utils/safe-url.util';

/** Shared by Create and Edit — mirrors `CreateRedirectDto`/
 * `UpdateRedirectDto` (both accept the same 3 fields; `status` is
 * edit-only, appended separately in `update-redirect.schema.ts`). */
export const redirectFieldsSchema = z.object({
  sourcePath: z
    .string()
    .min(1, 'Enter the old path, e.g. /old-about.')
    .max(2000, 'Must be 2000 characters or fewer.')
    .refine((value) => !isUnsafeUrlScheme(value), 'This type of path is not allowed.'),
  destinationUrl: z
    .string()
    .min(1, 'Enter where this should send visitors.')
    .max(2000, 'Must be 2000 characters or fewer.')
    .refine((value) => !isUnsafeUrlScheme(value), 'This type of link is not allowed.'),
  redirectType: z.union([z.literal(301), z.literal(302)]),
});

export const createRedirectSchema = redirectFieldsSchema;
export type CreateRedirectFormValues = z.infer<typeof createRedirectSchema>;

export const updateRedirectSchema = redirectFieldsSchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});
export type UpdateRedirectFormValues = z.infer<typeof updateRedirectSchema>;
