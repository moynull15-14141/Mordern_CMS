import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { PagesController } from './controllers/pages.controller';
import { PagesRepository } from './repositories/pages.repository';
import { PagesValidator } from './validators/pages.validator';
import { PagesMapper } from './mappers/pages.mapper';
import { PagesService } from './services/pages.service';

/**
 * Pages Foundation. Depends on AuthorizationModule for `PermissionGuard`
 * (`page.manage`). PrismaService is injected via the already-@Global()
 * DatabaseModule. See docs/69_BACKEND_PAGES.md.
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [PagesController],
  providers: [PagesRepository, PagesValidator, PagesMapper, PagesService],
  exports: [PagesService],
})
export class PagesModule {}
