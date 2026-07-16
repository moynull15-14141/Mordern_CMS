Enterprise AI Powered Publishing Platform Architecture
1 Executive Summary
What the system is
This platform is an enterprise-grade, plugin-free SaaS publishing system designed for modern media brands: sports news networks, travel publishers, news portals, magazines, media companies, and any future publishing business that needs content velocity, SEO leadership, editorial control, and enterprise resilience.

It is a complete publishing ecosystem built as a native platform, not a patched-together CMS. Every capability that WordPress currently provides through plugins is designed as a first-class module inside the system: content authoring, SEO, search, analytics, ads, AI, media optimization, editorial workflows, security, and extensibility.

Why WordPress is being replaced
WordPress was built as a blogging platform more than 20 years ago. Today’s large-scale publishing businesses demand:

predictable performance at enterprise traffic volumes
native SEO and schema management
modern developer and editorial experiences
built-in AI-assisted content operations
strong security without plugin risk
cloud-native architecture
cohesive modular services instead of fragmented plugin ecosystems
By replacing WordPress with a purpose-built platform, we eliminate plugin compatibility drift, performance penalties, plugin security risk, and the limitations of legacy PHP routing and templating. This platform is architected for the next 15 years.

Long-term vision
The long-term vision is to deliver a future-proof publishing platform that:

operates as a managed SaaS product with multi-tenant and single-tenant options
powers content businesses from global newsrooms to niche vertical publications
embeds AI across content creation, SEO, and editorial operations
supports lightning-fast public delivery through CDN/edge and pre-rendered pages
makes editorial teams productive with modular, no-code content experiences
retains enterprise-grade observability, governance, and compliance
evolves with new formats: newsletters, video-first stories, audio, immersive content, and AI-native narrative experiences
This platform should become the publishing foundation for companies that want to move beyond WordPress and build a modern digital newsroom or brand media business.

2 Technology Stack
Frontend
React + Next.js (TypeScript)
Reason: best-in-class support for hybrid SSR/SSG/ISR, incremental adoption, and front-end performance.
Enables page-level rendering strategies, edge deployment, and first-class SEO metadata.
Tailwind CSS + CSS Modules
Reason: scalable design system with utility-driven styling and component isolation.
Storybook
Reason: component documentation and design-system governance across public and admin apps.
React Query / TanStack Query
Reason: efficient client-side state and cache management for data fetching from APIs.
Zod
Reason: schema validation at runtime and TypeScript inference for frontend contracts.
NextAuth.js or custom OpenID Connect adapter
Reason: secure auth flows integrated with backend identity providers.
Backend
Node.js + TypeScript
Reason: fast developer iteration, rich ecosystem, and strong alignment with frontend TS stack.
NestJS (Fastify adapter)
Reason: modular architecture, dependency injection, middleware pipeline, and enterprise scalability.
GraphQL Gateway + REST APIs
Reason: flexible API surfaces for admin, public sites, and integration partners.
Serverless edge functions for lightweight routing
Reason: low-latency personalization and incremental page regeneration.
Database
PostgreSQL
Reason: proven relational content modeling, transactional consistency, extensibility, JSONB support, and enterprise deployment compatibility.
Optional Aurora PostgreSQL / CockroachDB
Reason: horizontally resilient, globally distributed deployments when required.
ORM
Prisma
Reason: modern type-safe ORM with migrations, strong schema modeling, and support for advanced PostgreSQL features.
Query Raw / SQL Templates as needed
Reason: performance-critical analytics and search indexing tasks benefit from bespoke SQL.
Authentication
OpenID Connect / OAuth 2.0
Reason: standard enterprise identity integration.
Keycloak or Auth0
Reason: enterprise-ready identity provider for SSO, MFA, and compliance.
JWT + Refresh Tokens
Reason: stateless access tokens for APIs plus secure session refresh.
WebAuthn / Passwordless
Reason: modern login options for editors and admins.
Image Storage
Cloudflare R2
Reason: S3-compatible object storage at edge, cost-effective, and well integrated with Cloudflare Images / Workers.
Optional AWS S3 or Google Cloud Storage
Reason: additional vendor flexibility for multi-cloud and hybrid deployments.
Video Storage
Cloudflare R2
Reason: unified object storage with signed URLs.
Direct upload + background transcoding pipeline
Reason: source preservation and adaptive delivery.
Search Engine
OpenSearch / Elasticsearch
Reason: enterprise full-text search, autocomplete, faceted search, language analyzers, and relevance tuning.
Vector search extension (optional)
Reason: AI-enhanced related content and semantic discovery.
Caching
Redis
Reason: caching, session store, queue backend, rate limiting, and ephemeral counters.
CDN cache
Reason: global edge delivery for public content and assets.
Application-layer cache
Reason: API response caching and query result caching.
Queue
BullMQ (Redis)
Reason: reliable background job processing using durable Redis queues.
Optional RabbitMQ / Apache Kafka for event-driven workloads
Reason: enterprise bus for cross-service integration and analytics events.
Email
Amazon SES / SendGrid / Mailgun
Reason: reliable transactional and marketing email.
In-app notification fallback
Reason: reduce email dependence for internal editorial workflows.
CDN
Cloudflare CDN
Reason: edge caching, performance, bot protection, image optimization, and integrated WAF.
Vercel Edge + Cloudflare Workers
Reason: fast edge rendering for public content and personalization.
Analytics
PostHog or Snowplow
Reason: self-hosted event analytics, privacy-first tracking, and enterprise control.
Event warehouse: ClickHouse / Amazon Redshift / Snowflake
Reason: high-volume analytics and BI integration.
Observability: Grafana + Prometheus + Loki
Reason: metrics, logs, and alerting across the stack.
SEO
Native SEO engine
Reason: built-in metadata, schema, sitemaps, redirect management, and indexing workflow.
Structured data generation service
Reason: enterprise-level support for news, article, video, breadcrumbs, organization, and schema graphs.
Deployment
Docker
Reason: deployment portability, consistency across environments, and local developer parity.
Kubernetes / EKS / AKS / GKE
Reason: orchestrated infrastructure for backend services and workers.
Vercel
Reason: frontend hosting optimized for Next.js, with built-in edge caching.
Railway / Fly.io
Reason: developer-friendly staging and small enterprise deployments.
CI/CD
GitHub Actions
Reason: integrated workflows, build validation, deploy pipelines, and branch-based environments.
Terraform / Pulumi
Reason: infrastructure as code for cloud resources and environment management.
Logging
Elastic Stack (Elasticsearch + Kibana) or Grafana Loki
Reason: centralized log ingestion, search, and root cause analysis.
Sentry
Reason: application error tracking and performance monitoring.
Audit log service
Reason: compliance tracking for editorial and security events.
Monitoring
Prometheus
Reason: metric collection for services, database, edge, and custom business metrics.
Grafana
Reason: dashboards, alerting, and capacity planning.
PagerDuty / Opsgenie
Reason: incident response and on-call management.
3 High Level Architecture
System overview
This platform is built as a modular, layered architecture:

