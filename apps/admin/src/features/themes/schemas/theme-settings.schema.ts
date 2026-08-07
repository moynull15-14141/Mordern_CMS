import { z } from 'zod';
import { HEX_COLOR_PATTERN } from '../constants/theme.constants';
import { designTokensSchema } from './design-tokens.schema';

export { HEX_COLOR_PATTERN };

/** Mirrors `ThemeSettingsDto` field-for-field
 * (`apps/backend/src/modules/themes/dto/theme-settings.dto.ts`) — every
 * field optional, same hex-color shape check the backend's
 * `HEX_COLOR_PATTERN` enforces. `typography` is edited as raw JSON text
 * (same "form-field string, domain-shape at the boundary" pattern the SEO
 * module's `schemaJsonText` uses) since the backend keeps it as an
 * open-ended `Record<string, unknown>` with no fixed sub-field set.
 * `designTokens` (Milestone 8) is the one exception to "raw JSON text" —
 * it has a real, typed schema (`design-tokens.schema.ts`) and is edited
 * through the Site Design tabbed UI, never JSON. */
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
  designTokens: designTokensSchema.optional(),
});

export type ThemeSettingsFormValues = z.infer<typeof themeSettingsSchema>;
