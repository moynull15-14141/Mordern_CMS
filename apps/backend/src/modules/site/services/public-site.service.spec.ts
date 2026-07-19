import { SiteRepository } from '../repositories/site.repository';
import { PublicThemesService } from '../../themes/services/public-themes.service';
import { NoActiveThemeException } from '../../themes/exceptions/theme.exceptions';
import { PublicThemeResponseDto } from '../../themes/dto/public-theme-response.dto';
import { PublicSiteService } from './public-site.service';

function buildTheme(overrides: Partial<PublicThemeResponseDto> = {}): PublicThemeResponseDto {
  return {
    id: 'theme-1',
    name: 'Classic',
    slug: 'classic',
    version: '1.0.0',
    logo: null,
    favicon: null,
    colors: { primary: null, secondary: null },
    typography: null,
    layout: {
      header: null,
      footer: null,
      containerWidth: null,
      borderRadius: null,
      buttonStyle: null,
      homepage: null,
      blog: null,
    },
    customCss: null,
    customJs: null,
    ...overrides,
  };
}

function buildService() {
  const siteRepository = {
    getDefaultSite: jest.fn(),
  } as unknown as SiteRepository;
  const publicThemesService = {
    getActiveTheme: jest.fn(),
  } as unknown as PublicThemesService;
  const service = new PublicSiteService(siteRepository, publicThemesService);
  return { service, siteRepository, publicThemesService };
}

describe('PublicSiteService', () => {
  it('returns name/locale/timezone plus a trimmed active theme reference', async () => {
    const { service, siteRepository, publicThemesService } = buildService();
    (siteRepository.getDefaultSite as jest.Mock).mockResolvedValue({
      id: 'site-1',
      name: 'SportingSpy',
      locale: 'en',
      timezone: 'UTC',
      domain: 'sportingspy.example.com',
    });
    (publicThemesService.getActiveTheme as jest.Mock).mockResolvedValue(buildTheme());

    const result = await service.getSite();

    expect(result).toEqual({
      name: 'SportingSpy',
      locale: 'en',
      timezone: 'UTC',
      activeTheme: { id: 'theme-1', name: 'Classic', slug: 'classic' },
    });
  });

  it('resolves activeTheme to null when no theme is active (NoActiveThemeException)', async () => {
    const { service, siteRepository, publicThemesService } = buildService();
    (siteRepository.getDefaultSite as jest.Mock).mockResolvedValue({
      id: 'site-1',
      name: 'SportingSpy',
      locale: null,
      timezone: null,
    });
    (publicThemesService.getActiveTheme as jest.Mock).mockRejectedValue(
      new NoActiveThemeException()
    );

    const result = await service.getSite();
    expect(result.activeTheme).toBeNull();
  });

  it('propagates a non-NoActiveThemeException error from the themes service', async () => {
    const { service, siteRepository, publicThemesService } = buildService();
    (siteRepository.getDefaultSite as jest.Mock).mockResolvedValue({
      id: 'site-1',
      name: 'SportingSpy',
      locale: 'en',
      timezone: 'UTC',
    });
    (publicThemesService.getActiveTheme as jest.Mock).mockRejectedValue(new Error('boom'));

    await expect(service.getSite()).rejects.toThrow('boom');
  });

  it('never exposes id, domain, or the legacy theme/seoDefaults JSON blobs', async () => {
    const { service, siteRepository, publicThemesService } = buildService();
    (siteRepository.getDefaultSite as jest.Mock).mockResolvedValue({
      id: 'site-1',
      name: 'SportingSpy',
      locale: 'en',
      timezone: 'UTC',
      domain: 'sportingspy.example.com',
      theme: { legacy: true },
      seoDefaults: { legacy: true },
    });
    (publicThemesService.getActiveTheme as jest.Mock).mockResolvedValue(buildTheme());

    const result = (await service.getSite()) as unknown as Record<string, unknown>;

    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('domain');
    expect(result).not.toHaveProperty('theme');
    expect(result).not.toHaveProperty('seoDefaults');
  });
});
