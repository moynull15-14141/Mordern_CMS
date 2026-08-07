import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const PREVIEW_TOKEN_PURPOSE = 'page-preview';
const PREVIEW_TOKEN_TTL = '10m';

interface PagePreviewTokenPayload {
  pageId: string;
  purpose: typeof PREVIEW_TOKEN_PURPOSE;
}

/**
 * Milestone 7 (Visual Page Builder) — the one genuinely new piece of
 * backend infrastructure this milestone needed: a way for the admin
 * Preview button to hand the (separate, unauthenticated) `apps/web`
 * process a short-lived credential for one specific page, without
 * exposing an always-public "any page by id" route (a Page can be
 * DRAFT/REVIEW content, unlike a Pattern, which is why the Pattern
 * preview route in Milestone 6 could safely be a plain public-by-id
 * route and this one can't).
 *
 * Deliberately stateless — signs/verifies with the same `JwtService` /
 * `JWT_SECRET` the login access token already uses (via `IdentityModule`,
 * imported into `PagesModule` for exactly this), just a different,
 * shorter-lived payload shape. No new table, no new migration, nothing to
 * clean up: an expired or already-used-past-its-window token simply stops
 * verifying.
 */
@Injectable()
export class PagePreviewService {
  constructor(private readonly jwtService: JwtService) {}

  createPreviewToken(pageId: string): string {
    const payload: PagePreviewTokenPayload = { pageId, purpose: PREVIEW_TOKEN_PURPOSE };
    return this.jwtService.sign(payload, { expiresIn: PREVIEW_TOKEN_TTL });
  }

  /** Throws `UnauthorizedException` for anything that isn't a genuine,
   * unexpired preview token — including a real login access token
   * presented here, which the `purpose` check rejects even though it
   * would pass the same `JwtService`'s signature check. */
  resolvePreviewToken(token: string): string {
    let payload: PagePreviewTokenPayload;
    try {
      payload = this.jwtService.verify<PagePreviewTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('This preview link has expired or is invalid.');
    }
    if (payload.purpose !== PREVIEW_TOKEN_PURPOSE || typeof payload.pageId !== 'string') {
      throw new UnauthorizedException('This preview link has expired or is invalid.');
    }
    return payload.pageId;
  }
}
