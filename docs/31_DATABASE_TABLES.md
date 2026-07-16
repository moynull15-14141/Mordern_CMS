# 31_DATABASE_TABLES

## Users

- Purpose: Store authenticated platform users and their profile identity.
- Columns:
  - `id UUID PRIMARY KEY`
  - `tenant_id UUID NULL`
  - `site_id UUID NULL`
  - `email TEXT NOT NULL`
  - `username TEXT NULL`
  - `display_name TEXT NULL`
  - `password_hash TEXT NULL`
  - `status TEXT NOT NULL`
  - `profile_image_id UUID NULL`
  - `last_login_at TIMESTAMPTZ NULL`
  - `metadata JSONB NULL`
  - audit fields
- Data Types: UUID, TEXT, TIMESTAMP WITH TIME ZONE, JSONB.
- Relationships: optional `tenant_id -> tenants.id`, optional `site_id -> sites.id`, optional `profile_image_id -> media_assets.id`.
- Required Indexes: `email UNIQUE`, `site_id`, `lower(email)` for case-insensitive login.
- Unique Constraints: `email` scoped per site for V1.
- Cascade Rules: No cascade delete for users; use soft delete.
- V1 Behavior: support a single tenant with site-scoped users. Tenant isolation is deferred.

## Sessions

- Purpose: Store active user sessions and device metadata.
- Columns:
  - `id UUID PRIMARY KEY`
  - `user_id UUID NOT NULL`
  - `site_id UUID NULL`
  - `refresh_token_id UUID NULL`
  - `ip_address TEXT NULL`
  - `user_agent TEXT NULL`
  - `device_name TEXT NULL`
  - `last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `expires_at TIMESTAMPTZ NOT NULL`
  - `revoked_at TIMESTAMPTZ NULL`
  - audit fields
- Relationships: `user_id -> users.id`, optional `site_id -> sites.id`, optional `refresh_token_id -> refresh_tokens.id`.
- Required Indexes: `user_id`, `refresh_token_id`, `expires_at`.
- Unique Constraints: none.
- Cascade Rules: cascade delete on user removal.
- V1 Behavior: support JWT refresh lifecycle and session invalidation.

## RefreshTokens

- Purpose: Store refresh token metadata for JWT session management.
- Columns:
  - `id UUID PRIMARY KEY`
  - `user_id UUID NOT NULL`
  - `token_hash TEXT NOT NULL`
  - `issued_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `expires_at TIMESTAMPTZ NOT NULL`
  - `revoked_at TIMESTAMPTZ NULL`
  - `revoked_reason TEXT NULL`
  - audit fields
- Relationships: `user_id -> users.id`.
- Required Indexes: `user_id`, `token_hash UNIQUE`.
- Unique Constraints: `token_hash`.
- Cascade Rules: cascade delete on user removal.
- V1 Behavior: support refresh token revocation and session rotation.

## PasswordResetTokens

- Purpose: Support password reset workflows.
- Columns:
  - `id UUID PRIMARY KEY`
  - `user_id UUID NOT NULL`
  - `token_hash TEXT NOT NULL`
  - `expires_at TIMESTAMPTZ NOT NULL`
  - `used_at TIMESTAMPTZ NULL`
  - `requested_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - audit fields
- Relationships: `user_id -> users.id`.
- Required Indexes: `user_id`, `token_hash UNIQUE`.
- Unique Constraints: `token_hash`.
- Cascade Rules: cascade delete on user removal.
- V1 Behavior: support secure password reset flows.

## EmailVerifications

- Purpose: Support email verification and account activation.
- Columns:
  - `id UUID PRIMARY KEY`
  - `user_id UUID NOT NULL`
  - `token_hash TEXT NOT NULL`
  - `expires_at TIMESTAMPTZ NOT NULL`
  - `verified_at TIMESTAMPTZ NULL`
  - `requested_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - audit fields
- Relationships: `user_id -> users.id`.
- Required Indexes: `user_id`, `token_hash UNIQUE`.
- Unique Constraints: `token_hash`.
- Cascade Rules: cascade delete on user removal.
- V1 Behavior: support email verification for new accounts.

## Roles

- Purpose: Define role templates for RBAC.
- Columns:
  - `id UUID PRIMARY KEY`
  - `tenant_id UUID NOT NULL`
  - `name TEXT NOT NULL`
  - `description TEXT NULL`
  - `scope TEXT NULL`
  - audit fields
