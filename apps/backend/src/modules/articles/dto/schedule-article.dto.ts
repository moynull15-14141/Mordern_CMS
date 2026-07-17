import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ScheduleArticleDto {
  @ApiProperty({ description: 'Must be a future ISO 8601 date-time.' })
  @IsDateString()
  scheduledAt!: string;
}