Public Presentation Layer: static pages, SSR content, edge functions
Gateway/API Layer: content APIs, admin APIs, commerce APIs
Domain Services: content, media, SEO, analytics, AI, notifications
Data Layer: relational database, search index, object store, cache
Worker Layer: background processing, scheduled jobs, AI tasks
Observability Layer: analytics, logs, metrics, error tracking
Architecture diagram

Data flow
Public traffic routes through Cloudflare CDN to the Next.js public frontend or edge rendering path.
Editor traffic uses the admin frontend behind authentication and authorization.
The API Gateway routes requests to domain-specific services.
Content is persisted in PostgreSQL; search and related data are indexed in OpenSearch.
Media files are stored in Cloudflare R2 and served through the CDN.
Background workers process scheduled tasks, AI content generation, analytics aggregation, and media transformations.
Monitoring and logging capture system health and business signals.
4 Folder Structure
Monorepo structure
The platform is organized into a monorepo with clear separation between apps, shared packages, infrastructure, and docs.

Folder intent
apps/: deployable applications and service entrypoints
packages/: reusable modules and libraries shared across apps
frontend/: public-facing Next.js application source
backend/: backend API source and service modules
admin/: admin panel and editorial interface
shared/: cross-cutting utilities, types, and design tokens
database/: schema, migrations, seeds, and data utilities
workers/: background worker definitions and scheduler jobs
scripts/: local development, deploy helpers, and ops tools
config/: centralized configuration files for formatting, linting, and tooling
docs/: architecture documentation, runbooks, and product docs
infrastructure/: IaC, deployment manifests, and cloud resources
docker/: container definitions and local environment orchestrations
github/: CI/CD workflows and automation settings
5 Frontend Architecture
Folder design
Purpose by folder
public/: static assets, icons, robots, manifest, fonts.
src/app/: page routes and nested layouts using Next.js App Router.
src/components/: reusable React components by domain and UI primitives.
src/sections/: page-specific composition blocks and landing sections.
src/hooks/: custom React hooks for data, auth, forms, and UX behavior.
src/services/: API wrappers, caching adapters, analytics events, and composition services.
src/types/: shared TypeScript interfaces and DTOs.
src/utils/: generic helper functions, formatting, and utility abstractions.
src/seo/: metadata strategies, schema generation, sitemap helper, and robots builder.
src/theme/: design tokens, theming engine, color palettes, spacing, typography.
src/lib/: low-level integration clients, feature flags, and context providers.
src/styles/: global styles and reset files.
src/config/: client-side environment configuration and feature toggles.
Routing
app/(public)/: public website routes
app/(admin)/: admin and editorial routes
app/api/: server actions and edge API routes
app/[locale]/articles/[slug]/page.tsx: localized article pages
app/[locale]/category/[slug]/page.tsx: category archives
app/[locale]/tag/[slug]/page.tsx: tag discovery
app/[locale]/author/[slug]/page.tsx: author hubs
app/dashboard/page.tsx: editorial homepage
app/settings/page.tsx: admin settings pages
Components
ui/: buttons, inputs, selects, avatars, cards, modals, loaders.
article/: ArticleHero, ArticleBody, ArticleMeta, RelatedStories, Breadcrumbs.
shared/: ChannelSwitcher, Footer, Header, NoticeBanner, SearchBar.
Layouts
RootLayout: global providers, suspense boundaries, analytics, theme.
PublicLayout: navigation, footer, metadata injection.
AdminLayout: sidebar, toolbars, access control, and preview bars.
ArticleLayout: article-specific SEO, schema, and navigation.
DashboardLayout: analytics widgets and editorial shortcuts.
Sections
HeroSection, FeaturedStoriesSection, TrendingTopicsSection, NewsletterSignupSection
EditorialWorkflowSection, ContentPreviewSection, AIWriteSection
MediaLibrarySection, SEOInsightsSection, NotificationCenterSection
Hooks
useFetchArticles, useFetchAuthors, useSearchSuggestions
useAuth, useSession, usePermissions
usePWAInstall, useScrollRestoration, useThemePreferences
useInfiniteScroll, useDebouncedInput
useSEO, useSchemaMetadata
Services
api/content.ts: fetch articles, categories, tags
api/admin.ts: create/update content, publish, permissions
api/media.ts: upload assets, fetch transformations
api/seo.ts: fetch SEO scoring, suggest metadata
api/ai.ts: generate drafts, summarization, translation
analytics.ts: track events and initialize telemetry
cache.ts: persistent client-side cache, stale-while-revalidate strategy
Types
Article, Author, Category, Tag, MediaAsset, SeoMeta
UserProfile, PermissionSet, ApiResponse<T>
PreviewData, SearchHit, AnalyticsEventPayload
Utils
date.ts: formatting, locale helpers
strings.ts: slugify, headline casing
numbers.ts: KPI formatting
url.ts: canonical URL builder
richText.ts: portable text transformation
image.ts: responsive srcset helper
seo.ts: meta tag utilities
SEO
metadata.ts: page metadata generation
schema.ts: structured data builder
sitemap.ts: dynamic sitemap utilities
robots.ts: robots policy generation
openGraph.ts: social preview builder
Theme
design-tokens.ts: color palette, typography, spacing
theme-provider.tsx: theme switcher and CSS variables
dark-mode.ts: theme persistence
brand-tokens.ts: site-specific branding hooks
theme-utils.ts: accessible color contrast helpers
6 Backend Architecture
Overall backend design
The backend is structured as a modular API platform, where each major domain is encapsulated in its own module. Modules expose services, controllers, repositories, event handlers, and schema definitions.

Module architecture
Each module contains:

