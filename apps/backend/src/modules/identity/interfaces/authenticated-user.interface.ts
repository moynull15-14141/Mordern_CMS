import type { UserStatus } from '@prisma/client';

/** Shape attached to `request.user` after JwtStrategy validates a token. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  status: UserStatus;
  siteId: string | null;
  tenantId: string | null;
}
