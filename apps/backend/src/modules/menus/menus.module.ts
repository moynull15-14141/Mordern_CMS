import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { MenusController } from './controllers/menus.controller';
import { PublicMenusController } from './controllers/public-menus.controller';
import { MenusRepository } from './repositories/menus.repository';
import { MenusValidator } from './validators/menus.validator';
import { MenusMapper } from './mappers/menus.mapper';
import { MenusService } from './services/menus.service';
import { PublicMenusService } from './services/public-menus.service';

/**
 * Menus Foundation (Backend Milestones 11.2–11.3). Depends on
 * AuthorizationModule for `PermissionGuard` (`menu.manage`) — used only by
 * `MenusController`; `PublicMenusController` is `@Public()` and never
 * touches it. PrismaService is injected via the already-@Global()
 * DatabaseModule. See docs/71_BACKEND_MENUS.md.
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [MenusController, PublicMenusController],
  providers: [MenusRepository, MenusValidator, MenusMapper, MenusService, PublicMenusService],
  exports: [MenusService, PublicMenusService],
})
export class MenusModule {}
