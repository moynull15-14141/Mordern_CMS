# 41_PLATFORM_CAPABILITIES.md

# Platform Capabilities & Product Philosophy (V1)

Version: 1.0

Status: Architecture Frozen

Applies To:

- Single Site Edition
- Future Agency Edition
- Future Enterprise Edition
- Future SaaS Edition

---

# Vision

This project is not intended to clone WordPress.

The goal is to build a **modern publishing platform** inspired by the strengths of WordPress while eliminating its architectural limitations.

The platform should provide:

- WordPress-level flexibility
- Modern SaaS architecture
- Enterprise-grade scalability
- Next.js performance
- Clean developer experience
- Optional AI
- Database-driven configuration
- Plugin-free core architecture

Everything should remain maintainable for many years.

---

# Core Product Philosophy

## Everything Should Be Configurable

The platform should never rely on hardcoded business logic for everyday website management.

If an administrator expects something to be editable,

it should be editable from the Admin Panel.

Code changes should only be required when introducing completely new platform capabilities.

---

# Database Driven Platform

The platform should be driven entirely by database configuration.

Examples:

- Navigation
- Pages
- Homepage Layout
- Settings
- SEO
- Advertisements
- Widgets
- Theme Options
- User Roles
- Permissions

Nothing should require source code modification for routine management.

---

# Navigation Engine

The Navigation System must support unlimited flexibility.

## Requirements

- Unlimited Menus
- Unlimited Menu Locations
- Unlimited Menu Levels
- Nested Menus
- Drag & Drop Ordering
- Menu Groups
- Mega Menu Ready
- Mobile Navigation
- Sticky Navigation Ready
- Footer Navigation
- Sidebar Navigation
- Top Bar Navigation
- User Navigation

---

## Supported Menu Item Types

Each menu item may point to:

- Homepage
- Internal Page
- Article
- Category
- Tag
- Author
- Custom URL
- External URL
- Section Anchor
- Search Page
- Contact Page
- Landing Page

---

## Future Ready

The Navigation Engine should be extendable without redesign.

Future capabilities include:

- Mega Menu
- Icon Support
- Badges
- Dynamic Counters
- Personalized Menus
- Multi-language Navigation

---

# Dynamic Pages

The platform must support unlimited pages.

Each page should support:

- Custom Slug
- SEO Metadata
- Featured Image
- Draft
- Published
- Scheduled
- Preview
- Version History
- Parent / Child Hierarchy
- Redirect Support
- Canonical URL
- Password Protection
- Visibility Control

Future:

- Landing Pages
- Marketing Pages
- Sales Pages
- Campaign Pages

---

# Homepage Builder

The homepage must never be hardcoded.

Homepage should be fully configurable.

Administrator should be able to:

- Enable Section
- Disable Section
- Reorder Sections
- Duplicate Layout
- Save Draft Layout
- Publish Layout
- Switch Homepage Layout instantly

Future support:

- Landing Page Builder
- Event Pages
- Festival Layouts
- Election Layouts
- Sports Tournament Layouts

---

# Widget System

The platform should include a modern widget engine.

Widgets may include:

- Latest Articles
- Trending News
- Popular Posts
- Related Posts
- Advertisement
- Newsletter
- Weather
- Poll
- Social Feed
- Video Block
- Live Score
- Crypto
- Stock Market
- HTML Block

Future:

- Custom Widgets
- Marketplace
- Widget SDK

---

# Routing Engine

The routing system should be fully database driven.

Supported Routes:

/article/{slug}

/category/{slug}

/tag/{slug}

/author/{slug}

/page/{slug}

/search

/archive

Custom Routes

Redirect Routes

404 Handler

Future:

- Dynamic Route Resolver
- Multi-language URLs

---

# Theme Engine

The frontend should never be hardcoded.

Everything should be configurable.

Future theme options:

- Light Mode
- Dark Mode
- Typography
- Color Palette
- Layout Width
- Container Width
- Logo
- Favicons
- Header Styles
- Footer Styles

---

# SEO Philosophy

SEO is a built-in platform capability.

No third-party SEO plugins should be required.

The platform should include:

- Meta Title
- Meta Description
- Open Graph
- Twitter Cards
- Canonical URL
- Robots
- Structured Data
- XML Sitemap
- RSS Feed
- Redirect Manager

Future:

- SEO Audit
- Internal Linking Assistant
- SEO Suggestions

