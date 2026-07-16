import { SetMetadata } from '@nestjs/common';
import { REQUIRE_ALL_PERMISSIONS_KEY } from '../authorization.constants';

/** Requires the caller to hold every listed permission (explicit AND — same
 * semantics as @RequirePermission, kept as its own decorator so call sites
 * can be explicit about intent per the milestone brief's method list). */
export const RequireAllPermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRE_ALL_PERMISSIONS_KEY, permissions);
