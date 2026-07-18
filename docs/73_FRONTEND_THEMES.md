# Frontend — Themes / Appearance Management

## Architecture

`apps/admin/src/features/themes/` mirrors `features/pages/` exactly
(types/services/hooks/constants/schemas/components), scoped to what
`ThemesController` actually exposes (list/get/active/create/update/
delete/restore/activate — verified against
`apps/backend/src/modules/themes` and `docs/72_BACKEND_THEMES.md`). No
public-website consumption in this milestone — `/public/theme` is
deliberately never called from anywhere in this feature.

Routes: `/themes`, `/themes/new`, `/themes/[id]`, `/themes/[id]/edit`.
Nav entry added under a new "Appearance" group (gated by `theme.manage`,
the real backend permission — already present in `constants/permissions.ts`,
not invented here).

## Folder Structure

```
features/themes/
  types/theme.ts
  services/themes.api.ts (+ .test.ts)
  hooks/{query-keys,use-themes,use-theme,use-active-theme,
         use-create-theme,use-update-theme,use-delete-theme,
         use-restore-theme,use-activate-theme}.ts (+ .test.ts each)
  constants/theme.constants.ts
  schemas/{theme-settings,create-theme,update-theme}.schema.ts (+ .test.ts each)
  components/
    status-badge.tsx, active-badge.tsx, theme-filters.tsx, theme-table.tsx
    delete-dialog.tsx, restore-dialog.tsx, activate-dialog.tsx
    color-input.tsx, appearance-settings-fields.tsx, theme-preview.tsx
    theme-form.tsx (Create/Edit)
    themes-page-content.tsx, create-theme-page-content.tsx,
    edit-theme-page-content.tsx, theme-detail-page-content.tsx
    (+ .test.tsx for every component except appearance-settings-fields.tsx,
    which is exercised through theme-form.test.tsx — same convention
    `seo-fields.tsx`/`category-seo-fields.tsx` already established: a
    pure sub-fields component tested through its parent form, not
    standalone)
  index.ts
```

## API Mapping

| Endpoint                    | Service fn            | Hook               |
| --------------------------- | --------------------- | ------------------ |
| `GET /themes`               | `themesApi.list`      | `useThemes`        |
| `GET /themes/active`        | `themesApi.getActive` | `useActiveTheme`   |
| `GET /themes/:id`           | `themesApi.get`       | `useTheme`         |
| `POST /themes`              | `themesApi.create`    | `useCreateTheme`   |
| `PATCH /themes/:id`         | `themesApi.update`    | `useUpdateTheme`   |
| `DELETE /themes/:id`        | `themesApi.remove`    | `useDeleteTheme`   |
| `POST /themes/:id/restore`  | `themesApi.restore`   | `useRestoreTheme`  |
| `POST /themes/:id/activate` | `themesApi.activate`  | `useActivateTheme` |

One function per real endpoint — no `bySlug` lookup (the backend has
none), no invented helper/bulk APIs, no optimistic mutations (every
mutation is pessimistic, matching Pages'/Menus' established pattern).

## Component Structure

- **List** (`ThemesPageContent` + `ThemeTable`): server pagination/search/sort/status-filter via the shared `DataTable`. Columns: Name (+ inline `ActiveBadge`) / Slug, Status, Updated, Actions. Row actions: View/Edit/Activate(if not active)/Delete, or Restore for a soft-deleted row.
- **Detail** (`ThemeDetailPageContent`): metadata card (slug/version/author/created/"Active since (last updated)" or "Last updated"), a read-only `ThemePreview` bound to the theme's saved settings, and action buttons (Edit/Activate-disabled-when-active/Delete, or Restore).
- **Create/Edit** (`CreateThemeForm`/`EditThemeForm` in `theme-form.tsx`): two-column layout — form on the left, live `ThemePreview` on the right, both driven by the same `form.watch('settings')` value so the preview updates on every keystroke.
- **Appearance editor** (`AppearanceSettingsFields`): every `ThemeSettingsDto` field, nothing invented — logo/favicon (URL text inputs), primaryColor/secondaryColor (`ColorInput` — swatch + hex text, since no color-picker primitive existed in the design system before this milestone), typography (raw JSON textarea, since the backend keeps it as an open-ended `Record<string, unknown>`), headerLayout/footerLayout/containerWidth/borderRadius/buttonStyle/homepageLayout/blogLayout (plain text inputs — all open-ended strings on the backend, no fixed option set to build a `<Select>` from), customCss/customJs (textareas).

