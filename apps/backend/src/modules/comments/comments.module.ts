import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { CommentsController } from './controllers/comments.controller';
import { ArticleCommentsController } from './controllers/article-comments.controller';
import { UserCommentsController } from './controllers/user-comments.controller';
import { CommentsRepository } from './repositories/comments.repository';
import { CommentsValidator } from './validators/comments.validator';
import { CommentsMapper } from './mappers/comments.mapper';
import { CommentsService } from './services/comments.service';

/**
 * Comments & Discussion Foundation (Milestone 11). Backend foundation
 * only — no realtime/websocket/notifications/moderation dashboard. Depends
 * on AuthorizationModule for `PermissionGuard`/`AuthorizationService`
 * (`comment.moderate` — the only real comment permission; self-service
 * create/update/delete/restore of one's own comment needs no permission,
 * only the existing global `JwtAuthGuard` — see
 * docs/49_COMMENTS_ARCHITECTURE.md "Permission Flow"). PrismaService is
 * injected via the already-@Global() DatabaseModule.
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [CommentsController, ArticleCommentsController, UserCommentsController],
  providers: [CommentsRepository, CommentsValidator, CommentsMapper, CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
