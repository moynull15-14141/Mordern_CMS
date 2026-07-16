import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AppValidationPipe } from './common/pipes/validation.pipe';
import { ConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';
import { FeatureFlagsModule } from './core/feature-flags/feature-flags.module';
import { LoggerModule } from './core/logger/logger.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { JwtAuthGuard } from './modules/identity/guards/jwt-auth.guard';
import { IdentityModule } from './modules/identity/identity.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    FeatureFlagsModule,
    DatabaseModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        throttlers: [
          { ttl: config.app.throttle.ttl * 1000, limit: config.app.throttle.limit },
        ],
      }),
    }),
    IdentityModule,
    AuthorizationModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_PIPE, useClass: AppValidationPipe },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware, CorrelationIdMiddleware).forRoutes('*');
  }
}
