# 57_DESIGN_SYSTEM

## Purpose

Defines the visual design system for the admin panel — tokens, component variants, theming, and accessibility baseline. **Architecture only — no implementation.** Every value/rule here is a specification for implementation-time Tailwind config + shadcn/ui theming, not code.

## Architecture

Token-driven, three-layer system:

```
Layer 1 — Primitive tokens (raw values: color scales, spacing scale, radii, shadows, durations)
Layer 2 — Semantic tokens (role-based aliases: --color-background, --color-danger, --radius-card)
Layer 3 — Component variants (shadcn/ui component configs consuming ONLY Layer 2 tokens, never Layer 1 directly)
```

This mirrors the backend's own "vocabulary is code, assignment is data" pattern (`39_SETTINGS_ARCHITECTURE.md`'s `SETTING_DEFINITIONS` vs. `Setting.value`) applied to design: primitives are the closed vocabulary, semantic tokens are the assignment layer, and no component ever hardcodes a primitive value directly — exactly the "no hardcoded colors" rule stated below, generalized to every token category.

## Color Tokens

Semantic roles only (actual hex/OKLCH values are an implementation-time decision, not frozen here — freezing exact colors before a single screen is built would be premature):

| Token                                                    | Purpose                                                                       |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `--color-background` / `--color-foreground`              | Page base                                                                     |
| `--color-card` / `--color-card-foreground`               | Card surfaces                                                                 |
| `--color-popover` / `--color-popover-foreground`         | Dropdowns, dialogs                                                            |
| `--color-primary` / `--color-primary-foreground`         | Primary actions                                                               |
| `--color-secondary` / `--color-secondary-foreground`     | Secondary actions                                                             |
| `--color-muted` / `--color-muted-foreground`             | De-emphasized content                                                         |
| `--color-accent` / `--color-accent-foreground`           | Hover/active highlight                                                        |
| `--color-destructive` / `--color-destructive-foreground` | Delete/dangerous actions                                                      |
| `--color-border` / `--color-input` / `--color-ring`      | Borders, input outlines, focus rings                                          |
| `--color-success` / `--color-warning` / `--color-info`   | Status semantics beyond shadcn's default set — needed for Status Colors below |

**Status Colors** (mapped 1:1 onto real backend enums — never invented independently of them):

| Domain                           | Values                                        | Token                                              |
| -------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| `ContentStatus` (Articles/Pages) | DRAFT, REVIEW, SCHEDULED, PUBLISHED, ARCHIVED | muted, info, warning, success, muted-outline       |
| `CommentStatus`                  | PENDING, APPROVED, REJECTED, SPAM             | warning, success, destructive-outline, destructive |
| `UserStatus`                     | ACTIVE, INACTIVE, SUSPENDED, PENDING          | success, muted, destructive, warning               |
| `MediaStatus`                    | PROCESSING, READY, FAILED, ARCHIVED           | info, success, destructive, muted                  |

No status color is invented for a status the backend doesn't have (e.g. no "Approved-pending-review" color — that's not a real `CommentStatus` value).

## Typography

Semantic scale, not raw pixel values: `text-display` (dashboard hero numbers), `text-heading-1` through `text-heading-4` (page/section titles), `text-body` (default), `text-body-sm` (secondary/meta text), `text-caption` (table cell meta, timestamps), `text-code` (monospace — request IDs, slugs, JSON-LD preview). One font family for UI text, one monospace family for code/IDs — both theme tokens, never hardcoded per component.

## Spacing

