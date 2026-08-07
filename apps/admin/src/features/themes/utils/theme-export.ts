import { z } from 'zod';
import type { Theme } from '../types/theme';
import type { CreateThemeInput } from '../types/theme';

/** What actually gets exported — deliberately NOT the full `Theme`
 * (Milestone 8 Phase 12: "Do NOT export user passwords, site secrets,
 * API keys, private credentials, unrelated database data"). No `id`,
 * `siteId` (never present on the admin `Theme` shape anyway),
 * `status`/`isActive` (an import always starts DRAFT/inactive, like any
 * other newly created theme), and no audit fields. Just the design-system
 * data itself. */
export interface ThemeExportFile {
  /** Bumped only if this export shape ever changes in a breaking way. */
  exportVersion: 1;
  name: string;
  version: string | null;
  author: string | null;
  description: string | null;
  settings: Theme['settings'];
}

export function buildThemeExport(theme: Theme): ThemeExportFile {
  return {
    exportVersion: 1,
    name: theme.name,
    version: theme.version,
    author: theme.author,
    description: theme.description,
    settings: theme.settings,
  };
}

/** Triggers a browser download — the only "backend call" an export ever
 * needs is the `GET /themes/:id` the caller already used to have a
 * `Theme` in hand; nothing new to fetch. */
export function downloadThemeExport(theme: Theme): void {
  const file = buildThemeExport(theme);
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${theme.slug || 'theme'}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Strict-enough validation for an imported file: real `name` (string,
 * non-empty), `settings` (if present) an object — anything more specific
 * is already re-validated by the real `createThemeSchema`/backend DTO
 * once the parsed result reaches `POST /themes`, so this only needs to
 * reject obviously-wrong input (not JSON, missing `name`, `settings` not
 * an object) before that. */
const themeImportSchema = z.object({
  exportVersion: z.number().optional(),
  name: z.string().min(1, 'Missing or empty "name".'),
  version: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  settings: z.record(z.string(), z.unknown()).nullable().optional(),
});

export interface ThemeImportResult {
  success: true;
  input: CreateThemeInput;
}
export interface ThemeImportError {
  success: false;
  error: string;
}

/** Parses + validates a theme export file's raw text into a real
 * `CreateThemeInput`, ready for `POST /themes` — never trusts the file
 * blindly (Milestone 8 Phase 12: "Validate imported data using strict
 * schemas"). A `.safeParse`-style result (never throws) so the calling
 * dialog can show a friendly inline error instead of an unhandled
 * exception on a malformed upload. */
export function parseThemeImport(rawText: string): ThemeImportResult | ThemeImportError {
  let json: unknown;
  try {
    json = JSON.parse(rawText);
  } catch {
    return { success: false, error: 'This file is not valid JSON.' };
  }

  const result = themeImportSchema.safeParse(json);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? 'This file is not a valid theme export.',
    };
  }

  const data = result.data;
  return {
    success: true,
    input: {
      name: data.name,
      version: data.version ?? undefined,
      author: data.author ?? undefined,
      description: data.description ?? undefined,
      settings: (data.settings ?? undefined) as CreateThemeInput['settings'],
    },
  };
}
