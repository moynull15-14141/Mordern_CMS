import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ArticlesController } from './controllers/articles.controller';
import { ArticlesRepository } from './repositories/articles.repository';
import { ArticlesValidator } from './validators/articles.validator';
import { ArticlesMapper } from './mappers/articles.mapper';
import { ArticlesService } from './services/articles.service';

/**
 * Content / Articles Foundation (Milestone 8). Backend foundation only — no
 * Media/Comments/Search/AI/Public UI. Depends on AuthorizationModule for
 * `PermissionGuard` (`article.create`/`update`/`delete`/`publish`) and
 * `AuthorizationService` (role resolution for `ArticleOwnershipPolicy`).
 * PrismaService is injected via the already-@Global() DatabaseModule.
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [ArticlesController],
  providers: [ArticlesRepository, ArticlesValidator, ArticlesMapper, ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