## Appearance Flow

Backend `ThemeSettingsDto` field ↔ frontend form field ↔ payload transform:

- Every field is optional both sides; empty strings are converted to `undefined` before the API call (`toSettingsInput` in both `create-theme-page-content.tsx` and `edit-theme-page-content.tsx`), so an untouched field is never sent as `""`.
- `typography` is edited as `settings.typographyText` (JSON string) and `JSON.parse`'d immediately before submit — same "form-field string, domain-shape at the boundary" pattern the SEO module's `schemaJsonText` already uses. A parse failure is swallowed (leaves `typography` undefined) rather than blocking submission, since the JSON textarea has no dedicated parse-error UI in this milestone.
- If every settings field is empty, `settings` itself is sent as `undefined` (not an empty object) — verified by a dedicated test (`create-theme-page-content.test.tsx`).

## Activation Flow

`ActivateDialog` → `useActivateTheme()` → `POST /themes/:id/activate`. The
backend atomically deactivates the site's previous active theme in the
same transaction (see docs/72_BACKEND_THEMES.md "Activation Flow") — the
frontend never re-implements that logic; it only invalidates
`detail(id)`/`lists()`/`active()` on success so the UI reflects the new
state. The Activate button/menu item is hidden entirely for an
already-active theme in the table, and disabled (labeled "Active") on the
Detail page — never a silently-broken action.

## Testing

114 new tests: services (9), hooks (16 across 9 hook files + query-keys),
schemas (29 across theme-settings/create-theme/update-theme), components
(60 across status-badge/active-badge/filters/table/3 dialogs/color-input/
theme-preview/theme-form/all 4 page-contents) — well above the 80+
target.

## Validation

`tsc --noEmit`: 0 errors. `eslint --max-warnings=0` on all new/modified files: 0 warnings. `vitest run` (themes feature): 27 files / 114 tests pass. Full admin suite re-run for regressions (see final report). `next build`: verified clean (see final report).

## Known Limitations

1. **No color-picker design-system primitive existed** — `ColorInput` (swatch + hex text) was built from scratch for this milestone; no prior `apps/admin/src/components/ui/` component covered this.
2. **No "activation timestamp" field on `Theme`** — only `isActive`. The Detail page labels `updatedAt` as "Active since (last updated)" when the theme is active, honestly acknowledging it's not a dedicated field rather than presenting it as one.
3. **No status-transition restriction from the backend** — `UpdateThemeDto.status` accepts any `ThemeStatus` directly (unlike Pages'/Articles' PUBLISHED-via-dedicated-endpoint-only split), so `updateThemeSchema` mirrors that unrestricted shape rather than inventing a restriction the backend doesn't enforce.
4. **Typography has no structured editor** — edited as raw JSON text, since the backend's `Record<string, unknown>` has no fixed sub-field set to build inputs for.

## Future Public Website Integration

Not started in this milestone (explicitly out of scope — "Do NOT start
Public Website"). When it exists, it will consume `GET /public/theme`
directly (already built, see docs/72_BACKEND_THEMES.md "Public API") —
no changes to this admin feature would be required; the admin `ThemePreview`
and the eventual public site's real rendering are intentionally separate
concerns (the admin preview is a frontend-only approximation, never an
iframe of the real site, per this milestone's own instruction).
