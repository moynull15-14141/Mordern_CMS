import { ApiProperty } from '@nestjs/swagger';
import { ThemeStatus } from '@prisma/client';
import { ThemeSettingsDto } from './theme-settings.dto';

export class ThemeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  version!: string | null;

  @ApiProperty({ nullable: true })
  author!: string | null;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  thumbnail!: string | null;

  @ApiProperty({ enum: ThemeStatus })
  status!: ThemeStatus;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: ThemeSettingsDto, nullable: true })
  settings!: ThemeSettingsDto | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
