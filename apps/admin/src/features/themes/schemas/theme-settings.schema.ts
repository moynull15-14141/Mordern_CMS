import { z } from 'zod';

/** Mirrors `ThemeSettingsDto` field-for-field
 * (`apps/backend/src/modules/themes/dto/theme-settings.dto.ts`) — every
 * field optional, same hex-color shape check the backend's
 * `HEX_COLOR_PATTERN` enforces. `typography` is edited as raw JSON text
 * (same "form-field string, domain-shape at the boundary" pattern the SEO
 * module's `schemaJsonText` uses) since the backend keeps it as an
 * open-ended `Record<string, unknown>` with no fixed sub-field set. */
export const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const themeSettingsSchema = z.object({
  logo: z.string().max(2000, 'Must be 2000 characters or fewer.').optional().or(z.literal('')),
  favicon: z.string().max(2000, 'Must be 2000 characters or fewer.').optional().or(z.literal('')),
  primaryColor: z
    .union([
      z.literal(''),
      z.string().regex(HEX_COLOR_PATTERN, 'Must be a valid hex color, e.g. "#1a2b3c".'),
    ])
    .optional(),
  secondaryColor: z
    .union([
      z.literal(''),
      z.string().regex(HEX_COLOR_PATTERN, 'Must be a valid hex color, e.g. "#ffffff".'),
    ])
    .optional(),
  typographyText: z.string().optional(),
  headerLayout: z
    .string()
    .max(100, 'Must be 100 characters or fewer.')
    .optional()
    .or(z.literal('')),
  footerLayout: z
    .string()
    .max(100, 'Must be 100 characters or fewer.')
    .optional()
    .or(z.literal('')),
  containerWidth: z
    .string()
    .max(50, 'Must be 50 characters or fewer.')
    .optional()
    .or(z.literal('')),
  borderRadius: z.string().max(50, 'Must be 50 characters or fewer.').optional().or(z.literal('')),
  buttonStyle: z.string().max(50, 'Must be 50 characters or fewer.').optional().or(z.literal('')),
  homepageLayout: z
    .string()
    .max(100, 'Must be 100 characters or fewer.')
    .optional()
    .or(z.literal('')),
  blogLayout: z.string().max(100, 'Must be 100 characters or fewer.').optional().or(z.literal('')),
  customCss: z
    .string()
    .max(50000, 'Must be 50000 characters or fewer.')
    .optional()
    .or(z.literal('')),
  customJs: z
    .string()
    .max(50000, 'Must be 50000 characters or fewer.')
    .optional()
    .or(z.literal('')),
});

export type ThemeSettingsFormValues = z.infer<typeof themeSettingsSchema>;
