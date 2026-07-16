import { Module } from '@nestjs/common';
import { AuthorizationController } from './controllers/authorization.controller';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { AuthorizationService } from './services/authorization.service';
import { PermissionGuard } from './guards/permission.guard';
import { RoleGuard } from './guards/role.guard';
import { AuthorizationGuard } from './guards/authorization.guard';

/**
 * RBAC Foundation (Milestone 5) — the authorization *engine* only. No
 * User/Role/Permission CRUD, no admin UI. Guards are provided here for
 * future business modules to opt into via `@UseGuards()`; none are
 * registered globally (see app.module.ts — only Identity's JwtAuthGuard is).
 */
@Module({
  controllers: [AuthorizationController],
  providers: [
    UserRoleRepository,
    RolePermissionRepository,
    AuthorizationService,
    PermissionGuard,
    RoleGuard,
    AuthorizationGuard,
  ],
  exports: [AuthorizationService, PermissionGuard, RoleGuard, AuthorizationGuard],
})
export class AuthorizationModule {}
