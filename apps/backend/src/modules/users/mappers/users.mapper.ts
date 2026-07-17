import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Session } from '@prisma/client';
import { UserMetadata } from '../interfaces/user-metadata.interface';
import { UserResponseDto } from '../dto/user-response.dto';
import { SessionResponseDto } from '../dto/session-response.dto';

@Injectable()
export class UsersMapper {
  private parseMetadata(user: User): UserMetadata {
    return (user.metadata as UserMetadata | null) ?? {};
  }

  toResponseDto(user: User): UserResponseDto {
    const metadata = this.parseMetadata(user);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      status: user.status,
      profileImageId: user.profileImageId,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      locked: Boolean(metadata.security?.locked),
      profile: metadata.profile ?? null,
      preferences: metadata.preferences ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      deletedAt: user.deletedAt?.toISOString() ?? null,
    };
  }

  toSessionResponseDto(session: Session): SessionResponseDto {
    return {
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceName: session.deviceName,
      browser: session.browser,
      operatingSystem: session.operatingSystem,
      country: session.country,
      city: session.city,
      rememberMe: session.rememberMe,
      lastSeenAt: session.lastSeenAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      revokedAt: session.revokedAt?.toISOString() ?? null,
    };
  }
}
