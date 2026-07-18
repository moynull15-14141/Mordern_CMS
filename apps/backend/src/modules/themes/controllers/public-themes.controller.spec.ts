import { PublicThemesService } from '../services/public-themes.service';
import { PublicThemesController } from './public-themes.controller';

describe('PublicThemesController', () => {
  it('getActiveTheme delegates to the service', async () => {
    const publicThemesService = {
      getActiveTheme: jest.fn().mockResolvedValue({ id: 'theme-1' }),
    } as unknown as PublicThemesService;
    const controller = new PublicThemesController(publicThemesService);

    const result = await controller.getActiveTheme();

    expect(publicThemesService.getActiveTheme).toHaveBeenCalledWith();
    expect(result).toEqual({ id: 'theme-1' });
  });
});
