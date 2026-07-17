# 60_ADMIN_NAVIGATION

## Purpose

Defines the admin panel's complete navigation structure — sidebar menu, route guards, and the mapping of every nav item to the exact backend permission it requires. **Architecture only — no implementation.**

## Architecture

One data-driven navigation manifest (a typed array of `NavItem { route, label, icon, permission, children? }`) is the single source every navigation surface (sidebar, breadcrumbs, command palette) renders from — never three independently hand-maintained lists that can drift out of sync. Every `permission` value in the manifest is one of the 21 frozen keys in `38_RBAC_ARCHITECTURE.md`'s `PERMISSIONS` object, imported from the frontend's own `types/permissions.ts` mirror (`58_FRONTEND_FOLDER_STRUCTURE.md`) — never a hand-typed string literal, so a typo in a permission name fails at compile time, not silently at runtime.

## Navigation Manifest

| Route            | Label                      | Required Permission                                                           | Notes                                                                                                                                                                                                                                                                    |
| ---------------- | -------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/dashboard`     | Dashboard                  | `dashboard.view`                                                              | Landing page after login                                                                                                                                                                                                                                                 |
| `/articles`      | Articles                   | `article.create` OR `article.update` OR `article.delete` OR `article.publish` | Matches the backend's own `RequireAnyPermission` read-gate exactly (`46_ARTICLES_ARCHITECTURE.md`)                                                                                                                                                                       |
| `/categories`    | Categories                 | `category.create`                                                             | Reused for all Category actions per backend's "one coarse permission" pattern                                                                                                                                                                                            |
| `/tags`          | Tags                       | `category.create`                                                             | Same reused key — Tags has no permission of its own (`47_CATEGORY_TAG_ARCHITECTURE.md`)                                                                                                                                                                                  |
| `/media`         | Media Library              | `media.upload` OR `media.delete`                                              | Matches backend's read-gate (`48_MEDIA_LIBRARY_ARCHITECTURE.md`)                                                                                                                                                                                                         |
| `/comments`      | Comments                   | _(none — authenticated only)_                                                 | Listing/moderating-visible-scope requires only login; the **Approve/Reject/Spam actions within the page** are gated by `comment.moderate` at the Action Guard level, not the menu level, since any authenticated user may open the page to see/manage their own comments |
| `/seo`           | SEO                        | `seo.manage`                                                                  | Standalone SeoMeta admin surface only — the inline per-article SEO form has no separate menu entry                                                                                                                                                                       |
| `/users`         | Users                      | `users.manage`                                                                |                                                                                                                                                                                                                                                                          |
| `/roles`         | Roles & Permissions        | `roles.manage`                                                                | Read-only view (see Limitations)                                                                                                                                                                                                                                         |
| `/settings`      | Settings                   | `settings.manage`                                                             | One sub-item per `SettingCategory` (General, Site, Localization, Security, Authentication, Media, SEO, Comments, Analytics, Email, Storage, Search, AI, Performance, Feature Flags, System, Developer)                                                                   |
| `/activity-logs` | Activity Logs              | `system.manage`                                                               | Placeholder — see Limitations                                                                                                                                                                                                                                            |
| `/system`        | System                     | `system.manage`                                                               | Health/build-info, read-only                                                                                                                                                                                                                                             |
| `/profile`       | (avatar menu, not sidebar) | _(none — authenticated only)_                                                 | Self-service                                                                                                                                                                                                                                                             |

Items with no listed permission requirement beyond authentication are visible to every logged-in user — matching the backend's own self-service precedent (`42_USER_MANAGEMENT_ARCHITECTURE.md`, `49_COMMENTS_ARCHITECTURE.md`: "acting on one's own record isn't managing").

## Sidebar Structure

```
[Logo]
─────────────────
Dashboard
─────────────────
Content
  ├─ Articles
  ├─ Categories
  ├─ Tags
  └─ Media
─────────────────
Community
  └─ Comments
─────────────────
SEO
─────────────────
Administration
  ├─ Users
  ├─ Roles & Permissions
  └─ Settings
─────────────────
System
  ├─ Activity Logs
  └─ System
