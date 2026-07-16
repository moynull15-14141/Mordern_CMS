# 20_BACKEND_ARCHITECTURE

## 1. Backend Philosophy

The backend foundation is designed to support a modern, enterprise-grade publishing platform that replaces WordPress without introducing plugin dependency. It is framed by the following principles:

- **Enterprise Grade**: Resilient, secure, observable, and capable of handling large traffic volumes.
- **Clean Architecture**: Separation of concerns between domain, application, infrastructure, and presentation.
- **Modular**: Each domain is isolated so features can be developed, tested, and deployed independently.
- **Highly Scalable**: Supports horizontal scaling of stateless services, workers, and API layers.
- **Maintainable**: Code is organized into predictable layers and packages, enabling future developers to understand and evolve the platform.
- **Cloud Native**: Designed for container orchestration, managed services, and edge-ready deployment.
- **AI Ready**: Built to support practical V1 AI features such as writer, rewrite, summary, meta, FAQ, internal links, tags, and categories.
- **Plugin Free**: All required capabilities are implemented as first-class backend modules rather than plugin extensions.
- **Version 1 Scope**: This architecture is frozen for V1 and covers core CMS, SEO, AI-assisted content, security, analytics, notifications, scheduler, and role-based access control. Advanced multi-tenancy and vector search are explicitly deferred.

## 2. Clean Architecture Layers

The backend is organized into the following layers:

1. **Presentation Layer**
   - API controllers and route handlers.
   - Accepts requests and returns HTTP responses.
   - No direct business logic.

2. **Application Layer**
   - Use cases and orchestration services.
   - Implements business processes across domain entities.
   - Coordinates validation, authorization, persistence, and events.

3. **Domain Layer**
   - Entities, value objects, domain events, and business rules.
   - Contains the core model of publishing platform concepts.
   - Independent from external frameworks.

4. **Infrastructure Layer**
   - Database persistence, messaging, caching, file storage, email, and external API integrations.
   - Implements repository interfaces and system adapters.

5. **Shared Core**
   - Cross-cutting concerns including logging, configuration, error handling, validation, security, and utility functions.

## 3. Folder Structure

The backend folder structure is intentionally shallow and modular:

```
apps/backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── config/
│   ├── common/
│   ├── core/
│   ├── modules/
│   ├── infrastructure/
│   ├── shared/
│   ├── adapters/
│   └── tests/
├── package.json
├── tsconfig.json
└── Dockerfile
```

- `config/`: environment-based configuration and application settings.
- `common/`: guards, interceptors, filters, pipes, decorators.
- `core/`: shared core abstractions, base classes, constants.
- `modules/`: feature-agnostic domain modules.
- `infrastructure/`: external integrations and adapters.
- `shared/`: reusable utilities, types, and validators.
- `adapters/`: port adapters for persistence, queue, cache, file storage.

## 4. Module Boundaries

Backend modules begin as architectural templates, but Phase 2 is focused on infrastructure-ready module boundaries:

