import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SettingCategory } from '../enums/setting-category.enum';

export class ResetCategoryDto {
  @ApiProperty({ enum: SettingCategory })
  @IsEnum(SettingCategory)
  category!: SettingCategory;
}

export class ResetResultDto {
  @ApiProperty()
  resetCount!: number;
}
