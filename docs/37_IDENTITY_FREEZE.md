# 37_IDENTITY_FREEZE

## Executive Summary

Official freeze declaration for the Identity & Authentication Foundation (Milestone 4, patched in Milestone 4.1). Mirrors `36_DATABASE_FREEZE.md`'s role for the database: from this point forward, `apps/backend/src/modules/identity/` is the literal implementation of what this document freezes. Any future change to auth architecture (new claim, new token strategy, new provider) must update this document in the same change.

## Module Identity

Implemented as `modules/identity/`, not `modules/auth/` — `20_BACKEND_ARCHITECTURE.md` §4 and `35_ARCHITECTURE_FREEZE.md`'s Final Module List both referred to "Auth" before Milestone 4 was built; both were updated in Milestone 4.1 to point to the actual name. Fully supersedes the Milestone 2 `modules/auth` scaffold, which no longer exists.

Folder structure (Milestone 4.1 §6 — Provider Architecture):
```
identity/
├── controllers/   — AuthController (8 endpoints, thin, no business logic)
├── services/      — AuthService (orchestrator) + Token/Password/Session/PasswordReset/EmailVerification
├── repositories/  — Prisma access scoped to exactly what auth needs (not full User CRUD)
├── interfaces/    — JwtPayload, AuthenticatedUser, RequestContext
├── providers/     — PasswordHistoryProvider (interface only, §4)
├── policies/      — password.policy.ts
├── dto/           — request/response contracts
├── strategies/    — JwtStrategy
├── guards/        — JwtAuthGuard, OptionalAuthGuard
├── decorators/    — @CurrentUser(), @Public()
└── utils/         — duration.util.ts
```

## JWT Strategy

**Payload** (frozen Milestone 4.1 §2) — exactly four claims, nothing more:
```ts
interface JwtPayload {
  sub: string;           // user id
  email: string;
  role: string | null;   // always null — no Roles module exists yet
  siteId: string | null;
}
```
`permissions`, `menus`, `tenant`, and `settings` must never be added to this payload. `role` reserves the claim shape for forward-compatibility only; **no code reads it for authorization** — every permission/role check always queries the database/service layer directly, never a cached JWT claim. This is enforced by convention today (no Roles module exists to violate it) and must remain true once one does.

`JwtStrategy.validate()` does a **real database lookup** by `sub` on every request (unchanged since Milestone 4) — a deleted/suspended user is rejected even with an otherwise-valid, unexpired token. The extra payload fields (`email`/`role`/`siteId`) are not used by `validate()`; `AuthenticatedUser` attached to `request.user` always comes from the fresh DB row, not the token claims.

## Refresh Token Strategy (official — no blacklist)

**Rotation is the entire strategy.** There is no blacklist table, no revocation list beyond what rotation itself produces:

```
Old refresh token
      ↓
   Revoke (refresh_tokens.revoked_at set, old Session revoked)
      ↓
Generate new refresh token (new row, new hash)
      ↓
Generate new Session (new row, carries forward device/rememberMe metadata)

Reuse of the old (already-rotated) token
      ↓
   Reject (findActiveByHash excludes revoked/expired rows → AuthenticationException)
```