controller/: HTTP handlers and API endpoints
service/: business logic and orchestration
repository/: data access and queries
dto/: request/response schemas and validation models
entities/: Prisma models or database entities
events/: domain events and event handlers
tests/: unit and integration tests
Core modules
Articles
content creation, revisions, publication state
structured article blocks, sections, lead paragraphs, CTAs
multi-language versioning and canonical management
article previews and drafts
content scheduling and embargoes
Categories
hierarchical category taxonomy
category metadata and SEO settings
category landing page controls
taxonomy permissions and localized names
Tags
tag normalization and synonyms
editorial tag suggestions and autocompletion
tag-to-category association
tag trending metrics
Authors
author profiles, bios, social links, contributor roles
author hubs and author-specific story feeds
writer performance metrics
author access controls and identity mapping
Media
asset upload, transcoding, optimization, and delivery
image transforms, responsive sources, and format variants
video workflows, adaptive streaming, and poster generation
asset metadata, alt text, captions, credits
library search and usage tracking
Comments
moderation workflow, threaded discussions
spam filtering, abuse detection, sentiment scoring
guest comments, login-required comments
comment analytics and engagement metrics
moderation assignments and bulk actions
SEO
native metadata engine
schema graph generation, open graph, Twitter cards
robots rules, sitemaps, canonical resolution
link monitoring, redirect management, indexing health
SEO insights and automated optimization suggestions
Ads
ad slot definitions, placements, and scheduling
ad vendor connectors and header bidding integration
analytics for inventory and yield
targeting by category, author, topic, geography
premium content gating and subscription monetization hooks
Analytics
event ingestion, session tracking, and business metrics
editor productivity metrics, traffic KPIs, conversion funnels
analytics API for dashboards, widgets, and export
real-time event pipeline with streaming ingestion
performance metrics for pages and API endpoints
Search
search indexing, relevance tuning, result grouping
full-text search, autocomplete, suggestions
faceted search and filtered discovery
related posts, trending queries, and query analytics
search API and search result caching
Users
profile store and identity mapping
roles, teams, and organizational units
editorial groups and workspace membership
system users vs external consumers
login and session management
Permissions
RBAC engine and permission matrix
scoped access rules by publication, section, category
approval workflows and change-request authorization
temporary escalation and audit of permission changes
AI
AI prompt orchestration and content generation
writer assistant modules, summarization, translation, rewriting
AI task queue and prompt templates
feedback capture and AI output auditing
integrated AI suggestions in editorial workflows
Notifications
notifications bus for email, in-app, Slack, webhook
content publish alerts, assignment notifications, system events
editorial reminders and approval escalation
notification templates and delivery monitoring
Settings
site settings, branding, locales, SEO defaults
multi-site and multi-brand configurations
feature flags and environment-specific settings
general preferences, API keys, and integrations
Scheduler
cron job management and scheduled content workflows
recurring tasks, publication schedules, and maintenance jobs
dynamic job registration and dependency graph
time zone aware execution
Cron
system cron jobs for reporting, indexing, and cleanup
health checks, data retention, and audit pruning
background report generation
cache invalidation orchestration
Logs
application logging, structured trace context
log ingestion and retention policies
error classification, correlation IDs, and trace IDs
log-driven alert conditions
Audit
audit event model for all critical actions
user activity logging for publish/revisions
permission and role changes
security-sensitive access events
compliance reporting exports
Native modules, no plugins
The backend is architected so every major usage scenario is a native module. There is no plugin layer for core capabilities. Instead, extensibility is provided through:

well-defined API contracts
event-driven hooks
integration adapters for external systems
modular packages that can be enabled/disabled per tenant
This ensures every feature is first-party and consistent.

7 Database Architecture
Core tables
users
id (PK)
email (unique)
name
display_name
username
password_hash
profile_image_id
status
created_at, updated_at
last_login_at
auth_provider
metadata (JSONB)
roles
id (PK)
name (unique)
description
default_scope
created_at, updated_at
permissions
id (PK)
name (unique)
description
action
resource
created_at
role_permissions
role_id (FK -> roles.id)
permission_id (FK -> permissions.id)
is_granted
user_roles
user_id (FK -> users.id)
role_id (FK -> roles.id)
scope_id
assigned_at
tenants
id (PK)
name
slug
domain
locale_default
timezone
plan
created_at, updated_at
sites
id (PK)
tenant_id (FK -> tenants.id)
title
description
theme
branding_settings
seo_defaults
created_at, updated_at
authors
id (PK)
user_id (FK -> users.id, nullable)
pen_name
bio
profile_image_id
social_links
created_at, updated_at
categories
id (PK)
site_id (FK -> sites.id)
name
slug
parent_id (self FK)
description
seo_meta_id
sort_order
status
created_at, updated_at
tags
id (PK)
site_id (FK -> sites.id)
name
slug
description
synonyms (JSONB)
created_at, updated_at
articles
id (PK)
site_id (FK -> sites.id)
author_id (FK -> authors.id)
primary_category_id (FK -> categories.id)
title
subtitle
slug
summary
body (JSONB or rich text type)
status
published_at
scheduled_at
canonical_url
visibility
language
locale
seo_meta_id
featured_media_id
reading_time
word_count
notes
created_at, updated_at
published_by
article_revisions
id (PK)
article_id (FK -> articles.id)
version
body (JSONB)
title
summary
status
author_id
created_at
comment
article_tags
article_id (FK -> articles.id)
tag_id (FK -> tags.id)
primary
article_media
article_id (FK -> articles.id)
media_asset_id (FK -> media_assets.id)
position
role
caption
media_assets
id (PK)
site_id (FK -> sites.id)
uploaded_by
type
storage_key
mime_type
filesize
width
height
duration
alt_text
caption
credit
metadata (JSONB)
status
created_at, updated_at
media_transforms
id (PK)
media_asset_id (FK -> media_assets.id)
transform_key
output_key
width
height
format
quality
created_at
status
error_message
comments
id (PK)
article_id (FK -> articles.id)
user_id (FK -> users.id, nullable)
author_name
author_email
parent_id (self FK)
body
status
moderation_reason
votes
created_at, updated_at
seo_meta
id (PK)
site_id (FK -> sites.id)
title
description
keywords
canonical_url
open_graph
twitter_card
schema_json (JSONB)
robots
extra_meta (JSONB)
created_at, updated_at
redirects
id (PK)
site_id (FK -> sites.id)
source_path
destination_url
redirect_type
status
created_at, updated_at
audit_logs
id (PK)
user_id (FK -> users.id, nullable)
tenant_id (FK -> tenants.id)
site_id (FK -> sites.id, nullable)
action
category
resource_type
resource_id
data (JSONB)
ip_address
user_agent
created_at
analytics_events
id (PK)
site_id (FK -> sites.id)
event_type
user_id (FK -> users.id, nullable)
session_id
page_url
referrer
payload (JSONB)
created_at
search_index_status
id (PK)
site_id (FK -> sites.id)
object_type
object_id
status
last_indexed_at
error_message
created_at
ai_tasks
id (PK)
site_id (FK -> sites.id)
task_type
prompt
parameters (JSONB)
status
result (JSONB)
requested_by
processed_at
created_at
notifications
id (PK)
tenant_id (FK -> tenants.id)
user_id (FK -> users.id)
type
channel
payload (JSONB)
status
sent_at
read_at
created_at
settings
id (PK)
site_id (FK -> sites.id)
namespace
key
value (JSONB)
created_at, updated_at
scheduled_jobs
id (PK)
site_id (FK -> sites.id, nullable)
name
type
schedule
payload (JSONB)
status
last_run_at
next_run_at
failure_count
created_at, updated_at
ads
id (PK)
site_id (FK -> sites.id)
name
slot
provider
settings (JSONB)
start_at
end_at
status
created_at, updated_at
ad_experiments
id (PK)
ad_id (FK -> ads.id)
variant
metrics (JSONB)
created_at, updated_at
broken_links
id (PK)
site_id (FK -> sites.id)
source_url
target_url
status
discovered_at
resolved_at
created_at
search_queries
id (PK)
site_id (FK -> sites.id)
query
count
last_searched_at
trending_score
created_at, updated_at
Relationships
articles belong to sites, have one author, one primary_category
articles have many-to-many relationship with tags via article_tags
articles reference media_assets through article_media
categories can be hierarchical and site-scoped
authors optionally map to users
users map to roles and permissions
seo_meta is reusable across content objects
redirects, broken_links, search_queries are site-scoped for SEO operations
analytics_events are aggregated to support dashboard reporting without blocking publishing flows
Indexes
users.email unique index
articles.site_id, slug unique index
categories.site_id, slug unique index
tags.site_id, slug unique index
media_assets.storage_key unique index
article_tags.article_id, tag_id composite index
article_media.article_id index
comments.article_id, status composite index
audit_logs.user_id, created_at index
search_queries.site_id, query index
analytics_events.site_id, created_at index
seo_meta.site_id index
redirects.site_id, source_path unique index
search_index_status.object_type, object_id unique index
Constraints
foreign keys for integrity between articles, authors, categories, tags
unique slugs by site and locale
enum constraints for status fields (draft, published, archived, pending_review)
JSONB validation at application layer for metadata structures
referential actions for deletion, with soft deletes on content objects when required
8 API Architecture
REST API structure
API path prefix: /api/v1/
Modular endpoints grouped by domain
Public content API and admin API separation
Consumer API for external integrations
Internal API for worker and orchestration tasks
Examples:

