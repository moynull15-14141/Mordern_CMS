import { z } from 'zod';
import { MEDIA_TYPE_MIME_PREFIX } from '../constants/media.constants';

/**
 * Mirrors `CreateMediaAssetDto` field-for-field, plus the exact
 * registration-time checks `MediaValidator` performs server-side
 * (`apps/backend/src/modules/media/validators/media.validator.ts`):
 * `assertStorageKeyShape` (non-empty, no `..` traversal, no leading `/`)
 * and `assertMimeTypeMatchesType` (declared `type` vs declared `mimeType`
 * prefix — DOCUMENT has no fixed prefix, so it always passes). Deliberately
 * NOT mirrored: `assertFilesizeWithinLimit`, which reads the dynamic
 * `media.maxUploadSizeMb`/`media.allowedMimeTypes` Settings values — same
 * "don't hardcode a second copy of a backend-only, dynamic rule" precedent
 * `buildSettingValueSchema` established in Frontend Milestone 4; a
 * violation surfaces as the backend's own 400 response instead.
 */
export const createMediaAssetSchema = z
  .object({
    type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO']),
    storageKey: z
      .string()
      .min(1, 'Storage key is required.')
      .max(1000, 'Must be 1000 characters or fewer.')
      .refine((value) => !value.includes('..'), 'Must not contain ".." path traversal segments.')
      .refine((value) => !value.startsWith('/'), 'Must not start with a leading slash.'),
    mimeType: z.string().min(1, 'MIME type is required.').max(200, 'Must be 200 characters or fewer.'),
    // A single `refine` (not `.regex().refine()`) — Zod runs every check in
    // a chain regardless of whether an earlier one already failed, so a
    // separate `.refine(() => BigInt(value) > 0n)` after `.regex()` would
    // still execute — and throw a real `SyntaxError` — for non-numeric
    // input the regex was supposed to have already rejected.
    filesize: z.string().refine((value) => {
      if (!/^\d+$/.test(value)) return false;
      return BigInt(value) > 0n;
    }, 'Must be a whole number of bytes greater than zero.'),
    width: z.coerce.number().int().min(1).optional(),
    height: z.coerce.number().int().min(1).optional(),
    duration: z.coerce.number().int().min(1).optional(),
    altText: z.string().max(500, 'Must be 500 characters or fewer.').optional(),
    caption: z.string().max(1000, 'Must be 1000 characters or fewer.').optional(),
    credit: z.string().max(300, 'Must be 300 characters or fewer.').optional(),
    filename: z.string().max(300, 'Must be 300 characters or fewer.').optional(),
    folderId: z.union([z.literal(''), z.string().uuid()]).optional(),
  })
  .superRefine((values, ctx) => {
    const expectedPrefix = MEDIA_TYPE_MIME_PREFIX[values.type];
    if (expectedPrefix && !values.mimeType.startsWith(expectedPrefix)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mimeType'],
        message: `MIME type is not consistent with declared type "${values.type}".`,
      });
    }
  });

export type CreateMediaAssetFormValues = z.infer<typeof createMediaAssetSchema>;
