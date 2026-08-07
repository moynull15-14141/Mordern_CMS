import { ApiProperty } from '@nestjs/swagger';

export class PreviewTokenResponseDto {
  @ApiProperty({ description: 'Short-lived (10 minute) token for the public preview route.' })
  token: string;
}
