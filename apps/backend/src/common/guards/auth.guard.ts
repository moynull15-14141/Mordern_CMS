import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Placeholder JWT auth guard. Delegates to JwtStrategy for token
 * verification; no user lookup, session revocation, or login/register logic
 * exists yet (Auth business module is a later milestone).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
