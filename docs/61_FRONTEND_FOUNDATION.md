# 61 — Frontend Foundation (Frontend Milestone 1)

Status: **Complete**. Implements the infrastructure approved in the Frontend Milestone 1 — Core Foundation brief, against the frozen contracts in `docs/53_API_FREEZE.md`, `docs/55_FRONTEND_HANDOFF.md`, `docs/56_ADMIN_FRONTEND_ARCHITECTURE.md`, `docs/57_DESIGN_SYSTEM.md`, `docs/58_FRONTEND_FOLDER_STRUCTURE.md`, `docs/59_FRONTEND_CODING_GUIDELINES.md`, and `docs/60_ADMIN_NAVIGATION.md`.

This milestone builds **only** reusable frontend infrastructure. No business page, module, or API call exists in `apps/admin` yet — every route rendered right now (`/`, `/401`, `/403`, `/_not-found`) is either a redirect or an error page.

## 1. Architecture

- Next.js 16 App Router, React 19, TypeScript strict mode.
- Tailwind CSS v4, CSS-first configuration (`@import 'tailwindcss'` + `@theme inline` in `src/styles/globals.css` / `src/styles/tokens.css` — no `tailwind.config.js`; the legacy `config/tailwind/tailwind.config.js` is untouched and unreferenced).
- shadcn/ui pattern: hand-authored components in `src/components/ui/`, built on Radix UI primitives + `class-variance-authority` + `clsx`/`tailwind-merge` — not CLI-generated.
- TanStack Query v5 for all server state; TanStack Table v8 for the DataTable foundation; Axios for HTTP.
- Zustand (+ `persist` for sidebar-collapse) for genuinely client-only UI state with no server representation.
- `next-themes` for Light/Dark/System theming; `sonner` for toasts.
- Vitest + React Testing Library + jsdom + `@testing-library/user-event` for all tests (no Jest).

## 2. Folder Structure

```
src/
  app/                    App Router routes, root layout, error pages
  components/
    ui/                   shadcn-style primitives (Button, Input, Dialog, ...)
    feedback/              LoadingSpinner, PageLoader, EmptyState, ErrorState, OfflineBanner
    layout/                Sidebar, Header, Footer, Breadcrumb, PageHeader, SearchInput, containers
    guards/                ProtectedRoute, GuestRoute, PermissionGate, RoleGate
    data-table/            DataTable + toolbar/pagination/column-header
    form/                  Form/FormField/FormItem/... RHF+Zod wrapper
  providers/               One file per global provider + app-providers.tsx composer
  hooks/                   useAuth, usePermissions, useModal, useAppForm, ...
  lib/                     env, api-client, api-error, token-store, query-client, toast, error-handler
  stores/                  Zustand stores (ui, loading, modal)
  constants/                PERMISSIONS, API_ENDPOINTS, ROUTES, STORAGE_KEYS, query-keys, theme, app
  config/                   navigation.ts (the one nav manifest)
  types/                    api, auth, navigation, table, form, common
  utils/                    cn, format, string, debounce, throttle, deep-merge, query-builder, permissions, routes
  styles/                   globals.css, tokens.css
```

Matches `docs/58_FRONTEND_FOLDER_STRUCTURE.md` exactly.

## 3. Providers

Composed in `providers/app-providers.tsx`, nested in this order (outermost first) — order matters, see inline comment in that file:

```
ErrorBoundary
  ThemeProvider              (next-themes: Light/Dark/System)
    QueryProvider             (one QueryClient per app instance, devtools dev-only)
      AuthProvider             (session bootstrap: GET /auth/me + GET /authorization/me)
        PermissionProvider      (can/canAny/canAll/isRole, derived from AuthProvider)
          SettingsProvider       (client-local display prefs only — NOT /settings API)
            LoadingProvider       (top-of-viewport progress bar)
              ModalProvider         (imperative modal stack)
                TooltipProvider
                ToastProvider (sonner, theme-aware)
```

`SuspenseBoundary` is a standalone wrapper (not part of the composed tree) for route-level Suspense fallbacks.

## 4. API Layer