- Relationships: `tenant_id -> tenants.id`.
- Required Indexes: `tenant_id`, `(tenant_id, name) UNIQUE`.
- Unique Constraints: `(tenant_id, name)`.
- Cascade Rules: Restrict delete when roles are assigned.
- Future Expansion: role metadata, built-in vs custom roles.

## Permissions

- Purpose: Represent atomic actions on resources.
- Columns:
  - `id UUID PRIMARY KEY`
  - `name TEXT NOT NULL`
  - `resource TEXT NOT NULL`
  - `action TEXT NOT NULL`
  - `description TEXT NULL`
  - `group TEXT NULL`
  - audit fields
- Relationships: none direct; assigned through `role_permissions`.
- Required Indexes: `(resource, action)`.
- Unique Constraints: `(resource, action)`.
- Cascade Rules: restrict delete if referenced by `role_permissions`.
- Future Expansion: permission categories and dynamic policies.

## RolePermissions

- Purpose: Map roles to permissions.
- Columns:
  - `role_id UUID NOT NULL`
  - `permission_id UUID NOT NULL`
  - `granted_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Relationships: `role_id -> roles.id`, `permission_id -> permissions.id`.
- Required Indexes: `(role_id, permission_id) UNIQUE`.
- Unique Constraints: `(role_id, permission_id)`.
- Cascade Rules: cascade delete on role or permission removal.
- Future Expansion: conditional grants, audit reasons.

## UserRoles

- Purpose: Map users to roles.
- Columns:
  - `user_id UUID NOT NULL`
  - `role_id UUID NOT NULL`
  - `assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `scope JSONB NULL`
- Relationships: `user_id -> users.id`, `role_id -> roles.id`.
- Required Indexes: `(user_id, role_id) UNIQUE`, `role_id`.
- Unique Constraints: `(user_id, role_id)`.
- Cascade Rules: cascade delete on user or role removal.
- Future Expansion: section-level or site-level role scoping.

## Tenants

- Purpose: Represent the top-level tenant or customer.
- Columns:
  - `id UUID PRIMARY KEY`
  - `name TEXT NOT NULL`
  - `slug TEXT NOT NULL`
  - `status TEXT NOT NULL`
  - `settings JSONB NULL`
  - audit fields
- Relationships: none direct; referenced by sites, users, and tenant-scoped configurations.
- Required Indexes: `slug UNIQUE`.
- Unique Constraints: `slug`.
- Cascade Rules: restrict delete until tenant data is archived.
- Future Expansion: tenant billing, region, and plan.

## Sites

- Purpose: Represent a publishing website or brand within a tenant.
- Columns:
  - `id UUID PRIMARY KEY`
  - `tenant_id UUID NOT NULL`
  - `name TEXT NOT NULL`
  - `slug TEXT NOT NULL`
  - `domain TEXT NOT NULL`
  - `locale TEXT NULL`
  - `timezone TEXT NULL`
  - `status TEXT NOT NULL`
  - `theme JSONB NULL`
  - `seo_defaults JSONB NULL`
  - audit fields
- Relationships: `tenant_id -> tenants.id`.
- Required Indexes: `(tenant_id, slug) UNIQUE`, `domain UNIQUE`.
- Unique Constraints: `(tenant_id, slug)`, `domain`.
- Cascade Rules: restrict delete while site content exists.
- Future Expansion: site-level feature toggles and branding.

## Authors

- Purpose: Author profiles used on content.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `user_id UUID NULL`
  - `pen_name TEXT NOT NULL`
  - `bio TEXT NULL`
  - `profile_image_id UUID NULL`
  - `social_links JSONB NULL`
  - audit fields
- Relationships: `site_id -> sites.id`, optional `user_id -> users.id`, `profile_image_id -> media_assets.id`.
- Required Indexes: `site_id`, `user_id`.
- Unique Constraints: `(site_id, pen_name)`.
- Cascade Rules: restrict delete when referenced by content.
- Future Expansion: author series, payout, and performance metrics.

## Categories

- Purpose: Taxonomy groups for content classification.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `parent_id UUID NULL`
  - `name TEXT NOT NULL`
  - `slug TEXT NOT NULL`
  - `description TEXT NULL`
  - `status TEXT NOT NULL`
  - `seo_meta_id UUID NULL`
  - `sort_order INTEGER NULL`
  - audit fields
