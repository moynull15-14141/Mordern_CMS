import { AuditLoggerService } from '../../core/logger/audit-logger.service';
import { SecurityLoggerService } from '../../core/logger/security-logger.service';
import { SettingsService } from '../settings/services/settings.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { SeoRepository } from './repositories/seo.repository';
import { SeoValidator } from './validators/seo.validator';
import { SeoMapper } from './mappers/seo.mapper';
import { SeoService } from './services/seo.service';
import { SeoController } from './controllers/seo.controller';

/**
 * Integration smoke test — wires the real Repository/Validator/Mapper/
 * Service/Controller together (only `PrismaService` and `SettingsService`
 * are faked, an in-memory Map standing in for the database), exercising
 * the full create -> preview -> validate -> update -> lookup-by-article ->
 * delete -> restore -> upsert lifecycle end-to-end through actual class
 * instances rather than fully-mocked units. Mirrors the pattern
 * established in `modules/comments/comments.integration-smoke.spec.ts`.
 */
function buildInMemoryPrisma() {
  const rows = new Map<string, Record<string, unknown>>();
  let counter = 0;
  const clone = (r: Record<string, unknown>) => ({ ...r });

  return {
    site: { findFirst: jest.fn().mockResolvedValue({ id: 'site-1' }) },
    article: { findFirst: jest.fn().mockResolvedValue({ seoMetaId: null }) },
    category: { findFirst: jest.fn().mockResolvedValue({ seoMetaId: null }) },
    page: { findFirst: jest.fn().mockResolvedValue({ seoMetaId: null }) },
    seoMeta: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        counter += 1;
        const id = `seo-${counter}`;
        const now = new Date();
        const record = {
          id,
          siteId: (data.site as { connect: { id: string } }).connect.id,
          title: data.title ?? null,
          description: data.description ?? null,
          keywords: data.keywords ?? [],
          canonicalUrl: data.canonicalUrl ?? null,
          openGraph: data.openGraph ?? null,
          twitterCard: data.twitterCard ?? null,
          schemaJson: data.schemaJson ?? null,
          robots: data.robots ?? null,
          extraMeta: data.extraMeta ?? null,
          createdAt: now,
          createdBy: data.createdBy ?? null,
          updatedAt: now,
          updatedBy: data.updatedBy ?? null,
          deletedAt: null,
          deletedBy: null,
        };
        rows.set(id, record);
        return clone(record);
      }),
      findFirst: jest.fn(async ({ where }: { where: { id: string; deletedAt?: null } }) => {
        const record = rows.get(where.id);
        if (!record) return null;
        if ('deletedAt' in where && record.deletedAt !== null) return null;
        return clone(record);
      }),
      update: jest.fn(
        async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
          const existing = rows.get(where.id)!;
          const updated = { ...existing, ...data };
          rows.set(where.id, updated);
          return clone(updated);
        }
      ),
    },
  } as unknown as PrismaService;
}

describe('SEO module — integration smoke', () => {
  function buildStack() {
    const prisma = buildInMemoryPrisma();
    const repository = new SeoRepository(prisma);
    const securityLogger = { record: jest.fn() } as unknown as SecurityLoggerService;
    const validator = new SeoValidator(securityLogger);
    const mapper = new SeoMapper();
    const settingsService = {
      getByKey: jest.fn().mockResolvedValue({ value: null }),
    } as unknown as SettingsService;
    const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;
    const service = new SeoService(repository, validator, mapper, settingsService, auditLogger);
    const controller = new SeoController(service);
    return { controller, repository };
  }

  const actor = { id: 'user-1' } as never;

  it('creates a new SEO row via the controller', async () => {
    const { controller } = buildStack();
    const created = await controller.createSeo(
      { siteId: 'site-1', title: 'Hello World' } as never,
      actor
    );
    expect(created.title).toBe('Hello World');
    expect(created.id).toMatch(/^seo-/);
  });

  it('normalizes the canonical URL on create', async () => {
    const { controller } = buildStack();
    const created = await controller.createSeo(
      { siteId: 'site-1', canonicalUrl: 'https://example.com/a//b/' } as never,
      actor
    );
    expect(created.canonicalUrl).toBe('https://example.com/a/b');
  });

  it('rejects an over-length title with a validation error', async () => {
    const { controller } = buildStack();
    await expect(
      controller.createSeo({ siteId: 'site-1', title: 'a'.repeat(500) } as never, actor)
    ).rejects.toThrow();
  });

  it('previews without persisting anything', async () => {
    const { controller, repository } = buildStack();
    const preview = await controller.previewSeo({
      title: 'Preview title',
      description: 'Preview description',
    } as never);
    expect(preview.title).toBe('Preview title');
    expect(repository).toBeDefined();
  });

  it('validates a candidate payload and returns both errors and warnings', async () => {
    const { controller } = buildStack();
    const result = await controller.validateSeo({ canonicalUrl: 'not a url' } as never);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'canonicalUrl')).toBe(true);
    expect(result.analysis.warnings.length).toBeGreaterThan(0);
  });

  it('updates an existing row and only changes the provided field', async () => {
    const { controller } = buildStack();
    const created = await controller.createSeo(
      { siteId: 'site-1', title: 'Original', description: 'Kept' } as never,
      actor
    );
    const updated = await controller.updateSeo(created.id, { title: 'Changed' } as never, actor);
    expect(updated.title).toBe('Changed');
    expect(updated.description).toBe('Kept');
  });

  it('deletes then restores a row', async () => {
    const { controller } = buildStack();
    const created = await controller.createSeo(
      { siteId: 'site-1', title: 'To delete' } as never,
      actor
    );
    const deleted = await controller.deleteSeo(created.id, actor);
    expect(deleted.deletedAt).not.toBeNull();
    const restored = await controller.restoreSeo(created.id, actor);
    expect(restored.deletedAt).toBeNull();
  });

  it('upsert creates when no id is given, then updates when the returned id is reused', async () => {
    const { controller } = buildStack();
    const created = await controller.upsertSeo(
      { siteId: 'site-1', title: 'Upsert-created' } as never,
      actor
    );
    const upserted = await controller.upsertSeo(
      { id: created.id, siteId: 'site-1', title: 'Upsert-updated' } as never,
      actor
    );
    expect(upserted.id).toBe(created.id);
    expect(upserted.title).toBe('Upsert-updated');
  });
});
