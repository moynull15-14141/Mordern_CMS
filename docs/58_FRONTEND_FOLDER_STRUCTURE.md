# 58_FRONTEND_FOLDER_STRUCTURE

## Purpose

Defines the complete `apps/admin/src/` folder structure and the rule set for what goes where. **Architecture only — no implementation.** This is the frontend counterpart to the backend's own consistent `controllers/services/repositories/...` per-module layout (confirmed identical across all 9 business modules in `52_BACKEND_FREEZE_REPORT.md`) — the frontend adopts an equally strict, equally consistent convention.

## Architecture

Feature-first at the top level, layered internally per feature. A feature directory's internal shape is fixed and identical across every feature, exactly like the backend's per-module shape is fixed and identical across `articles/`, `categories/`, `media/`, etc.

## Folder Structure

```
apps/admin/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── articles/[...routes per 56_ADMIN_FRONTEND_ARCHITECTURE.md]
│   │   ├── categories/…
│   │   ├── tags/…
│   │   ├── media/…
│   │   ├── comments/…
│   │   ├── seo/…
│   │   ├── users/…
│   │   ├── roles/…
│   │   ├── settings/[category]/page.tsx
│   │   ├── profile/…
│   │   ├── activity-logs/page.tsx
│   │   ├── system/page.tsx
│   │   └── layout.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── global-error.tsx
│   └── layout.tsx
│
├── features/
│   ├── articles/
│   │   ├── components/       — ArticleForm, ArticleTable, ArticleStatusBadge, RevisionDiffView, ...
│   │   ├── hooks/            — useArticles, useArticle, useCreateArticle, useUpdateArticle, usePublishArticle, ...
│   │   ├── services/         — articlesService.ts (typed API functions for /articles/*)
│   │   ├── types/            — Article, CreateArticleInput, ArticleFilters (mirrors backend DTOs 1:1)
│   │   ├── schemas/          — Zod schemas for ArticleForm (mirrors CreateArticleDto/UpdateArticleDto validation)
│   │   ├── constants/        — ARTICLE_SORT_FIELDS, ARTICLE_STATUS_LABELS
│   │   └── index.ts          — the feature's ONE public export surface
│   ├── categories/            — identical internal shape
│   ├── tags/                  — identical internal shape
│   ├── media/                 — identical internal shape (+ a `folders/` sub-concern within components/hooks/services)
│   ├── comments/              — identical internal shape
│   ├── seo/                   — identical internal shape (shared SeoFieldsForm used by both the standalone
│   │                            surface and embedded inline in articles/categories forms — see 56 "SEO Strategy")
│   ├── users/                  — identical internal shape
│   ├── settings/               — identical internal shape (one sub-concern per SettingCategory)
│   ├── auth/                   — login/refresh/permission-fetch logic, NOT a route — consumed by (auth) route group
│   │                            and by providers/AuthProvider
│   └── dashboard/               — KPI widgets, activity feed placeholder (see Limitations)
│
├── components/
│   ├── ui/                    — shadcn/ui primitives as installed (button.tsx, input.tsx, dialog.tsx, ...) — NEVER
│   │                            hand-edited beyond shadcn's own theming mechanism, so `npx shadcn add` stays safe to re-run
│   ├── data-table/             — the universal DataTable organism (56 "Table System") + its sub-parts
│   │                            (DataTablePagination, DataTableToolbar, DataTableColumnHeader, ...)
│   ├── form/                   — FormWrapper, FieldWrapper, FormSubmitButton (56 "Form System")
│   ├── layout/                 — Sidebar, Topbar, Breadcrumbs, PageHeader — composed by app/ layouts, not by features
│   ├── feedback/               — EmptyState, ErrorState, Skeleton variants, PageLoader (57 "Design System")
│   └── guards/                 — RouteGuard, PermissionGuard, MenuGuard, ActionGuard (56 "Permission Flow")
│
├── hooks/
│   ├── use-debounce.ts
│   ├── use-media-query.ts
│   ├── use-permissions.ts      — wraps the cached GET /authorization/me query
│   └── use-current-user.ts
│
├── lib/
│   ├── api-client.ts           — the one Axios instance + interceptors (56 "API Layer")
│   ├── query-client.ts         — the one TanStack QueryClient instance + default options
│   ├── query-keys.ts           — shared query-key factory conventions (per-feature keys still live in
│   │                            features/*/hooks, but the FACTORY PATTERN is defined once here)
│   └── env.ts                  — typed, validated access to NEXT_PUBLIC_* env vars (mirrors the backend's
│                                own env.validation.ts fail-fast philosophy)
│
├── providers/
│   ├── query-provider.tsx      — QueryClientProvider + devtools (dev only)
│   ├── theme-provider.tsx      — next-themes ThemeProvider
│   ├── auth-provider.tsx       — session bootstrap, exposes useAuth()
│   └── app-providers.tsx       — composes all of the above into one <AppProviders> for app/layout.tsx
│
├── stores/
│   ├── ui-store.ts             — sidebar collapsed/expanded, active command-palette state
│   └── (feature-scoped stores, if genuinely needed, live inside that feature's own directory instead —
│       a TRULY global store here is the exception, not the default; see 56 "State Management")
│
├── styles/
│   ├── globals.css             — Tailwind v4 entry + @theme token definitions (57 "Design System")
│   └── tokens.css              — semantic token layer, imported by globals.css
│
├── types/
│   ├── api.ts                  — ApiResponse<T>, ApiError, PaginationMeta (mirrors the backend's frozen envelope
│   │                            exactly — 53_API_FREEZE.md)
│   └── permissions.ts          — the frontend mirror of PERMISSIONS from 38_RBAC_ARCHITECTURE.md — one
│                                constant object, never a hand-typed string literal at a call site
│
└── utils/
    ├── format.ts                — date/number/filesize formatting helpers
    └── cn.ts                    — the standard shadcn `cn()` class-merge utility
```

