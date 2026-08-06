import { ReusableBlockRepository } from '../repositories/reusable-block.repository';
import { ReusableBlockNotFoundException } from '../exceptions/content-blocks.exceptions';
import { PublicContentBlocksService } from './public-content-blocks.service';

function buildService() {
  const repository = {
    findById: jest.fn(),
  } as unknown as ReusableBlockRepository;
  const service = new PublicContentBlocksService(repository);
  return { service, repository };
}

describe('PublicContentBlocksService', () => {
  it('throws ReusableBlockNotFoundException when the block is missing', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(null);
    await expect(service.getReusableBlock('missing')).rejects.toThrow(
      ReusableBlockNotFoundException
    );
  });

  it('returns only id/blockType/data — never name or audit fields', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue({
      id: 'block-1',
      name: 'Internal editorial label',
      blockType: 'callout',
      data: { text: 'Subscribe!' },
      createdAt: new Date(),
    });
    const result = await service.getReusableBlock('block-1');
    expect(result).toEqual({ id: 'block-1', blockType: 'callout', data: { text: 'Subscribe!' } });
  });
});