GET /api/v1/public/articles
GET /api/v1/public/articles/{slug}
POST /api/v1/admin/articles
PATCH /api/v1/admin/articles/{id}
GET /api/v1/admin/seo/preview
POST /api/v1/admin/media/uploads
POST /api/v1/admin/ai/drafts
GET /api/v1/admin/analytics/dashboard
Naming convention
Use nouns for resources.
Use plural resource names.
Use nested resources for natural ownership: /sites/{siteId}/articles
Use query params for filtering and pagination.
Use action endpoints only for non-CRUD operations: /actions/publish, /actions/preview, /actions/score.
Versioning
URL-based versioning: /api/v1/
Support v2 when API contracts need breaking changes
Maintain backward compatibility for a minimum of 12 months for public APIs
Use semantic versioning for internal packages and docs
Authentication
Admin endpoints require OAuth2 bearer tokens or session cookies.
Public endpoints support optional API key access for authenticated consumption.
JWT flows for service-to-service and worker consumption.
Token types:
access token: short-lived JWT
refresh token: long-lived encrypted token stored securely
service token: non-user token for integrations
Support multiple auth providers:
direct password-based auth
SSO via SAML / OpenID Connect
API key issuance for partners
webhook auth with HMAC signature
Response format
Standard API wrapper:

status: success or error
data: payload
meta: pagination, request IDs, timing, warnings
errors: array of structured errors
Pagination
Use cursor-based pagination for large data sets
Default page size and maximum page size
Include nextCursor, previousCursor, total when applicable
Support limit, cursor, sort, filter
Error handling
Standard HTTP status codes
Error body includes:
code: platform-specific error code
message: user-friendly description
details: optional validation or inner error
requestId: traceable request identifier
Example:
Clients may receive warnings in meta.warnings.
Use 429 for rate limit breaches.
Use 422 for validation errors.
Use 401/403 for auth failures.
API security
enforce scopes and permission checks in middleware
validate all input schemas
sane defaults for CORS
reject unknown fields
audit critical API actions
9 Admin Panel Architecture
Primary screens
Dashboard
overview cards: sessions, pageviews, article reads, engagement
publishing pipeline: scheduled, pending review, recently published
editorial activity stream
SEO health snapshot
alerts for broken links, indexing issues, expired redirects
Articles
article listing with status, author, category, publish schedule
fast create / quick draft
bulk actions: publish, archive, assign category
editorial queue with approvals
revision history and diff view
sample preview in live site context
Editor
block-based rich editor with structured content support
AI assist panel for headline, summary, meta, translation
status controls: draft, review, publish, schedule
media picker integrated with library
inline SEO score and recommendation panel
live content preview
versioning and rollback controls
Media
searchable asset library
direct upload and drag-drop
image/video transform preview
asset metadata editor
usage report and broken asset detection
bulk optimize/replace actions
SEO
site-level SEO dashboard
URL inspector and canonical audit
metadata manager for pages, authors, categories
schema builder and preview
redirect manager
broken link monitor
news sitemap controls
robots / crawl rules editor
indexing status and search console sync
Ads
ad inventory dashboard
ad slot creation and placement manager
preview for ad zones
reporting on impressions and revenue
experimentation and A/B test setup
AI
AI workspace for content generation tasks
recipe gallery for article drafts, summaries, translations
prompt history and quality metrics
AI output approvals and audit records
AI usage monitoring and spend control
Analytics
audience overview
traffic sources and campaigns
article performance and author metrics
search analytics and trending topics
subscription / membership conversions
real-time event stream
Users
user directory and access controls
role assignment and tenant membership
activity log
login history and security events
team / department grouping
Roles
roles matrix with permission builder
custom role creation
role assignment by site / section
preview effective permissions
role change audit
Settings
site settings and branding
editorial workflow configuration
SEO defaults
personalization options
integrations management
email / notification templates
deployment and environment toggles
Screen relationships
the Dashboard surfaces cross-module activity
Article and SEO screens share metadata and publishing controls
AI tools are embedded inside the editor and SEO workflows
Media screen integrates with article composer
Analytics contextualizes editorial performance at article and author level
Permissions influence which admin screens are visible and actionable
10 SEO Engine
Native implementation
The platform embeds SEO as an engine, not an add-on. Every publish path, page render, and admin flow uses the native SEO engine to generate optimized output.