`lib/api-client.ts` is the **one** Axios instance for the app (`apiClient`), plus a typed `api.{get,post,patch,put,delete}` wrapper (Axios's static types say `Promise<AxiosResponse<T>>`; the response interceptor already unwraps to bare `T` at runtime, so the wrapper corrects the compile-time type to match).

- **Request interceptor**: injects `Authorization: Bearer <token>` from `lib/token-store.ts`, unless the request config sets `public: true`.
- **Response interceptor**: unwraps the `{success, message, data, meta, errors}` envelope on success; on a 401 (non-public, not already retried), triggers a single in-flight refresh (`refreshAccessToken()`) and replays the original request once via a `_retried` flag — the "refresh-on-401-retry-once" pattern from `docs/55_FRONTEND_HANDOFF.md`. If the refresh itself fails, tokens are cleared and every `onSessionExpired()` subscriber (the Auth Provider) is notified.
- All other failures are mapped to a typed `ApiError` (`lib/api-error.ts`) carrying `.code`, `.status`, `.requestId`, `.errors`, and derived getters `.isNotFound` / `.isForbidden` / `.isUnauthorized` / `.isValidation` / `.isNetworkError`.

No resource-specific service function (e.g. `getArticles()`) exists anywhere — that's explicitly Milestone 2+ work.

## 5. Query Layer

`lib/query-client.ts` — `createQueryClient()`: `staleTime` 30s, `gcTime` 5min, `refetchOnWindowFocus: false`, and a retry policy that **never retries a 4xx** `ApiError` (correctness errors, not transient ones) but retries other failures up to 3 attempts.

`constants/query-keys.ts` defines the factory _pattern_ (`resourceKeys(resource)` → `{all, lists, list(filters), details, detail(id)}`) plus the two keys actually consumed by shared infrastructure (`queryKeys.auth.me()`, `queryKeys.authorization.me()`). Per-feature keys are Milestone 2+ work.

## 6. Theme

`providers/theme-provider.tsx` wraps `next-themes`: `attribute="class"`, `defaultTheme: system`, `enableSystem`, persisted under `STORAGE_KEYS.THEME`. Design tokens live in `src/styles/tokens.css` as OKLCH CSS custom properties under `:root` / `.dark`, mapped into Tailwind utilities via `@theme inline` — matches `docs/57_DESIGN_SYSTEM.md` exactly.

## 7. Authentication

`providers/auth-provider.tsx` bootstraps a session from two real, frozen, read-only endpoints (`GET /auth/me`, `GET /authorization/me`), both gated by `enabled: hasTokens`. `hasTokens` is read via `useSyncExternalStore(tokenStore.subscribe, tokenStore.hasTokens, () => false)` — not `useState` + a mount `useEffect` — so the server snapshot (`false`, no `localStorage` during SSR) and the client's real value never disagree in a way that would either hydration-mismatch or trip `react-hooks/set-state-in-effect`.

- `hooks/use-auth.ts` — throws outside `<AuthProvider>`.
- `providers/permission-provider.tsx` / `hooks/use-permissions.ts` — wraps `permissions`/`roles` from Auth into `can` / `canAny` (OR) / `canAll` (AND) / `isRole`, matching the backend's `RequireAnyPermission` / `RequireAllPermissions` / `RequireRole` decorators.
- `components/guards/protected-route.tsx` / `guest-route.tsx` — redirect to `/login` (preserving the originally-requested path) or away from a guest-only route, respectively. UX-only; the backend independently re-enforces on every request.
- `components/guards/permission-gate.tsx` / `role-gate.tsx` — Component Guards; hide a subtree the user lacks permission/role for, default to rendering nothing.

**No login page, credentials submission flow, or token-acquisition UI exists yet** — `login(tokens)` assumes a future login page has already called `POST /auth/login` itself and hands the resulting tokens to this provider.

## 8. Layout

`components/layout/dashboard-layout.tsx` composes `Sidebar` + `MobileNavDrawer` + `Header` + `Footer`. `components/layout/auth-layout.tsx` is the centered-card shell for `(auth)` routes. Both route groups (`app/(dashboard)/layout.tsx`, `app/(auth)/layout.tsx`) wrap their guard (`ProtectedRoute` / `GuestRoute`) around the corresponding shell — no actual dashboard/login page exists inside either group yet.

`PageContainer` / `ContentContainer` (`components/layout/containers.tsx`) are the two composable wrappers every future page template will use for consistent max-width/padding/vertical rhythm.

## 9. Navigation

`config/navigation.ts` is **the one** navigation manifest (`NAVIGATION: NavGroup[]`) — Sidebar, Breadcrumb, and a future Command Palette all render from it; none independently hand-maintains its own list. Every `permissions` entry references the shared `PERMISSIONS` constant, never a string literal. `flattenNavigation()` produces the flat view the Breadcrumb renderer consumes.

`hooks/use-filtered-navigation.ts` applies the Menu Guard: an item whose permission requirement isn't met is filtered out entirely (not disabled in the DOM); a group left with zero visible items is dropped too.

The routes referenced in the manifest (`/articles`, `/users`, ...) have **no corresponding `page.tsx`** yet — this is infrastructure ahead of the pages that will consume it.

## 10. Components

~24 reusable components with zero business logic:

- **UI primitives** (`components/ui/`): Button, Input, Textarea, Label, Checkbox, Switch, Select, Dialog, Drawer, Card, Badge, Alert, Tabs, DropdownMenu, Popover, Tooltip, Separator, Skeleton, Table.
- **Feedback** (`components/feedback/`): LoadingSpinner, PageLoader, EmptyState, ErrorState (branches on `ApiError.isNotFound`/`.isForbidden`), OfflineBanner (via `hooks/use-online-status.ts`, a `useSyncExternalStore` wrapper around `navigator.onLine` + online/offline events).
- **Layout** (`components/layout/`): PageHeader, SearchInput (debounced), ConfirmDialog, Sidebar, Breadcrumb, Header, Footer, MobileNavDrawer.

## 11. DataTable Foundation

`components/data-table/data-table.tsx` — one `DataTable<TData>` for every future list view, built on `@tanstack/react-table`'s `useReactTable`. Server-driven only: `manualSorting`/`manualPagination` are always `true`; this component never re-sorts or re-paginates data the server already paginated. Handles `isLoading` (skeleton rows), `error` (renders `ErrorState`), and empty (`EmptyState`) states in-place. `createSelectionColumn<TData>()` is exported for features that need row-selection checkboxes. No module-specific `columns` are defined here — every feature supplies its own `ColumnDef<TData>[]`.

## 12. Form Foundation

`components/form/form.tsx` — the standard React-Hook-Form `Form`/`FormField`/`FormItem`/`FormControl`/`FormLabel`/`FormDescription`/`FormMessage` composition. `FormControl` forwards `id`/`aria-describedby`/`aria-invalid` onto the actual field element via Radix `Slot` (not a wrapping `<div>`) so `<FormLabel htmlFor>` resolves to a real labellable element. `hooks/use-app-form.ts` wraps `useForm` + `zodResolver`, `mode: 'onBlur'` by default.

## 13. Utilities

`utils/`: `cn` (class merge), `format` (date/number/currency/file-size/truncate), `string` (capitalize/slugify/titleCase/initials), `debounce`/`throttle`, `deep-merge` (arrays replaced, not merged), `query-builder` (drops undefined/null/empty-string params), `permissions` (pure `has*` evaluators, never a source of truth — the backend re-checks independently), `routes` (public-route detection, login-redirect URL building with open-redirect protection).

## 14. Performance

- `staleTime`/`gcTime` tuned per §5; `refetchOnWindowFocus` disabled to avoid redundant refetches on tab-focus.
- `SuspenseBoundary` pairs with `Skeleton`/`FormSkeleton` for consistent loading shapes at route and form boundaries.
- The DataTable's `@tanstack/react-table` usage is intentionally exempted from the React Compiler's static memoization pass (`react-hooks/incompatible-library` disabled inline, informational only) — the library's mutable table-instance API is not compiler-safe by design, a known and accepted tradeoff.

## 15. Accessibility

- Every icon-only interactive element (`Button` with `variant="icon"`, pagination arrows, clear-search button, etc.) carries an explicit `aria-label`.
- `FormControl` → real labellable element (see §12) so every form field's label is genuinely associated, not just visually adjacent.
- `LoadingSpinner` uses `role="status"` with a visually-hidden default label; `OfflineBanner` uses `role="status"`.
- `Breadcrumb` marks the current page via `aria-current="page"`.
- Focus-visible rings are defined on every interactive primitive via Tailwind's `focus-visible:` variant.

## 16. Testing

273 tests across 55 files (target was 150+), run via `vitest run` with jsdom + React Testing Library + `@testing-library/user-event`. Coverage spans:

- **Utility** — `utils/*.test.ts` (68 tests): pure-function edge cases (invalid dates, open-redirect rejection, debounce/throttle timer behavior, deep-merge array-replace semantics).
- **Constants/config** — `constants/*.test.ts`, `config/navigation.test.ts`: shape/uniqueness invariants (21 permission keys, 11 roles, no duplicate nav ids).
- **Store** — `stores/*.test.ts`: Zustand state transitions in isolation (`getState()`/`setState()`, no React needed).
- **API/lib** — `lib/*.test.ts` (46 tests): `ApiError` getters, the Axios request/response interceptors (token injection, envelope unwrap, 401 refresh-and-retry-once, network-error mapping) invoked directly against the interceptor handlers, `env.ts` fail-fast validation via `vi.resetModules()`.
- **Hook** — `hooks/*.test.tsx`: `renderHook` + a minimal context wrapper per hook; a "throws outside provider" case for every context-consuming hook.
- **Provider** — `providers/*.test.tsx`: `AuthProvider` with `@/lib/api-client` mocked (login/logout/session-expiry), `ErrorBoundary` catching a thrown child, `ModalProvider`/`LoadingProvider` reacting to their backing stores, `AppProviders` composition smoke test.
- **Component** — `components/**/*.test.tsx`: guards (redirect behavior via a mocked `next/navigation`), UI primitives, feedback components, DataTable (loading/error/empty/data states, pagination, debounced search), Form composition (Zod validation surfacing through `FormMessage`).

Two genuine defects were found and fixed _by_ this test suite (not pre-existing knowledge going in):

1. `FormControl` was wrapping fields in a `<div>` instead of forwarding `id`/`aria-*` onto the actual input via `Slot` — broke every form label's `htmlFor` association.
2. `DataTable` passed `rowSelection: undefined` as a _controlled_ TanStack Table state slot, which skips the library's own internal `{}` default and crashes `row.getIsSelected()` for every row, even when row selection isn't used.

A `this`-binding bug in `tokenStore.hasTokens` (broke the moment it was passed by reference into `useSyncExternalStore`) was also caught and fixed.

## 17. Future Integration

- Milestone 2+ builds actual pages behind the routes already listed in `config/navigation.ts` / `constants/routes.ts`.
- A login page will call `POST /auth/login` directly, then call `AuthProvider.login(tokens)`.
- `SettingsProvider` is a placeholder; once a Settings feature module exists, it should read from `GET /settings` instead of holding only a client-local `tableDensity` flag.
- Per-feature query keys should use the `resourceKeys(resource)` factory from `constants/query-keys.ts` rather than hand-writing new key arrays.
- `lib/token-store.ts`'s localStorage mechanism is explicitly flagged (in its own file header, per `docs/55_FRONTEND_HANDOFF.md`'s Integration Checklist) as revisitable — an httpOnly-cookie proxy layer is the production-appropriate replacement, swappable behind the same module interface without touching call sites.

## Limitations

- Zero business pages/CRUD/API calls exist — by design, per the Milestone 1 scope.
- `framer-motion` and `recharts` (part of the original locked tech stack) were deliberately **not** installed this milestone — not part of the approved Milestone 1 dependency list.
- `apps/admin/.env.example` matches the root `.gitignore`'s `.env.*` pattern and will not be tracked by git as-is; flagged, not modified (`.gitignore` changes were out of scope for this milestone).

## Cross References

`docs/35_ARCHITECTURE_FREEZE.md` · `docs/50_V1_PRODUCT_SCOPE.md` · `docs/52_BACKEND_FREEZE_REPORT.md` · `docs/53_API_FREEZE.md` · `docs/55_FRONTEND_HANDOFF.md` · `docs/56_ADMIN_FRONTEND_ARCHITECTURE.md` · `docs/57_DESIGN_SYSTEM.md` · `docs/58_FRONTEND_FOLDER_STRUCTURE.md` · `docs/59_FRONTEND_CODING_GUIDELINES.md` · `docs/60_ADMIN_NAVIGATION.md`
