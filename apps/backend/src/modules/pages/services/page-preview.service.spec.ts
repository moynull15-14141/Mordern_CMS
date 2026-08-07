import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { PagePreviewService } from './page-preview.service';

describe('PagePreviewService', () => {
  const jwtService = new JwtService({ secret: 'test-secret' });
  const service = new PagePreviewService(jwtService);

  describe('createPreviewToken / resolvePreviewToken', () => {
    it('round-trips: a token minted for a page resolves back to that page id', () => {
      const token = service.createPreviewToken('page-1');
      expect(service.resolvePreviewToken(token)).toBe('page-1');
    });

    it('rejects a token signed with a different secret', () => {
      const otherJwtService = new JwtService({ secret: 'different-secret' });
      const otherService = new PagePreviewService(otherJwtService);
      const token = otherService.createPreviewToken('page-1');

      expect(() => service.resolvePreviewToken(token)).toThrow(UnauthorizedException);
    });

    it('rejects a malformed/garbage token', () => {
      expect(() => service.resolvePreviewToken('not-a-real-token')).toThrow(UnauthorizedException);
    });

    it('rejects a real login-style JWT presented as a preview token (wrong purpose)', () => {
      const loginLikeToken = jwtService.sign({ sub: 'user-1', email: 'a@b.com', role: null });
      expect(() => service.resolvePreviewToken(loginLikeToken)).toThrow(UnauthorizedException);
    });

    it('rejects an expired token', () => {
      const expiredToken = jwtService.sign(
        { pageId: 'page-1', purpose: 'page-preview' },
        { expiresIn: '-1s' }
      );
      expect(() => service.resolvePreviewToken(expiredToken)).toThrow(UnauthorizedException);
    });
  });
});