---

# Publishing Philosophy

Publishing should be simple.

Supported workflow (matches the frozen `ContentStatus` enum exactly — see `36_DATABASE_FREEZE.md`):

Draft

↓

Review

↓

Scheduled

↓

Published

↓

Archived

"Approved" is a business-workflow action an editor takes to move a Review-state article toward Scheduled/Published — it is never a database status. It must not be added to `ContentStatus`. A future editorial-approvals feature (assignments, approval chains, sign-off) may track that action separately without changing this enum.

Future:

- Editorial Workflow
- Assignments
- Approval Chains

---

# Media Philosophy

The media system should support:

- Images
- Video
- Audio
- Documents
- Folder Structure
- Metadata
- Optimization
- Future CDN Support

---

# User & Permission Philosophy

RBAC should be built into the platform.

Support:

- Users
- Roles
- Permissions
- Custom Roles
- Multiple Roles
- Fine-grained Permissions

No plugin required.

> **Milestone 5 status** (see `38_RBAC_ARCHITECTURE.md`): the resolution
> engine (`modules/authorization/`) delivers Multiple Roles (a user may hold
> several `UserRole` rows) and Fine-grained Permissions (`resource.action`
> strings via `Role` → `RolePermission` → `Permission`) against the existing
> Milestone 3 tables. Custom Roles — creating/editing roles and their
> permission assignments through an API or admin UI — is intentionally not
> part of this engine and remains a future Roles/Permissions business module.

---

# AI Philosophy

AI is **Optional**.

AI must never become a dependency.

Without AI:

- Entire CMS works normally.

With AI:

Administrator can enable AI from:

Settings

↓

AI

↓

Provider

↓

API Key

↓

Enable

Disable:

↓

Everything continues to work normally.

Supported future providers:

- OpenAI
- Google Gemini
- Anthropic Claude
- OpenRouter
- Ollama (Local)
- Custom Provider

No business logic should depend on AI.

---

# Database Philosophy

The platform must remain PostgreSQL-first.

Supported providers:

- PostgreSQL
- Supabase PostgreSQL
- Neon
- AWS RDS PostgreSQL
- Azure PostgreSQL
- Google Cloud SQL
- Self-hosted PostgreSQL
- Docker PostgreSQL
- Ubuntu VPS PostgreSQL

Changing only:

DATABASE_URL

must migrate the platform to another PostgreSQL provider.

No vendor lock-in.

---

# Deployment Philosophy

The platform should support:

Development

- Local Machine

Production

- Ubuntu VPS
- Docker
- Coolify
- Dokploy
- Railway
- Render
- DigitalOcean
- AWS
- Azure
- Google Cloud

Shared Hosting is **not** a deployment target.

---

# Editions Roadmap

The entire platform should share one codebase.

## Edition 1

Single Site Edition

Perfect for:

- Blogs
- Newspapers
- Company Websites
- Sports Websites

---

## Edition 2

Agency Edition

Supports:

- Multiple Client Websites
- Shared Infrastructure
- Independent Databases

---

## Edition 3

Enterprise Edition

Supports:

- Large Organizations
- Editorial Teams
- Multi-Department Publishing
- Advanced Workflows

---

## Edition 4

Cloud SaaS Edition

Supports:

- Multi-Tenant
- Subscription Plans
- Workspace Management
- Usage Billing
- Self-Service Site Creation

---

# Product Principles

The platform should always follow these principles:

✓ Database Driven

✓ API First

✓ Clean Architecture

✓ SOLID Principles

✓ Domain Driven Design

✓ Modular Design

✓ Plugin-Free Core

✓ Enterprise Security

✓ High Performance

✓ Vendor Independent

✓ PostgreSQL First

✓ Optional AI

✓ Future Proof

✓ Long-Term Maintainability

✓ Single Codebase

✓ Multiple Editions

---

# Final Mission Statement

Build a modern Publishing Platform that combines:

- WordPress-level flexibility
- Next.js performance
- Enterprise architecture
- PostgreSQL portability
- Optional AI
- Database-driven configuration
- Long-term maintainability

without inheriting the architectural limitations of traditional CMS platforms.

---

# Architecture Commitment

This document is considered part of the project's Architecture Freeze.

Every future milestone must follow the principles defined here.

No implementation should violate these architectural commitments without an approved architecture revision.

Status:

✅ Approved

Version:

V1.0

Architecture State:

Frozen