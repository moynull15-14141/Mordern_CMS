import { SetMetadata } from '@nestjs/common';
import { REQUIRE_PERMISSION_KEY } from '../authorization.constants';

/** Requires the caller to hold every listed permission (AND semantics). */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permissions);
