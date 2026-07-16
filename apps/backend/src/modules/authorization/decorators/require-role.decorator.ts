import { SetMetadata } from '@nestjs/common';
import { REQUIRE_ROLE_KEY } from '../authorization.constants';

/** Requires the caller to hold at least one of the listed roles (direct or inherited). */
export const RequireRole = (...roles: string[]) => SetMetadata(REQUIRE_ROLE_KEY, roles);
