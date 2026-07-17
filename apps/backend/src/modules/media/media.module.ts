import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SettingsModule } from '../settings/settings.module';
import { MediaController } from './controllers/media.controller';
import { MediaFolderController } from './controllers/media-folder.controller';
import { MediaRepository } from './repositories/media.repository';
import { MediaFolderRepository } from './repositories/media-folder.repository';
import { MediaValidator } from './validators/media.validator';
import { SlugShapeValidator } from '../categories/validators/slug-shape.validator';
import { MediaMapper } from './mappers/media.mapper';
import { MediaFolderMapper } from './mappers/media-folder.mapper';
import { MediaService } from './services/media.service';
import { MediaFolderService } from './services/media-folder.service';

/**
 * Media Library Foundation (Milestone 10). Backend foundation only — no
 * Uploader UI/Image processing/CDN/S3/R2/MinIO/Azure/GCS/Video/Audio/OCR/AI.
 * Depends on AuthorizationModule for `PermissionGuard`
 * (`media.upload`/`media.delete` — reused for every endpoint, see
 * docs/48_MEDIA_LIBRARY_ARCHITECTURE.md "Permission Flow") and
 * SettingsModule (reuses `SettingCategory.MEDIA`'s `maxUploadSizeMb`/
 * `allowedMimeTypes` instead of hardcoding limits). `SlugShapeValidator` is
 * re-provided from the Categories module (not duplicated) for folder slugs.
 * PrismaService is injected via the already-@Global() DatabaseModule.
 */
@Module({
  imports: [AuthorizationModule, SettingsModule],
  controllers: [MediaController, MediaFolderController],
  providers: [
    MediaRepository,
    MediaFolderRepository,
    MediaValidator,
    SlugShapeValidator,
    MediaMapper,
    MediaFolderMapper,
    MediaService,
    MediaFolderService,
  ],
  exports: [MediaService, MediaFolderService],
})
export class MediaModule {}
