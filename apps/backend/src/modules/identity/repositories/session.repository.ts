import { Injectable } from '@nestjs/common';
import type { Session } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { RequestContext } from '../interfaces/request-context.interface';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(params: {
    userId: string;
    refreshTokenId: string;
    expiresAt: Date;
    context: RequestContext;
    rememberMe: boolean;
  }): Promise<Session> {
    return this.prisma.session.create({
      data: {
        userId: params.userId,
        refreshTokenId: params.refreshTokenId,
        expiresAt: params.expiresAt,
        ipAddress: params.context.ipAddress,
        userAgent: params.context.userAgent,
        deviceName: params.context.deviceName,
        browser: params.context.browser,
        operatingSystem: params.context.operatingSystem,
        country: params.context.country,
        city: params.context.city,
        rememberMe: params.rememberMe,
      },
    });
  }

  findActiveByRefreshTokenId(refreshTokenId: string): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where: { refreshTokenId, revokedAt: null, deletedAt: null },
    });
  }

  revoke(id: string): Promise<Session> {
    return this.prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  updateLastSeen(id: string): Promise<Session> {
    return this.prisma.session.update({ where: { id }, data: { lastSeenAt: new Date() } });
  }
}
