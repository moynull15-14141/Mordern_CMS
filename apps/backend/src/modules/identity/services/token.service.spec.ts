import { JwtService } from '@nestjs/jwt';
import type { AppConfigService } from '../../../config/config.service';
import { TokenService } from './token.service';

describe('TokenService', () => {
  const config = {
    auth: { jwtAccessExpiresIn: '15m' },
  } as unknown as AppConfigService;
  const jwtService = new JwtService({ secret: 'test-secret' });
  const service = new TokenService(jwtService, config);

  describe('signAccessToken', () => {
    it('signs a JWT carrying sub/email/siteId, with role always null', () => {
      const { token, expiresIn } = service.signAccessToken({
        id: 'user-123',
        email: 'user@example.com',
        siteId: 'site-1',
      });
      expect(expiresIn).toBe('15m');
      const decoded = jwtService.verify(token);
      expect(decoded).toMatchObject({
        sub: 'user-123',
        email: 'user@example.com',
        siteId: 'site-1',
        role: null,
      });
    });
  });

  describe('generateOpaqueToken', () => {
    it('generates a high-entropy token distinct from its hash', () => {
      const { token, tokenHash } = service.generateOpaqueToken();
      expect(token).not.toEqual(tokenHash);
      expect(token.length).toBeGreaterThanOrEqual(64);
    });

    it('generates a different token on every call', () => {
      const first = service.generateOpaqueToken();
      const second = service.generateOpaqueToken();
      expect(first.token).not.toEqual(second.token);
    });
  });

  describe('hashToken', () => {
    it('is deterministic for the same input', () => {
      expect(service.hashToken('abc')).toBe(service.hashToken('abc'));
    });

    it('produces different hashes for different inputs', () => {
      expect(service.hashToken('abc')).not.toBe(service.hashToken('xyz'));
    });
  });
});
