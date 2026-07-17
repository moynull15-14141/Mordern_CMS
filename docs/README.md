# Documentation Index

This is the entry point to every document in `/docs`. Per `RULE_ZERO`, documentation is the source of truth — if code and a document ever disagree, the document wins (or the conflict is reported and resolved here, in `43_CONFLICT_RESOLUTION.md`, never silently in code).

Each entry below lists **Purpose**, **Status**, **Version**, and **Related Documents**.

---

## Architecture

### `20_BACKEND_ARCHITECTURE.md`

- **Purpose:** Core backend architecture — clean-architecture layers, folder structure, module boundaries, request/auth/authorization/validation/exception flows, API contract strategy.
- **Status:** Frozen (V1)
- **Version:** V1
- **Related:** `21_BACKEND_IMPLEMENTATION_PLAN.md`, `35_ARCHITECTURE_FREEZE.md`, `44_SYSTEM_OVERVIEW.md`

### `21_BACKEND_IMPLEMENTATION_PLAN.md`

- **Purpose:** Frozen V1 implementation phases (2.1–2.11) for backend scaffolding, infrastructure, and foundation work — largely historical now that Milestones 3–7 have superseded most of its placeholders.
- **Status:** Frozen (historical record)
- **Version:** V1
- **Related:** `20_BACKEND_ARCHITECTURE.md`, `35_ARCHITECTURE_FREEZE.md`, `43_CONFLICT_RESOLUTION.md`

### `34_ARCHITECTURE_AUDIT.md`

- **Purpose:** Historical audit of the architecture/database documentation prior to the V1 freeze; records resolved and deferred audit findings.
- **Status:** Frozen (historical record — audit closed)
- **Version:** V1
- **Related:** `35_ARCHITECTURE_FREEZE.md`, `36_DATABASE_FREEZE.md`

### `35_ARCHITECTURE_FREEZE.md`

- **Purpose:** Final frozen architecture declaration — module list, technology stack, folder structure, rejected/approved audit suggestions, deferred features.
- **Status:** Frozen (V1), amended twice (Milestone 6 feature-flags reversal note, Milestone 6 module-list addition)
- **Version:** V1
- **Related:** `20_BACKEND_ARCHITECTURE.md`, `36_DATABASE_FREEZE.md`, `43_CONFLICT_RESOLUTION.md`, `45_PROJECT_FREEZE_V1.md`

---

## Backend

### `20_BACKEND_ARCHITECTURE.md` — see Architecture, above.

### `21_BACKEND_IMPLEMENTATION_PLAN.md` — see Architecture, above.

---

## Database

### `30_DATABASE_ARCHITECTURE.md`

- **Purpose:** Database philosophy — durability, relational modeling, modularity, scalability, observability, extensibility, site-boundary strategy.
- **Status:** Frozen (V1)
- **Version:** V1
- **Related:** `31_DATABASE_TABLES.md`, `36_DATABASE_FREEZE.md`

### `31_DATABASE_TABLES.md`

- **Purpose:** Detailed V1 table definitions — columns, relationships, indexes, cascade rules — for every model, including `Settings`.
- **Status:** Frozen (V1), with one known documentation/schema drift — see `43_CONFLICT_RESOLUTION.md`'s "Email/username uniqueness" entry (this doc claims a unique constraint that doesn't exist in the actual schema).
- **Version:** V1
- **Related:** `32_ENTITY_RELATIONSHIP.md`, `33_PRISMA_MODELING_GUIDE.md`, `36_DATABASE_FREEZE.md`, `43_CONFLICT_RESOLUTION.md`

### `32_ENTITY_RELATIONSHIP.md`

- **Purpose:** Final ER diagram (Mermaid) and cardinality definitions for the frozen V1 schema.
- **Status:** Frozen (V1), updated once during Milestone 3.1 (Menus/ActivityLogs sync)
- **Version:** V1
- **Related:** `31_DATABASE_TABLES.md`, `36_DATABASE_FREEZE.md`

### `33_PRISMA_MODELING_GUIDE.md`

- **Purpose:** Prisma modeling conventions — naming, UUID strategy, model organization by domain — aligned to the frozen schema.
- **Status:** Frozen (V1)
- **Version:** V1
- **Related:** `36_DATABASE_FREEZE.md`