- Relationships: `site_id -> sites.id`, `parent_id -> categories.id`, `seo_meta_id -> seo_meta.id`.
- Required Indexes: `(site_id, slug) UNIQUE`, `parent_id`.
- Unique Constraints: `(site_id, slug)`.
- Cascade Rules: restrict delete if children exist, or reparent on delete.
- Future Expansion: nested sets, category reports.

## Tags

- Purpose: Content tags for discovery and classification.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `name TEXT NOT NULL`
  - `slug TEXT NOT NULL`
  - `description TEXT NULL`
  - `synonyms JSONB NULL`
  - audit fields
- Relationships: `site_id -> sites.id`.
- Required Indexes: `(site_id, slug) UNIQUE`.
- Unique Constraints: `(site_id, slug)`.
- Cascade Rules: restrict delete if tag is assigned.
- Future Expansion: popularity score.

## Articles

- Purpose: Core published and draft content.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `author_id UUID NOT NULL`
  - `primary_category_id UUID NULL`
  - `title TEXT NOT NULL`
  - `subtitle TEXT NULL`
  - `slug TEXT NOT NULL`
  - `summary TEXT NULL`
  - `body JSONB NOT NULL`
  - `status TEXT NOT NULL`
  - `published_at TIMESTAMPTZ NULL`
  - `scheduled_at TIMESTAMPTZ NULL`
  - `canonical_url TEXT NULL`
  - `visibility TEXT NOT NULL`
  - `language TEXT NOT NULL`
  - `locale TEXT NOT NULL`
  - `seo_meta_id UUID NULL`
  - `featured_media_id UUID NULL`
  - `reading_time INTEGER NULL`
  - `word_count INTEGER NULL`
  - `notes TEXT NULL`
  - audit fields
- Relationships: `site_id -> sites.id`, `author_id -> authors.id`, `primary_category_id -> categories.id`, `seo_meta_id -> seo_meta.id`, `featured_media_id -> media_assets.id`.
- Required Indexes: `(site_id, slug) UNIQUE`, `(site_id, status, published_at)`, `author_id`.
- Unique Constraints: `(site_id, slug)`.
- Cascade Rules: restrict delete if revisions exist; soft delete content instead.
- Future Expansion: paywall metadata, content gating, audience segments.

## ArticleRevisions

- Purpose: Maintain version history for articles.
- Columns:
  - `id UUID PRIMARY KEY`
  - `article_id UUID NOT NULL`
  - `version INTEGER NOT NULL`
  - `body JSONB NOT NULL`
  - `title TEXT NOT NULL`
  - `summary TEXT NULL`
  - `status TEXT NOT NULL`
  - `author_id UUID NOT NULL`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `comment TEXT NULL`
- Relationships: `article_id -> articles.id`, `author_id -> authors.id`.
- Required Indexes: `(article_id, version) UNIQUE`, `article_id`.
- Unique Constraints: `(article_id, version)`.
- Cascade Rules: cascade delete when article is removed.
- Future Expansion: revision diff storage.

## ArticleTags

- Purpose: Many-to-many association between articles and tags.
- Columns:
  - `article_id UUID NOT NULL`
  - `tag_id UUID NOT NULL`
  - `primary BOOLEAN NOT NULL DEFAULT false`
- Relationships: `article_id -> articles.id`, `tag_id -> tags.id`.
- Required Indexes: `(article_id, tag_id) UNIQUE`, `tag_id`.
- Unique Constraints: `(article_id, tag_id)`.
- Cascade Rules: cascade delete on article or tag removal.
- Future Expansion: tag weight or priority.

## ArticleMedia

- Purpose: Link media assets to articles and define roles.
- Columns:
  - `article_id UUID NOT NULL`
  - `media_asset_id UUID NOT NULL`
  - `position INTEGER NULL`
  - `role TEXT NULL`
  - `caption TEXT NULL`
- Relationships: `article_id -> articles.id`, `media_asset_id -> media_assets.id`.
- Required Indexes: `(article_id, media_asset_id) UNIQUE`, `media_asset_id`.
- Unique Constraints: `(article_id, media_asset_id)`.
- Cascade Rules: cascade delete on article or media asset removal.
- Future Expansion: asset usage metadata.

## MediaAssets

