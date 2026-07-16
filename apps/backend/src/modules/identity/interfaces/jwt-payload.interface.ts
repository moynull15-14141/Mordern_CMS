/**
 * Access token claims (Milestone 4.1 §2). Deliberately lightweight — `role`
 * is present in the shape for forward-compatibility only and is always
 * `null` until the future Roles module resolves and assigns it. This field
 * must NEVER be used for authorization decisions: permission/role
 * resolution always comes from the database/service layer, never from a
 * cached JWT claim. Do not add permissions, menus, tenant, or settings here.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: string | null;
  siteId: string | null;
}

export interface JwtPayloadWithMeta extends JwtPayload {
  iat: number;
  exp: number;
}
