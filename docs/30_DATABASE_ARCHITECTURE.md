# 30_DATABASE_ARCHITECTURE

## 1. Database Philosophy

The database architecture is designed for an enterprise AI publishing platform that must support media businesses, multi-site publishing, AI workflows, SEO automation, analytics, and content operations for the next 10–15 years.

Key principles:

- **Durability and Consistency**: Use PostgreSQL as the primary source of truth for content, permissions, configuration, and transactional workflows.
- **Relational model**: Leverage normalized relational design for core entities while retaining flexibility through JSON/JSONB for extensible metadata.
- **Modularity**: Separate domain concerns into clear table groups so features can evolve independently.
- **Scalability**: Design schemas to support large volume tables using indexes, partitioning readiness, and archive strategies.
- **Observability**: Include audit fields and activity records for transparency and compliance.
- **Extensibility**: Provide room for future V2/V3 entities such as collections, series, and generative AI outputs, while keeping V1 schema focused on core CMS, SEO, AI-assisted content, analytics, notifications, and security.
- **Site boundary strategy**: Build for multi-site publishing with site-scoped entities. Tenant-level isolation beyond a single tenant is deferred to later versions.

## 2. Naming Conventions

- Use `snake_case` for all table and column names.
- Prefer descriptive plural table names such as `articles`, `media_assets`, `seo_meta`, `audit_logs`.
- Include the entity in join table names, e.g. `article_tags`, `article_media`.
- Prefix lookup tables with a clear domain when needed: `seo_settings`, `notification_channels`.
- Keep enum-like columns descriptive: `status`, `visibility`, `media_type`, `job_type`.
- Avoid abbreviations unless they are standard and unambiguous.

## 3. UUID Strategy

- Use `UUID` as the primary key for all business entities.
- Generate UUIDs at the application layer or by the database using `gen_random_uuid()`.
- Use UUIDs consistently to support distributed systems and avoid integer collisions.
- Keep surrogate integer IDs only for very high throughput internal tables if required, but prefer UUID across the schema.
- Use explicit `id UUID PRIMARY KEY` columns and separate natural identifiers as needed.

## 4. Soft Delete Strategy

- Use a `deleted_at TIMESTAMP WITH TIME ZONE` column on all soft-deletable entities.
- Soft delete is standard for content, media, redirects, and user-facing entities.
- Hard delete is reserved for audit logs, queue logs, and retention-bound operational cleanup.
- Implement soft delete filters in application repositories and query layers.
- Keep `status` columns to reflect lifecycle state (`draft`, `published`, `archived`, `deleted`).
- Ensure `deleted_at` is excluded from global published views and search indexes.

## 5. Audit Fields

Standard audit fields for all primary entities:

- `created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
- `created_by UUID NULL`
- `updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
- `updated_by UUID NULL`
- `deleted_at TIMESTAMP WITH TIME ZONE NULL`
- `deleted_by UUID NULL`

Additional audit tables capture user actions, system events, and approval history.

## 6. Timestamp Strategy

- Use timezone-aware timestamps for all persisted date/time values.
- Prefer `TIMESTAMP WITH TIME ZONE` for creation, update, publish, schedule, and event timestamps.
- Normalize application timestamps to UTC.
- Use dedicated date columns for business semantics when needed (`publish_date`, `event_date`).
- Use `created_at` and `updated_at` across all tables for temporal analysis.

## 7. Versioning

- Content versioning is supported through revision tables rather than overloading the primary table.
- Maintain revision history for articles, pages, and other editable content using linked version tables, e.g. `article_revisions`.
- Keep the main entity as the current active record and use revision tables for historical snapshots.
- Use version numbers, `version INTEGER NOT NULL`, and optional revision notes.
- Support soft rollback by referencing prior revision records.

## 8. Relationships

- Use foreign keys to enforce ownership and relationships.
- Normalize many-to-many associations with join tables.
- Keep site-scoped ownership explicit: most content tables include `site_id` or `tenant_id` to support multi-site environments.
- Honor ownership semantics through cascade rules appropriate for each relationship.
- Maintain clear parent/child relationships for hierarchical content such as categories and media folders.

## 9. Constraints

- Apply unique constraints for natural identifiers:
  - `users.email`, `roles.name`, `sites.slug`, `articles.site_id` + `slug`.
- Use foreign key constraints for referential integrity between primary entities.
- Use check constraints for enums and semantic validation where possible.
- Use partial unique indexes for scoped uniqueness, e.g. unique on `redirects.site_id, source_path` when `deleted_at` is null.
- Avoid soft delete gaps by combining `deleted_at IS NULL` with unique constraints as needed.

## 10. Index Strategy

- Index primary keys and foreign keys by default.
- Add composite indexes for common filtering patterns:
  - `articles(site_id, status, published_at)
  - `article_tags(article_id, tag_id)
  - `media_assets(site_id, uploaded_by)
  - `analytics_events(site_id, created_at)
- Use GIN indexes for JSONB columns and full text search vectors.
- Use expression indexes for frequent computed filters: `lower(email)` for case-insensitive lookup.
- Consider partial indexes on active content only.
- Monitor index cost for write-heavy tables and apply partitioning as volume grows.

## 11. Performance Considerations

- Keep heavily accessed content in normalized tables, but allow metadata and extensible fields in JSONB.
- Use separate tables for analytics and logs to avoid polluting transactional workloads.
- Optimize read-heavy queries with denormalized materialized views if necessary.
- Use caching and search indexes for public discovery rather than raw relational queries.
- Avoid overly wide rows; keep large text and binary content in separate tables or storage.
- Design for incremental migration and online schema evolution.

## 12. Partitioning (future)

- Anticipate partitioning for large event tables such as `analytics_events`, `search_logs`, and `audit_logs`.
- Partition by time range (`created_at`) for logs and analytics.
- Partition by tenant or site for extremely large, multi-tenant deployments when isolation is required.
- Keep partitioning strategy compatible with application-level queries and retention policies.

## 13. Single Tenant and Site Boundary Strategy

- V1 is designed for a single tenant operating one or more publishing sites.
- Use `site_id` as the primary scope for content, media, SEO, analytics, and editorial operations.
- `tenant_id` is retained in the schema only for future compatibility; V1 behavior does not require full multi-tenant isolation.
- Multi-tenant deployment modes, tenant-level feature partitioning, and tenant-scoped resource residency are deferred to V2/V3.
- Keep security boundaries clear for site-level access control in V1.
- Future tenant partitioning in analytics and event tables is reserved for later versions.

## 14. Backup & Recovery considerations

- Rely on managed PostgreSQL point-in-time recovery in production.
- Build a backup policy for daily base backups and continuous WAL retention.
- Define recovery objectives for production and staging environments.
- Use export-friendly table designs for content and SEO data.
- Maintain backup and restore scripts in infrastructure docs, not in schema.
- Keep audit logs and analytics data in separate backup domains to meet retention requirements.
