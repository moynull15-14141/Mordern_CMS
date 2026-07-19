import { HttpStatus } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../infrastructure/database/prisma.service';

/**
 * Boots the real AppModule (Milestone 13.2) with PrismaService swapped for
 * an in-memory stub — no live database is available in this environment —
 * mirroring `app.smoke.spec.ts`'s exact pattern. Verifies every new
 * `/public/*` route is actually registered, reachable without a Bearer
 * token (global JwtAuthGuard bypassed via `@Public()`), returns the frozen
 * response envelope, and enforces the published/active-only gate for real
 * (an unknown/unpublished slug 404s).
 */
describe('Public Content API smoke test', () => {
  let app: NestFastifyApplication;

  const now = new Date('2026-01-01T00:00:00.000Z');

  const site = {
    id: 'site-1',
    tenantId: 'tenant-1',
    name: 'SportingSpy',
    slug: 'sportingspy',
    domain: 'sportingspy.example.com',
    locale: 'en',
    timezone: 'UTC',
    status: 'ACTIVE',
    theme: null,
    seoDefaults: null,
    createdAt: now,
    createdBy: null,
    updatedAt: now,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
  };

  const publishedPage = {
    id: 'page-1',
    siteId: site.id,
    title: 'About Us',
    slug: 'about-us',
    body: { type: 'doc' },
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

  const draftPage = { ...publishedPage, id: 'page-2', slug: 'draft-page', status: 'DRAFT' };

  const publishedArticle = {
    id: 'article-1',
    siteId: site.id,
    authorId: 'author-1',
    primaryCategoryId: null,
    title: 'Match Report',
    subtitle: null,
    slug: 'match-report',
    summary: 'City won.',
    body: { type: 'doc' },
    status: 'PUBLISHED',
    publishedAt: now,
    scheduledAt: null,
    canonicalUrl: null,
    visibility: 'PUBLIC',
    language: 'en',
    locale: 'en-US',
    seoMetaId: null,
    featuredMediaId: null,
    readingTime: 3,
    wordCount: 500,
    notes: null,
    createdAt: now,
    createdBy: null,
    updatedAt: now,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    author: { id: 'author-1', penName: 'Jane Doe', userId: null },
    primaryCategory: null,
    seoMeta: null,
    tags: [],
  };

  const activeCategory = {
    id: 'cat-1',
    siteId: site.id,
    parentId: null,
    name: 'Football',
    slug: 'football',
    description: 'All things football',
    status: 'ACTIVE',
    seoMetaId: null,
    sortOrder: 1,
    createdAt: now,
    createdBy: null,
    updatedAt: now,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
  };

  const activeTheme = {
    id: 'theme-1',
    siteId: site.id,
    name: 'Classic',
    slug: 'classic',
    version: '1.0.0',
    author: 'Acme',
    description: null,
    thumbnail: null,
    status: 'PUBLISHED',
    isActive: true,
    settings: { primaryColor: '#112233' },
    createdAt: now,
    createdBy: null,
    updatedAt: now,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
  };

  const prismaMock = {
    site: { findFirst: jest.fn().mockResolvedValue(site) },
    page: {
      findFirst: jest.fn().mockImplementation(({ where }: { where: { slug?: string } }) => {
        if (where.slug === publishedPage.slug) return Promise.resolve(publishedPage);
        if (where.slug === draftPage.slug) return Promise.resolve(draftPage);
        if (where.slug) return Promise.resolve(null);
        return Promise.resolve(publishedPage);
      }),
    },
    article: {
      findFirst: jest.fn().mockImplementation(({ where }: { where: { slug?: string } }) => {
        if (where.slug && where.slug !== publishedArticle.slug) return Promise.resolve(null);
        return Promise.resolve(publishedArticle);
      }),
      findMany: jest.fn().mockResolvedValue([publishedArticle]),
      count: jest.fn().mockResolvedValue(1),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    category: {
      findFirst: jest.fn().mockImplementation(({ where }: { where: { slug?: string } }) => {
        if (where.slug && where.slug !== activeCategory.slug) return Promise.resolve(null);
        return Promise.resolve(activeCategory);
      }),
      findMany: jest.fn().mockResolvedValue([activeCategory]),
      count: jest.fn().mockResolvedValue(1),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    theme: {
      findFirst: jest.fn().mockResolvedValue(activeTheme),
    },
    setting: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    seoMeta: {
      findMany: jest.fn().mockResolvedValue([]),
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

  it('GET /public/pages/slug/:slug is reachable without auth and returns the published page', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/public/pages/slug/about-us');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject({
      success: true,
      data: { title: 'About Us', slug: 'about-us' },
    });
    expect(response.body.data).not.toHaveProperty('id');
    expect(response.body.data).not.toHaveProperty('status');
  });

  it('GET /public/pages/slug/:slug 404s for a DRAFT page (never leaks unpublished content)', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/public/pages/slug/draft-page');
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(response.body.success).toBe(false);
  });

  it('GET /public/pages/slug/:slug 404s for an unknown slug', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/public/pages/slug/does-not-exist'
    );
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('GET /public/articles is reachable without auth and paginates', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/public/articles');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0]).toMatchObject({ slug: 'match-report' });
    expect(response.body.meta.pagination).toMatchObject({ total: 1 });
  });

  it('GET /public/articles/slug/:slug is reachable without auth', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/public/articles/slug/match-report'
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toMatchObject({ slug: 'match-report' });
    expect(response.body.data.author).toEqual({ penName: 'Jane Doe' });
  });

  it('GET /public/categories is reachable without auth', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/public/categories');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data[0]).toMatchObject({ slug: 'football' });
  });

  it('GET /public/categories/slug/:slug 404s for an unknown slug', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/public/categories/slug/does-not-exist'
    );
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('GET /public/settings is reachable without auth and returns only allowlisted keys', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/public/settings');
    expect(response.status).toBe(HttpStatus.OK);
    const keys = (response.body.data as { key: string }[]).map((entry) => entry.key);
    expect(keys).toContain('general.siteName');
    expect(keys).not.toContain('email.providerApiKey');
    expect(keys).not.toContain('ai.apiKey');
  });

  it('GET /public/site is reachable without auth and includes the active theme reference', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/public/site');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toMatchObject({
      name: 'SportingSpy',
      locale: 'en',
      timezone: 'UTC',
      activeTheme: { id: 'theme-1', name: 'Classic', slug: 'classic' },
    });
    expect(response.body.data).not.toHaveProperty('id');
    expect(response.body.data).not.toHaveProperty('domain');
  });

  it('GET /public/seo/:entity/:slug rejects an unrecognized entity with 400', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/public/seo/menu/header');
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('GET /public/seo/page/:slug 404s for an unknown slug (no separate error invented)', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/public/seo/page/does-not-exist'
    );
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('Swagger document generation includes every new public route/DTO without throwing', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('smoke').setVersion('1.0').build()
    );

    const paths = Object.keys(document.paths);
    expect(paths).toEqual(
      expect.arrayContaining([
        '/api/v1/public/pages/slug/{slug}',
        '/api/v1/public/articles',
        '/api/v1/public/articles/slug/{slug}',
        '/api/v1/public/categories',
        '/api/v1/public/categories/slug/{slug}',
        '/api/v1/public/settings',
        '/api/v1/public/site',
        '/api/v1/public/seo/{entity}/{slug}',
      ])
    );

    const schemas = Object.keys(document.components?.schemas ?? {});
    expect(schemas).toEqual(
      expect.arrayContaining([
        'PublicPageResponseDto',
        'PublicArticleResponseDto',
        'PublicCategoryResponseDto',
        'PublicSettingResponseDto',
        'PublicSiteResponseDto',
        'PublicSeoResponseDto',
      ])
    );
  });
});
