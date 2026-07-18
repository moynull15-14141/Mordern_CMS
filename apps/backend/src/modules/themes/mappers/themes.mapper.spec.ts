import { ThemeStatus } from '@prisma/client';
import { ThemesMapper } from './themes.mapper';
import type { Theme } from '@prisma/client';

function buildTheme(overrides: Partial<Theme> = {}): Theme {
  return {
    id: 'theme-1',
    siteId: 'site-1',
    name: 'Classic',
    slug: 'classic',
    version: '1.0.0',
    author: 'Acme',
    description: 'A classic theme.',
    thumbnail: 'https://example.com/thumb.png',
    status: ThemeStatus.PUBLISHED,
    isActive: true,
    settings: {
      logo: 'https://example.com/logo.png',
      favicon: 'https://example.com/favicon.ico',
      primaryColor: '#112233',
      secondaryColor: '#ffffff',
      typography: { fontFamily: 'Inter' },
      headerLayout: 'centered',
      footerLayout: 'columns',
      containerWidth: '1200px',
      borderRadius: '8px',
      buttonStyle: 'rounded',
      homepageLayout: 'grid',
      blogLayout: 'list',
      customCss: 'body { color: red; }',
      customJs: 'console.log("hi")',
    },
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-02'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Theme;
}

describe('ThemesMapper', () => {
  describe('toResponseDto (admin)', () => {
    it('maps every field, including admin-only ones', () => {
      const mapper = new ThemesMapper();
      const dto = mapper.toResponseDto(buildTheme());
      expect(dto).toMatchObject({
        id: 'theme-1',
        name: 'Classic',
        slug: 'classic',
        version: '1.0.0',
        author: 'Acme',
        status: 'PUBLISHED',
        isActive: true,
      });
    });

    it('passes settings through as-is', () => {
      const mapper = new ThemesMapper();
      const dto = mapper.toResponseDto(buildTheme());
      expect(dto.settings).toMatchObject({ primaryColor: '#112233' });
    });

    it('returns settings=null when the theme has no settings', () => {
      const mapper = new ThemesMapper();
      const dto = mapper.toResponseDto(buildTheme({ settings: null }));
      expect(dto.settings).toBeNull();
    });

    it('serializes dates to ISO strings', () => {
      const mapper = new ThemesMapper();
      const dto = mapper.toResponseDto(buildTheme());
      expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });

    it('returns deletedAt=null for a non-deleted theme', () => {
      const mapper = new ThemesMapper();
      const dto = mapper.toResponseDto(buildTheme());
      expect(dto.deletedAt).toBeNull();
    });
  });

  describe('toPublicResponseDto (public)', () => {
    it('excludes status, isActive, author, description, thumbnail, and audit fields', () => {
      const mapper = new ThemesMapper();
      const dto = mapper.toPublicResponseDto(buildTheme()) as unknown as Record<string, unknown>;
      expect(dto).not.toHaveProperty('status');
      expect(dto).not.toHaveProperty('isActive');
      expect(dto).not.toHaveProperty('author');
      expect(dto).not.toHaveProperty('description');
      expect(dto).not.toHaveProperty('thumbnail');
      expect(dto).not.toHaveProperty('createdAt');
      expect(dto).not.toHaveProperty('updatedAt');
      expect(dto).not.toHaveProperty('deletedAt');
      expect(dto).not.toHaveProperty('siteId');
    });

    it('keeps id/name/slug/version as theme metadata', () => {
      const mapper = new ThemesMapper();
      const dto = mapper.toPublicResponseDto(buildTheme());
      expect(dto).toMatchObject({
        id: 'theme-1',
        name: 'Classic',
        slug: 'classic',
        version: '1.0.0',
      });
    });

    it('buckets primaryColor/secondaryColor into colors', () => {
      const mapper = new ThemesMapper();
      const dto = mapper.toPublicResponseDto(buildTheme());
      expect(dto.colors).toEqual({ primary: '#112233', secondary: '#ffffff' });
    });

    it('buckets layout-related settings into layout', () => {
      const mapper = new ThemesMapper();
      const dto = mapper.toPublicResponseDto(buildTheme());
      expect(dto.layout).toEqual({
        header: 'centered',
        footer: 'columns',
        containerWidth: '1200px',
        borderRadius: '8px',
        buttonStyle: 'rounded',
        homepage: 'grid',
        blog: 'list',
      });
    });

    it('includes logo/favicon/typography/customCss/customJs', () => {
      const mapper = new ThemesMapper();
      const dto = mapper.toPublicResponseDto(buildTheme());
      expect(dto.logo).toBe('https://example.com/logo.png');
      expect(dto.favicon).toBe('https://example.com/favicon.ico');
      expect(dto.typography).toEqual({ fontFamily: 'Inter' });
      expect(dto.customCss).toBe('body { color: red; }');
      expect(dto.customJs).toBe('console.log("hi")');
    });

    it('returns all-null appearance fields when the theme has no settings', () => {
      const mapper = new ThemesMapper();
      const dto = mapper.toPublicResponseDto(buildTheme({ settings: null }));
      expect(dto.logo).toBeNull();
      expect(dto.colors).toEqual({ primary: null, secondary: null });
      expect(dto.layout.header).toBeNull();
      expect(dto.customCss).toBeNull();
    });
  });
});
