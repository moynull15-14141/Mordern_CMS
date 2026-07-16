import { Injectable } from '@nestjs/common';
import type { EmailVerification } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class EmailVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<EmailVerification> {
    return this.prisma.emailVerification.create({ data });
  }

  /** Valid = not yet verified, not expired, not soft-deleted. */
  findValidByHash(tokenHash: string): Promise<EmailVerification | null> {
    return this.prisma.emailVerification.findFirst({
      where: { tokenHash, verifiedAt: null, deletedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  markVerified(id: string): Promise<EmailVerification> {
    return this.prisma.emailVerification.update({ where: { id }, data: { verifiedAt: new Date() } });
  }
}
