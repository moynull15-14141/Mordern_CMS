import { SetMetadata } from '@nestjs/common';
import { REQUIRE_ANY_PERMISSION_KEY } from '../authorization.constants';

/** Requires the caller to hold at least one of the listed permissions (OR semantics). */
export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(REQUIRE_ANY_PERMISSION_KEY, permissions);
