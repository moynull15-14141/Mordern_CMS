# 33_PRISMA_MODELING_GUIDE

## Prisma Conventions

- Use PascalCase model names and snake_case database names via `@@map` and `@map` when necessary.
- Keep Prisma model names expressive: `User`, `Article`, `MediaAsset`, `SeoMeta`.
- Use explicit UUID fields with `String @id @default(uuid())` when `UUID` is required.
- Avoid implicit relation fields if the domain requires explicit control over foreign key names.
- Model blocks should be grouped by domain to improve readability.

## Model Organization

- Organize models in `schema.prisma` by logical groups:
  - Identity and security: `User`, `Role`, `Permission`
  - Tenant and site: `Tenant`, `Site`
  - Content: `Author`, `Article`, `Category`, `Tag`, `ArticleTag`
  - Media: `MediaAsset`, `MediaFolder`, `ArticleMedia`
  - SEO: `SeoMeta`, `Redirect`, `Sitemap`
  - Ads: `Ad`, `AdPlacement`
  - Analytics and logs: `AnalyticsEvent`, `SearchLog`, `AuditLog`.
  - AI: `AIJob`, `AIPrompt`
  - Platform support: `Notification`, `Setting`, `APIKey`

- Use comments (`///`) in Prisma schema to document fields and relationships.
- Keep the schema file as the single source of data model truth.

## Enum Strategy

- Represent fixed sets of values as Prisma enums.
- Use enums for status columns, visibility, media types, job types, and notification channels.
- Avoid enum explosion; only model values that are stable and shared across the codebase.
- For dynamic categories or taxonomies, use tables rather than enums.
- Map Prisma enums to underlying database text values where needed with `@db.Text`.

## Relation Strategy

- Use explicit relation fields and `@relation` directives for all relationships.
- Favor foreign key scalar fields for clarity: `siteId String`, `authorId String`.
- Define back-relations for navigation and query convenience.
- Use join models for many-to-many relations rather than implicit relations to support metadata on association tables.
- Keep relation cardinality explicit with `@relation(fields: [authorId], references: [id])`.

## Migration Strategy

- Use Prisma Migrate for schema evolution.
- Keep migration history in version control under `config/prisma/migrations`.
- Create migration plans for structural changes and large-table operations.
- Prefer additive migrations for production deployments.
- Use shadow database for local migration validation.

## Seed Strategy

- Use a dedicated seed script for base data.
- Seed tenants, roles, permissions, and admin user accounts.
- Keep seed data deterministic and environment-aware.
- Do not seed production-specific content in development.
- Use Prisma client in seed scripts with error handling.

## Transaction Strategy

- Use Prisma transactions for multi-step persistence operations.
- Prefer `prisma.$transaction()` for atomic updates across related entities.
- Keep transactions short and avoid long-running locks.
- For long-running workflows, rely on background jobs instead of transactional scope.
- Use explicit retries for concurrency-sensitive operations.
