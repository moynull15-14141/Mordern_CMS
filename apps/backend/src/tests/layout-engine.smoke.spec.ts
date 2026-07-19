import { HttpStatus } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../infrastructure/database/prisma.service';

/**
 * Boots the real AppModule (Milestone 14.1) with PrismaService swapped for
 * an in-memory stub — no live database is available in this environment —
 * mirroring `public-content-api.smoke.spec.ts`'s exact pattern. Verifies
 * the admin Layout/LayoutAssignment routes are guarded (401 without a
 * token), `GET /public/layouts/resolve` is reachable without auth, and
 * enforces "slug required unless home". The PUBLISHED-only gate itself
 * (a DRAFT Layout's preset never leaking) is unit-tested against the real
 * `where` clause in `layout-assignments.repository.spec.ts` — a
 * request-mock here can't meaningfully distinguish a filtered query from
 * an unfiltered one without a real database.
 */
describe('Layout Engine smoke test', () => {
  let app: NestFastifyApplication;

  const now = new Date('2026-01-01T00:00:00.000Z');
  const site = { id: 'site-1', deletedAt: null };

  const publishedPage = {
    id: 'page-1',
    siteId: site.id,
    title: 'About Us',
    slug: 'about-us',
    body: {},
    status: 'PUBLISHED',
    seoMetaId: null,
    publishedAt: now,
    createdAt: now,
    createdBy: null,
    updatedAt: now,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    seoMeta: null,
  };

  const publishedLayout = {
    id: 'layout-1',
    siteId: site.id,
    themeId: null,
    name: 'Sidebar Left',
    slug: 'sidebar-left',
    status: 'PUBLISHED',
    layoutPreset: 'sidebar-left',
    createdAt: now,
    createdBy: null,
    updatedAt: now,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
  };

  const explicitAssignment = {
    id: 'assignment-1',
    siteId: site.id,
    layoutId: publishedLayout.id,
    contentType: 'PAGE',
    pageId: publishedPage.id,
    articleId: null,
    categoryId: null,
    deletedAt: null,
    layout: publishedLayout,
  };

  const prismaMock = {
    site: { findFirst: jest.fn().mockResolvedValue(site) },
    page: {
      findFirst: jest.fn().mockImplementation(({ where }: { where: { slug?: string } }) => {
        if (where.slug === publishedPage.slug) return Promise.resolve(publishedPage);
        return Promise.resolve(null);
      }),
    },
    article: { findFirst: jest.fn().mockResolvedValue(null) },
    category: { findFirst: jest.fn().mockResolvedValue(null) },
    layout: { findFirst: jest.fn().mockResolvedValue(null) },
    layoutAssignment: {
      findFirst: jest.fn().mockImplementation(({ where }: { where: Record<string, unknown> }) => {
        if (where.pageId === publishedPage.id && where.layout) {
          return Promise.resolve(explicitAssignment);
        }
        return Promise.resolve(null);
      }),
    },
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

  it('GET /api/v1/layouts without a token is rejected (protected by default)', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/layouts');
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('GET /api/v1/layout-assignments without a token is rejected (protected by default)', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/layout-assignments');
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('GET /public/layouts/resolve?contentType=home is reachable without auth', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/public/layouts/resolve?contentType=home'
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toEqual({
      explicitLayoutPreset: null,
      contentDefaultLayoutPreset: null,
    });
  });

  it('GET /public/layouts/resolve?contentType=page without a slug is a 400', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/public/layouts/resolve?contentType=page'
    );
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('resolves an explicit, PUBLISHED assignment for a real slug', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/public/layouts/resolve?contentType=page&slug=about-us'
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.explicitLayoutPreset).toBe('sidebar-left');
  });

  it('GET /public/layouts/resolve rejects an unrecognized contentType', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/public/layouts/resolve?contentType=nonsense'
    );
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