### `36_DATABASE_FREEZE.md`

- **Purpose:** Official freeze declaration for the V1 database — schema version, totals, soft-delete strategy, partial unique index strategy, UUID strategy, migration strategy, enum reference. The literal implementation of record for `config/prisma/schema.prisma`.
- **Status:** Frozen (V1), amended once (Milestone 6 feature-flags note)
- **Version:** V1.2 (schema version)
- **Related:** `30_DATABASE_ARCHITECTURE.md`, `31_DATABASE_TABLES.md`, `32_ENTITY_RELATIONSHIP.md`, `33_PRISMA_MODELING_GUIDE.md`, `43_CONFLICT_RESOLUTION.md`

---

## Identity

### `37_IDENTITY_FREEZE.md`

- **Purpose:** Official freeze declaration for Identity & Authentication (JWT strategy, refresh-token rotation, session strategy, password policy, provider abstractions, API contract). The literal implementation of record for `modules/identity/`.
- **Status:** **Frozen**, V1.1 (Milestone 4.1 patch applied)
- **Version:** V1.1
- **Related:** `38_RBAC_ARCHITECTURE.md`, `42_USER_MANAGEMENT_ARCHITECTURE.md` (reuse strategy), `43_CONFLICT_RESOLUTION.md`

---

## RBAC

### `38_RBAC_ARCHITECTURE.md`

- **Purpose:** Official freeze declaration for the RBAC resolution engine — permission naming, role hierarchy, permission resolution, guards, decorators, policies. The literal implementation of record for `modules/authorization/`.
- **Status:** **Frozen** (V1), extended once (Milestone 6/patch: deferred `settings.view` permission-split note)
- **Version:** V1
- **Related:** `37_IDENTITY_FREEZE.md`, `39_SETTINGS_ARCHITECTURE.md`, `42_USER_MANAGEMENT_ARCHITECTURE.md`, `43_CONFLICT_RESOLUTION.md`

---

## Settings

### `39_SETTINGS_ARCHITECTURE.md`

- **Purpose:** Platform Settings & System Configuration Foundation — categories, types, scope, priority chain, validation, security, feature-flags migration. The literal implementation of record for `modules/settings/`.
- **Status:** Implemented, Awaiting Approval; extended twice by stabilization patches (Global uniqueness clarification, deferred permission-split note)
- **Version:** V1 (Milestone 6)
- **Related:** `36_DATABASE_FREEZE.md`, `38_RBAC_ARCHITECTURE.md`, `43_CONFLICT_RESOLUTION.md`

---

## Users

### `42_USER_MANAGEMENT_ARCHITECTURE.md`

- **Purpose:** User Management Foundation — CRUD, profile/preferences (metadata JSON strategy), sessions, password, avatar, permission model. The literal implementation of record for `modules/users/`.
- **Status:** Implemented, Awaiting Approval
- **Version:** V1 (Milestone 7)
- **Related:** `37_IDENTITY_FREEZE.md` (reuse strategy), `38_RBAC_ARCHITECTURE.md`, `39_SETTINGS_ARCHITECTURE.md` (metadata-JSON precedent), `43_CONFLICT_RESOLUTION.md`

---

## Freeze Documents

Documents whose status is **Frozen** — no model, relation, enum, index, auth flow, or RBAC resolution rule may change without a new milestone document per `RULE_ZERO`:

- `35_ARCHITECTURE_FREEZE.md`
- `36_DATABASE_FREEZE.md`
- `37_IDENTITY_FREEZE.md`
- `38_RBAC_ARCHITECTURE.md`

Settings (`39`) and Users (`42`) are **implemented and verified but not yet marked Frozen** — they remain "Awaiting Approval" until you explicitly sign off, per each milestone's own closing instruction.

---

## Product Philosophy

### `40_PRODUCT_PHILOSOPHY.md`

- **Purpose:** Durable product principles (AI optional, provider pattern, configuration over hardcoding, no vendor lock-in, product editions, AI roadmap) — not milestone-scoped, applies to every future decision.
- **Status:** Frozen (permanent — applies beyond V1)
- **Version:** V1 (principles), evergreen
- **Related:** `41_PLATFORM_CAPABILITIES.md`, `45_PROJECT_FREEZE_V1.md`

