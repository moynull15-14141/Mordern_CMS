import { PublicSettingsService } from '../services/public-settings.service';
import { PublicSettingsController } from './public-settings.controller';

function buildController() {
  const publicSettingsService = {
    getPublicSettings: jest.fn().mockResolvedValue([]),
  } as unknown as PublicSettingsService;
  const controller = new PublicSettingsController(publicSettingsService);
  return { controller, publicSettingsService };
}

describe('PublicSettingsController', () => {
  it('getPublicSettings delegates to PublicSettingsService', async () => {
    const { controller, publicSettingsService } = buildController();
    await controller.getPublicSettings();
    expect(publicSettingsService.getPublicSettings).toHaveBeenCalledWith();
  });
});