Tokens are opaque 384-bit random strings (`crypto.randomBytes(48)`), SHA-256-hashed at rest — deliberately not JWTs (no claims to decode) and deliberately not bcrypt-hashed (bcrypt's slow adaptive hashing defends low-entropy human passwords; a 384-bit random token has no such threat model, and bcrypt would add needless latency to every refresh). Password reset and email verification tokens use the same opaque/SHA-256 pattern.

## Session Strategy

One active Session row per refresh token, revoked and replaced together on rotation/logout. Fields, as of Milestone 4.1 §3:

| Field | Since | Populated by |
|---|---|---|
| `ipAddress`, `userAgent`, `deviceName` | Milestone 4 | Request headers / client-supplied `deviceName` at login |
| `lastSeenAt` | Milestone 4 | `SessionRepository.updateLastSeen()` |
| `rememberMe` | Milestone 4.1 | Login's `rememberMe` flag; carried forward across rotation |
| `browser`, `operatingSystem` | Milestone 4.1 | **Not populated yet** — no user-agent parser wired in; architecture-readiness only |
| `country`, `city` | Milestone 4.1 | **Not populated yet** — no geo-IP lookup wired in; architecture-readiness only |

"Remember me" extends both the refresh token and session expiry to `AUTH_REMEMBER_ME_EXPIRES_IN` (default 30d) instead of the standard `JWT_REFRESH_EXPIRES_IN` (default 7d). Rotation always uses the standard duration going forward (existing business rule, unchanged in 4.1) — only the `rememberMe` metadata flag is carried forward for record accuracy, not the extended duration itself.

## Password Policy

8+ characters, at least one uppercase, one lowercase, one number, one special character (`modules/identity/policies/password.policy.ts`). Enforced on `reset-password`'s `newPassword` only — never re-validated on `login`'s password, since doing so would wrongly reject accounts created under a looser or since-changed policy. Hashed with bcrypt (12 salt rounds).

## Provider Abstractions (interfaces only — no implementation)

- **`EmailProvider`** (`core/interfaces/email-provider.interface.ts`, extended Milestone 4.1 §5): `send()`, `verify()`, `queue()`, `health()`. No SMTP/SendGrid/Mailgun/SES/nodemailer/Resend package is installed or implements it. `AuthService` currently logs generated tokens (raw value outside production only) instead of sending email — see `deliverToken()`.
- **`PasswordHistoryProvider`** (`modules/identity/providers/password-history.provider.ts`, new Milestone 4.1 §4): `record()`, `wasPreviouslyUsed()`. No `password_history` table, no repository, no queries — interface only, for a future password-reuse-prevention feature.

Both are pure TypeScript interfaces with zero concrete implementations and zero DI providers registered for them.

## API Contract (Swagger)

Every endpoint documents its response through **one** generic wrapper (Milestone 4.1 §9): `ApiWrappedResponse(Model)` in `core/responses/api-response.swagger.ts`, composing `{ success, message, data, meta, errors }` (`ApiResponseDto`) with the endpoint's specific `data` type via OpenAPI `allOf`. No endpoint hand-rolls its own response schema. Verified live: `/docs-json` shows every `200` response as `allOf: [ApiResponseDto, { data: <Model> }]`.

## Endpoints (8, unchanged since Milestone 4)

`POST /auth/{login,logout,refresh,forgot-password,reset-password,verify-email,resend-verification}`, `GET /auth/me`. All protected by default (`JwtAuthGuard` is a global `APP_GUARD`); `login`/`refresh`/`forgot-password`/`reset-password`/`verify-email`/`resend-verification` are `@Public()`; `logout`/`me` require a valid access token.

## Security Notes

- Login/forgot-password/resend-verification responses are generic on failure — never reveal whether an email exists.
- Every `AuthenticationException` (bad credentials, invalid/expired token) is auto-logged via `SecurityLoggerService` through the existing Milestone 2.1 exception-filter integration — confirmed live in test output.
- Password change revokes every existing session/refresh token for that user.

## Testing

44 tests / 9 suites (unchanged count in 4.1 — no new scenarios added per this patch's instruction; existing `TokenService` test updated only for the new `signAccessToken` signature). Coverage figures for this patch are in the Milestone 4.1 report, not restated here to avoid drift between two documents.

## Deferred / Explicitly Out of Scope

RBAC, Roles/Permissions/User CRUD, Admin UI, OAuth/social login, MFA, multi-tenant/SaaS behavior, SMTP/Redis/Queue/Notifications wiring, password-history enforcement, password blacklist/reuse-check enforcement. All per `41_PLATFORM_CAPABILITIES.md`'s User & Permission Philosophy (future) and this patch's explicit STRICTLY-DO-NOT list. (Scoped to this document's Milestone 4/4.1 freeze date: the RBAC *resolution engine* was subsequently implemented in Milestone 5 as `modules/authorization/` — see `38_RBAC_ARCHITECTURE.md`. Roles/Permissions/User CRUD and Admin UI remain deferred, and the "never a cached JWT claim" rule above still holds under the Milestone 5 engine.)

## Approved Date

2026-07-16

## Architecture Status

**FROZEN** — Identity & Authentication Foundation, V1.1 (Milestone 4.1 patch applied on top of Milestone 4).
