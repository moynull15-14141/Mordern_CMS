import { PatternFavoritesService } from '../services/pattern-favorites.service';
import { PatternFavoritesController } from './pattern-favorites.controller';

function buildController() {
  const favoritesService = {
    listFavorites: jest.fn().mockResolvedValue([]),
    addFavorite: jest.fn().mockResolvedValue(undefined),
    removeFavorite: jest.fn().mockResolvedValue(undefined),
  } as unknown as PatternFavoritesService;
  const controller = new PatternFavoritesController(favoritesService);
  return { controller, favoritesService };
}

const user = { id: 'user-1' } as never;

describe('PatternFavoritesController', () => {
  it('listFavorites delegates with the current user as actor', async () => {
    const { controller, favoritesService } = buildController();
    await controller.listFavorites(user);
    expect(favoritesService.listFavorites).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('addFavorite / removeFavorite delegate with id + actor', async () => {
    const { controller, favoritesService } = buildController();
    await controller.addFavorite('pattern-1', user);
    await controller.removeFavorite('pattern-1', user);
    expect(favoritesService.addFavorite).toHaveBeenCalledWith('pattern-1', { id: 'user-1' });
    expect(favoritesService.removeFavorite).toHaveBeenCalledWith('pattern-1', { id: 'user-1' });
  });
});