## Naming Conventions

- **Files**: `kebab-case.ts`/`kebab-case.tsx` throughout (matching the backend's own file-naming convention — e.g. `article-ownership.policy.ts` — for cross-stack consistency).
- **Components**: `PascalCase` export names, one primary component per file, file name matches the component in kebab-case (`article-status-badge.tsx` exports `ArticleStatusBadge`).
- **Hooks**: `use-*.ts`, exporting a single `use*` hook per file (co-located variants like `useArticle`/`useArticles` may share a file if they share a query-key namespace).
- **Types**: named exports only, no default exports anywhere in the codebase (matching the backend's own convention, confirmed consistent across all 9 modules).
- **Feature public surface**: every `features/*/index.ts` re-exports only what other layers (`app/`) actually need (page-level hooks/components) — internal helpers stay unexported, enforced by not re-exporting them, not by a lint rule alone.

## Colocation Rules

1. A feature's Zod schema lives next to the form that uses it, not in a separate global `schemas/` bucket — only truly cross-feature schemas (e.g. the shared pagination query-param schema) live in `types/`/`lib/`.
2. A component used by exactly one feature lives in that feature's `components/`; a component used by two or more features is promoted to `components/` (shared) — promotion happens when the second consumer appears, not preemptively.
3. Tests (when introduced) colocate as `*.test.tsx`/`*.test.ts` next to the file under test, mirroring the backend's `*.spec.ts` colocation convention exactly.

## Best Practices

- No file in `app/` contains business logic beyond composing `features/*` components and reading route params/search params — pages are thin, matching the backend's "controllers are thin, no business logic" rule (`52_BACKEND_FREEZE_REPORT.md`).
- No feature imports another feature's internal (non-`index.ts`) path — see `56_ADMIN_FRONTEND_ARCHITECTURE.md`'s Best Practices.
- `components/ui/` is treated as generated/vendored code — customize via shadcn's theming layer (CSS variables, `components.json` config), not by hand-editing primitive component internals, so upgrades stay low-friction.

## Future Integration

New backend modules (Pages, Search, Ads, Analytics, Notifications, Scheduler, AI, Authors, Roles/Permissions CRUD) each get one new `features/*` directory with this exact same internal shape, plus one new `app/(dashboard)/*` route group — no exception to the pattern is anticipated.

## Limitations

- This structure has not been validated against a real build — some adjustment during Frontend Milestone 1 is expected and should be reported as a documented deviation (per `RULE_ZERO`), not silently drifted from.
- No `apps/admin` code beyond the existing bare Next.js scaffold exists yet.

## Cross References

`56_ADMIN_FRONTEND_ARCHITECTURE.md` (the architecture this structure implements) · `59_FRONTEND_CODING_GUIDELINES.md` (coding rules applied within this structure) · `44_SYSTEM_OVERVIEW.md` (the backend module boundaries this structure's `features/*` split mirrors).

## Approved Date

Pending — awaiting explicit approval before Frontend Milestone 1.

## Architecture Status

**FOLDER STRUCTURE — DESIGN ONLY, AWAITING APPROVAL.**
