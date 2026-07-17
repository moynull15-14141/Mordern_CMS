# 59_FRONTEND_CODING_GUIDELINES

## Purpose

Defines coding standards for `apps/admin` — component patterns, the Table/Form systems, TypeScript conventions, and how frontend code stays consistent with the backend's own established conventions. **Architecture only — no implementation.**

## Architecture

Guidelines are organized around the three reusable systems every feature depends on (Table, Form, API), plus cross-cutting TypeScript/component rules. The backend's own coding conventions (one exception file per error category, one DTO per request/response shape, `class-validator` decorators on every field — all confirmed consistent across 9 modules in `52_BACKEND_FREEZE_REPORT.md`) are the model this document mirrors on the frontend side wherever a direct analogue exists.

## TypeScript Conventions

- **Strict mode on**, matching the backend's `tsconfig.json`. No `any` — use `unknown` + narrowing, or generate/hand-write a precise type.
- **No default exports** (components, hooks, services, types) — named exports only, mirroring the backend's convention exactly (grep-confirmed zero default exports across all 9 backend modules).
- **One primary declaration per file** — a component file exports that component (+ its own Props type); a service file exports that resource's API functions; a hook file exports that hook.
- **Types mirror backend DTOs 1:1, never invent extra fields.** `features/articles/types/article.ts`'s `Article` type has exactly the fields `ArticleResponseDto` returns — no frontend-only field bolted onto a type that's supposed to represent server data (a frontend-only concern like "isSelected" belongs in local component/table state, not merged into the server-shape type).
- **Discriminated unions for API results** where branching matters (`{ status: 'loading' } | { status: 'error', error: ApiError } | { status: 'success', data: T }`) in shared infrastructure code — feature code normally just consumes TanStack Query's own `isLoading`/`isError`/`data` triple directly rather than re-wrapping it.

## Component Patterns