- Purpose: Store metadata for uploaded images, video, and assets.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `uploaded_by UUID NOT NULL`
  - `type TEXT NOT NULL`
  - `storage_key TEXT NOT NULL`
  - `mime_type TEXT NOT NULL`
  - `filesize BIGINT NOT NULL`
  - `width INTEGER NULL`
  - `height INTEGER NULL`
  - `duration INTEGER NULL`
  - `alt_text TEXT NULL`
  - `caption TEXT NULL`
  - `credit TEXT NULL`
  - `metadata JSONB NULL`
  - `status TEXT NOT NULL`
  - audit fields
- Relationships: `site_id -> sites.id`, `uploaded_by -> users.id`.
- Required Indexes: `site_id`, `uploaded_by`, `(site_id, storage_key) UNIQUE`.
- Unique Constraints: `(site_id, storage_key)`.
- Cascade Rules: soft delete on media assets and preserve in historical article relations if needed.
- Future Expansion: transformation history, usage tracking.

## MediaFolders

- Purpose: Hierarchical folders for media organization.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `parent_id UUID NULL`
  - `name TEXT NOT NULL`
  - `slug TEXT NOT NULL`
  - audit fields
- Relationships: `site_id -> sites.id`, `parent_id -> media_folders.id`.
- Required Indexes: `(site_id, slug) UNIQUE`, `parent_id`.
- Unique Constraints: `(site_id, slug)`.
- Cascade Rules: restrict or reparent children on delete.
- Future Expansion: folder permissions, folder asset counts.

## Comments

- Purpose: User-generated comments and moderation data.
- Columns:
  - `id UUID PRIMARY KEY`
  - `article_id UUID NOT NULL`
  - `user_id UUID NULL`
  - `author_name TEXT NULL`
  - `author_email TEXT NULL`
  - `parent_id UUID NULL`
  - `body TEXT NOT NULL`
  - `status TEXT NOT NULL`
  - `moderation_reason TEXT NULL`
  - `votes INTEGER NOT NULL DEFAULT 0`
  - audit fields
- Relationships: `article_id -> articles.id`, `user_id -> users.id`, `parent_id -> comments.id`.
- Required Indexes: `article_id`, `status`, `parent_id`.
- Unique Constraints: none required.
- Cascade Rules: cascade delete child comments on parent removal.
- Future Expansion: threaded nesting, comment history.

## SEO_Meta

- Purpose: Store SEO metadata for pages and content.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `title TEXT NULL`
  - `description TEXT NULL`
  - `keywords TEXT[] NULL`
  - `canonical_url TEXT NULL`
  - `open_graph JSONB NULL`
  - `twitter_card JSONB NULL`
  - `schema_json JSONB NULL`
  - `robots JSONB NULL`
  - `extra_meta JSONB NULL`
  - audit fields
- Relationships: `site_id -> sites.id`.
- Required Indexes: `site_id`.
- Unique Constraints: none.
- Cascade Rules: cascade delete on site removal.
- Future Expansion: SEO score history.

## Redirects

- Purpose: Manage URL redirects for SEO and content migration.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `source_path TEXT NOT NULL`
  - `destination_url TEXT NOT NULL`
  - `redirect_type INTEGER NOT NULL`
  - `status TEXT NOT NULL`
  - audit fields
- Relationships: `site_id -> sites.id`.
- Required Indexes: `(site_id, source_path) UNIQUE`.
- Unique Constraints: `(site_id, source_path)`.
- Cascade Rules: cascade delete on site removal.
- Future Expansion: redirect analytics.

## Sitemaps

- Purpose: Track generated sitemap metadata and publication state.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `type TEXT NOT NULL`
  - `path TEXT NOT NULL`
  - `status TEXT NOT NULL`
  - `generated_at TIMESTAMPTZ NULL`
  - audit fields
- Relationships: `site_id -> sites.id`.
- Required Indexes: `site_id`, `(site_id, type)`.
- Unique Constraints: `(site_id, type)`.
- Cascade Rules: cascade delete on site removal.
- Future Expansion: incremental sitemap partitions.

## Ads

- Purpose: Represent ad inventory and configuration.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `name TEXT NOT NULL`
  - `slot TEXT NOT NULL`
  - `provider TEXT NOT NULL`
  - `settings JSONB NULL`
  - `start_at TIMESTAMPTZ NULL`
  - `end_at TIMESTAMPTZ NULL`
  - `status TEXT NOT NULL`
  - audit fields
