import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PatternFavoriteRepository } from '../repositories/pattern-favorite.repository';
import { PatternRepository } from '../repositories/pattern.repository';
import { PatternMapper } from '../mappers/pattern.mapper';
import { PatternNotFoundException } from '../exceptions/pattern.exceptions';
import { PatternFavoritesService } from './pattern-favorites.service';

function buildService() {
  const favoriteRepository = {
    addFavorite: jest.fn().mockResolvedValue(undefined),
    removeFavorite: jest.fn().mockResolvedValue(undefined),
    findFavoritePatterns: jest.fn().mockResolvedValue([]),
  } as unknown as PatternFavoriteRepository;
  const repository = {
    findById: jest.fn(),
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
  } as unknown as PatternRepository;
  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;

  const service = new PatternFavoritesService(
    favoriteRepository,
    repository,
    new PatternMapper(),
    auditLogger
  );
  return { service, favoriteRepository, repository };
}

const actor = { id: 'user-1' };

describe('PatternFavoritesService', () => {
  it('addFavorite throws when the pattern does not exist', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(null);
    await expect(service.addFavorite('missing', actor)).rejects.toThrow(PatternNotFoundException);
  });

  it('addFavorite records the favorite and an audit log entry', async () => {
    const { service, repository, favoriteRepository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue({ id: 'pattern-1' });
    await service.addFavorite('pattern-1', actor);
    expect(favoriteRepository.addFavorite).toHaveBeenCalledWith('user-1', 'pattern-1');
  });

  it('removeFavorite delegates without requiring the pattern to still exist', async () => {
    const { service, favoriteRepository } = buildService();
    await service.removeFavorite('pattern-1', actor);
    expect(favoriteRepository.removeFavorite).toHaveBeenCalledWith('user-1', 'pattern-1');
  });

  it('listFavorites reads favorites scoped to the default site', async () => {
    const { service, favoriteRepository } = buildService();
    (favoriteRepository.findFavoritePatterns as jest.Mock).mockResolvedValue([
      { id: 'pattern-9', body: {}, tags: [], updatedAt: new Date('2026-01-01'), deletedAt: null },
    ]);
    const result = await service.listFavorites(actor);
    expect(favoriteRepository.findFavoritePatterns).toHaveBeenCalledWith('user-1', 'site-1');
    expect(result[0].id).toBe('pattern-9');
  });
});
