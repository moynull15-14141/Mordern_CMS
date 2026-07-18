# 64_FRONTEND_SETTINGS

## Executive Summary

Settings Management Module (Frontend Milestone 4). Implements the admin-facing platform Settings UI against the real, frozen `SettingsController` (`apps/backend/src/modules/settings/controllers/settings.controller.ts`) — verified directly from source (controller, all DTOs, all 3 enums, the full 34-entry `SETTING_DEFINITIONS` catalog, the service, mapper, and validator), not assumed from the milestone brief. The brief's build list described Settings as if it were a paginated, searchable, creatable/deletable resource shaped like Users — it is none of those; every mismatch is documented below rather than silently built around.

**Status: Implemented, awaiting approval.**

## Architecture

No architectural deviation from `docs/56_ADMIN_FRONTEND_ARCHITECTURE.md`/`docs/58_FRONTEND_FOLDER_STRUCTURE.md`. One feature directory, `features/settings/`, following the same `components/hooks/services/schemas/types/constants` shape Frontend Milestone 3 established. No shared-infrastructure component was modified — `DataTable`, `Form`/`FormField`/`FormControl`, `ConfirmDialog`, `PermissionRoute`/`PermissionGate`, `EmptyState`/`ErrorState`/`Skeleton`, and `lib/api-client.ts` are all reused byte-for-byte unchanged from Milestones 1–3.

Two additive, non-breaking constants changes were required:

1. `constants/api-endpoints.ts`'s `SETTINGS` entry changed from a bare `'/settings'` string to an object of path builders (`ROOT`, `EXPORT`, `IMPORT`, `RESET`, `RESET_CATEGORY`, `byCategory()`, `byKey()`) — grep-confirmed before changing it that nothing referenced the old string shape.
2. `constants/routes.ts` gained a `SETTINGS_ROUTES.category()` builder, additive alongside the existing flat `ROUTES.SETTINGS` (which stays untouched — `config/navigation.ts` already references it as a plain string and needed no change).

## Folder Structure

```
features/settings/
├── components/    — SettingsTable, SettingsFilters, SettingField (per-type input),
│                    SettingValueDisplay, CategorySettingsForm, SettingDetailsDialog,
│                    ResetCategoryDialog, ResetAllDialog, + 2 page-composition components
├── hooks/         — one hook per real endpoint actually used, + query-keys.ts,
│                    + use-unsaved-changes-warning.ts (browser beforeunload guard)
├── services/      — settings.api.ts
├── schemas/       — setting-value.schema.ts (buildSettingValueSchema(type))
├── types/         — settings.ts (mirrors SettingResponseDto/*Dto 1:1)
├── constants/     — settings.constants.ts (category/source labels, sensitive-type set)
└── index.ts       — public surface; app/ imports only from here
```

## API Mapping

Every function below was written against the real `SettingsController` source (9 endpoints total), not the milestone brief's build list.

| Function | Method + Path | File |
|---|---|---|
| `settingsApi.getAll` | `GET /settings` | `features/settings/services/settings.api.ts` |
| `settingsApi.getByCategory` | `GET /settings/category/:category` | same |
| `settingsApi.getByKey` | `GET /settings/:key` | same |
| `settingsApi.updateSetting` | `PUT /settings/:key` | same |
| `settingsApi.bulkUpdateCategory` | `PUT /settings/category/:category` | same |
| `settingsApi.resetCategory` | `POST /settings/reset/category` | same |
| `settingsApi.resetAll` | `POST /settings/reset` | same |

**Deliberately not implemented**: `GET /settings/export` and `POST /settings/import` are real endpoints but were out of the brief's 18-item build list (no "Export/Import Settings" item was requested) — not a discovery, a scope decision.

## Conflicts Discovered

The brief modeled Settings as a paginated, filterable, creatable/deletable CRUD resource (mirroring Users). Once the real backend source was read, none of that shape exists:

