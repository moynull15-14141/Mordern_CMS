import { ThemeStatus } from '@prisma/client';
import { ThemesRepository } from '../repositories/themes.repository';
import { ThemesMapper } from '../mappers/themes.mapper';
import { NoActiveThemeException } from '../exceptions/theme.exceptions';
import { PublicThemesService } from './public-themes.service';
import type { Theme } from '@prisma/client';

function buildTheme(overrides: Partial<Theme> = {}): Theme {
  return {
    id: 'theme-1',
    siteId: 'site-1',
    name: 'Classic',
    slug: 'classic',
    version: '1.0.0',
    author: 'Acme',
    description: null,
    thumbnail: null,
    status: ThemeStatus.PUBLISHED,
    isActive: true,
    settings: { primaryColor: '#112233' },
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Theme;
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findActive: jest.fn(),
  } as unknown as ThemesRepository;

  const service = new PublicThemesService(repository, new ThemesMapper());
  return { service, repository };
}

describe('PublicThemesService', () => {
  it('returns the public-shaped active theme', async () => {
    const { service, repository } = buildService();
    (repository.findActive as jest.Mock).mockResolvedValue(buildTheme());

    const result = await service.getActiveTheme();

    expect(repository.findActive).toHaveBeenCalledWith('site-1');
    expect(result.colors.primary).toBe('#112233');
  });

  it('throws NoActiveThemeException when no theme is active', async () => {
    const { service, repository } = buildService();
    (repository.findActive as jest.Mock).mockResolvedValue(null);

    await expect(service.getActiveTheme()).rejects.toThrow(NoActiveThemeException);
  });

  it('never exposes status/isActive/author in the result', async () => {
    const { service, repository } = buildService();
    (repository.findActive as jest.Mock).mockResolvedValue(buildTheme());

    const result = (await service.getActiveTheme()) as unknown as Record<string, unknown>;

    expect(result).not.toHaveProperty('status');
    expect(result).not.toHaveProperty('isActive');
    expect(result).not.toHaveProperty('author');
  });
});