- Relationships: `site_id -> sites.id`.
- Required Indexes: `site_id`, `slot`.
- Unique Constraints: `(site_id, slot)`.
- Cascade Rules: cascade delete on site removal.
- Future Expansion: ad scheduling, A/B variants.

## AdPlacements

- Purpose: Link ads to page placements and inventory logic.
- Columns:
  - `id UUID PRIMARY KEY`
  - `ad_id UUID NOT NULL`
  - `page_type TEXT NOT NULL`
  - `position TEXT NOT NULL`
  - `target JSONB NULL`
  - audit fields
- Relationships: `ad_id -> ads.id`.
- Required Indexes: `ad_id`, `(page_type, position)`.
- Unique Constraints: none required.
- Cascade Rules: cascade delete on ad removal.
- Future Expansion: performance metrics and experiments.

## AnalyticsEvents

- Purpose: Capture page and editorial analytics events.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `event_type TEXT NOT NULL`
  - `user_id UUID NULL`
  - `session_id TEXT NULL`
  - `page_url TEXT NULL`
  - `referrer TEXT NULL`
  - `payload JSONB NULL`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Relationships: `site_id -> sites.id`, optional `user_id -> users.id`.
- Required Indexes: `(site_id, created_at)`, `event_type`.
- Unique Constraints: none.
- Cascade Rules: cascade delete on site removal.
- Future Expansion: partitioning and analytics aggregation tables.

## SearchLogs

- Purpose: Store search query activity for trending and optimization.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `query TEXT NOT NULL`
  - `count INTEGER NOT NULL DEFAULT 1`
  - `last_searched_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `trending_score FLOAT NULL`
  - audit fields
- Relationships: `site_id -> sites.id`.
- Required Indexes: `(site_id, query)`.
- Unique Constraints: `(site_id, query)`.
- Cascade Rules: cascade delete on site removal.
- Future Expansion: search term taxonomy.

## Notifications

- Purpose: Store notification delivery records.
- Columns:
  - `id UUID PRIMARY KEY`
  - `tenant_id UUID NOT NULL`
  - `user_id UUID NOT NULL`
  - `type TEXT NOT NULL`
  - `channel TEXT NOT NULL`
  - `payload JSONB NOT NULL`
  - `status TEXT NOT NULL`
  - `sent_at TIMESTAMPTZ NULL`
  - `read_at TIMESTAMPTZ NULL`
  - audit fields
- Relationships: `tenant_id -> tenants.id`, `user_id -> users.id`.
- Required Indexes: `user_id`, `status`.
- Unique Constraints: none.
- Cascade Rules: cascade delete on tenant or user removal.
- Future Expansion: notification templates and schedule windows.

## Settings

- Purpose: Store site or tenant-specific configuration.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NULL`
  - `tenant_id UUID NULL`
  - `namespace TEXT NOT NULL`
  - `key TEXT NOT NULL`
  - `value JSONB NOT NULL`
  - audit fields
- Relationships: `site_id -> sites.id`, `tenant_id -> tenants.id`.
- Required Indexes: `(site_id, namespace, key)`, `(tenant_id, namespace, key)`.
- Unique Constraints: unique per scope and key.
- Cascade Rules: cascade delete on site or tenant removal.
- Future Expansion: feature flag metadata.

## AIJobs

- Purpose: Persist AI task requests and results.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `task_type TEXT NOT NULL`
  - `prompt TEXT NOT NULL`
  - `parameters JSONB NULL`
  - `status TEXT NOT NULL`
  - `result JSONB NULL`
  - `requested_by UUID NULL`
  - `processed_at TIMESTAMPTZ NULL`
  - audit fields
- Relationships: `site_id -> sites.id`, optional `requested_by -> users.id`.
- Required Indexes: `site_id`, `status`.
- Unique Constraints: none.
- Cascade Rules: cascade delete on site removal.
- Future Expansion: AI task lineage and cost tracking.

## AIPrompts

- Purpose: Store reusable prompt templates and AI configuration.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `name TEXT NOT NULL`
  - `description TEXT NULL`
  - `prompt TEXT NOT NULL`
  - `model TEXT NOT NULL`
  - `settings JSONB NULL`
  - audit fields
- Relationships: `site_id -> sites.id`.
- Required Indexes: `(site_id, name) UNIQUE`.
- Unique Constraints: `(site_id, name)`.
- Cascade Rules: cascade delete on site removal.
- Future Expansion: prompt analytics, versioning.

