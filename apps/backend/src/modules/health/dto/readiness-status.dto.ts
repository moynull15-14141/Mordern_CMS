import { ApiProperty } from '@nestjs/swagger';

class ReadinessChecksDto {
  @ApiProperty({ example: 'up' })
  database!: 'up' | 'down';
}

/** Swagger-only mirror of HealthService's ReadinessStatus return shape. */
export class ReadinessStatusDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok' | 'error';

  @ApiProperty()
  timestamp!: string;

  @ApiProperty({ type: ReadinessChecksDto })
  checks!: ReadinessChecksDto;
}
