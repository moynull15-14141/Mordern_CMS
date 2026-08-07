import { PublicPatternsService } from '../services/public-patterns.service';
import { PublicPatternsController } from './public-patterns.controller';

describe('PublicPatternsController', () => {
  it('getPattern delegates with the id param', async () => {
    const publicPatternsService = {
      getPattern: jest.fn().mockResolvedValue({ id: 'pattern-1', name: 'Hero', body: {} }),
    } as unknown as PublicPatternsService;
    const controller = new PublicPatternsController(publicPatternsService);
    await controller.getPattern('pattern-1');
    expect(publicPatternsService.getPattern).toHaveBeenCalledWith('pattern-1');
  });
});
