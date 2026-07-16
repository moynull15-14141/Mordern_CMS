import { UnauthorizedException } from '@nestjs/common';
import type { User } from '@prisma/client';
import type { AppConfigService } from '../../../config/config.service';
import { UserRepository } from '../repositories/user.repository';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const config = { auth: { jwtSecret: 'test-secret' } } as unknown as AppConfigService;

  function buildStrategy(findActiveById: jest.Mock) {
    const userRepository = { findActiveById } as unknown as UserRepository;
    return new JwtStrategy(config, userRepository);
  }

  const activeUser: Partial<User> = {
    id: 'user-1',
    email: 'user@example.com',
    username: null,
    displayName: 'User One',
    status: 'ACTIVE',
    siteId: null,
    tenantId: null,
  };

  it('returns an AuthenticatedUser for a valid, active user', async () => {
    const findActiveById = jest.fn().mockResolvedValue(activeUser);
    const strategy = buildStrategy(findActiveById);

    const result = await strategy.validate({ sub: 'user-1' });

    expect(findActiveById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({
      id: 'user-1',
      email: 'user@example.com',
      username: null,
      displayName: 'User One',
      status: 'ACTIVE',
      siteId: null,
      tenantId: null,
    });
  });

  it('throws UnauthorizedException when the user no longer exists', async () => {
    const strategy = buildStrategy(jest.fn().mockResolvedValue(null));
    await expect(strategy.validate({ sub: 'user-1' })).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when the user is no longer ACTIVE', async () => {
    const strategy = buildStrategy(jest.fn().mockResolvedValue({ ...activeUser, status: 'SUSPENDED' }));
    await expect(strategy.validate({ sub: 'user-1' })).rejects.toThrow(UnauthorizedException);
  });
});
