import { Injectable } from '@nestjs/common';
import { Session } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

/**
 * Read-only queries against the existing, frozen `Session` table
 * (`37_IDENTITY_FREEZE.md`). Identity's own `SessionRepository` has no
 * `findAllForUser`/`findById` methods (it only needs create/revoke/lookup-by-
 * refresh-token for the auth flow), and that file is left untouched since
 * Identity is frozen — this is new, additive, read-only code instead of an
 * edit to a frozen file. Revocation still goes through Identity's actual
 * `SessionRepository`/`RefreshTokenRepository`/`SessionService` (re-provided
 * in `UsersModule` — see users.module.ts) so no revocation logic is
 * duplicated.
 */
@Injectable()
export class UserSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: { userId, deletedAt: null },
      orderBy: { lastSeenAt: 'desc' },
    });
  }

  async findById(sessionId: string): Promise<Session | null> {
    return this.prisma.session.findFirst({ where: { id: sessionId, deletedAt: null } });
  }
}