Meta
title templating with brand, page, and locale variables
description generation and preview
keyword suggestion support
open graph and Twitter card metadata
image preview metadata
metadata inheritance from site and category defaults
Schema
native support for:
Article
NewsArticle
BlogPosting
VideoObject
BreadcrumbList
Organization
WebSite
Person
FAQPage
automatic schema generation from article properties
manual schema overrides
schema validation engine
schema preview and structured data diagnostics
Canonical
canonical URL builder based on canonical field, locale, and preferred domain
automatic self-referential canonical generation
canonical conflict detection
pagination canonicalization
cross-site canonical support for syndication workflows
Breadcrumb
dynamic breadcrumb generation from category hierarchy
manual breadcrumb override per article
markup and JSON-LD support
breadcrumb optimization for SEO and UX
Robots
robot directives by page type
per-site and per-page robots.txt generator
directive preview and testing
noindex controls for drafts, previews, and obsolete pages
crawl delay and host rules
RSS
dynamic RSS feeds for site, categories, tags, authors, and custom collections
XML feed generation with proper metadata
support for content:encoded, media enclosures, and categories
auto-refresh on publish
News Sitemap
dedicated sitemap generation for news publications
rules to meet Google News requirements
article discovery, publication dates, genres, and keywords
incremental sitemap updates
Image Sitemap
image sitemap generation for all published visual assets
support for multiple images per article
optional embedded caption, geo_location, license
Redirect Manager
native redirect table and editor
301, 302, 307, and proxy redirects
bulk import/export
redirect validation and conflict detection
redirect chaining resolution
preview and audit logging
Broken Link Monitor
site crawl engine for internal and external link discovery
link health checks and status tracking
broken link alerts in admin dashboard
suggested fixes and redirect recommendations
scheduled crawl jobs
Indexing Status
page-level indexing state tracking
search engine submission status
fetch and render health checks
status indicators for indexed, pending, error, blocked
stale content detection
Google Search Console Integration
native GSC connector
automated sitemap submission
coverage report ingestion
indexing issue notification
performance metrics sync
URL inspection integration
11 AI Engine
Design philosophy
The AI Engine is built as a set of composable modules, each responsible for a specific editorial capability. It is an orchestration layer, not a black box: prompts, templates, context, and result validation are all managed in a controlled enterprise workflow.

