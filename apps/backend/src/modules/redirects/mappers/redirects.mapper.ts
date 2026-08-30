import { Injectable } from '@nestjs/common';
import { Redirect } from '@prisma/client';
import { PublicRedirectResponseDto, RedirectResponseDto } from '../dto/redirect-response.dto';

@Injectable()
export class RedirectsMapper {
  toResponseDto(redirect: Redirect): RedirectResponseDto {
    return {
      id: redirect.id,
      sourcePath: redirect.sourcePath,
      destinationUrl: redirect.destinationUrl,
      redirectType: redirect.redirectType,
      status: redirect.status,
      createdAt: redirect.createdAt.toISOString(),
      updatedAt: redirect.updatedAt.toISOString(),
      deletedAt: redirect.deletedAt ? redirect.deletedAt.toISOString() : null,
    };
  }

  toPublicResponseDto(redirect: Redirect): PublicRedirectResponseDto {
    return {
      destinationUrl: redirect.destinationUrl,
      redirectType: redirect.redirectType,
    };
  }
}
