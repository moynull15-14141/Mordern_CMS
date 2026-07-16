import { ApiProperty } from '@nestjs/swagger';

/** Swagger-only mirror of HealthService's AppInfo return shape. */
export class AppInfoDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok';

  @ApiProperty()
  name!: string;

  @ApiProperty()
  version!: string;

  @ApiProperty()
  environment!: string;

  @ApiProperty()
  uptimeSeconds!: number;

  @ApiProperty()
  timestamp!: string;
}