1. **No pagination, search, or sort query params on any GET endpoint.** `GET /settings` returns the complete, unpaginated 34-entry catalog every time. The brief's "Settings List (Search, Category filter, Pagination, Sorting, Server-side query)" was built as **client-side** search/filter/sort/pagination over that one fetched array instead — page/sort/filter/search state still lives in the URL (matching the established convention), but nothing is a server request beyond the single initial `GET /settings`.
2. **No "Create Setting" endpoint, and none is possible.** `SETTING_DEFINITIONS` is a closed, code-level catalog (34 entries across 17 categories) — `getByKey`/`updateSetting` throw `SettingNotFoundException` for any key not already in that catalog. No create UI was built.
3. **No "Delete Setting" endpoint.** Settings cannot be removed, only reset to their system default. `POST /settings/reset/category` and `POST /settings/reset` are the real analogs to "Delete/Restore" from the brief's build list — implemented as `ResetCategoryDialog`/`ResetAllDialog`, not a delete/restore pair.
4. **`docs/56_ADMIN_FRONTEND_ARCHITECTURE.md`'s route tree freezes only `settings/[category]/page.tsx`**, unlike every other module (which lists both a list page and a detail/edit page). No `settings/page.tsx` overview route is separately enumerated. However, that route already exists in the live app (a `ComingSoonPage` placeholder scaffolded in an earlier milestone) and is the single entry `config/navigation.ts` links to. Treated the doc's omission as non-exhaustive shorthand rather than a prohibition — removing or hiding a nav-linked existing route would itself be an undocumented architecture change. The overview was implemented at the existing `/settings` path; `/settings/[category]` was added as the frozen per-category route.
5. **No single-setting edit route or endpoint UX beyond the category form.** `PUT /settings/:key` exists, but there is no per-key page to put it behind (see #4) and the brief's "Edit Setting" is one build-list item, not two. Editing happens via `CategorySettingsForm`, which bulk-submits every changed field in one category through `PUT /settings/category/:category`. "Setting Details" (a separate build-list item) is a read-only `SettingDetailsDialog` launched from the overview table instead of a third route.
6. **`SettingResponseDto` never returns validation rules.** `min`/`max`/`regex`/`allowedValues`/`required`/`nullable` live only in the backend-internal `SETTING_DEFINITIONS` catalog and are never serialized into any response. `buildSettingValueSchema(type)` therefore validates only `type` (mirroring `SettingsValidator.assertType()` exactly) — deliberately not a second, silently-driftable copy of the backend's private validation rules. Any rule violation the frontend can't catch client-side surfaces as the backend's own 400 response, shown inline via `submitError`.
7. **Sensitive values (`PASSWORD`/`SECRET`) are redacted (`value: null`) on every read.** The only response that ever reveals a real value is the direct response to that same setting's own update (`SettingsMapper.toResponseDto(..., { reveal: true })`, `updateSetting()` only). Every sensitive `SettingField` therefore always starts blank with a "Leave blank to keep unchanged" placeholder; `CategorySettingsForm`'s submit handler omits a sensitive entry from the bulk-update payload entirely unless the user actually typed a new value.
8. **`bulkUpdateCategory` is not transactional.** The service loops `updateSetting()` per entry — a partial failure partway through a category save is possible. Surfaced via the mutation's ordinary error state; no client-side rollback/retry logic was added, since the backend gives no compensating endpoint to build one against.
9. **`Setting.key` is fully-qualified (`"general.siteName"`); `BulkUpdateSettingsDto`'s per-entry key is not.** `buildSettingKey(category, key)` on the backend produces the dotted identity every GET/single-PUT response uses, but `SettingEntryDto.key` inside a bulk payload must be the unqualified remainder. `CategorySettingsForm` strips the `"<category>."` prefix before building both RHF field names and the submit payload — verified directly against `settings.service.ts`'s `bulkUpdateCategory()`/`buildSettingKey()`.

## Query Flow

```
Settings overview (SettingsPageContent)
  → useSettings() — TanStack Query, no filters/params
    → settingsApi.getAll() → GET /settings
      ← the complete 34-entry catalog, cached once
  → client-side filter (category, search) + sort + paginate over that array
    (page/sort/filter/search state lives in the URL, matching the established
    convention, even though nothing beyond the one fetch is a server request)

Category edit page (CategorySettingsPageContent)
  → useSettingsByCategory(category) → GET /settings/category/:category
  → CategorySettingsForm submits → useBulkUpdateCategory(category)
    → settingsApi.bulkUpdateCategory(category, { settings }) → PUT /settings/category/:category
    ← on success: settingsKeys.category()/lists() invalidated, navigate back to /settings
```

Every mutation invalidates only the query keys it affects (`settingsKeys.key()`/`.category()`/`.lists()` as applicable per hook) — never a blanket `invalidateQueries()`.

## Permission Flow

Every guard maps to the single real `settings.manage` permission — no finer-grained key was invented (`SettingsController` gates all 9 endpoints behind exactly one `@RequirePermission(PERMISSIONS.SETTINGS_MANAGE)` at the controller level; there is no separate view-only permission). `PermissionRoute` gates both pages (`/settings`, `/settings/[category]`). `PermissionGate` hides the "Reset all settings" action on the overview page and the "Reset to defaults" action on the category page for a viewer without `settings.manage` — both are page-level-redundant in principle (the whole page is already gated) but scoped specifically to the two destructive reset actions, matching the "defense around irreversible actions" precedent rather than gating read-only content a second time.

## Form Flow

`CategorySettingsForm` builds its Zod schema and default values **dynamically** from the `Setting[]` array fetched for one category — there is no static per-category schema file, since the field set is data-driven (17 categories × ~2 settings each, verified against the real `SETTING_DEFINITIONS` catalog). Per-field validation comes from `buildSettingValueSchema(setting.type)` (see Conflict #6), except `JSON`/`ARRAY` fields, whose RHF-level schema is a permissive `z.string()` — those two types are edited as raw text (`SettingField`'s textarea branches) and only parsed back into their real object/array shape inside the submit handler, where a parse failure surfaces as a normal field-level error via `form.setError()` rather than failing on every keystroke.

`isReadOnly` settings never enter the form at all — they render as a plain static row (label + description + `SettingValueDisplay` + a "Read-only" badge), entirely outside RHF, and are never part of the schema, defaults, or submit payload.

Category Settings is **pessimistic**, mirroring `EditUserForm` (Frontend Milestone 3): the page only navigates back to `/settings` after `useBulkUpdateCategory`'s mutation resolves. This was a deliberate choice over staying on the page after a successful save — remaining would require reconciling the form's dirty/default-values state against a background refetch of the just-saved data, risking silently discarding an unrelated in-progress edit if a refetch happened to race a user's next keystroke. `CategorySettingsForm` exposes `onDirtyChange`, driving both the existing in-app discard-changes confirmation (mirroring Milestone 3) **and** a new `useUnsavedChangesWarning(isDirty)` hook — a native `beforeunload` browser guard, since an in-app confirm dialog can never intercept a tab close, reload, or address-bar navigation. This is the concrete difference between the brief's build-list items 11 ("dirty form detection") and 12 ("unsaved change warning"), which Milestone 3 did not distinguish.

## Table Flow

`SettingsTable` is built entirely on the existing, unmodified `DataTable` (`components/data-table/`) — no changes to that shared component were needed. Unlike `UserTable` (server-driven), every one of `data`/`sorting`/`pagination` passed into it is pre-computed client-side by `SettingsPageContent` (see Conflict #1). "Edit" always routes to that setting's category page; there is no per-row inline edit or single-setting edit route (see Conflict #5).

## Testing

**8 new test files this milestone caught real bugs in before they'd have shipped**, all in `category-settings-form.tsx`/`setting-field.tsx`: `<FormControl>` (`components/form/form.tsx`) is a Radix `Slot` that clones its single JSX child to inject `id`/`aria-describedby`/`aria-invalid`. Every prior milestone always placed a raw `<Input>`/`<SelectTrigger>` directly as that child; this milestone was the first to put an intermediate type-switching component (`SettingField`) there instead, which silently dropped those injected props since it didn't declare or forward them — breaking every `<FormLabel>`'s `htmlFor` association (caught immediately by `getByLabelText` failing in `category-settings-form.test.tsx`, not a preexisting gap). Fixed by having `SettingField` accept and spread `...rest` onto whichever leaf element it renders in every branch. **Lesson recorded for any future dynamic/type-switching field renderer**: it must forward unknown rest props, not just its own explicit ones, to remain a valid `FormControl` child.

One test-environment-only issue: jsdom's generic `Event` doesn't model the real `BeforeUnloadEvent.returnValue` string contract (assigning `''` triggers legacy boolean-cancel semantics instead) — `useUnsavedChangesWarning`'s own test asserts only `preventDefault()` was called, the one signal that's reliable across jsdom and real browsers; the hook's implementation itself still sets `event.returnValue = ''` per the standard cross-browser `beforeunload` pattern.

**24 new test files / 116 new tests** for this milestone (settings feature: 22 files/109 tests; 2 new page-route test files/7 tests). Existing 541-test suite remains green (see Validation).

## Validation

- `npx eslint apps/admin --ext .ts,.tsx --max-warnings=0` → (restated verbatim in the Final Report).
- `npx tsc --noEmit` → (restated verbatim in the Final Report).
- `npm run build` (authoritative TypeScript check per the Frontend Milestone 3 lesson — `next build`'s internal checker has caught errors `tsc --noEmit` missed before) → (restated verbatim in the Final Report).
- `npx vitest run` → (restated verbatim in the Final Report).

(Exact pass/fail counts and any deviation from this section are restated verbatim in the milestone's own Final Report, not duplicated here to avoid drift between two documents — matching the precedent `docs/63`'s own Validation section set.)

## Future Integration

Once a future milestone adds an Import/Export UI, `settingsApi` already has real, unused `EXPORT`/`IMPORT` endpoint constants to build against — no backend change would be needed. If a future backend release adds validation-rule fields to `SettingResponseDto` (see Conflict #6), `buildSettingValueSchema` would gain `min`/`max`/`regex`/`allowedValues` branches without any other file changing. If `SettingScopeContext` ever grows beyond `GLOBAL_SCOPE` (site/tenant-scoped settings — architecture-only in V1 per `docs/39_SETTINGS_ARCHITECTURE.md`), every hook/service function here would need a scope parameter threaded through; nothing in this milestone assumes global-only beyond simply never passing one.

## Limitations

- No search/filter/sort/pagination on the backend — all four are client-side over one fetched 34-item array, not real server queries (Conflict #1).
- No create/delete of settings — the catalog is closed; reset-to-default is the only destructive/corrective action available (Conflicts #2–3).
- No per-setting edit page or "Setting Details" route — both are dialog/inline UI on the overview and category pages instead (Conflicts #4–5).
- Frontend validation covers only a setting's `type`, not its backend-only `min`/`max`/`regex`/`allowedValues`/`required` rules — a rule violation the frontend can't catch client-side surfaces as the backend's 400 response (Conflict #6).
- `bulkUpdateCategory` is not transactional on the backend; a partial-failure category save is possible and is not specially handled beyond the mutation's normal error state (Conflict #8).
- JSON/ARRAY setting values are edited as raw text (JSON text / newline-separated list), not a structured object/array builder UI.

## Cross References

`docs/39_SETTINGS_ARCHITECTURE.md` (the backend module this consumes, including the frozen PUT-vs-PATCH decision) · `docs/53_API_FREEZE.md` (the contract this milestone integrates against) · `docs/56_ADMIN_FRONTEND_ARCHITECTURE.md`/`docs/58_FRONTEND_FOLDER_STRUCTURE.md`/`docs/59_FRONTEND_CODING_GUIDELINES.md` (architecture, unchanged) · `docs/60_ADMIN_NAVIGATION.md` (the `/settings` nav entry, unchanged) · `docs/63_FRONTEND_USERS.md` (the milestone this one's `features/*` shape, form/table/permission conventions, and validation discipline directly continue).

## Approved Date

Pending — awaiting explicit approval, per this milestone's own "Do not continue to Milestone 5" instruction.

## Architecture Status

**IMPLEMENTED, AWAITING APPROVAL** — Settings Management Module (Frontend Milestone 4).
