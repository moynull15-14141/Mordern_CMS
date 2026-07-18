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
    // Explicit — @fastify/cors v11 narrowed its own default from
    // 'GET,HEAD,PUT,PATCH,POST,DELETE' (v10) to 'GET,HEAD,POST', which
    // silently broke every browser-originated PUT/PATCH/DELETE request
    // (blocked at the CORS preflight, before reaching any controller) the
    // moment the dependency resolved to v11. Pinning the full method list
    // here removes the dependency on whichever default that library ships.
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
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