AI modules
AI Writer
generate full article drafts from brief prompts
support structured brief inputs: headline, angle, tone, audience, word count
optionally generate article sections and block-level content
preserve brand voice and editorial guidelines via prompt templates
allow user review and revision before publish
AI Rewrite
rewrite existing content for clarity, brevity, or new tone
preserve factual structure and SEO keywords
support short-form and long-form content rewrites
use revision tracking to compare before/after
AI Summary
generate article summaries for previews, social copy, and newsletters
create TL;DR, bullet takeaways, or executive summaries
support multi-locale summarization
AI Meta
generate optimized titles, descriptions, open graph text
evaluate SEO readability and focus terms
produce clickable meta copy for social sharing
suggest best alt text for featured images
AI FAQ
generate FAQ sections from article content
create structured FAQ schema
identify common user questions and answers
support FAQ pages for publishers
AI Internal Links
suggest contextual internal link targets
build internal linking maps for article clusters
support anchor text generation
surface broken or outdated links to replace
AI Image Prompt
create image prompt copy for editors to use with generative image services
suggest visual concepts based on article theme
produce fallback alt text and caption suggestions
integrate image prompt output into media metadata
AI Tags
suggest tags based on article semantics
propose taxonomy categories
identify trending keywords and topic clusters
support tag normalization and synonyms
AI Category
recommend category assignments
validate category relevance
identify new taxonomy gaps
AI Translation
translate content into supported locales
preserve brand tone and metadata
support side-by-side translation preview
integrate with localization workflow
AI Grammar
grammar, spelling, punctuation, and readability checks
support style guide enforcement
detect passive voice, long sentences, and jargon
suggest corrections inline
AI orchestration
prompt templates stored as first-class configuration
AI tasks queued and audited
multi-model support: OpenAI, Anthropic, Azure OpenAI, Llama-family
response validation and human-in-the-loop review
AI usage tracking and spend control
cache AI outputs for reuse when input context is unchanged
fallback to human review for sensitive content
AI integration
embedded inside editor workflows
available as dedicated AI workspace screens
accessible through article creation, SEO suggestions, translation interfaces
integrated with audit logs and task assignment
12 Media System
Cloudflare R2
object storage for all image, video, document, and asset content
direct browser upload using signed URLs
lifecycle policies for archive and retention
unified storage for site assets and editorial media
Image optimization
automatic generation of transformation variants
responsive image sizes and densities
format conversion to WebP and AVIF
sharp compression profiles based on asset type
metadata preservation and alt text injection
object storage of all transform outputs for reuse
Image CDN
serve assets through Cloudflare CDN with cache control
use signed delivery URLs for private preview assets
apply image resizing and optimization at edge when supported
support global image distribution and cache invalidation
WebP / AVIF
generate modern image formats by default
provide fallback JPEG/PNG for legacy clients
include format negotiation for efficient delivery
use responsive srcset and sizes on article pages
Lazy Loading
native loading="lazy" attributes for offscreen assets
intersection observer fallback for older browsers
priority loading for hero images and in-view assets
support skeleton placeholders for visual stability
Video
background transcoding pipeline for adaptive bitrate deliverables
support HLS / DASH for video playback
poster image generation and metadata
secure delivery for premium or gated content
embed support in articles, previews, and social cards
13 Search System
Full-text search
index all published content and searchable metadata
use analyzers for multi-lingual tokenization
support stemming, stop words, synonyms, and phrase matching
optimize content ranking by freshness, relevance, and engagement signals
real-time indexing on publish/update
Autocomplete
search suggestions as users type
prefix match, phrase completion, and related query suggestions
trending query prioritization
category-aware autocomplete for topic discovery
Related posts
compute related content based on:
shared tags/categories
semantic similarity
author association
user engagement
present related stories on article pages and email recommendations
surface “more like this” suggestions in admin UX
Popular searches
capture and rank search queries
surface top queries by date range, site, and locale
integrate popular searches into search landing pages
detect trending topics and indicate search spikes
Search experience
support faceted filters for categories, authors, publication date
search result personalization by audience segment
safe search controls for premium content gating
fuzzy search and misspelling tolerance
search analytics for query performance and content gaps
Search architecture
source-of-truth content resides in PostgreSQL
OpenSearch stores indexable search documents
background workers sync content changes
search API uses query tuning clusters for high throughput
analytics feed search activity for editorial analysis
14 Permission System
Roles
Admin
Editor
Author
Moderator
SEO Manager
Support
Guest
Role definitions
Admin
full access to all sites, settings, users, and integrations
can manage roles and permissions
can publish on behalf of all teams
Editor
manage articles, categories, and tags
approve workflows
access editorial dashboards
moderate comments and schedule content
Author
create and edit own articles
submit drafts for review
view performance of own publications
use AI tools and media library
Moderator
moderate comment streams
approve or reject user-generated content
monitor community engagement
manage flagged items
SEO Manager
manage metadata, guides, and sitemaps
oversee indexing and search console integration
review SEO suggestions and site health
update redirects and broken links
Support
view user profiles and logs
handle support requests
access helpdesk and notification systems
limited editorial access
Guest
view published content
if authenticated, consume paywalled or member content
no editorial privileges
RBAC model
roles are defined as collections of permissions
permissions are scoped by resource type and action
support per-site, per-category, and per-tenant scoping
support custom roles and permission sets
use policy engine for fine-grained rules:
can_edit_article
can_publish_article
can_manage_media
can_view_analytics
can_manage_seo
can_manage_ads
allow temporary role elevation for urgent editorial operations
Access control
evaluated at API middleware layer
enforced in frontend routing and UI feature gating
support permission inheritance in team hierarchies
role assignment audit trail stored in audit_logs
support user groups and workspace memberships
15 Security Architecture
JWT
access tokens issued as JWTs
short-lived expiration (minutes)
signed with secure asymmetric keys
include scope, roles, and tenant claims
refresh tokens stored encrypted in DB or secure cookie
revoke refresh tokens on logout and suspicious activity
Refresh Token
use rotating refresh tokens
support refresh token invalidation on breach
store token fingerprint and device metadata
issue refresh token only over secure HTTPS
preserve session continuity while limiting exposure
RBAC
central permission engine based on roles and resources
enforce at API gateway and service boundaries
use policy evaluation for dynamic access
separate admin and public payload contracts
prevent permission escalation through strict validation
Rate Limit
global and route-specific rate limiting
use Redis for counters and sliding windows
protect authentication endpoints and APIs
differentiate limits by user type: anonymous, authenticated, service
add burst allowances and throttling for editorial workflows
Audit Log
record all security-critical actions
capture user, action, resource, timestamp, IP, user agent
include permission changes, publish actions, login events
searchable audit index for compliance and incident response
retain logs for configured retention periods
2FA
mandatory for high-privilege roles
support authenticator apps (TOTP)
support SMS / email one-time passcodes optionally
support passwordless WebAuthn
integrate 2FA into login and SSO flows
require 2FA for API key creation and critical operations
Additional security measures
encryption in transit TLS everywhere
encryption at rest for sensitive database fields
secrets management via Vault or cloud secret store
secure default headers (CSP, HSTS, X-Frame-Options)
content security policy enforcement
WAF via Cloudflare
OWASP top 10 hardened code practices
regular dependency scanning
proactive threat modeling and pentesting
16 Performance Strategy
SSR
server-side rendering for pages requiring live personalization or dynamic content
support fast public article delivery with SSR on first request
use streaming SSR where applicable
separate SSR workload from admin app for resource isolation
SSG
static generation for evergreen landing pages, category archives, and public sections
use incremental static generation to scale with content volume
pre-generate high-value pages as part of deployment pipelines
static pages served directly from CDN
ISR
incremental static regeneration for new/updated content
queue regeneration on publish and update
stale-while-revalidate strategy for content freshness
use on-demand revalidation APIs
Caching
CDN caching for public assets and HTML
browser caching for static assets and resources
API response caching for common queries
edge cache purge on publish and update
application cache for expensive queries and render fragments
HTTP caching headers tuned per route
Edge
edge middleware for redirects, preview auth, and geo-targeting
deploy front-end routes at edge for low latency
use Cloudflare Workers for cache logic and personalization
route preview and publisher preview traffic through secure edge paths
CDN
Cloudflare CDN for global content delivery
cache key optimization for locale, device type, and personalization
automatic purge and invalidation pipelines
asset versioning for stable cache management
support origin shield for origin protection
Image Optimization
generate image variants at build time and runtime
use modern formats and responsive delivery
support precomputed responsive image metadata
route optimized images through edge with correct caching
Performance metrics
track Time To First Byte (TTFB)
track Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS)
record API latency, error rates, and throughput
use actual field data from real users and synthetic monitoring
continuously optimize by publishing pipelines and new features
17 Deployment Architecture
Environment tiers
Development
local containers and service emulators
developer preview environment with rapid iteration
Staging
full production-like environment
validation for integrations, QA, and UAT
Production
globally distributed, high-availability deployment
autoscaled backend and workers
controlled rollout and observability
Docker
Docker images for backend, frontend, workers, and local utilities
build cache optimization and multi-stage builds
development compose file for local cross-service workflows
container registry integration for CI/CD
GitHub Actions
workflow for:
lint
typecheck
unit tests
integration tests
build
security scanning
deploy to staging
deploy to production
branch strategies:
feature branches
main branch for production
staging branch for QA
Vercel
host public site and admin panel as serverless applications
edge functions for routing and preview
deploy previews for pull requests
connect to GitHub Actions for build validation
Railway
deploy backend services and workers for staging or smaller tenants
use Railway for rapid environment creation and shared resources
connect to PostgreSQL, Redis, and object storage
Cloudflare
CDN, edge cache, WAF, image optimization
Cloudflare Pages / Workers for edge delivery
Cloudflare R2 for media storage
DNS and traffic management
Production architecture
frontend on Vercel / Cloudflare Pages
backend services on Kubernetes or managed container platform
Redis cluster for cache and queue
PostgreSQL cluster with read replicas
OpenSearch cluster for search
object store on R2 or cloud storage
monitoring stack on dedicated observability cluster
API gateway and service mesh for internal communication
Deployment strategies
blue/green deployments for backend
canary releases for major releases
feature flags for gradual rollout
preflight health checks and smoke tests
rollback automation on failure
infrastructure as code for repeatable environments
18 File Structure
COMPLETE project tree
Additional files
CHANGELOG.md
LICENSE.md
SECURITY.md
CODE_OF_CONDUCT.md
CONTRIBUTING.md
TERMS.md
DATA_POLICY.md
PRIVACY_POLICY.md
Package definitions
top-level package.json for workspace scripts
package manifests in each app and package
pnpm-workspace.yaml or Yarn workspace config for monorepo management
Infrastructure config
terraform/ for cloud resources
k8s/ for container orchestration manifests
cloudflare/ for edge rules and R2 settings
observability/ for monitoring and logging config
Documentation
docs organized by architecture, onboarding, API, runbooks
architecture docs include diagrams, security models, and deployment guides
Closing
This document defines a complete, enterprise-grade architecture for a modern AI-powered publishing platform that replaces WordPress and unifies content, SEO, AI, media, search, and editorial workflows as native capabilities. It is designed to scale with multi-brand publishers, support complex editorial operations, and provide a future-ready foundation for the next generation of publishing businesses.


