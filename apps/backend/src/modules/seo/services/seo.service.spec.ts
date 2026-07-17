import { SeoMeta } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { SettingsService } from '../../settings/services/settings.service';
import { SecurityLoggerService } from '../../../core/logger/security-logger.service';
import { SeoRepository } from '../repositories/seo.repository';
import { SeoValidator } from '../validators/seo.validator';
import { SeoMapper } from '../mappers/seo.mapper';
import { SeoService } from './seo.service';
import {
  SeoArticleNotFoundException,
  SeoCategoryNotFoundException,
  SeoMetaAlreadyDeletedException,
  SeoMetaNotDeletedException,
  SeoMetaNotFoundException,
  SeoMetaNotLinkedException,
  SeoPageNotFoundException,
  SeoSiteNotFoundException,
} from '../exceptions/seo.exceptions';

function buildSeoMeta(overrides: Partial<SeoMeta> = {}): SeoMeta {
  return {
    id: 'seo-1',
    siteId: 'site-1',
    title: 'A title',
    description: 'A description',
    keywords: [],
    canonicalUrl: null,
    openGraph: null,
    twitterCard: null,
    schemaJson: null,
    robots: null,
    extraMeta: null,
    createdAt: new Date('2026-01-01'),
    createdBy: 'user-1',
    updatedAt: new Date('2026-01-01'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as SeoMeta;
}

function buildService() {
  const repository = {
    siteExists: jest.fn().mockResolvedValue(true),
    findById: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    findArticleSeoMetaId: jest.fn(),
    findCategorySeoMetaId: jest.fn(),
    findPageSeoMetaId: jest.fn(),
  } as unknown as SeoRepository;

  const securityLogger = { record: jest.fn() } as unknown as SecurityLoggerService;
  const validator = new SeoValidator(securityLogger);
  const mapper = new SeoMapper();

  const settingsService = {
    getByKey: jest.fn().mockResolvedValue({ value: null }),
  } as unknown as SettingsService;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;

  const service = new SeoService(repository, validator, mapper, settingsService, auditLogger);
  return { service, repository, validator, settingsService, auditLogger };
}

describe('SeoService', () => {
  describe('createSeo', () => {
    it('creates a row when the site exists', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildSeoMeta());

      const result = await service.createSeo(
        { siteId: 'site-1', title: 'A title' },
        { id: 'user-1' }
      );

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'A title', createdBy: 'user-1', updatedBy: 'user-1' })
      );
      expect(result.id).toBe('seo-1');
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'seo.create' })
      );
    });

    it('throws when the site does not exist', async () => {
      const { service, repository } = buildService();
      (repository.siteExists as jest.Mock).mockResolvedValue(false);
      await expect(
        service.createSeo({ siteId: 'missing', title: 'x' }, { id: 'user-1' })
      ).rejects.toThrow(SeoSiteNotFoundException);
    });

    it('normalizes canonicalUrl before persisting', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildSeoMeta());
      await service.createSeo(
        { siteId: 'site-1', canonicalUrl: 'https://example.com/a//b/' },
        { id: 'user-1' }
      );
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ canonicalUrl: 'https://example.com/a/b' })
      );
    });

    it('propagates a validation error for an over-length title', async () => {
      const { service } = buildService();
      await expect(
        service.createSeo({ siteId: 'site-1', title: 'a'.repeat(500) }, { id: 'user-1' })
      ).rejects.toThrow();
    });
  });

  describe('getSeo', () => {
    it('returns the mapped row', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildSeoMeta());
      const result = await service.getSeo('seo-1');
      expect(result.id).toBe('seo-1');
    });

    it('throws when missing', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getSeo('missing')).rejects.toThrow(SeoMetaNotFoundException);
    });
  });

  describe('updateSeo', () => {
    it('updates only the provided fields', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildSeoMeta());
      (repository.update as jest.Mock).mockResolvedValue(buildSeoMeta({ title: 'New title' }));

      const result = await service.updateSeo('seo-1', { title: 'New title' }, { id: 'user-1' });

      expect(repository.update).toHaveBeenCalledWith(
        'seo-1',
        expect.objectContaining({ title: 'New title', updatedBy: 'user-1' })
      );
      expect(result.title).toBe('New title');
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'seo.update' })
      );
    });

    it('does not touch fields that were not provided', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildSeoMeta());
      (repository.update as jest.Mock).mockResolvedValue(buildSeoMeta());

      await service.updateSeo('seo-1', {}, { id: 'user-1' });

      const [, data] = (repository.update as jest.Mock).mock.calls[0] as [
        string,
        Record<string, unknown>,
      ];
      expect(data.title).toBeUndefined();
      expect(data.description).toBeUndefined();
    });

    it('throws when the row does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.updateSeo('missing', { title: 'x' }, { id: 'user-1' })).rejects.toThrow(
        SeoMetaNotFoundException
      );
    });
  });

  describe('deleteSeo', () => {
    it('soft-deletes an active row', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildSeoMeta())
        .mockResolvedValueOnce(buildSeoMeta({ deletedAt: new Date() }));

      await service.deleteSeo('seo-1', { id: 'user-1' });

      expect(repository.softDelete).toHaveBeenCalledWith('seo-1', 'user-1');
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'seo.delete' })
      );
    });

    it('throws when already deleted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildSeoMeta({ deletedAt: new Date() }));
      await expect(service.deleteSeo('seo-1', { id: 'user-1' })).rejects.toThrow(
        SeoMetaAlreadyDeletedException
      );
    });
  });

  describe('restoreSeo', () => {
    it('restores a deleted row', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildSeoMeta({ deletedAt: new Date() }))
        .mockResolvedValueOnce(buildSeoMeta({ deletedAt: null }));

      await service.restoreSeo('seo-1', { id: 'user-1' });

      expect(repository.restore).toHaveBeenCalledWith('seo-1', 'user-1');
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'seo.restore' })
      );
    });

    it('throws when not deleted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildSeoMeta({ deletedAt: null }));
      await expect(service.restoreSeo('seo-1', { id: 'user-1' })).rejects.toThrow(
        SeoMetaNotDeletedException
      );
    });
  });

  describe('upsertSeo', () => {
    it('creates a new row when no id is given', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildSeoMeta());
      await service.upsertSeo({ siteId: 'site-1', title: 'x' }, { id: 'user-1' });
      expect(repository.create).toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('creates a new row when id is given but not found', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      (repository.create as jest.Mock).mockResolvedValue(buildSeoMeta());
      await service.upsertSeo({ id: 'missing', siteId: 'site-1', title: 'x' }, { id: 'user-1' });
      expect(repository.create).toHaveBeenCalled();
    });

    it('updates the existing row when id is given and found', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildSeoMeta());
      (repository.update as jest.Mock).mockResolvedValue(buildSeoMeta({ title: 'updated' }));
      const result = await service.upsertSeo(
        { id: 'seo-1', siteId: 'site-1', title: 'updated' },
        { id: 'user-1' }
      );
      expect(repository.update).toHaveBeenCalledWith(
        'seo-1',
        expect.objectContaining({ title: 'updated' })
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(result.title).toBe('updated');
    });
  });

  describe('previewSeo', () => {
    it('uses the entity title/description when provided', async () => {
      const { service } = buildService();
      const preview = await service.previewSeo({
        title: 'My title',
        description: 'My description',
      });
      expect(preview.title).toBe('My title');
      expect(preview.description).toBe('My description');
    });

    it('falls back to Settings SEO category defaults when title/description are omitted', async () => {
      const { service, settingsService } = buildService();
      (settingsService.getByKey as jest.Mock).mockImplementation(async (key: string) => {
        if (key.includes('defaultMetaTitle')) return { value: 'Default Title' };
        if (key.includes('defaultMetaDescription')) return { value: 'Default Description' };
        return { value: null };
      });

      const preview = await service.previewSeo({});

      expect(preview.title).toBe('Default Title');
      expect(preview.description).toBe('Default Description');
    });

    it('resolves image from openGraph.image first, then twitterCard.image', async () => {
      const { service } = buildService();
      const preview = await service.previewSeo({
        openGraph: { image: 'https://example.com/og.png' },
      });
      expect(preview.image).toBe('https://example.com/og.png');

      const preview2 = await service.previewSeo({
        twitterCard: { image: 'https://example.com/tw.png' },
      });
      expect(preview2.image).toBe('https://example.com/tw.png');
    });

    it('image is null when neither openGraph nor twitterCard has one', async () => {
      const { service } = buildService();
      const preview = await service.previewSeo({});
      expect(preview.image).toBeNull();
    });

    it('normalizes canonical in the preview output', async () => {
      const { service } = buildService();
      const preview = await service.previewSeo({ canonicalUrl: 'https://example.com/a//b/' });
      expect(preview.canonical).toBe('https://example.com/a/b');
    });
  });

  describe('validateSeoInput', () => {
    it('returns valid=true with no errors for a well-formed input', async () => {
      const { service } = buildService();
      const result = await service.validateSeoInput({
        title: 'Good title here',
        description: 'A'.repeat(80),
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('collects multiple field errors without stopping at the first', async () => {
      const { service } = buildService();
      const result = await service.validateSeoInput({
        title: 'a'.repeat(500),
        canonicalUrl: 'not a url',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
      expect(result.errors.some((e) => e.field === 'canonicalUrl')).toBe(true);
    });

    it('includes analysis warnings alongside hard errors', async () => {
      const { service } = buildService();
      const result = await service.validateSeoInput({});
      expect(result.analysis.warnings.length).toBeGreaterThan(0);
    });

    it('marks robots invalid in the analysis when robots validation fails', async () => {
      const { service } = buildService();
      const result = await service.validateSeoInput({ robots: { index: 'not-a-boolean' } });
      expect(result.errors.some((e) => e.field === 'robots')).toBe(true);
      expect(result.analysis.warnings.some((w) => w.field === 'robots')).toBe(true);
    });
  });

  describe('getSeoForArticle', () => {
    it('returns the mapped SEO row when the article and link exist', async () => {
      const { service, repository } = buildService();
      (repository.findArticleSeoMetaId as jest.Mock).mockResolvedValue({
        found: true,
        seoMetaId: 'seo-1',
      });
      (repository.findById as jest.Mock).mockResolvedValue(buildSeoMeta());
      const result = await service.getSeoForArticle('article-1');
      expect(result.id).toBe('seo-1');
    });

    it('throws when the article does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findArticleSeoMetaId as jest.Mock).mockResolvedValue({
        found: false,
        seoMetaId: null,
      });
      await expect(service.getSeoForArticle('missing')).rejects.toThrow(
        SeoArticleNotFoundException
      );
    });

    it('throws SeoMetaNotLinkedException when the article exists but has no SEO linked', async () => {
      const { service, repository } = buildService();
      (repository.findArticleSeoMetaId as jest.Mock).mockResolvedValue({
        found: true,
        seoMetaId: null,
      });
      await expect(service.getSeoForArticle('article-1')).rejects.toThrow(
        SeoMetaNotLinkedException
      );
    });
  });

  describe('getSeoForCategory', () => {
    it('returns the mapped SEO row when the category and link exist', async () => {
      const { service, repository } = buildService();
      (repository.findCategorySeoMetaId as jest.Mock).mockResolvedValue({
        found: true,
        seoMetaId: 'seo-1',
      });
      (repository.findById as jest.Mock).mockResolvedValue(buildSeoMeta());
      const result = await service.getSeoForCategory('category-1');
      expect(result.id).toBe('seo-1');
    });

    it('throws when the category does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findCategorySeoMetaId as jest.Mock).mockResolvedValue({
        found: false,
        seoMetaId: null,
      });
      await expect(service.getSeoForCategory('missing')).rejects.toThrow(
        SeoCategoryNotFoundException
      );
    });

    it('throws SeoMetaNotLinkedException when linked seoMetaId is null', async () => {
      const { service, repository } = buildService();
      (repository.findCategorySeoMetaId as jest.Mock).mockResolvedValue({
        found: true,
        seoMetaId: null,
      });
      await expect(service.getSeoForCategory('category-1')).rejects.toThrow(
        SeoMetaNotLinkedException
      );
    });
  });

  describe('getSeoForPage', () => {
    it('returns the mapped SEO row when the page and link exist', async () => {
      const { service, repository } = buildService();
      (repository.findPageSeoMetaId as jest.Mock).mockResolvedValue({
        found: true,
        seoMetaId: 'seo-1',
      });
      (repository.findById as jest.Mock).mockResolvedValue(buildSeoMeta());
      const result = await service.getSeoForPage('page-1');
      expect(result.id).toBe('seo-1');
    });

    it('throws when the page does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findPageSeoMetaId as jest.Mock).mockResolvedValue({
        found: false,
        seoMetaId: null,
      });
      await expect(service.getSeoForPage('missing')).rejects.toThrow(SeoPageNotFoundException);
    });

    it('throws SeoMetaNotLinkedException when linked seoMetaId is null', async () => {
      const { service, repository } = buildService();
      (repository.findPageSeoMetaId as jest.Mock).mockResolvedValue({
        found: true,
        seoMetaId: null,
      });
      await expect(service.getSeoForPage('page-1')).rejects.toThrow(SeoMetaNotLinkedException);
    });
  });
});
