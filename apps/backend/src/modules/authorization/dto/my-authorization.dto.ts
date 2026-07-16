import { ApiProperty } from '@nestjs/swagger';

/** Response for GET /authorization/me — a read-only self-inspection of the
 * caller's own resolved authorization state. Not a management endpoint. */
export class MyAuthorizationDto {
  @ApiProperty({ type: [String], example: ['Editor'] })
  roles!: string[];

  @ApiProperty({ type: [String], example: ['article.create', 'article.update'] })
  permissions!: string[];
}