---

## Capabilities

### `41_PLATFORM_CAPABILITIES.md`

- **Purpose:** Platform capabilities and product philosophy — navigation, dynamic pages, homepage builder, widgets, routing, theme engine, SEO, publishing workflow, media, RBAC, AI, database, deployment, editions.
- **Status:** Frozen (Architecture Freeze, applies to Single Site + future Agency/Enterprise/SaaS editions)
- **Version:** V1.0
- **Related:** `40_PRODUCT_PHILOSOPHY.md`, `45_PROJECT_FREEZE_V1.md`

---

## Conflict Resolution

### `43_CONFLICT_RESOLUTION.md`

- **Purpose:** Single source of truth for every architecture conflict identified and resolved across Milestones 2–7 — what was reported, why, what was decided, and current status of each.
- **Status:** Awaiting Approval (this stabilization patch)
- **Version:** Covers Milestones 2–7
- **Related:** Every document above — this is the cross-reference index for _why_ each frozen/implemented decision looks the way it does.

---

## System Overview

### `44_SYSTEM_OVERVIEW.md`

- **Purpose:** Official architecture overview — high-level Mermaid system diagram, the five project layers and their responsibilities, request/authentication/authorization/database/configuration flows, module inventory.
- **Status:** Awaiting Approval (this stabilization patch)
- **Version:** As of Milestone 7
- **Related:** `20_BACKEND_ARCHITECTURE.md`, `35_ARCHITECTURE_FREEZE.md`, `36_DATABASE_FREEZE.md`, `37_IDENTITY_FREEZE.md`, `38_RBAC_ARCHITECTURE.md`, `39_SETTINGS_ARCHITECTURE.md`, `42_USER_MANAGEMENT_ARCHITECTURE.md`

---

## Project Freeze

### `45_PROJECT_FREEZE_V1.md`

- **Purpose:** Official V1 project snapshot — versions, milestones/modules completed/pending/deferred, and the full Future V2/V3/SaaS/Enterprise/AI/Search/Analytics/Multi-Site/Plugin/Theme/Widget/Landing-Builder/Mega-Menu/Dynamic-Homepage roadmap, each explicitly marked Completed/In Progress/Deferred/Frozen/Not Started/Not Planned.
- **Status:** Awaiting Approval (this stabilization patch)
- **Version:** V1.0 snapshot, as of the post-Milestone-7 stabilization patch
- **Related:** `40_PRODUCT_PHILOSOPHY.md`, `41_PLATFORM_CAPABILITIES.md`, `43_CONFLICT_RESOLUTION.md`

---

## Other Files in `/docs` (Not Part of the Numbered Series)

- `RULE_ZERO.MD` — the six foundational rules governing how documentation and implementation relate; referenced implicitly by every document above.
- `database filan.md` — an orphaned early draft, content-identical in substance to `40_PRODUCT_PHILOSOPHY.md` but unnumbered and un-maintained. **Not canonical** — superseded entirely by `40_PRODUCT_PHILOSOPHY.md`. Flagged here for transparency rather than silently ignored; recommend deleting it in a future cleanup pass (out of scope for this documentation-only patch, which touches no pre-existing file's content).

## Numbering Reference

| Range | Category                                                                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 20–21 | Backend architecture                                                                                                                                               |
| 30–34 | Database architecture                                                                                                                                              |
| 35    | Architecture freeze                                                                                                                                                |
| 36    | Database freeze                                                                                                                                                    |
| 37    | Identity freeze                                                                                                                                                    |
| 38    | RBAC architecture                                                                                                                                                  |
| 39    | Settings architecture                                                                                                                                              |
| 40–41 | Product philosophy / platform capabilities                                                                                                                         |
| 42    | User management architecture                                                                                                                                       |
| 43    | Conflict resolution history                                                                                                                                        |
| 44    | System overview                                                                                                                                                    |
| 45    | Project freeze (V1 snapshot)                                                                                                                                       |
| 46+   | Next free — reserved for future documents (e.g. a future event-architecture freeze, proposed but not yet started; see `43_CONFLICT_RESOLUTION.md` Recommendations) |
