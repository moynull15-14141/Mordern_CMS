import { Module } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { ConfigModule } from '../../config/config.module';
import { NotImplementedStorageProvider } from './not-implemented-storage.provider';
import { R2StorageProvider } from './r2-storage.provider';
import { STORAGE_PROVIDER } from './storage.constants';

/**
 * First custom-DI-token binding in this codebase — `StorageProvider`/
 * `CacheProvider`/`EmailProvider` all predate this module as pure
 * interfaces with zero DI wiring anywhere (confirmed by full-codebase grep
 * before writing this). `STORAGE_PROVIDER=r2`/`s3` resolves to the real
 * `R2StorageProvider`; every other value (including the `REPLACE_ME_*`
 * placeholder this repo's dev env ships with) resolves to
 * `NotImplementedStorageProvider`, so the app still boots cleanly — only
 * calling a storage method throws.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useFactory: (config: AppConfigService) => {
        const providerType = config.storage.provider;
        if (providerType === 'r2' || providerType === 's3') {
          return new R2StorageProvider(config);
        }
        return new NotImplementedStorageProvider(providerType);
      },
      inject: [AppConfigService],
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