─────────────────
[User avatar / Profile / Logout]
```

Grouping ("Content," "Community," "Administration," "System") is a pure UI grouping for scanability — it has no permission semantics of its own; each item's own permission requirement (table above) is independently evaluated regardless of which group it's rendered under, and a group header is only rendered if at least one of its children is visible.

## Route Guards

Applied at the `(dashboard)` layout level (`56_ADMIN_FRONTEND_ARCHITECTURE.md`'s Layout System):

```
1. Authenticated? (valid access token, or successful silent refresh)
   NO  → redirect to /login?redirect=<original path>
   YES → continue
2. Route requires a permission?
   NO  → render
   YES → does usePermissions() include it (or any-of, per the OR rules above)?
     YES → render
     NO  → redirect to /403 (an in-app "Forbidden" page, NOT /login — the user IS authenticated)
```

Ownership-gated pages (e.g. `/articles/:id` for an Author's own article) cannot be fully resolved by the Route Guard alone (the guard only knows the user holds `article.update` in general, not whether they own THIS article) — the guard passes, the page loads, and a `403` from the actual `PATCH` call is handled by the Form System's error state (`59_FRONTEND_CODING_GUIDELINES.md`), per `56_ADMIN_FRONTEND_ARCHITECTURE.md`'s Permission Flow note on ownership.

## Menu Guard

A `NavItem` whose permission requirement isn't met is **not rendered** (removed from the DOM, not disabled) — consistent with `56_ADMIN_FRONTEND_ARCHITECTURE.md`'s stated rule that a disabled-but-visible item would leak the existence of a capability the viewer can't use. A parent group with zero visible children also doesn't render its own header.

## Breadcrumbs

Derived from the same navigation manifest plus the current route's dynamic segments (e.g. `Articles / Edit "My Article Title"` — the leaf segment's label comes from the loaded entity's title/name once available, showing a Skeleton placeholder until then).

## Command Palette (⌘K)

Optional, reserved architecture point: a searchable flattened view of the same navigation manifest (permission-filtered identically) plus, at implementation time, a per-resource "quick jump to record" search — not required for Frontend Milestone 1, listed here so its data source is specified in advance (the manifest, not a separately-maintained list).

## Best Practices

- Exactly one manifest, consumed by Sidebar + Breadcrumbs + Command Palette — never duplicated.
- Every permission string in the manifest is imported from the shared `PERMISSIONS`-mirror constant, never inlined as a string literal.
- A route with an OR-permission requirement (Articles, Media) uses the same OR semantics the backend's own `RequireAnyPermission` decorator uses for that endpoint — verified against each module's architecture doc, not assumed.

## Future Integration

Pages, Search, Ads, Analytics, Notifications, Scheduler, AI, Authors each add one manifest entry + one sidebar item (likely under a new or existing group) once their backend module ships — no structural change to the manifest/guard mechanism itself is anticipated.

## Limitations

- `/roles` has no backend CRUD to manage — it renders a read-only view of role→permission assignments (sourced from the frozen, code-level `PERMISSIONS`/`SystemRole`/`ROLE_HIERARCHY` constants documented in `38_RBAC_ARCHITECTURE.md`, since no `GET /roles` endpoint exists) until a Roles/Permissions CRUD backend module ships.
- `/activity-logs` has no backend data source (`AuditLoggerService` is log-line-only, not persisted — `52_BACKEND_FREEZE_REPORT.md` Known Limitations) — this route renders an explicit empty/placeholder state, never fabricated log entries.
- Comment moderation actions are Action-Guard-gated (per-button), not Menu-Guard-gated (the whole `/comments` page) — documented above as intentional, not an inconsistency.

## Cross References

`56_ADMIN_FRONTEND_ARCHITECTURE.md` (Permission Flow, Layout System, App Router route list this manifest matches exactly) · `38_RBAC_ARCHITECTURE.md` (the 21 frozen permission keys and 11 system roles this manifest maps to) · `53_API_FREEZE.md` (Authorization section) · `55_FRONTEND_HANDOFF.md` (Permission Flow's "never trust client-side hiding" warning, which every guard in this document exists to honor without violating).

## Approved Date

Pending — awaiting explicit approval before Frontend Milestone 1.

## Architecture Status

**ADMIN NAVIGATION — DESIGN ONLY, AWAITING APPROVAL.**
