import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SettingsModule } from '../settings/settings.module';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { MediaController } from './controllers/media.controller';
import { MediaFolderController } from './controllers/media-folder.controller';
import { MediaUploadController } from './controllers/media-upload.controller';
import { MediaBulkController } from './controllers/media-bulk.controller';
import { MediaFavoritesController } from './controllers/media-favorites.controller';
import { PublicMediaController } from './controllers/public-media.controller';
import { MediaRepository } from './repositories/media.repository';
import { MediaFolderRepository } from './repositories/media-folder.repository';
import { MediaEngagementRepository } from './repositories/media-engagement.repository';
import { MediaValidator } from './validators/media.validator';
import { SlugShapeValidator } from '../categories/validators/slug-shape.validator';
import { MediaMapper } from './mappers/media.mapper';
import { MediaFolderMapper } from './mappers/media-folder.mapper';
import { MediaService } from './services/media.service';
import { MediaFolderService } from './services/media-folder.service';
import { MediaUrlResolverService } from './services/media-url-resolver.service';
import { MediaUploadService } from './services/media-upload.service';
import { MediaBulkService } from './services/media-bulk.service';
import { MediaFavoritesService } from './services/media-favorites.service';
import { PublicMediaService } from './services/public-media.service';
import { ImageProcessingService } from './services/image-processing.service';
import { NoopVirusScanner } from './services/noop-virus-scanner.service';
import { MediaProcessorService } from './services/media-processor.service';

/**
 * Media Library — backend foundation (Milestone 10) plus the real upload/
 * processing/CDN/bulk/favorites layer (Milestone 5, Enterprise Digital
 * Asset Platform). `StorageModule`/`QueueModule` provide `STORAGE_PROVIDER`/
 * `JOB_QUEUE` (`QueueModule` is `@Global()`, registered once in
 * `app.module.ts` — not imported here). Depends on AuthorizationModule for
 * `PermissionGuard` (`media.upload`/`media.delete` — reused for every
 * endpoint, including every Milestone 5 addition; no new permission key)
 * and SettingsModule (reuses `SettingCategory.MEDIA`'s `maxUploadSizeMb`/
 * `allowedMimeTypes`). `SlugShapeValidator` is re-provided from the
 * Categories module (not duplicated) for folder slugs. PrismaService is
 * injected via the already-@Global() DatabaseModule.
 */
@Module({
  imports: [AuthorizationModule, SettingsModule, StorageModule],
  controllers: [
    MediaController,
    MediaFolderController,
    MediaUploadController,
    MediaBulkController,
    MediaFavoritesController,
    PublicMediaController,
  ],
  providers: [
    MediaRepository,
    MediaFolderRepository,
    MediaEngagementRepository,
    MediaValidator,
    SlugShapeValidator,
    MediaMapper,
    MediaFolderMapper,
    MediaService,
    MediaFolderService,
    MediaUrlResolverService,
    MediaUploadService,
    MediaBulkService,
    MediaFavoritesService,
    PublicMediaService,
    ImageProcessingService,
    NoopVirusScanner,
    MediaProcessorService,
  ],
  exports: [MediaService, MediaFolderService],
})
export class MediaModule {}