18 File Structure
COMPLETE project tree

/
├── README.md
├── package.json
├── tsconfig.json
├── pnpm-workspace.yaml
├── .gitignore
├── .editorconfig
├── .prettierrc
├── .eslintrc.js
├── .github/
│   ├── workflows/
│   │   ├── lint.yml
│   │   ├── test.yml
│   │   ├── build.yml
│   │   ├── deploy-staging.yml
│   │   ├── deploy-production.yml
│   │   └── security-scan.yml
│   └── dependabot.yml
├── apps/
│   ├── public-site/
│   │   ├── next.config.mjs
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   ├── robots.txt
│   │   │   ├── sitemap.xml
│   │   │   └── assets/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── globals.css
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [locale]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── articles/
│   │   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   │   ├── category/
│   │   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   │   ├── tag/
│   │   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   │   ├── author/
│   │   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   │   └── search/page.tsx
│   │   │   │   ├── api/
│   │   │   │   │   ├── preview/route.ts
│   │   │   │   │   ├── sitemap/route.ts
│   │   │   │   │   └── robots/route.ts
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   └── Card.tsx
│   │   │   │   ├── article/
│   │   │   │   └── shared/
│   │   │   ├── sections/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── seo/
│   │   │   ├── theme/
│   │   │   └── lib/
│   │   └── tests/
│   ├── admin-panel/
│   │   ├── next.config.mjs
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── public/
│   │   │   ├── admin-icons.svg
│   │   │   └── preview.png
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── articles/page.tsx
│   │   │   │   ├── articles/[id]/page.tsx
│   │   │   │   ├── media/page.tsx
│   │   │   │   ├── seo/page.tsx
│   │   │   │   ├── ads/page.tsx
│   │   │   │   ├── ai/page.tsx
│   │   │   │   ├── analytics/page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── roles/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── components/
│   │   │   ├── sections/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── seo/
│   │   │   ├── theme/
│   │   │   └── lib/
│   │   └── tests/
│   ├── backend-api/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── app.service.ts
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── filters/
│   │   │   │   ├── decorators/
│   │   │   │   ├── pipes/
│   │   │   │   └── middleware/
│   │   │   ├── config/
│   │   │   ├── modules/
│   │   │   │   ├── articles/
│   │   │   │   ├── categories/
│   │   │   │   ├── tags/
│   │   │   │   ├── authors/
│   │   │   │   ├── media/
│   │   │   │   ├── comments/
│   │   │   │   ├── seo/
│   │   │   │   ├── ads/
│   │   │   │   ├── analytics/
│   │   │   │   ├── search/
│   │   │   │   ├── users/
│   │   │   │   ├── permissions/
│   │   │   │   ├── ai/
│   │   │   │   ├── notifications/
│   │   │   │   ├── settings/
│   │   │   │   ├── scheduler/
│   │   │   │   ├── logs/
│   │   │   │   └── audit/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   ├── migrations/
│   │   │   │   └── seed.ts
│   │   │   └── tests/
│   │   └── docker/
│   │       └── Dockerfile
│   ├── worker-services/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── queue/
│   │   │   │   ├── index.ts
│   │   │   │   ├── jobs/
│   │   │   │   │   ├── publish-job.ts
│   │   │   │   │   ├── seo-index-job.ts
│   │   │   │   │   ├── media-transform-job.ts
│   │   │   │   │   └── ai-task-job.ts
│   │   │   ├── scheduler/
│   │   │   ├── media/
│   │   │   └── services/
│   └── analytics-dashboard/
│       ├── next.config.mjs
│       ├── package.json
│       ├── tsconfig.json
│       ├── public/
│       └── src/
├── packages/
│   ├── ui/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   └── tests/
│   ├── design-system/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── tokens/
│   │   │   ├── components/
│   │   │   └── theme/
│   ├── api-client/
│   │   ├── package.json
│   │   ├── src/
│   │   ├── types/
│   │   └── utils/
│   ├── auth/
│   │   ├── package.json
│   │   ├── src/
│   │   └── strategies/
│   ├── seo/
│   │   ├── package.json
│   │   ├── src/
│   │   └── tests/
│   └── ai/
│       ├── package.json
│       ├── src/
│       └── prompts/
├── shared/
│   ├── types/
│   │   ├── article.ts
│   │   ├── seo.ts
│   │   ├── user.ts
│   │   └── media.ts
│   ├── constants/
│   ├── helpers/
│   ├── validators/
│   └── i18n/
├── database/
│   ├── migrations/
│   │   ├── 20260101_initial.sql
│   │   ├── 20260301_seo_meta.sql
│   │   └── 20260401_ai_tasks.sql
│   ├── seeds/
│   │   ├── seed-tenants.ts
│   │   ├── seed-roles.ts
│   │   └── seed-admin-user.ts
│   ├── schema/
│   │   ├── data-model.md
│   │   └── er-diagram.svg
│   └── local/
│       ├── init-db.sh
│       └── reset-db.sh
├── workers/
│   ├── queue/
│   │   ├── job-processor.ts
│   │   ├── job-definitions.ts
│   │   └── event-handlers.ts
│   ├── scheduler/
│   │   ├── scheduler.ts
│   │   └── task-registry.ts
│   └── media/
│       ├── transcoder/
│       └── transform-service.ts
├── scripts/
│   ├── dev/
│   │   ├── start-dev.sh
│   │   └── seed-dev-data.ts
│   ├── deploy/
│   │   ├── deploy-staging.sh
│   │   └── deploy-prod.sh
│   ├── maintenance/
│   │   ├── prune-logs.ts
│   │   └── rebuild-search-index.ts
│   └── utils/
│       ├── generate-docs.ts
│       └── migrate.sh
├── config/
│   ├── env/
│   │   ├── development.env
│   │   ├── staging.env
│   │   └── production.env
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── prisma.config.ts
│   ├── prettier/
│   │   └── .prettierrc
│   ├── eslint/
│   │   └── .eslintrc.js
│   ├── jest/
│   │   └── jest.config.ts
│   └── tailwind/
│       └── tailwind.config.js
├── docs/
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── backend-architecture.md
│   │   ├── frontend-architecture.md
│   │   ├── security-architecture.md
│   │   ├── seo-engine.md
│   │   └── ai-engine.md
│   ├── onboarding/
│   │   ├── dev-setup.md
│   │   ├── code-review.md
│   │   ├── git-guidelines.md
│   │   └── release-process.md
│   ├── api/
│   │   ├── public-api.md
│   │   ├── admin-api.md
│   │   ├── auth-api.md
│   │   └── webhooks.md
│   └── runbooks/
│       ├── incident-response.md
│       ├── deploy-checklist.md
│       ├── database-backup.md
│       └── on-call-guide.md
├── infrastructure/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── modules/
│   │   │   ├── postgres/
│   │   │   ├── redis/
│   │   │   ├── opensearch/
│   │   │   ├── cloudflare/
│   │   │   ├── kubernetes/
│   │   │   └── monitoring/
│   ├── k8s/
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── worker-deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   ├── cloudflare/
│   │   ├── pages-config.toml
│   │   ├── workers/
│   │   │   ├── edge-router.ts
│   │   │   └── preview-auth.ts
│   │   └── r2-policy.json
│   └── observability/
│       ├── prometheus.yml
│       ├── grafana-dashboards/
│       ├── loki-config.yaml
│       └── sentry-config.yml
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── Dockerfile.worker
│   └── Dockerfile.tests








