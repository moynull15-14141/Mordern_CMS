import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import {
  PUBLIC_LAYOUT_CONTENT_TYPES,
  PublicLayoutContentType,
} from '../constants/public-layout-content-type';

/** `slug` is required for every `contentType` except `'home'` (there is
 * exactly one homepage per site, no slug to disambiguate) — enforced at
 * the service layer (`PublicLayoutsService.resolveLayoutForContent`), not
 * a decorator, same reasoning `MenusValidator.validateItemTarget`'s
 * cross-field rule is service-layer rather than decorator-layer. */
export class PublicLayoutResolveQueryDto {
  @ApiProperty({ enum: PUBLIC_LAYOUT_CONTENT_TYPES })
  @IsIn(PUBLIC_LAYOUT_CONTENT_TYPES)
  contentType!: PublicLayoutContentType;

  @ApiPropertyOptional({ description: 'Required unless contentType is "home".' })
  @IsOptional()
  @IsString()
  slug?: string;
}
