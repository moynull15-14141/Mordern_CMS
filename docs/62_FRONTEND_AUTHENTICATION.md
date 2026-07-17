# 62 — Frontend Authentication, Login & Dashboard Foundation (Frontend Milestone 2)

Status: **Complete**. Implements the approved scope from the Frontend Milestone 2 brief against the frozen backend contract (`docs/37_IDENTITY_FREEZE.md`, `docs/38_RBAC_ARCHITECTURE.md`, `docs/52_BACKEND_FREEZE_REPORT.md`, `docs/53_API_FREEZE.md`, `docs/55_FRONTEND_HANDOFF.md`) and the frontend architecture docs (`docs/56`–`docs/61`).

This milestone makes the admin panel usable end-to-end: login, session bootstrap, route/permission/role protection, and a full application shell (sidebar, header, dashboard home). It does **not** implement any business feature module — every nav-manifest route without a shipped feature renders a "Coming Soon" placeholder.

## 1. Architecture

No architectural change from `docs/56_ADMIN_FRONTEND_ARCHITECTURE.md` — this milestone fills in the previously-reserved `features/auth` and `features/dashboard` directories (per `docs/58_FRONTEND_FOLDER_STRUCTURE.md`'s frozen folder shape) and completes the Milestone 1 infrastructure (`AuthProvider`, `ProtectedRoute`, `GuestRoute`, the Axios client) rather than replacing any of it.

Two backend-contract alignment fixes were required (not architecture changes, per the approval's own framing):

- `types/auth.ts`'s `AuthTokens` now matches `AuthTokensDto` exactly: `expiresIn` is a `string` (was incorrectly typed `number`), and `user`/`tokenType` were added (previously missing).
- `lib/api-client.ts` exports a `RequestOptions` type (`AxiosRequestConfig & { public?: boolean }`) so call sites like login can request the public/no-Bearer-token path with a typed config instead of an unsound cast.

## 2. Authentication Flow

```
LoginForm (features/auth/components/login-form.tsx)
  → Zod validation (features/auth/schemas/login.schema.ts — mirrors LoginDto exactly:
    email format + password required only, no policy re-validation, matching
    docs/37_IDENTITY_FREEZE.md "Password Policy": "enforced on reset-password
    only")
  → useLogin() (features/auth/hooks/use-login.ts)
    → api.post('/auth/login', values, { public: true })  — @Public(), no Bearer token attached
    ← AuthTokensDto { accessToken, refreshToken, expiresIn, tokenType, user }
  → AuthContext.login(tokens)
    → tokenStore.setTokens(tokens)          — persists accessToken/refreshToken
    → queryClient.setQueryData(auth.me, tokens.user)   — seeds the cache directly;
                                                           no redundant GET /auth/me
    → queryClient.invalidateQueries(authorization.me)  — no login-response equivalent,
                                                           still needs a real fetch
  → GuestRoute observes isAuthenticated flip to true and performs the actual
    redirect (getRedirectTarget(searchParams), defaulting to /dashboard) — the
    login hook itself never navigates.
```

**Backend error display**: `LoginForm` reads `loginMutation.isError`/`.error`, narrows via `isApiError()`, and renders the backend's own message (generic — "Invalid email or password" — per `docs/37`'s "never reveal whether an email exists" rule) in a destructive `Alert`. No message is invented client-side.

**Loading state**: `FormSubmitButton` is driven explicitly by `loginMutation.isPending`, not by React Hook Form's own `formState.isSubmitting` — `onSubmit` fire-and-forgets `mutate()` (a deliberate choice so RHF's synchronous submit-handler lifecycle doesn't block the async login network call), which means `isSubmitting` resolves to `false` almost immediately and would otherwise never reflect the in-flight request. This was caught and fixed during this milestone's own test-writing.

**Show Password**: `components/ui/password-input.tsx` — a generic UI atom (Input + a keyboard-accessible toggle button, `aria-pressed` reflecting state), reusable by any future password field (change-password, reset-password), not auth-specific.

**Logout**: `AuthContext.logout()` now reads the stored refresh token and sends it as `{ refreshToken }` in the `POST /auth/logout` body (previously sent no body at all — `/auth/logout` requires it to identify which session to revoke; this was Frontend Milestone 2 Conflict Report item #3, fixed as approved). The call is skipped entirely if no refresh token is present. Failure is non-fatal — the client-side session is always cleared in a `finally` block regardless of whether the backend call succeeds, since logout must still work against an already-expired access token.

## 3. Refresh Flow

**Unchanged from Milestone 1, reactive-only, per the approval's explicit decision 5**: no proactive pre-expiry timer, no expiry countdown, no persistence of `expiresIn` for timing purposes. The existing single-flight refresh queue in `lib/api-client.ts` (one in-flight `POST /auth/refresh` per 401 storm, queued requests replay after) is unchanged.

## 4. Session Management

`AuthProvider` (`providers/auth-provider.tsx`) is otherwise structurally unchanged from Milestone 1: `hasTokens` via `useSyncExternalStore` against `tokenStore`, `GET /auth/me` + `GET /authorization/me` both gated on `hasTokens`.

**New this milestone — the "session expired" UX rule from `docs/56_ADMIN_FRONTEND_ARCHITECTURE.md`**: `onSessionExpired`'s listener (fired only when a request that _had_ a token failed to refresh — never for a visitor with no token, since `enabled: hasTokens` prevents those requests from ever being sent in the first place) now shows a toast: _"Your session expired — Please log in again to continue."_ This correctly implements the required local-state distinction ("never logged in" → silent redirect, no toast; "was logged in, now expired" → toast) without needing any extra state — the existing `onSessionExpired` callback's firing conditions already are exactly that distinction.

## 5. Permission Bootstrap

Unchanged from Milestone 1: `PermissionProvider` derives `can`/`canAny`/`canAll`/`isRole` from `AuthContext`'s `roles`/`permissions` (sourced from `GET /authorization/me`), consumed via `usePermissions()`.

**New this milestone — Route Guards** (`docs/60_ADMIN_NAVIGATION.md` "Route Guards" step 2, previously unimplemented since no page existed to protect):

- `components/guards/permission-route.tsx` — `PermissionRoute`, redirects to `/403` (never `/login`) when the current page's permission requirement isn't met. OR semantics by default, AND via `requireAll`.
- `components/guards/role-route.tsx` — `RoleRoute`, the role-based counterpart. No route in the current frozen navigation manifest is role-gated (every entry in `docs/60`'s table is permission-gated), so this exists as reusable infrastructure ahead of that need — matching Milestone 1's own "infrastructure ahead of pages" precedent.

Both are distinct from the existing Component Guards (`PermissionGate`/`RoleGate`), which hide a subtree within an otherwise-rendered page rather than redirecting away from the whole page.

## 6. Route Protection

```
(auth) layout.tsx        SuspenseBoundary → GuestRoute → AuthLayout
  └── login/page.tsx      LoginForm

(dashboard) layout.tsx   ProtectedRoute → DashboardLayout
  └── dashboard/page.tsx           PermissionRoute(dashboard.view) → DashboardHome
  └── articles/page.tsx            PermissionRoute(article.create|update|delete|publish) → ComingSoon
  └── categories/page.tsx          PermissionRoute(category.create) → ComingSoon
  └── tags/page.tsx                PermissionRoute(category.create) → ComingSoon
  └── media/page.tsx                PermissionRoute(media.upload|media.delete) → ComingSoon
  └── comments/page.tsx             (authenticated only) → ComingSoon
  └── seo/page.tsx                  PermissionRoute(seo.manage) → ComingSoon
  └── users/page.tsx                PermissionRoute(users.manage) → ComingSoon
  └── roles/page.tsx                PermissionRoute(roles.manage) → ComingSoon
  └── settings/page.tsx             PermissionRoute(settings.manage) → ComingSoon
  └── activity-logs/page.tsx        PermissionRoute(system.manage) → ComingSoon
  └── system/page.tsx               PermissionRoute(system.manage) → ComingSoon
  └── profile/page.tsx              (authenticated only) → ComingSoon
```

Every permission requirement above matches `docs/60_ADMIN_NAVIGATION.md`'s Navigation Manifest table exactly — no invented permission, no route gated differently than its documented requirement.

**`/401`**: per the approval's decision 3, reused as-is (unchanged from Milestone 1) as the official Unauthorized page for V1 — no new page was created.

## 7. Dashboard Summary

`features/dashboard/components/dashboard-home.tsx` composes:

- **Profile Summary** — real session data (`useAuth().user`), never fabricated.
- **4 Statistic cards** (`StatCardSkeleton`) — label + icon only; the value slot is a permanent `Skeleton`. No resource query is issued anywhere in this milestone's Dashboard code (grep-verified: no `api.get`/`useQuery` call for article/user/comment/category counts).
- **Quick Actions** — permission-gated (`PermissionGate`) buttons that resolve to a "Coming soon" toast, not a real create flow (the underlying feature modules don't exist yet).
- **Recent Activity** — a permanent `EmptyState`, never fabricated log entries, matching `docs/52_BACKEND_FREEZE_REPORT.md`'s "Known Limitations" (no durable Audit persistence exists).
- **System Status** — a permanent `Skeleton`, no `GET /health` call anywhere in this component (per the approval's decision 8).

## 8. Navigation Summary

Unchanged `Sidebar`/`MobileNavDrawer`/`Breadcrumb` from Milestone 1 (data-driven from `config/navigation.ts`, permission-filtered via `useFilteredNavigation()`) now have a real page behind every link — the navigation shell is "fully functional" in the sense the brief specifies: every sidebar item navigates somewhere real, even where that destination is a `ComingSoon` placeholder rather than a finished feature. `Header` gained a "Profile" menu item (linking to `/profile`) alongside the pre-existing theme switcher and (now-fixed) logout action.

## 9. Loading & Error Handling Summary

Per the approval's decision 4, the existing `ProtectedRoute`/`GuestRoute`-driven `PageLoader` pattern remains the **primary** loading mechanism — no `loading.tsx` (Next.js's own App Router convention) was added anywhere in this milestone. None of the new pages perform server-side data fetching or async work during route-segment rendering that `loading.tsx` would meaningfully cover; adding it would only risk a second, redundant loading flash on top of the guard-driven one, which the approval explicitly asked to avoid. The one real Suspense boundary added (`SuspenseBoundary` wrapping `GuestRoute` in `app/(auth)/layout.tsx`) exists for a different, unavoidable reason: Next.js requires any `useSearchParams()` consumer to sit inside a `<Suspense>` boundary for a statically-prerendered page, and `GuestRoute` reads `useSearchParams()` for the post-login redirect target — without it, `next build` fails prerendering `/login` outright. This is a build-correctness fix, not a new loading-UX layer.

Error pages (`/401`, `/403`, `not-found.tsx`, `error.tsx`, `global-error.tsx`) are unchanged from Milestone 1.

## 10. Testing

314 tests across 66 files (cumulative with Milestone 1's suite; up from 273/55), all passing. New coverage this milestone:

- **Contract fixes** — `types/auth.ts`/`api-client.ts` changes verified via updated `lib/api-client.test.ts`, `lib/token-store.test.ts`, `providers/auth-provider.test.tsx` (a shared `test/fixtures/auth.ts` fixture was added so every test constructs a real `AuthTokensDto`-shaped object instead of a partial literal).
- **Guards** — `permission-route.test.tsx`, `role-route.test.tsx` (OR/AND semantics, redirect-to-/403 behavior, mocked `next/navigation`).
- **features/auth** — schema validation edge cases, `useLogin` (public-request flag, success seeding `AuthContext.login()`, error surfacing), `LoginForm` (rendering, validation, submit payload shape including `rememberMe`, pending/disabled state, backend vs. generic error display).
- **features/dashboard** — every card component in isolation plus a `DashboardHome` composition test (permission-gated Quick Actions, real profile data, no fabricated numbers).
- **Header** — mobile drawer trigger, user menu (name/email fallback, Profile link, logout wiring), theme menu.
- **App pages** — representative composition tests (`login/page.tsx`, `dashboard/page.tsx`, `articles/page.tsx`, `comments/page.tsx`) confirming each page wires its `PermissionRoute` (or lack thereof) correctly, on top of the exhaustive `ComingSoonPage`/`PermissionRoute` unit coverage that already exercises every permission-gating branch directly.
- **Session-expired toast** — dedicated `AuthProvider` tests confirming the toast fires when the registered `onSessionExpired` listener is invoked, and does _not_ fire for a first-time unauthenticated visit.

Two genuine defects were found and fixed _by_ this test suite:

1. `LoginForm`'s submit button never actually showed a loading state during the real (async) login request, because it relied on React Hook Form's `formState.isSubmitting`, which resolves synchronously right after the fire-and-forget `mutate()` call returns — fixed by driving `isLoading`/`disabled` explicitly from the mutation's own `isPending`.
2. `next build` failed prerendering `/login` because `GuestRoute`'s `useSearchParams()` had no enclosing `<Suspense>` boundary — fixed by wrapping it in the existing `SuspenseBoundary` component at the `(auth)` layout level.

## 11. Validation Summary

- `npx eslint apps/admin --ext .ts,.tsx --max-warnings=0` → 0 errors, 0 warnings.
- `npx tsc --noEmit` → 0 errors.
- `npm run build` → success, 19 static routes generated (up from 5 in Milestone 1).
- `npx vitest run` → all tests passing.

## 12. Production Readiness

Login, session bootstrap, refresh, logout, and route/permission/role protection are all wired against the real, frozen backend contract and covered by tests — this is real, usable authentication, not a mock. It is not yet exercised against a live running backend (all tests mock the network boundary, consistent with Milestone 1's own limitation) — first live-backend integration remains a pre-production verification step, not a code gap. No business feature exists yet; the admin panel is navigable but not yet productive beyond authentication and viewing the dashboard shell.

## Limitations

- Forgot-password/reset-password pages don't exist — the login form's "Forgot password?" link points at `/forgot-password`, a route reserved in `constants/routes.ts` since Milestone 1 but with no `page.tsx` (out of this milestone's explicit scope).
- No proactive token-refresh timer — a user's very first action after a 15-minute idle period will incur one reactive refresh round-trip (invisible to them, per the existing interceptor), by design (approval decision 5).
- `deviceName` is never collected or sent on login (approval decision 6) — every `Session` row created via this frontend has no device label.
- Quick Actions and all "Coming Soon" pages are non-functional by design — they exist so the navigation shell is fully clickable, not so any feature actually works yet.
- No live-backend verification has been performed (see Production Readiness).

## Future Integration

Each "Coming Soon" route becomes a real feature module in its own future milestone, replacing `ComingSoonPage`'s call with that feature's actual page composition — no change to the route's `PermissionRoute` wrapping or the nav manifest is anticipated, since both already exist and are already correct. A future login enhancement (forgot-password/reset-password) reuses the same `features/auth` directory and `PasswordInput` primitive.

## Cross References

`docs/37_IDENTITY_FREEZE.md` · `docs/38_RBAC_ARCHITECTURE.md` · `docs/52_BACKEND_FREEZE_REPORT.md` · `docs/53_API_FREEZE.md` · `docs/55_FRONTEND_HANDOFF.md` · `docs/56_ADMIN_FRONTEND_ARCHITECTURE.md` · `docs/58_FRONTEND_FOLDER_STRUCTURE.md` · `docs/60_ADMIN_NAVIGATION.md` · `docs/61_FRONTEND_FOUNDATION.md` (the milestone this one builds directly on top of)
