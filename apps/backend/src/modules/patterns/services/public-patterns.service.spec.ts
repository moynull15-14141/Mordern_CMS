import { PatternRepository } from '../repositories/pattern.repository';
import { PatternMapper } from '../mappers/pattern.mapper';
import { PatternNotFoundException } from '../exceptions/pattern.exceptions';
import { PublicPatternsService } from './public-patterns.service';

function buildService() {
  const repository = { findById: jest.fn() } as unknown as PatternRepository;
  const service = new PublicPatternsService(repository, new PatternMapper());
  return { service, repository };
}

describe('PublicPatternsService', () => {
  it('throws PatternNotFoundException (404-mapped) when the pattern does not exist', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(null);
    await expect(service.getPattern('missing')).rejects.toThrow(PatternNotFoundException);
  });

  it('resolves a rendering-only shape (id/name/body only)', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue({
      id: 'pattern-1',
      name: 'Hero Banner',
      body: { blocks: [{ id: 'b1', type: 'heading', data: {} }] },
    });
    const result = await service.getPattern('pattern-1');
    expect(Object.keys(result).sort()).toEqual(['body', 'id', 'name']);
    expect(result.id).toBe('pattern-1');
  });
});