- `modules/identity/` (implemented Milestone 4 — authentication engine; was named `modules/auth/` in this original planning list)
- `modules/authorization/` (implemented Milestone 5 — the permission/role *resolution engine*; not in this original planning list, see `38_RBAC_ARCHITECTURE.md`)
- `modules/users/`
- `modules/roles/` (future CRUD business module — distinct from `modules/authorization/`'s read-only engine)
- `modules/permissions/` (future CRUD business module — distinct from `modules/authorization/`'s read-only engine)
- `modules/articles/`
- `modules/categories/`
- `modules/tags/`
- `modules/authors/`
- `modules/media/`
- `modules/pages/`
- `modules/comments/`
- `modules/search/`
- `modules/seo/`
- `modules/ads/`
- `modules/analytics/`
- `modules/notifications/`
- `modules/scheduler/`
- `modules/audit/`
- `modules/ai/`
- `modules/config/`
- `modules/health/`
- `modules/logging/`
- `modules/validation/`
- `modules/exception/`
- `modules/rate-limit/`
- `modules/database/`
- `modules/queue/`
- `modules/cache/`
- `modules/storage/`
- `modules/monitoring/`

Future modules not required for V1 are explicitly deferred to later releases.

## 5. Dependency Rules

- Lower-level layers may depend only on abstractions defined by higher-level layers, never on concrete implementations from higher-level modules.
- Domain layer must remain framework-agnostic.
- Application layer depends on domain and shared abstractions.
- Infrastructure implements interfaces defined in application or shared layers.
- Presentation depends on application and shared layers only.
- No cyclic dependencies between modules.
- Shared core may be consumed by all layers.

## 6. Shared Core

Shared core supports reusable platform building blocks:

- `BaseResponse` and API wrappers.
- `ErrorCode` enumerations.
- `Result` objects or `Either` typed constructs.
- `DomainEvent` contracts.
- `Logger` abstractions.
- `ConfigService` interfaces.
- `Environment` helpers.
- `Security` utilities.

## 7. Infrastructure Layer

Infrastructure is responsible for system services and external adapters:

- Database adapter (Prisma/PostgreSQL)
- Cache adapter (Redis)
- Queue adapter (BullMQ)
- File storage adapter (Cloudflare R2 / S3-compatible)
- Email provider adapter
- Monitoring / metrics adapter
- Search adapter placeholder
- AI provider adapter placeholder

Infrastructure modules are pluggable by implementation but transparent to application services through interfaces.

## 8. Request Lifecycle

1. Request enters controller.
2. Authentication guard resolves identity.
3. Authorization guard checks permissions.
4. Request validation occurs via pipes.
5. Controller delegates to application service.
6. Application service coordinates domain logic.
7. Domain entities and repositories execute.
8. Infrastructure persists or publishes events.
9. Response is mapped and returned.
10. Errors are transformed by exception filters.

## 9. Authentication Flow

- Use JWT-based access tokens.
- Support refresh token lifecycle.
- Support future OpenID Connect / SSO adapters.
- Authentication lives in dedicated auth module.
- Identity context is attached to request and available to services.
- Access tokens validated before authorization.

## 10. Authorization Flow

- Role-based access control (RBAC) from the start.
- Permissions expressed as scoped actions/resources.
- Authorization guard verifies user permissions per request.
- Policy checks may be enforced in services for sensitive operations.
- Supports future attribute-based access extension.

## 11. Validation Flow

- Strong schema validation for all incoming requests.
- Centralized validation pipes in presentation layer.
- Shared DTOs and Zod schemas for consistency.
- Validation errors are normalized into API error responses.

## 12. Exception Flow

- Create centralized exception filter.
- Map all exceptions to structured HTTP response shape.
- Include request ID and trace context.
- Preserve developer-friendly error details in non-production only.
- Avoid leaking internal system errors.

## 13. API Contract Strategy

- Use a single versioned API surface under `/api/v1/` for all backend endpoints.
- Standardize every response — success or error — under one frozen envelope (Milestone 2.1):
  `{ success: boolean, message: string, data: T | null, meta: { requestId?, timestamp, pagination? }, errors: ErrorItem[] }`
  - Success: `success: true`, `data` populated, `errors: []`.
  - Error: `success: false`, `data: null`, `errors` populated (each item: `{ code, message, details? }`).
- Error codes are organized into six categories, each its own enum: Business, Validation, Authentication, Authorization, Infrastructure, System.
- Use pagination metadata in list responses: `page`, `limit`, `total`, `hasNext`, `hasPrevious`.
- Standardize filtering and sorting using query parameters: `filter`, `sort`, `search`, `page`, `limit`.
- Validate all request inputs at the presentation boundary and return normalized error responses.
- Version APIs explicitly by path, not by payload, for V1 simplicity.
- Use token-based authentication for protected routes and keep public discovery endpoints separate.

## 14. Editorial Workflow

- Support the full editorial lifecycle for articles and pages.
- States include: `draft`, `review`, `scheduled`, `published`, `archived`, `deleted`.
- Workflow actions include: create draft, submit for review, schedule publish, publish now, update, archive, restore, delete.
- Editorial state is managed in the application layer and persisted with audit records.
- Comments are created on published articles and moderated before approval.
- Scheduler module handles publish scheduling, notification triggers, and cleanup tasks.

## 15. Logging Strategy

- Use structured JSON logs.
- Log at levels: debug, info, warn, error.
- Capture request correlation IDs.
- Emit logs for startup, config, health, errors, and background jobs.
- Provide adapter to external log sinks (Loki/Sentry) later.

## 16. Configuration Strategy

- Environment-driven config using nested typed objects.
- Single `ConfigModule` loads environment variables, validates them, and exposes typed settings.
- Use `.env` templates per environment.
- Provider selection is supported; feature toggle runtime control is deferred to V2/V3.

## 17. Environment Strategy

- Three primary environments: development, staging, production.
- Each environment has dedicated `.env` file and secrets management.
- Protect production secrets from local development.
- Support local override files in developer workspaces.

## 18. Health Check Strategy

- Health endpoint exposed by a dedicated module.
- Include application liveness and readiness.
- Check dependencies: database, cache, queue, storage.
- Provide three lightweight endpoints (Milestone 2.1): `/health` (application info, no dependency checks), `/live` (liveness probe, no dependency checks), `/ready` (readiness — database check; cache/queue/storage checks are added once those adapters are implemented).

## 19. Database Strategy

- PostgreSQL as the primary relational data store.
- Use Prisma as the ORM adapter.
- Keep schema modeling in `config/prisma/schema.prisma` but no domain models yet.
- Support migrations and seed scaffolding.
- Use a repository pattern for persistence abstraction.

## 20. Queue Strategy

- BullMQ backed by Redis for background work.
- Provide queue adapter in infrastructure layer.
- Use separate worker process definitions.
- Define job contracts and retry behavior.
- Keep queue integration available for AI orchestration, media processing, and scheduled tasks.

## 21. Event Strategy

- Define domain events in shared/core.
- Use event publishers and subscribers for loose coupling.
- Support integration with background workers.
- Keep event flow internal for now; external event bus may be integrated later.

## 22. Background Jobs

- Worker services run outside the HTTP request flow.
- Use queue-based job processors.
- Support scheduled jobs for health, cleanup, and later business tasks.
- Keep worker startup separate from API server.

## 23. API Versioning

- Use URL prefix versioning (`/api/v1/`).
- Keep versioned modules organized in routing.
- Support future versioned upgrades while maintaining backward compatibility.

## 24. File Upload Strategy

- Use presigned upload flow with object storage adapter.
- Keep upload handling separate from request body processing.
- Validate file metadata and size at the API boundary.
- No media module implementation in Phase 2; prepare adapter layer only.

## 25. Caching Strategy

- Use Redis for application caching, rate limiting, and session support.
- Provide a cache adapter with TTL semantics.
- Use cache to reduce load on database and search where needed.
- Keep caching configurable and pluggable.

## 24. Security Strategy

- Harden default headers at the API edge.
- Use rate limiting for public API and authentication endpoints.
- Enforce strong secrets management.
- Prevent common injection and deserialization vulnerabilities.
- Maintain a secure-by-default architecture.
- Support CSRF protection for browser sessions and XSS-resistant payload handling.
- Enforce SQL injection protection through parameterized queries, ORM safeguards, and input validation.
- Use RBAC for all protected routes and include session revocation when refresh tokens are revoked.
- Support password reset and email verification workflows as part of core auth.
- Manage API keys for integrations with expiration and revocation support.

## 25. SEO Engine Strategy

- Implement native SEO metadata support for articles, pages, categories, and author profiles.
- Manage metadata fields for meta title, description, canonical URL, OpenGraph, Twitter card, breadcrumb, JSON-LD, and robots directives.
- Store SEO metadata in `seo_meta` and link it to content via foreign keys.
- Provide a redirect manager and sitemap status tracking for V1 XML, image, news, and RSS sitemap generation.
- Replace WordPress/RankMath-style plugin dependency with built-in SEO domain logic.
- Keep SEO rules explicit, configurable, and available through the backend admin for V1.
- Use a single SEO module rather than external plugins.

## 26. AI Strategy

- Support practical V1 AI capabilities only: writer, rewrite, summary, meta, FAQ, internal links, tags, and categories.
- Use an AI jobs table to persist task requests, status, and results.
- Use reusable prompt templates for AI use cases in a prompt repository.
- Keep AI orchestration simple: queue AI tasks, process them with a worker, persist results, and expose them through the admin workflow.
- Avoid speculative architectures such as vector search, recommendation engines, or AI governance frameworks in V1.
- Align AI outputs with editorial workflow and SEO metadata generation.

## 27. Testing Strategy

- Test the backend foundation with unit and integration tests.
- Focus on configuration validation, health checks, request lifecycle, and adapter scaffolding.
- Avoid business-specific module tests in this phase.
- Establish test folder conventions under `apps/backend/src/tests`.

## 28. Future Scalability Plan

- Keep the backend stateless and horizontally scalable.
- Use container orchestration for API and worker services.
- Separate API, worker, and scheduler processes.
- Maintain clear boundaries so business modules can be added without refactoring the foundation.
- Enable future multi-tenant and multi-cluster deployment patterns in later versions only.
