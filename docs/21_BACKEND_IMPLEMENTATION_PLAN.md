# 21_BACKEND_IMPLEMENTATION_PLAN

## Phase 2.1 — Backend Scaffolding

Goal:
- Create the backend project structure and foundational files without implementing business logic.
- Scope this phase strictly to V1 features and avoid scaffolding deferred capabilities.

Files:
- `apps/backend/package.json`
- `apps/backend/tsconfig.json`
- `apps/backend/Dockerfile`
- `apps/backend/src/main.ts`
- `apps/backend/src/app.module.ts`
- `apps/backend/src/config/*`
- `apps/backend/src/common/*`
- `apps/backend/src/core/*`
- `apps/backend/src/modules/*`
- `apps/backend/src/infrastructure/*`
- `apps/backend/src/shared/*`

Dependencies:
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-fastify` (planning only)
- `prisma`, `@prisma/client` (planning only)
- `bullmq` (planning only)
- `ioredis`, `dotenv`, `class-validator`, `class-transformer`

Risks:
- Over-scaffolding before final architecture agreement.
- Inconsistent folder layout with later business modules.

Expected Output:
- Backend folder structure aligned with architecture.
- Placeholder modules and layer skeletons.

Validation Checklist:
- Folder and file structure matches `20_BACKEND_ARCHITECTURE.md`.
- No business-specific code is present.
- Root and backend config files are coherent.

## Phase 2.2 — Core Infrastructure

Goal:
- Define infrastructure adapters and shared core abstractions.

Files:
- `apps/backend/src/infrastructure/database/` (adapter interfaces)
- `apps/backend/src/infrastructure/cache/`
- `apps/backend/src/infrastructure/queue/`
- `apps/backend/src/infrastructure/storage/`
- `apps/backend/src/core/logger.ts`
- `apps/backend/src/core/config.ts`

Dependencies:
- `nestjs/config` (planning only)
- `pino` or logging library (planning only)
- `redis` clients and queue adapters (planning only)

Risks:
- Premature technology decisions before documentation approval.
- Adapter interfaces too rigid for future changes.

Expected Output:
- Infrastructure abstraction contracts defined.
- Shared core services scaffolding in place.

Validation Checklist:
- Adapters expose clean interface contracts.
- Core services do not contain business logic.
- Infrastructure layer is decoupled from application layer.

## Phase 2.3 — Configuration

Goal:
- Implement typed configuration management and environment validation.

Files:
- `apps/backend/src/config/config.module.ts`
- `apps/backend/src/config/config.service.ts`
- `apps/backend/src/config/validation.ts`
- `config/env/*.env`

Dependencies:
- `class-validator`, `joi`, or `zod` (planning only)
- `dotenv` / `nestjs/config`

Risks:
- Configuration schema drift across environments.
- Missing required env variables in staging/production.

Expected Output:
- Typed config accessible throughout the backend.
- Validation prevents misconfigured deployments.

Validation Checklist:
- Local and production env templates exist.
- Validation rules cover required backend settings.
- Config service is referenced by other modules.

## Phase 2.4 — Logging

Goal:
- Establish structured logging and request correlation.

Files:
- `apps/backend/src/common/logging/`.
- `apps/backend/src/core/logger.ts`
- `apps/backend/src/common/interceptors/logging.interceptor.ts`
- `apps/backend/src/infrastructure/logging/adapter.ts`

Dependencies:
- `pino`, `nestjs-pino` (planning only)

Risks:
- Logging too verbose or too sparse.
- Missing correlation across requests.

Expected Output:
- A single logger abstraction.
- Structured logs for request lifecycle.

Validation Checklist:
- Logger is injected via shared core.
- Request ID propagation is designed.
- Logging interceptor exists but no feature logging yet.

## Phase 2.5 — Validation

Goal:
- Define request validation strategy and DTO contracts.

Files:
- `apps/backend/src/common/pipes/validation.pipe.ts`
- `apps/backend/src/common/dto/` placeholder

Dependencies:
- `class-validator`, `class-transformer`

Risks:
- Validation rules too tightly coupled to future business entities.
- Inconsistent request normalization.

Expected Output:
- Validation pipeline skeleton.
- Shared DTO conventions.

Validation Checklist:
- A global validation pipe is planned.
- DTO standards are documented.
- No real entity validation implemented.

## Phase 2.6 — Database

Goal:
- Establish database strategy and Prisma scaffolding.

Files:
- `config/prisma/schema.prisma`
- `apps/backend/src/infrastructure/database/prisma.service.ts`
- `apps/backend/src/infrastructure/database/database.module.ts`

Dependencies:
- `prisma`, `@prisma/client`

Risks:
- Premature schema modeling before domain definition.
- Incorrect production DB config assumptions.

Expected Output:
- Database adapter skeleton and Prisma connection config.
- Migration-ready placeholder schema.

Validation Checklist:
- Prisma schema exists and is referenced.
- DB adapter interface is defined.
- No domain tables are implemented.

## Phase 2.7 — Authentication Framework

Goal:
- Define auth module boundaries and token strategy.

Files:
- `apps/backend/src/modules/auth/auth.module.ts`
- `apps/backend/src/modules/auth/auth.service.ts`
- `apps/backend/src/modules/auth/strategies/`
- `apps/backend/src/common/guards/auth.guard.ts`

Dependencies:
- `@nestjs/jwt`, `passport-jwt` (planning only)

Risks:
- Hard-coding auth strategies before approval.
- Mixing identity stores with business modules.

Expected Output:
- Auth module skeleton with JWT and refresh token plan.
- Auth guard contract.

Validation Checklist:
- Auth flow is documented and scaffolded.
- No user or role logic is implemented.
- Tokens and flows are defined conceptually.

## Phase 2.8 — Authorization Framework

> **Superseded by Milestone 5** (see `docs/38_RBAC_ARCHITECTURE.md`): the three
> placeholder files originally planned below were retired and replaced by the
> real permission/role resolution engine in `modules/authorization/`
> (interfaces, repositories, `AuthorizationService`, decorators, guards,
> policies, providers). This phase's goal — "authorization concepts and RBAC
> contracts" — is what Milestone 5 actually delivers; the file list below is
> kept only as a historical record of the original plan.

Goal:
- Define authorization concepts and RBAC contracts.

Files:
- `apps/backend/src/modules/authorization/roles.ts` (superseded — see note above)
- `apps/backend/src/common/guards/permissions.guard.ts` (superseded — see note above)
- `apps/backend/src/common/decorators/permissions.decorator.ts` (superseded — see note above)

Dependencies:
- none required for design phase.

Risks:
- Authorization patterns too rigid for future use cases.
- Over-designing before actual permission model exists.

Expected Output:
- Authorization abstraction and guard design.
- RBAC concept documentation.

Validation Checklist:
- Permission metadata contract exists.
- Guard and decorator design is present.
- No role-specific rules are implemented.

## Phase 2.9 — Shared Core

Goal:
- Define reusable abstractions and utilities across backend.

Files:
- `apps/backend/src/core/`.
- `apps/backend/src/shared/`.

Dependencies:
- none.

Risks:
- Shared core becomes a dumping ground.
- Poor separation of concerns.

Expected Output:
- Clean shared utility contracts.
- Core abstractions available for future modules.

Validation Checklist:
- Shared core is organized and minimal.
- No business logic or domain implementation.

## Phase 2.10 — Module Template

Goal:
- Create a canonical feature module template for future development.

Files:
- `apps/backend/src/modules/template/`
  - `controller.ts`
  - `service.ts`
  - `module.ts`
  - `dto/`
  - `entities/`
  - `repository.ts`

Dependencies:
- none.

Risks:
- Template may not reflect actual future requirements.

Expected Output:
- Reusable module pattern for all feature modules.

Validation Checklist:
- Template aligns with clean architecture.
- No domain-specific entities are included.

## Phase 2.11 — Business Modules

Goal:
- Stop. No business modules in Phase 2.

Notes:
- After architecture approval, move to Phase 3 for concrete backend implementation.
