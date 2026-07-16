import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { FeatureFlagsService } from './feature-flags.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