4 Folder Structure
Monorepo structure
The platform is organized into a monorepo with clear separation between apps, shared packages, infrastructure, and docs.

/
├── apps/
│   ├── public-site/
│   ├── admin-panel/
│   ├── backend-api/
│   ├── worker-services/
│   └── analytics-dashboard/
├── packages/
│   ├── ui/
│   ├── design-system/
│   ├── api-client/
│   ├── auth/
│   ├── seo/
│   └── ai/
├── frontend/
│   ├── public/
│   └── src/
├── backend/
│   ├── src/
│   ├── modules/
│   └── tests/
├── admin/
│   ├── src/
│   ├── routes/
│   └── components/
├── shared/
│   ├── types/
│   ├── constants/
│   └── helpers/
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── schema/
│   └── local/
├── workers/
│   ├── queue/
│   ├── scheduler/
│   └── media/
├── scripts/
│   ├── dev/
│   ├── deploy/
│   └── maintenance/
├── config/
│   ├── env/
│   ├── prisma/
│   ├── prettier/
│   └── eslint/
├── docs/
│   ├── architecture/
│   ├── onboarding/
│   ├── api/
│   └── runbooks/
├── infrastructure/
│   ├── terraform/
│   ├── k8s/
│   ├── cloudflare/
│   └── observability/
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── Dockerfile.worker
├── github/
│   ├── workflows/
│   └── dependabot.yml
├── README.md
└── package.json

Architecture diagram
flowchart TB
  subgraph EndUsers
    Browser["Browser / Mobile App"]
    Editor["Editor / Admin"]
    APIConsumer["Third-party App / Partner API"]
  end

  subgraph CDN
    Cloudflare["Cloudflare CDN / Edge"]
  end

  subgraph Frontend
    PublicFE["Public Frontend (Next.js)"]
    AdminFE["Admin Panel (Next.js / React)"]
  end

  subgraph API
    APIGateway["API Gateway"]
    PublicAPI["Public Content API"]
    AdminAPI["Admin Management API"]
    AuthService["Auth / Identity Service"]
    SEOService["SEO Service"]
    AnalyticsService["Analytics Service"]
    MediaService["Media API"]
    AIService["AI Orchestration"]
  end

  subgraph Data
    Postgres["PostgreSQL (Primary DB)"]
    OpenSearch["OpenSearch / Elasticsearch"]
    Redis["Redis Cache / Queue"]
    ObjectStore["Cloudflare R2"]
    EventWarehouse["Analytics Warehouse"]
  end

  subgraph Workers
    BackgroundJobs["Background Workers"]
    Scheduler["Scheduler / Cron"]
    Transcoder["Media Transcoder"]
    Audit["Audit & Compliance"]
  end

  subgraph Observability
    Prometheus["Prometheus"]
    Grafana["Grafana"]
    Loki["Grafana Loki"]
    Sentry["Sentry"]
  end

  Browser -->|HTTP/HTTPS| Cloudflare
  Editor -->|HTTP/HTTPS| Cloudflare
  APIConsumer -->|API Calls| APIGateway

  Cloudflare --> PublicFE
  Cloudflare --> AdminFE
  Cloudflare --> APIGateway

  APIGateway --> PublicAPI
  APIGateway --> AdminAPI
  APIGateway --> AuthService
  PublicAPI --> Postgres
  PublicAPI --> OpenSearch
  AdminAPI --> Postgres
  AdminAPI --> OpenSearch
  AdminAPI --> ObjectStore
  MediaService --> ObjectStore
  AIService --> OpenAI
  AnalyticsService --> EventWarehouse
  AnalyticsService --> Postgres

  BackgroundJobs --> Postgres
  BackgroundJobs --> OpenSearch
  BackgroundJobs --> Redis
  BackgroundJobs --> ObjectStore
  Scheduler --> BackgroundJobs
  Transcoder --> ObjectStore
  Audit --> Postgres

  Prometheus --> Grafana
  Loki --> Grafana
  APIGateway --> Prometheus
  APIGateway --> Loki
  APIGateway --> Sentry