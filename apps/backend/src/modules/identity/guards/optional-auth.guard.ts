import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * For routes that behave differently for logged-in vs anonymous users but
 * must never reject the request outright (e.g. future public content
 * endpoints). Attaches `request.user` when a valid token is present;
 * otherwise proceeds with no user, never throwing.
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
