# 40_PRODUCT_PHILOSOPHY

## Executive Summary

This document defines the durable product principles for the Modern CMS Platform. Unlike `20`–`35`, which freeze the V1 backend/database architecture, these principles are not milestone-scoped — they apply to every future decision, module, and provider added to the platform, in V1 and beyond. Where a future choice is ambiguous, these principles resolve it before a new document or milestone brief is needed.

## Vision

This project is not a website — it is a modern publishing platform designed to replace traditional WordPress-style CMS systems with a clean, scalable, enterprise-ready architecture. The same codebase must be able to power a Sports News Portal, Magazine, Newspaper, Blog, Travel Website, Company Blog, Media Portal, Documentation Website, or Editorial Website. The long-term goal is a complete Modern CMS Platform.

## Core Principles

1. **AI is Optional.**
   AI is never required. Every core workflow (publishing, editing, search, media) must be fully usable with AI completely disabled.

2. **Everything must work manually.**
   Any AI-assisted or automated capability must have a manual, human-driven path that produces the same outcome without it.

3. **Provider Pattern everywhere.**
   External capabilities — storage, cache, email, search, AI — are accessed only through an interface. Business logic never depends on a specific vendor's SDK directly.

4. **Configuration over hardcoding.**
   Behavior is controlled by configuration and environment variables, not hardcoded values or vendor-specific branches in source.

5. **Interface before implementation.**
   Define the contract first. Implement a concrete provider only when a real, immediate need exists — not speculatively.

6. **Single Site in V1.**
   V1 operates exactly one site per deployment. Site-scoped fields exist in the schema, but multi-site is not a V1 feature.

7. **Future Multi Site Ready.**
   Because data is site-scoped from day one, multi-site support is additive later — a new module, not a rewrite of existing ones.

8. **Self Hosted First.**
   The platform must run fully self-hosted with no mandatory external SaaS dependency for core functionality.

9. **SaaS Later.**
   A managed/hosted offering is a future business model layered on top of the same core — never a prerequisite for running it.

10. **No Vendor Lock-in.**
    Any external provider (storage, AI, search, email) must be swappable for another without touching business logic — only configuration and the provider adapter change.

11. **Feature Flags before Features.**
    New capabilities ship behind a flag, disabled by default, before they are turned on for real use.

12. **Everything replaceable.**
    Any module, adapter, or provider can be replaced without cascading changes to unrelated parts of the system.

13. **SOLID everywhere.**
    Every layer of the backend follows SOLID, especially dependency inversion between business logic and providers/adapters.

14. **Plugin-free Core.**
    Core capabilities are native modules, not a plugin marketplace. Extensibility comes from clean interfaces and adapters, not third-party plugins.

15. **Documentation First.**
    No implementation begins before the relevant documentation exists and is approved — this is `RULE_ZERO` applied permanently, not just for the frozen V1 milestones.

## Database Strategy

Development uses Supabase only as a PostgreSQL database — no Supabase Auth, Storage, Edge Functions, Realtime, or AI SDKs. Production must run on any PostgreSQL server (VPS, Docker, AWS RDS, Azure, Google Cloud SQL, DigitalOcean, Railway, Neon, Supabase). Changing providers must only ever require updating `DATABASE_URL` — no application code changes (see Principles 8–10).

## Product Editions

The architecture evolves into multiple editions from the same codebase, without redesigning V1:

- **Edition 1 — Single Site** (personal blog, company site, news portal, magazine, travel, sports — **V1, current**)
- **Edition 2 — Agency** (multi-client management, theme management, site cloning, shared media, deployment tools — future)
- **Edition 3 — Enterprise** (advanced roles, SSO, audit, workflow, approvals, publishing teams, security policies — future)
- **Edition 4 — SaaS Cloud** (tenant isolation, subscriptions, billing, workspaces, custom domains, usage tracking — future)

**Development rule:** never implement a future edition inside V1. Design V1 so later editions are additive, not a rewrite (Principle 7, 12).

## AI Roadmap

- **V1** (current): AI disabled by default. Foundation, configuration, and provider interface only — no live provider calls.
- **V2**: AI optional, bring-your-own API key (OpenAI, Gemini, Claude, OpenRouter, Ollama, DeepSeek).
- **V3**: Full AI editorial workflow — content generation, SEO, translation, summaries, automation, editorial assistance.

## Final Principle

This project is not being built for today's needs. It is being built to remain maintainable, scalable, portable, and extensible for the next 10 years.