## AuditLogs

- Purpose: Record security and editorial actions.
- Columns:
  - `id UUID PRIMARY KEY`
  - `tenant_id UUID NULL`
  - `site_id UUID NULL`
  - `user_id UUID NULL`
  - `action TEXT NOT NULL`
  - `category TEXT NOT NULL`
  - `resource_type TEXT NULL`
  - `resource_id UUID NULL`
  - `data JSONB NULL`
  - `ip_address TEXT NULL`
  - `user_agent TEXT NULL`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Relationships: optional `tenant_id -> tenants.id`, `site_id -> sites.id`, `user_id -> users.id`.
- Required Indexes: `created_at`, `user_id`, `site_id`, `tenant_id`.
- Unique Constraints: none.
- Cascade Rules: no cascade; keep audit trails independent.
- Future Expansion: audit retention and export.

## ActivityLogs

- Purpose: Track editorial and API activity separate from audit logs.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NULL`
  - `user_id UUID NULL`
  - `activity_type TEXT NOT NULL`
  - `payload JSONB NULL`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Relationships: optional `site_id -> sites.id`, `user_id -> users.id`.
- Required Indexes: `site_id`, `user_id`, `activity_type`.
- Unique Constraints: none.
- Cascade Rules: no cascade.
- Future Expansion: editor productivity analytics.

## Webhooks (Deferred to V2/V3)

- Purpose: Store outbound webhook subscriptions and history.
- V1 Decision: This feature is deferred. Webhooks are not part of the frozen V1 scope.
- Tables and delivery history will be designed in a later version.

## APIKeys

- Purpose: Manage API keys for integrations.
- Columns:
  - `id UUID PRIMARY KEY`
  - `tenant_id UUID NOT NULL`
  - `name TEXT NOT NULL`
  - `key_hash TEXT NOT NULL`
  - `scopes TEXT[] NULL`
  - `status TEXT NOT NULL`
  - `expires_at TIMESTAMPTZ NULL`
  - audit fields
- Relationships: `tenant_id -> tenants.id`.
- Required Indexes: `tenant_id`, `status`.
- Unique Constraints: `(tenant_id, name)`.
- Cascade Rules: cascade delete on tenant removal.
- Future Expansion: API key rotation and audit.

## Menus

- Purpose: Define navigation menus for sites.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `name TEXT NOT NULL`
  - `items JSONB NOT NULL`
  - audit fields
- Relationships: `site_id -> sites.id`.
- Required Indexes: `(site_id, name) UNIQUE`.
- Unique Constraints: `(site_id, name)`.
- Cascade Rules: cascade delete on site removal.
- Future Expansion: menu versioning and editor metadata.

## Pages

- Purpose: Manage custom static or CMS-authored pages.
- Columns:
  - `id UUID PRIMARY KEY`
  - `site_id UUID NOT NULL`
  - `title TEXT NOT NULL`
  - `slug TEXT NOT NULL`
  - `body JSONB NOT NULL`
  - `status TEXT NOT NULL`
  - `seo_meta_id UUID NULL`
  - `published_at TIMESTAMPTZ NULL`
  - audit fields
- Relationships: `site_id -> sites.id`, `seo_meta_id -> seo_meta.id`.
- Required Indexes: `(site_id, slug) UNIQUE`, `status`.
- Unique Constraints: `(site_id, slug)`.
- Cascade Rules: cascade delete on site removal.
- Future Expansion: page builder blocks and templates.

## Blocks (Deferred to V2/V3)

- Purpose: Represent reusable content blocks or layout components.
- V1 Decision: This feature is deferred. Blocks are not required for the frozen V1 scope.

## Widgets (Deferred to V2/V3)

- Purpose: Store dashboard or front-end widget definitions.
- V1 Decision: This feature is deferred. Widgets are not required for the frozen V1 scope.

## Additional Tables

These tables are not required for V1 and are deferred to later versions:

- `categories_translations`, `tags_translations` for multilingual taxonomies.
- `article_collections` for curated content sets.
- `member_subscriptions` for future membership products.
- `content_permissions` for gated content and paywalls.
- `newsletter_subscriptions` for audience capture.
- `search_index_status` for search sync state tracking.
- `media_transforms` for asset rendition metadata.
- `api_rate_limits` for custom integration throttling.
- `blocks` and `widgets` for page builder or personalization features.
- `webhooks` and webhook delivery history for event integrations.