4px base unit scale (`space-1` = 4px through `space-16` = 64px, matching Tailwind's default scale rather than inventing a parallel one) — consistent gap/padding/margin usage across every component so a Card's internal padding is the same token used everywhere else a "card-like" padding is needed.

## Radius

Three semantic radii only: `--radius-sm` (inputs, badges), `--radius-md` (buttons, cards — the default), `--radius-lg` (dialogs, large surfaces). No component picks an arbitrary radius outside these three.

## Shadow

Two semantic elevations: `--shadow-sm` (cards resting on the page background), `--shadow-md` (popovers/dropdowns/dialogs floating above content). No third elevation level — two is sufficient for an admin panel's flat information hierarchy and avoids the "shadow soup" anti-pattern.

## Border

`--border-width-default` (1px, the near-universal case) and `--border-width-emphasis` (2px, reserved for a focused/selected table row or active nav item) — border color always via `--color-border`/`--color-ring`, never a one-off gray.

## Animation

Duration/easing tokens only, powered by Framer Motion at implementation time: `--duration-fast` (~120ms — hover/press feedback), `--duration-base` (~200ms — most transitions: dialog open, dropdown expand), `--duration-slow` (~320ms — page-level transitions, drawer slide). One easing curve (`ease-out` for entrances, `ease-in` for exits) applied consistently — animation is never used to mask a slow data fetch (that's Skeleton's job, below).

## Icons

Lucide Icons exclusively (per the locked tech stack) — one icon per semantic concept, mapped in a single `icon-map.ts` (e.g. `article` → `FileText`, `comment` → `MessageSquare`, `seo` → `Search`) so the same concept never gets two different icons in two different features.

## Component Variants

### Button

`default` (primary action), `secondary`, `outline`, `ghost`, `link`, `destructive` (delete/dangerous, always paired with a Confirm Dialog — never a bare destructive button with no confirmation step) — each in `default`/`sm`/`lg`/`icon` sizes.

### Input

`default`, `error` (red ring + helper text, driven by React Hook Form + Zod validation state), `disabled`. Includes `Textarea`, `Select`, `Combobox` (for large option sets like Author/Category pickers), `DatePicker`, `FileInput` (visually present for the Media Strategy's reserved Uploader, functionally inert until a backend `StorageProvider` exists).

### Cards

`default` (page-section container), `stat` (dashboard KPI tile), `interactive` (hoverable, clickable — list-item-as-card patterns).

### Tables

Single `DataTable` variant (see "Table System" in `56_ADMIN_FRONTEND_ARCHITECTURE.md`) with density modifiers `comfortable`/`compact` — no per-feature bespoke table styling.

### Badges

`default`, `secondary`, `outline`, plus the Status Color variants above for entity status display.

### Alerts

`info`, `success`, `warning`, `destructive` — used for persistent, in-page messages (e.g. "This article is scheduled for tomorrow"), distinct from Toast (below), which is for transient, action-triggered feedback.

### Dialog

`default` (confirm/cancel actions), `form` (contains a full form, larger max-width), `destructive` (delete confirmation — requires explicit re-typing of the resource name for high-risk deletes, e.g. deleting a Category with children).

### Toast

`success`, `error`, `info` — triggered by mutation results (create/update/delete succeed or fail), auto-dismiss after a fixed duration except `error`, which requires manual dismissal so a failure is never missed.

### Skeleton

One `Skeleton` primitive (a pulsing muted-token rectangle) composed into per-component skeleton variants (`TableRowSkeleton`, `CardSkeleton`, `FormSkeleton`) matching the real component's layout, shown during a query's initial `isLoading` state — never a generic full-page spinner for a partially-loaded page.

### Loading

Full-page loading uses a single `PageLoader` (centered, minimal) reserved for route transitions only; in-place loading (a button mid-mutation, a table refetching) uses inline spinners/Skeletons, never a full-page overlay for a partial update.

### Empty State

One `EmptyState` component (icon + message + optional CTA), used consistently whenever a list/table has zero items — copy is feature-specific ("No articles yet — create your first one" vs. "No comments to moderate"), the visual pattern is identical everywhere.

### Error State

One `ErrorState` component distinguishing three cases by `errors[0].code` (per `55_FRONTEND_HANDOFF.md`): **not found** (`BUSINESS_NOT_FOUND` → "This doesn't exist" + back link), **forbidden** (403 → "You don't have permission" + no retry button, since retrying won't help), **transient** (5xx/network → "Something went wrong" + retry button, since retrying might help). Never a single generic "Error occurred" for all three, since the correct user action differs by case.

## Theme

**Light / Dark / System**, via `next-themes`. **Theme tokens only — no component ever references a raw color value.** Every token in "Color Tokens" above has a light-mode and dark-mode definition; components consume the semantic token name and never branch on the active theme in component logic (no `if (theme === 'dark')` inside a feature component — if a component needs different behavior per theme beyond color, that's a sign the token layer is insufficient and needs a new semantic token, not a component-level branch).

## Responsive Strategy

**Desktop-first**, three breakpoints: `desktop` (default, ≥1024px — full sidebar + multi-column layouts), `tablet` (768–1023px — collapsible sidebar, tables scroll horizontally or drop secondary columns), `mobile` (<768px — sidebar becomes a drawer/sheet, DataTable switches to a card-list representation per row, forms stack to single-column). Every shared component (DataTable, Form, Dialog) defines its own responsive behavior once, in the component itself — feature code never adds ad hoc responsive overrides.

## Accessibility

**WCAG AA baseline**, non-negotiable for the component library:

- **Keyboard**: every interactive element reachable and operable via keyboard alone (Tab/Shift+Tab/Enter/Space/Escape/Arrow keys per shadcn/Radix's built-in patterns); no custom component removes a native focusable element's keyboard behavior.
- **Focus**: visible focus ring (`--color-ring` token) on every focusable element, never `outline: none` without a replacement; focus is trapped correctly inside open Dialogs/Drawers and returned to the triggering element on close.
- **Screen Reader**: every icon-only button has an `aria-label`; every form field has a programmatically-associated `<label>` (via React Hook Form + shadcn's `FormLabel`); Toast announcements use `aria-live="polite"` (or `"assertive"` for errors); DataTable headers use proper `<th scope="col">` semantics.
- **ARIA**: applied only where native semantics are insufficient (Radix primitives already handle most of this correctly) — no redundant/conflicting ARIA on elements that already have correct native semantics.

## Best Practices

- No component hardcodes a color, spacing value, radius, or duration — always a token.
- No two features style the "same concept" (a status badge, an empty state, a confirm dialog) differently — one shared component per concept, always.
- Dark mode is validated for every new component before merge, not retrofitted later.
- Every destructive action requires a confirmation step; every high-risk destructive action (cascading deletes) requires typed confirmation.

## Future Integration

Exact color palette values, font choices, and the full Tailwind v4 `@theme` token file are implementation-time decisions for Frontend Milestone 1 — this document freezes the _categories_ and _rules_, not final values, deliberately, since committing to exact hex values before any screen exists would be premature (mirrors `40_PRODUCT_PHILOSOPHY.md` Principle 5, "interface before implementation," applied to visual design).

## Limitations

- No exact color/font values are specified — see "Future Integration."
- No components have been built; this document cannot be validated against a real rendered screen until Frontend Milestone 1.
- Animation/Framer Motion usage is specified at the token level only; specific enter/exit choreography per component is an implementation-time decision.

## Cross References

`56_ADMIN_FRONTEND_ARCHITECTURE.md` (Component Strategy, which this document's variants feed into) · `59_FRONTEND_CODING_GUIDELINES.md` (how components consuming these tokens must be written) · `36_DATABASE_FREEZE.md` (the frozen enums — `ContentStatus`, `CommentStatus`, `UserStatus`, `MediaStatus` — that Status Colors must stay in lockstep with) · `40_PRODUCT_PHILOSOPHY.md` (Principle 5, informing the "values deferred, categories frozen" approach here).

## Approved Date

Pending — awaiting explicit approval before Frontend Milestone 1.

## Architecture Status

**DESIGN SYSTEM — DESIGN ONLY, AWAITING APPROVAL.**