- **Function components only**, no class components anywhere.
- **Props interfaces named `<Component>Props`**, colocated in the same file as the component unless shared across multiple components (then promoted to that feature's `types/`).
- **Server Components by default**; a component opts into `'use client'` only when it needs interactivity, browser APIs, or a hook that requires it (TanStack Query hooks, React Hook Form, Zustand) — never applied reflexively to an entire feature directory.
- **Composition over prop-drilling configuration objects** — a `DataTable` takes a `columns` array + a `data` array (TanStack Table's own pattern) and slot-based render props for row actions, not a giant `tableConfig` object trying to describe every possible feature's needs generically.
- **No inline styles, no arbitrary Tailwind values** (`w-[123px]`) outside a documented, rare exception (e.g. matching a third-party embed's fixed dimension) — always a token or Tailwind's standard scale.

## Atomic Layering (applied)

Matches `56_ADMIN_FRONTEND_ARCHITECTURE.md`'s Component Strategy:

```
components/ui/*        → Atoms (shadcn primitives, vendored)
components/*  (other)  → Molecules / Organisms (DataTable, FormWrapper, EmptyState, ...)
(no dedicated folder)  → Templates (ListPageTemplate/DetailPageTemplate live in components/layout/
                          or a feature's own components/ if truly feature-specific — promoted to shared
                          the moment a second feature needs the same template shape)
features/*/components/ → Feature Components
components/ (shared)   → Shared Components
components/layout/     → Layout Components
```

A component never skips a layer improperly — a Feature Component composes Organisms/Molecules/Atoms; it does not reach past Organisms to hand-roll table/form primitives itself.

## Table System

**One universal `DataTable`** (`components/data-table/`), built on TanStack Table, used by every list view (Articles, Categories, Tags, Media, Comments, Users):

- **Pagination**: controlled via URL search params (`?page=&limit=`), synced to the backend's `meta.pagination` shape exactly — the table never invents its own pagination state disconnected from what the server actually returned.
- **Search**: a single debounced search input in the table toolbar, wired to the resource's `search` query param (matches `53_API_FREEZE.md`'s Filtering — substring match only, no client-side re-filtering of server-paginated data pretending to be "search").
- **Column Filter**: per-column filter UI driven by that resource's own closed filter set (status dropdown, date range) — never a filter option the backend doesn't support.
- **Sorting**: click-to-sort column headers map to that resource's frozen `SortField` enum; an unsupported column is simply not sortable (no header click handler attached), rather than sending an invalid `sortBy` and relying on the backend's 400 to catch it.
- **Bulk Action**: row-selection checkboxes + a toolbar action bar that appears once ≥1 row is selected; every bulk action is implemented as N individual mutation calls through the existing single-item endpoints (there is no bulk backend endpoint for these resources, except Settings' own `bulkUpdateCategory`/`import` — see `53_API_FREEZE.md`), with a per-item success/failure summary shown at the end, never a silent partial failure.
- **Export Hook**: a `useTableExport()` hook reserved as an architecture point (CSV/JSON export of the current filtered view) — implementation-time concern, not required for Frontend Milestone 1, and not a backend capability (export happens entirely client-side from already-fetched page data, or is explicitly out of scope if a full-dataset export is later needed, which would require a dedicated backend endpoint not currently frozen).
- **Selection**: single or multi-row selection mode, used both for bulk actions and for "picker" use cases (e.g. selecting a Category in a Combobox that's backed by the same DataTable component in compact mode).
- **Responsive**: below the `tablet` breakpoint (`57_DESIGN_SYSTEM.md`), `DataTable` renders each row as a stacked card instead of a horizontal row — implemented once in the shared component, never per-feature.

## Form System

**Reusable primitives** (`components/form/`), composed by every feature's own form components:

- **Form Wrapper** — wraps React Hook Form's `FormProvider`, wires a Zod resolver, and standardizes submit-loading/error state.
- **Field Wrapper** — pairs a label, the input control, a helper/error message, and correct `aria-describedby` wiring in one place, so no feature hand-rolls label/error markup.
- **Validation** — Zod schema colocated with the form (`58_FRONTEND_FOLDER_STRUCTURE.md`'s Colocation Rules), mirroring the corresponding backend DTO's validation rules as closely as the backend exposes them (max lengths, required-ness, enum membership) — never stricter or looser without a documented reason, since a mismatch either blocks a legitimately valid submission or lets an invalid one reach the backend (where it will correctly 400, but with a worse UX than catching it client-side first).
- **Error** — field-level errors render inline (Field Wrapper); form-level/submission errors (a 409 conflict, a 403) render as an Alert at the top of the form, mapped from `ApiError.code` where a specific message is warranted (e.g. `BUSINESS_CONFLICT` on a slug → "This slug is already taken").
- **Submit** — a single `FormSubmitButton` shows a loading spinner during the mutation and disables re-submission, preventing duplicate-submit double-clicks.
- **Loading** — while the form's initial data is being fetched (edit mode), the Form Wrapper renders `FormSkeleton` instead of the real fields.
- **Success** — successful mutations trigger a Toast (`57_DESIGN_SYSTEM.md`) and, per-feature, either a redirect (create → detail page) or an in-place "saved" indicator (edit → stay in place) — the choice is documented per form, not left ambiguous.

## API Layer Conventions

- One `services/*.ts` file per backend resource, exporting plain async functions (`list`, `get`, `create`, `update`, `remove`, `restore`, plus resource-specific actions like `publish`/`approve`) — no class-based "repository" pattern on the frontend; a thin function-per-endpoint mapping is sufficient and mirrors REST directly.
- Every service function's parameter and return types are the feature's own `types/*.ts` types (which mirror backend DTOs — see TypeScript Conventions), never `any`/untyped Axios responses.
- TanStack Query hooks (`features/*/hooks/*.ts`) are the ONLY thing components call — no component imports a `services/*` function directly, keeping caching/invalidation centralized in the hook layer.

## State Management Conventions

Reiterating `56_ADMIN_FRONTEND_ARCHITECTURE.md`'s State Management table as enforceable rules:

- If it came from the API, it lives in TanStack Query — never copy server data into `useState`/Zustand "for convenience."
- If it belongs in the URL (table page/sort/filter, active tab), it lives in the URL — never Zustand.
- If it's genuinely client-only and not shareable via URL (sidebar collapsed state), it's the only case Zustand is appropriate for.
- Form state lives in React Hook Form, full stop — never mirrored into a separate `useState` "for the submit button's disabled state" (RHF's `formState` already has this).

## Code Style / Linting

Aligned with the backend's own tooling for a single consistent developer experience across the monorepo:

- Same root `eslint.config.js`/`.prettierrc` apply (100-char width, single quotes, semicolons, ES5 trailing commas) — no separate frontend-only style config diverging from what the backend already established.
- `npm run lint`/`npm run build` at the workspace root must stay clean for `apps/admin` exactly as they already are for `apps/backend`/`apps/web` (`52_BACKEND_FREEZE_REPORT.md`'s Production Verification) — zero warnings is the bar, not a lower one for frontend code.

## Best Practices

- Every mutation invalidates the exact query keys it affects — never a blanket `queryClient.invalidateQueries()` with no key, which would cause unrelated refetch storms across the whole app.
- Every list-fetching hook accepts the exact filter/sort/pagination shape its resource's backend `*QueryDto` defines — no speculative extra filter param the backend will reject.
- Every permission check reads from the single cached `usePermissions()` source (`56_ADMIN_FRONTEND_ARCHITECTURE.md`'s Permission Flow) — no component re-derives permission logic locally.
- Comments in code follow the same restraint the backend codebase uses: explain _why_, not _what_ — no comment restating what a well-named function/variable already communicates.

## Future Integration

As new features (Pages, Search, Ads, Analytics, etc.) are added, they reuse every system in this document unchanged — the Table/Form/API-layer conventions are deliberately generic across all 9 current + N future resources, not something to be redesigned per feature.

## Limitations

- These guidelines are unvalidated against real code — the first feature built in Frontend Milestone 1 should surface any genuine friction as a documented, reported deviation, not a silent drift.
- Exact ESLint rule configuration for React/Next-specific concerns (hooks rules, JSX a11y) is an implementation-time addition to the existing root config, not specified value-by-value here.

## Cross References

`56_ADMIN_FRONTEND_ARCHITECTURE.md` (the architecture these guidelines implement) · `58_FRONTEND_FOLDER_STRUCTURE.md` (where this code lives) · `52_BACKEND_FREEZE_REPORT.md` §Architecture Verification (the backend conventions mirrored here) · `53_API_FREEZE.md` (the DTO/error/pagination contract these guidelines assume).

## Approved Date

Pending — awaiting explicit approval before Frontend Milestone 1.

## Architecture Status

**CODING GUIDELINES — DESIGN ONLY, AWAITING APPROVAL.**
