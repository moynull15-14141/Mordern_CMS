import { HttpStatus } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../infrastructure/database/prisma.service';

/**
 * Boots the real AppModule (all global guards/filters/interceptors/pipes
 * included) with PrismaService swapped for an in-memory stub — no live
 * database is available in this environment. Verifies the wiring end to
 * end: global JwtAuthGuard + @Public() health routes, the frozen response
 * envelope, and validation on a real auth endpoint.
 */
describe('App smoke test', () => {
  let app: NestFastifyApplication;

  const prismaMock = {
    user: { findFirst: jest.fn().mockResolvedValue(null) },
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.setGlobalPrefix('api/v1');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/live is reachable without auth (@Public)', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/live');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.success).toBe(true);
  });

  it('GET /api/v1/health is reachable without auth and matches the frozen envelope', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject({
      success: true,
      data: { name: 'sportingspy-backend' },
      errors: [],
    });
  });

  it('GET /api/v1/auth/me without a token is rejected (protected by default)', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/auth/me');
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login with an unknown email returns a generic 401 in the frozen envelope', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever' });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toMatchObject({
      success: false,
      errors: [expect.objectContaining({ code: 'AUTHENTICATION_UNAUTHORIZED' })],
    });
  });

  it('POST /api/v1/auth/login with an invalid body is rejected by validation', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email' });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/v1/authorization/me without a token is rejected (protected by default)', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/authorization/me');
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.success).toBe(false);
  });
});
