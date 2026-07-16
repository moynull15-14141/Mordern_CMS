import { Injectable } from '@nestjs/common';
import type { PasswordResetToken } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.create({ data });
  }

  /** Valid = unused, not expired, not soft-deleted (single-use per §8). */
  findValidByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, deletedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  markUsed(id: string): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  }
}
