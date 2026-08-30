import { z } from 'zod';
import { isUnsafeUrlScheme } from '../utils/safe-url.util';

/** Powers the Add/Edit Item dialog. Mirrors `CreateMenuItemDto`/
 * `UpdateMenuItemDto`, but as ONE discriminated-by-`targetType` form
 * schema (the backend also treats `targetType` as the discriminator over
 * 4 mutually-exclusive nullable fields, §A.5) — `superRefine` enforces
 * "exactly the one field matching `targetType` is filled in," the same
 * rule `MenusValidator.validateItemTarget` enforces server-side, so an
 * invalid combination is caught before the request ever leaves the form. */
export const menuItemSchema = z
  .object({
    label: z
      .string()
      .min(1, 'Give this item a label.')
      .max(200, 'Must be 200 characters or fewer.'),
    targetType: z.enum(['PAGE', 'ARTICLE', 'CATEGORY', 'EXTERNAL_URL', 'CUSTOM_URL']),
    pageId: z.string().optional().or(z.literal('')),
    pageLabel: z.string().optional().or(z.literal('')),
    articleId: z.string().optional().or(z.literal('')),
    articleLabel: z.string().optional().or(z.literal('')),
    categoryId: z.string().optional().or(z.literal('')),
    categoryLabel: z.string().optional().or(z.literal('')),
    url: z.string().max(2000, 'Must be 2000 characters or fewer.').optional().or(z.literal('')),
    openMode: z.enum(['SELF', 'BLANK']),
    parentId: z.string().optional().or(z.literal('')),
    icon: z.string().max(100, 'Must be 100 characters or fewer.').optional().or(z.literal('')),
    cssClass: z.string().max(200, 'Must be 200 characters or fewer.').optional().or(z.literal('')),
  })
  .superRefine((value, ctx) => {
    if (value.targetType === 'PAGE' && !value.pageId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pageId'], message: 'Choose a page.' });
    }
    if (value.targetType === 'ARTICLE' && !value.articleId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['articleId'],
        message: 'Choose an article.',
      });
    }
    if (value.targetType === 'CATEGORY' && !value.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categoryId'],
        message: 'Choose a category.',
      });
    }
    if ((value.targetType === 'EXTERNAL_URL' || value.targetType === 'CUSTOM_URL') && !value.url) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['url'], message: 'Enter a URL.' });
    }
    if (value.url && isUnsafeUrlScheme(value.url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['url'],
        message: 'This type of link is not allowed. Use a regular web address.',
      });
    }
  });

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
