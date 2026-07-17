import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { SeoFieldsDto } from './seo-fields.dto';

export class CreateSeoDto extends SeoFieldsDto {
  @ApiProperty({ description: 'The Site this SEO metadata belongs to.' })
  @IsUUID()
  siteId!: string;
}
