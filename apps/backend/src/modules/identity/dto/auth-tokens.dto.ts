import { ApiProperty } from '@nestjs/swagger';
import { CurrentUserDto } from './current-user.dto';

export class AuthTokensDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ example: '15m' })
  expiresIn!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;

  @ApiProperty({ type: CurrentUserDto })
  user!: CurrentUserDto;
}
