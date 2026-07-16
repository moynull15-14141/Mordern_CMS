-- Manual migration (Prisma's schema DSL cannot express filtered/partial
-- unique indexes — there is no WHERE-clause syntax for `@@unique`).
-- docs/30_DATABASE_ARCHITECTURE.md §9 requires uniqueness scoped to
-- non-deleted rows only, so a soft-deleted row's slug/path/hash/etc. can be
-- reused by a later active row. schema.prisma now declares these fields as
-- plain @@index (matching the renamed indexes below) instead of @@unique,
-- so Prisma's own diff engine never tries to "fix" this back to a
-- full-table unique constraint on a future `migrate dev`. The actual
-- uniqueness constraint lives only in the partial index created here.
--
-- Pattern per table: drop the full-table unique index created in
-- 20260716000000_init_v1_schema, recreate it as a plain (non-unique) index
-- under Prisma's expected name, then add the real partial unique index
-- scoped to `deleted_at IS NULL`.
--
-- ArticleRevision.(article_id, version) is intentionally NOT touched here:
-- revisions have no deleted_at column (immutable, append-only per
-- 31_DATABASE_TABLES.md), so a full-table unique constraint is already correct.

-- users: email unique per site, active rows only
DROP INDEX "users_site_id_email_key";
CREATE INDEX "users_site_id_email_idx" ON "users"("site_id", "email");
CREATE UNIQUE INDEX "users_site_id_email_active_key" ON "users"("site_id", "email") WHERE "deleted_at" IS NULL;

-- refresh_tokens: token hash globally unique, active rows only
DROP INDEX "refresh_tokens_token_hash_key";
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");
CREATE UNIQUE INDEX "refresh_tokens_token_hash_active_key" ON "refresh_tokens"("token_hash") WHERE "deleted_at" IS NULL;

-- password_reset_tokens: token hash globally unique, active rows only
DROP INDEX "password_reset_tokens_token_hash_key";
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens"("token_hash");
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_active_key" ON "password_reset_tokens"("token_hash") WHERE "deleted_at" IS NULL;

-- email_verifications: token hash globally unique, active rows only
DROP INDEX "email_verifications_token_hash_key";
CREATE INDEX "email_verifications_token_hash_idx" ON "email_verifications"("token_hash");
CREATE UNIQUE INDEX "email_verifications_token_hash_active_key" ON "email_verifications"("token_hash") WHERE "deleted_at" IS NULL;

-- roles: name unique per tenant, active rows only
DROP INDEX "roles_tenant_id_name_key";
CREATE INDEX "roles_tenant_id_name_idx" ON "roles"("tenant_id", "name");
CREATE UNIQUE INDEX "roles_tenant_id_name_active_key" ON "roles"("tenant_id", "name") WHERE "deleted_at" IS NULL;

-- permissions: (resource, action) globally unique, active rows only
DROP INDEX "permissions_resource_action_key";
CREATE INDEX "permissions_resource_action_idx" ON "permissions"("resource", "action");
CREATE UNIQUE INDEX "permissions_resource_action_active_key" ON "permissions"("resource", "action") WHERE "deleted_at" IS NULL;

-- tenants: slug globally unique, active rows only
DROP INDEX "tenants_slug_key";
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");
CREATE UNIQUE INDEX "tenants_slug_active_key" ON "tenants"("slug") WHERE "deleted_at" IS NULL;

-- sites: domain globally unique, active rows only
DROP INDEX "sites_domain_key";
CREATE INDEX "sites_domain_idx" ON "sites"("domain");
CREATE UNIQUE INDEX "sites_domain_active_key" ON "sites"("domain") WHERE "deleted_at" IS NULL;

-- sites: slug unique per tenant, active rows only
DROP INDEX "sites_tenant_id_slug_key";
CREATE INDEX "sites_tenant_id_slug_idx" ON "sites"("tenant_id", "slug");
CREATE UNIQUE INDEX "sites_tenant_id_slug_active_key" ON "sites"("tenant_id", "slug") WHERE "deleted_at" IS NULL;

-- authors: pen_name unique per site, active rows only
DROP INDEX "authors_site_id_pen_name_key";
CREATE INDEX "authors_site_id_pen_name_idx" ON "authors"("site_id", "pen_name");
CREATE UNIQUE INDEX "authors_site_id_pen_name_active_key" ON "authors"("site_id", "pen_name") WHERE "deleted_at" IS NULL;

-- categories: slug unique per site, active rows only
DROP INDEX "categories_site_id_slug_key";
CREATE INDEX "categories_site_id_slug_idx" ON "categories"("site_id", "slug");
CREATE UNIQUE INDEX "categories_site_id_slug_active_key" ON "categories"("site_id", "slug") WHERE "deleted_at" IS NULL;

-- tags: slug unique per site, active rows only
DROP INDEX "tags_site_id_slug_key";
CREATE INDEX "tags_site_id_slug_idx" ON "tags"("site_id", "slug");
CREATE UNIQUE INDEX "tags_site_id_slug_active_key" ON "tags"("site_id", "slug") WHERE "deleted_at" IS NULL;

