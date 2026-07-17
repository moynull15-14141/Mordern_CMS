import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { SettingsModule } from '../../modules/settings/settings.module';
import { FeatureFlagsService } from './feature-flags.service';

@Global()
@Module({
  imports: [ConfigModule, SettingsModule],
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
