import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { MyAuthorizationDto } from '../dto/my-authorization.dto';
import { AuthorizationService } from '../services/authorization.service';

/**
 * Read-only self-inspection only — no CRUD, no role/permission management.
 * Demonstrates the authorization engine end-to-end and gives frontends a
 * way to ask "what can I do" without duplicating resolution logic.
 * Protected by the existing global JwtAuthGuard (Milestone 4) — no
 * @Public(), no PermissionGuard/RoleGuard applied (nothing to require here).
 */
@ApiTags('Authorization')
@ApiBearerAuth()
@Controller('authorization')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the current user's resolved roles and permissions" })
  @ApiWrappedResponse(MyAuthorizationDto)
  async getMyAuthorization(@CurrentUser() user: AuthenticatedUser): Promise<MyAuthorizationDto> {
    const [roles, permissions] = await Promise.all([
      this.authorizationService.resolveEffectiveRoles(user.id),
      this.authorizationService.resolvePermissions(user.id),
    ]);
    return { roles, permissions };
  }
}