-- articles: slug unique per site, active rows only
DROP INDEX "articles_site_id_slug_key";
CREATE INDEX "articles_site_id_slug_idx" ON "articles"("site_id", "slug");
CREATE UNIQUE INDEX "articles_site_id_slug_active_key" ON "articles"("site_id", "slug") WHERE "deleted_at" IS NULL;

-- media_assets: storage_key unique per site, active rows only
DROP INDEX "media_assets_site_id_storage_key_key";
CREATE INDEX "media_assets_site_id_storage_key_idx" ON "media_assets"("site_id", "storage_key");
CREATE UNIQUE INDEX "media_assets_site_id_storage_key_active_key" ON "media_assets"("site_id", "storage_key") WHERE "deleted_at" IS NULL;

-- media_folders: slug unique per site, active rows only
DROP INDEX "media_folders_site_id_slug_key";
CREATE INDEX "media_folders_site_id_slug_idx" ON "media_folders"("site_id", "slug");
CREATE UNIQUE INDEX "media_folders_site_id_slug_active_key" ON "media_folders"("site_id", "slug") WHERE "deleted_at" IS NULL;

-- redirects: source_path unique per site, active rows only (the case named
-- explicitly in docs/30_DATABASE_ARCHITECTURE.md §9)
DROP INDEX "redirects_site_id_source_path_key";
CREATE INDEX "redirects_site_id_source_path_idx" ON "redirects"("site_id", "source_path");
CREATE UNIQUE INDEX "redirects_site_id_source_path_active_key" ON "redirects"("site_id", "source_path") WHERE "deleted_at" IS NULL;

-- sitemaps: type unique per site, active rows only
DROP INDEX "sitemaps_site_id_type_key";
CREATE INDEX "sitemaps_site_id_type_idx" ON "sitemaps"("site_id", "type");
CREATE UNIQUE INDEX "sitemaps_site_id_type_active_key" ON "sitemaps"("site_id", "type") WHERE "deleted_at" IS NULL;

-- ads: slot unique per site, active rows only
DROP INDEX "ads_site_id_slot_key";
CREATE INDEX "ads_site_id_slot_idx" ON "ads"("site_id", "slot");
CREATE UNIQUE INDEX "ads_site_id_slot_active_key" ON "ads"("site_id", "slot") WHERE "deleted_at" IS NULL;

-- search_logs: query unique per site, active rows only
DROP INDEX "search_logs_site_id_query_key";
CREATE INDEX "search_logs_site_id_query_idx" ON "search_logs"("site_id", "query");
CREATE UNIQUE INDEX "search_logs_site_id_query_active_key" ON "search_logs"("site_id", "query") WHERE "deleted_at" IS NULL;

-- ai_prompts: name unique per site, active rows only
DROP INDEX "ai_prompts_site_id_name_key";
CREATE INDEX "ai_prompts_site_id_name_idx" ON "ai_prompts"("site_id", "name");
CREATE UNIQUE INDEX "ai_prompts_site_id_name_active_key" ON "ai_prompts"("site_id", "name") WHERE "deleted_at" IS NULL;

-- settings: (namespace, key) unique per site, active rows only
DROP INDEX "settings_site_id_namespace_key_key";
CREATE INDEX "settings_site_id_namespace_key_idx" ON "settings"("site_id", "namespace", "key");
CREATE UNIQUE INDEX "settings_site_id_namespace_key_active_key" ON "settings"("site_id", "namespace", "key") WHERE "deleted_at" IS NULL;

-- settings: (namespace, key) unique per tenant, active rows only
DROP INDEX "settings_tenant_id_namespace_key_key";
CREATE INDEX "settings_tenant_id_namespace_key_idx" ON "settings"("tenant_id", "namespace", "key");
CREATE UNIQUE INDEX "settings_tenant_id_namespace_key_active_key" ON "settings"("tenant_id", "namespace", "key") WHERE "deleted_at" IS NULL;

-- api_keys: name unique per tenant, active rows only
DROP INDEX "api_keys_tenant_id_name_key";
CREATE INDEX "api_keys_tenant_id_name_idx" ON "api_keys"("tenant_id", "name");
CREATE UNIQUE INDEX "api_keys_tenant_id_name_active_key" ON "api_keys"("tenant_id", "name") WHERE "deleted_at" IS NULL;

-- menus: name unique per site, active rows only
DROP INDEX "menus_site_id_name_key";
CREATE INDEX "menus_site_id_name_idx" ON "menus"("site_id", "name");
CREATE UNIQUE INDEX "menus_site_id_name_active_key" ON "menus"("site_id", "name") WHERE "deleted_at" IS NULL;

-- pages: slug unique per site, active rows only
DROP INDEX "pages_site_id_slug_key";
CREATE INDEX "pages_site_id_slug_idx" ON "pages"("site_id", "slug");
CREATE UNIQUE INDEX "pages_site_id_slug_active_key" ON "pages"("site_id", "slug") WHERE "deleted_at" IS NULL;
