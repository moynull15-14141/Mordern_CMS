import { ApiProperty } from '@nestjs/swagger';

/** Swagger-only mirror of HealthService's LivenessStatus return shape. */
export class LivenessStatusDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok';

  @ApiProperty()
  timestamp!: string;
}
