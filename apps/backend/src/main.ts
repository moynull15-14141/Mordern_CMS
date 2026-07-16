import 'reflect-metadata';
import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const config = app.get(AppConfigService);

  await app.register(helmet);
  await app.register(compression);

  app.enableCors({
    origin: config.app.corsOrigins.length > 0 ? config.app.corsOrigins : true,
    credentials: true,
  });

  app.setGlobalPrefix(config.app.apiPrefix);

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(config.app.name)
      .setDescription('SportingSpy backend API — V1 foundation')
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('docs', app, swaggerDocument);

  app.enableShutdownHooks();

  await app.listen(config.app.port, '0.0.0.0');
}

void bootstrap();
